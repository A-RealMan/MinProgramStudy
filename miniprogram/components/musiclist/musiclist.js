// components/musiclist/musiclist.js
const App = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId:-1
  },
  pageLifetimes:{
    show(){
      this.setData({
      playingId:parseInt(App.getplayingMusicId())
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      console.log(event.currentTarget.dataset.musicid)
      const musicid = event.currentTarget.dataset.musicid
      const index = event.currentTarget.dataset.index
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${index}`,
      })
    },
  }
})
