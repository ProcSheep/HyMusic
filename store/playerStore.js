import {HYEventStore} from 'hy-event-store'

const playerStore = new HYEventStore({
  state: {
    playSongList: [], // 歌曲列表
    playSongIndex: 0 // 歌曲索引
  }
})

export default playerStore