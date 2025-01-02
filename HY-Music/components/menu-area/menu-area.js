// components/menu-area/menu-area.js
const app = getApp()

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ""
    },
    menuList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    screenWidth: 0
  },

  lifetimes: {
    attached(){
      this.setData({ screenWidth: app.globalData.screenWidth })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击'更多'触发
    onMenuMoreClick(){
      wx.navigateTo({
        url: '/pages/detail-menu/detail-menu',
      })
    }
  }
})