import { HYEventStore } from 'hy-event-store'
import { getPlaylistDetail } from '../services/music'

const recommendStore = new HYEventStore({
  // 公共状态区
  state: {
    recommendInfo: {}
  },
  // 函数区: 可以写网络请求
  actions: {
    fetchRecommendSongsAction(ctx){
      getPlaylistDetail(3778678).then(res => {
        ctx.recommendInfo = res.playlist
      })
    } 
  }
})

export default recommendStore