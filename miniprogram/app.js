//app.js
App({
  onLaunch: function (options) {
    console.log(options)
    this.checkUpate()
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env:'test-4qajy',
        traceUser: true,
      })
    }

    this.globalData = {
      playingMusicId:-1,
      openid:-1,
    }
    this.getOpenid()
  },
  //小程序生命周期函数 会监听小程序的启动与切前台
  onShow(options){
    console.log('onShow执行'+options)
  },
  setplayingMusicId(musicId){
    this.globalData.playingMusicId=musicId
  },
  getplayingMusicId(){
    return this.globalData.playingMusicId
  },
  getOpenid() {
    wx.cloud.callFunction({
      name: 'login'
    }).then((res) => {
      const openid = res.result.openid
      this.globalData.openid = openid
      if (wx.getStorageSync(openid) == '') {
        wx.setStorageSync(openid, [])
      }
    })
  },
  
  checkUpate() {
    const updateManager = wx.getUpdateManager()
    // 检测版本更新
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启小程序',
            success(res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },
})
