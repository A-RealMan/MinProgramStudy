// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db=cloud.database()

const rp = require('request-promise');

const URL='http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT=100
// 云函数入口函数
exports.main = async (event, context) => {
  //存的是歌单已有数据
  // const list =await playlistCollection.get()
  const countResult=await playlistCollection.count()
  const total=countResult.total
  const batchTimes=Math.ceil(total/MAX_LIMIT)
  const tasks=[]
  for(let i=0;i<batchTimes;i++){
    let promise=playlistCollection.skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list={
    data:[]
  }
  if(tasks.length>0){
   list =(await Promise.all(tasks)).reduce((acc,cur)=>{
     return{
       data:acc.data.concat(cur.data)
     }
   })
  }

  //前往服务器获取推荐歌单的数据
  const playlist= await rp(URL).then((res)=>{
    return JSON.parse(res).result
  })
//对获取的数据进行去重操作
  const newData=[]
  for(let i=0,len1=playlist.length;i<len1;i++){
    let flag=true
    for(let j=0,len2=list.data.length;j<len2;j++){
      if(playlist[i].id===list.data[j].id){
        flag=false
        break
      }
    }
    if(flag){
      newData.push(playlist[i])
    }
  }
  // console.log(playlist)
  //将数据插入到数据库中
  for (let i = 0, length = newData.length;i<length;i++){
    await playlistCollection.add({
      data:{
        ...newData[i],
      createTime:db.serverDate(),
      }
    }).then((res)=>{
      console.log('插入成功')
    }).catch((err)=>{
      console.log('插入失败')
    })
  }

  return newData.length
}