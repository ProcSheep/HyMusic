// pages/detail-song/detail-song.js
import recommendStore from '../../store/recommendStore'
import rankingStore from '../../store/rankingStore'
import { getPlaylistDetail } from '../../services/music'
import playerStore from '../../store/playerStore'

Page({
  data: {
    // 默认初始化,可以为空的
    type: "",
    key: "",
    id: "",

    songInfo: [] // 歌曲数据
  },

  onLoad(options){
    // 歌曲数据详情页面
    // 1.确定数据类型: 
    // type: ranking 榜单数据
    // type: recommend 推荐数据

    const type = options.type
    // this.data.type = type
    this.setData({
      type
    })

    // 1.巅峰榜
    if(type === "ranking"){
      const key = options.key
      this.data.key = key
      // 获取不同榜单的歌曲,key=新歌/原创/飙升的任意一个
      rankingStore.onState(key,this.handleRanking)
    }else if (type === "recommend"){ // 2.推荐歌曲来的
      recommendStore.onState("recommendInfo",this.handleRanking)
    } else if (type === "menu"){ // 3.歌单来的
      const id = options.id
      this.data.id = id
      this.fetchMenuSongInfo()
    }
    
  },
  async fetchMenuSongInfo(){
    const res = await getPlaylistDetail(this.data.id)
    // console.log(res)
    this.setData({
      songInfo: res.playlist
    })
  },

  onUnload(){
    if(this.data.type==="ranking"){
      rankingStore.offState(this.data.key,this.handleRanking)
    }else if (this.data.type==="recommend"){
      recommendStore.offState("recommendInfo",this.handleRanking)
    }
  },


  // =========== 从store中获取数据 ===================
  // 监听后,获取store对应榜单的歌曲数据信息
  handleRanking(value){
    if(this.data.type === "recommend"){
      value.name = "推荐歌单" // 稍微改下名字
    }
    this.setData({
      songInfo: value
    })
    // 改改标题,不一定需要json中配置
    wx.setNavigationBarTitle({
      title: value.name,
    })
  },

  // ====================== 事件监听 ======================== 
  onSongItemTap(ev){
    const index = ev.currentTarget.dataset.index
    playerStore.setState("playSongList",this.data.songInfo.tracks)
    playerStore.setState("playSongIndex",index)
  },
  
})