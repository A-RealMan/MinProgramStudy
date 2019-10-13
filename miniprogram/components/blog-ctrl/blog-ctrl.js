// components/blog-ctrl/blog-ctrl.js
let userInfo={}
const db=wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog:Object,
  },
  externalClasses: ['iconfont', 'icon-pinglun','icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    //登录组件是否显示
    loginShow:false,
    //底部弹出层是否显示
    modalShow:false,
    //评论内容
    content:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      //判断用户是否授权
      wx.getSetting({
        success:(res)=>{
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success:(res)=>{
                userInfo=res.userInfo
                //显示评论的弹出层
                this.setData({
                  modalShow: true
                })
              }
            })
          }else{
            this.setData({
              loginShow:true
            })
          }
        }
      })
    },
    //登录成功
    onLoginSuccess(event){
      userInfo=event.detail
      this.setData({
        loginShow:false,
      },()=>{
        this.setData({
          modalShow: true
        })
      })
       
    },
    //登录失败
    onLoginFail(){
      wx.showModal({
        title: '只有授权用户才能评论',
        content: '',
      })
    },

    //发布评论
    onSend(event){
      console.log(event)
      //插入云数据库
      //formId 用于推送模板消息
      let formId=event.detail.formId
      let content=event.detail.value.content
      if(content.trim()==''){
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return 
      }
      wx.showLoading({
        title: '发布中',
        mask:true
      })
      db.collection('blog-comment').add({
        data:{
          content,
          createTime:db.serverDate(),
          blogId:this.properties.blogId,
          nickName:userInfo.nickName,
          avatarUrl:userInfo.avatarUrl,
        }
      }).then((res)=>{

        wx.hideLoading()
        wx.showModal({
          title: '评论成功',
          content: '',
        })
        this.setData({
          modalShow:false,
          content:''
        })
      })
      //推送模板消息
      wx.cloud.callFunction({
        name:'sendMessage',
        data:{
          content,
          formId,
          blogId:this.properties.blogId
        }
      }).then((res)=>{
        console.log(res)
      })

      //抛出评论成功的事件 父元素刷新界面
      this.triggerEvent('refreshCommentList')

    },
  }
})
