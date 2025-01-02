// app.js
App({
  // 共享不变的信息
  globalData:{
    // 屏幕的宽高
    screenWidth:0,
    screenHeight: 0,
    statusBarHeight: 0, // 状态栏高度
    contentHeight: 500 // 内容高度(动态计算)
  },
  onLaunch(){
    const windowInfo = wx.getWindowInfo()
    this.globalData.screenWidth = windowInfo.screenWidth
    this.globalData.screenHeight = windowInfo.screenHeight
    this.globalData.statusBarHeight = windowInfo.statusBarHeight
    // 内容的高度 = 屏幕高度 - 状态栏高度 - nav高度(固定44px)
    // 因为有自定义导航栏,所以内容高度获取麻烦一些,如果是默认导航栏,是直接可以获取剩余内容高度的windowHeight,但是现在使用自定义导航栏了,整个屏幕高度都是内容区,即windowHeight = screenHeight
    this.globalData.contentHeight = windowInfo.screenHeight - windowInfo.statusBarHeight - 44
  }
})
