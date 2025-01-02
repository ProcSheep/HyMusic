// pages/main-video/main-video.js
import { getTopMV } from '../../services/video'
Page({
  data: {
    videoList: [],
    offset: 0,
    hasMore: true 
  },

  onLoad() {
    // // 1.发送网络请求
    // hyRequest.get({
    //   url: '/top/mv',
    //   data: {
    //     limit: 20,
    //     offset: 0
    //   }
    // }).then(res=>{
    //   // console.log(res);
    //   this.setData({
    //     videoList: res.data
    //   })
    // })

    // 使用async/await的同时,不阻塞onLoad函数运行
    this.fetchTopMV()
  },

  // ================== 发送网络请求的方法 ===================
  async fetchTopMV(){
    // 进阶请求视频请求
    const res = await getTopMV(this.data.offset)

    // 注意: 新增数据不要覆盖
    const newVideoList = [...this.data.videoList,...res.data]
    this.setData({
      videoList: newVideoList
    })
    // 这里不需要setData,因为页面不需要对此数据进行刷新显示
    this.data.offset = this.data.videoList.length
    this.data.hasMore = res.hasMore
  },

  // ================ 监听上拉和下拉功能 ==============

  // 2.监听上拉到页面底部功能,自带的
  onReachBottom(){
    // 下拉加载更多,后端数据只有50条数据,后端会返回一个变量hasMore用于判断下次是否还能请求新的数据
    // 判断是否有更多的数据
    if(!this.data.hasMore) return 
    this.fetchTopMV() 
  },

  // 3.下拉监听事件 自带的
  async onPullDownRefresh(){
    // 1.还原数据初始化
    this.setData({
      videoList: []
    }),
    this.data.offset = 0
    this.hasMore = true

    // 2.重新请求新的数据
    await this.fetchTopMV()

    // 3.停止下拉刷新,等待网络请求函数异步结束,再执行停止刷新功能
    wx.stopPullDownRefresh()
  },

  // ==================== 事件监听 ===========================
  // 4.事件监听 data-X方法,还可以直接在组件video-item里面写跳转逻辑
  onVideoItemTap(ev){
    // const item = ev.currentTarget.dataset.item
    // wx.navigateTo({
    //   url: `/pages/detail-video/detail-video?id=${item.id}`
    // })
  }


})