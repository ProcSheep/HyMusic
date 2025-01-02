// components/song-item-v1/song-item-v1.js
Component({
  properties: {
    itemData: {
      type: Object,
      value: {}
    }
  },

  methods: {
    onSongItemTap(){
      const id = this.properties.itemData.id
      // console.log(id)
      // 跳转音乐播放页面
      wx.navigateTo({
        url: `/pages/music-player/music-player?id=${id}`,
      })
      
    }
  }
})