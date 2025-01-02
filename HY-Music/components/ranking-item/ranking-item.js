// components/ranking-item/ranking-item.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
      value: {}
    },
    // 接受对象的index值,即对象的key值
    key: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 巅峰榜单点击监听事件
    onRakingItemTap(){
      wx.navigateTo({
        // 跳转类型type + 榜单类型
        url: `/pages/detail-song/detail-song?type=ranking&key=${this.properties.key}`,
      })
    }
  }
})