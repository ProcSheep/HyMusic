// components/area-header/area-header.js
Component({
  properties: {
    title: {
      type: String,
      value: "默认标题"
    },
    // 是否有右侧的'更多'
    hasMore: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onMoreTap(){
      this.triggerEvent("moreclick")
    }
  }
})