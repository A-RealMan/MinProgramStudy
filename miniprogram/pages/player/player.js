// pages/player/player.js
let musiclist = []
//正在播放的index
let nowPlayingIndex = 0
//获取全局唯一的音乐播放管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

const App=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isplaying: false,
    isLyricShow:false,
    lyric:'',
    isSame:false
  },
  onChangeLyricShow(){
    this.setData({
      isLyricShow:!this.data.isLyricShow
    })
  },
  //音乐播放控制图标 以及胶片动画的转动 progess-bar抛出
  onPlay(){
    this.setData({
      isplaying:true
    })
  },
  //音乐暂停 控制图标 以及胶片动画的转动 progess-bar抛出
  onPause(){
    this.setData({
      isplaying:false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    musiclist = wx.getStorageSync('musiclist')
    nowPlayingIndex = options.index
    this._loadMusicDetail(options.musicId)
  },

  _loadMusicDetail(musicId) {
    if(musicId==App.getplayingMusicId()){
      this.setData({
        isSame:true
      })
    }else{
      this.setData({
        isSame:false
      })
    }
    if(!this.data.isSame){  
    backgroundAudioManager.stop()
    }
    let music = musiclist[nowPlayingIndex]
    console.log(music)
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isplaying: false
    })

    App.setplayingMusicId(musicId)
    wx.showLoading({
      title: '歌曲加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then((res) => {
      console.log(res)
      console.log(JSON.parse(res.result))
      //一定要提前解析
      let result = JSON.parse(res.result)
      //无权限播放判断
      if (result.data[0].url==null){
        wx.showToast({
          title: '无权限播放',
        })
        return 
      }
      if(!this.data.isSame){
      backgroundAudioManager.src = result.data[0].url
      backgroundAudioManager.title = music.name
      backgroundAudioManager.singer = music.ar[0].name
      backgroundAudioManager.coverImgUrl = music.al.picUrl
      backgroundAudioManager.epname = music.al.name
      //保存播放历史
      this.savePlayHistory()
      }
      this.setData({
        isplaying: true
      })
      wx.hideLoading()
    })
    //加载歌词
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'lyric',
      }
    }).then((res)=>{
      console.log(res)
      let lyric='暂无歌词'
      const lrc = JSON.parse(res.result).lrc
      if(lrc){
        lyric = lrc.lyric
        this.setData({
          lyric
        })
      }
    })
  },

  togglePlaying() {
    if (this.data.isplaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isplaying: !this.data.isplaying
    })
  },
  onPrev() {
    nowPlayingIndex--
    if(nowPlayingIndex<0){
      nowPlayingIndex=musiclist.length-1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext(){
    nowPlayingIndex++
    if(nowPlayingIndex===musiclist.length){
      nowPlayingIndex=0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  timeUpdate(event){
    //两个组件之间的通信
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  //保存播放历史
  savePlayHistory(){
    const music=musiclist[nowPlayingIndex]
    const openid = App.globalData.openid
    const history=wx.getStorageSync(openid)
    let bHave=false
    for(let i=0;i<history.length;i++){
      if(history[i].id==music.id){
        bHave=true
        break
      }
    }
    if(!bHave){
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})