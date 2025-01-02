import {HYEventStore} from 'hy-event-store'
import {getPlaylistDetail} from '../services/music'

const rankingsMap = {
  newRanking: 3779629,
  originRanking: 2884035,
  upRanking: 19723756
} 
const rankingStore = new HYEventStore({
  state: {
    newRanking: {}, // 新歌榜
    originRanking: {}, // 原创榜
    upRanking: {} // 飙升榜
  },
  actions: {
    // 请求数据
    fetchRankingDataAction(ctx) {
      // 虽然一次发送三次请求,但是收到的res不一定是按顺序的,所以依靠映射关系一一对应放置
      for(const key in rankingsMap){
        const id = rankingsMap[key]
        getPlaylistDetail(id).then(res =>{
          ctx[key] = res.playlist
          // console.log(res)
        })
      }
    }
  }
})

export default rankingStore