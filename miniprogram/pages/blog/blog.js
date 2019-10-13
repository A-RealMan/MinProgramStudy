// pages/blog/blog.js
//搜索关键字
let keyWord=''
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //控制底部弹出框是否显示
    modalShow:false,
    //博客列表
    blogList:[]
  },
  //发布
  onPublish(){
    //判断用户是否授权
    wx.getSetting({
      success:(res)=>{
        console.log(res)
        //用户已授权信息
        if (res.authSetting['scope.userInfo']){
          //获取对应信息 
          wx.getUserInfo({
            success:(res)=>{
              this.onLoginSuccess({
                detail:res.userInfo
              })
            }
          })
        }else{
          this.setData({
            modalShow: true
          })
        }
      }
    })
  },
//获取用户信息成功
  onLoginSuccess(event){
    console.log(event)
    const detail=event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,

    })
  },

  //获取用户信息失败
  onLoginFail(){
    wx.showModal({
      title: '授权的用户才能发布',
      content: '',
    })
  },
  //查看详情界面
  goComment(event) {
    // console.log(event.target.dataset.blogid)
    wx.navigateTo({
      url: '../blog-comment/blog-comment?blogid=' + event.target.dataset.blogid,
    })
  },
  //搜索
  onSearch(event){
    keyWord=event.detail.keyWord
    this.setData({
      blogList:[]
    })
    this._loadBlogList(0)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.scene)
    this._loadBlogList()
  },
  //获取云数据库的博客列表
  _loadBlogList(start=0) {
    wx.showLoading({
      title: '拼命加载中',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyWord,
        start,
        count: 10,
        $url: 'list',
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
    })
  },
 

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      blogList:[]
    })
    this._loadBlogList()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    let blogObj=event.target.dataset.blog
    return{
      title:'我跟我的小伙伴们都惊呆了',
      path:`/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      imageUrl:'/images/share.jpg'
    }
  }
})