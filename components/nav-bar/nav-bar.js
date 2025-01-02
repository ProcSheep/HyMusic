// components/nav-bar/nav-bar.js

const app = getApp()

Component({
  options: {
    multipleSlots: true
  },

  properties: {
    title: {
      type: String,
      value: "导航标题"
    }
  },

  data: {
    statusHeight: 0, // 自定义导航栏的状态栏高度
  },

  lifetimes: {
    attached(){
      // 1.获取状态栏高度(设备信息,来自app.js)
      this.setData({
        statusHeight: app.globalData.statusBarHeight
      })
    }
  },

  methods: {
    onLeftTap(){
      // wx.navigateBack()
      this.triggerEvent('leftClick')
    }
  }
})