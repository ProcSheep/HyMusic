// pages/detail-video/detail-video.js
import { getMvUrl,getMvInfo,getMvRelated,getTopMV } from '../../services/video'
Page({
  data: {
    id: 0,
    mvUrl: "",
    mvInfo: {},
    relatedVideo: []
  },

  onLoad(options){
    const id = options.id
    this.setData({
      id
    })
    this.fetchMvUrl(id)
    this.fetchMvInfo(id)
    this.fetchMvRelated(id) //json
  },

  async fetchMvUrl(id){
    const res = await getMvUrl(id)
    this.setData({
      mvUrl: res.data.url
    })
  },

  async fetchMvInfo(id){
    const res = await getMvInfo(id)
    console.log(res.data);
    this.setData({
      mvInfo: res.data
    })
  },

  // async fetchMvRelated(id){
  //   const res = await getMvRelated(id)
  //   // 相关视频的数据没了,请求成功但是没有任何数据
  //   // 相关视频的渲染css结构和外面的视频页面main-video一个思路,所以学好外面的里面的自然就会了,这里面就略了
  //   // 最后在html结构也是把relatedVideo获取的res数据进行一个for循环而已
  //   console.log(res);
  //   this.setData({
  //     relatedVideo: res.data
  //   })
  // }

  // 曲线实现功能,请求10条mv视频
  async fetchMvRelated(){
    const res = await getTopMV(0,10)
    console.log(res)
    this.setData({
      relatedVideo: res.data
    })
  }

  
})