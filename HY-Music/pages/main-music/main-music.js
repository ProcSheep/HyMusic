// pages/main-music/main-music.js
import {getMusicBanner,getPlaylistDetail,getSongMenuList} from '../../services/music'
import recommendStore from '../../store/recommendStore'
import rankingStore from '../../store/rankingStore'
import playerStore from '../../store/playerStore'

const app = getApp()

Page({
  data:{
    searchValue: "",
    banners: [],
    recommendSongs: [],

    // 歌单数据
    hotMenuList: [],
    recMenuList: [],
    // 屏幕数据,封装组件了(menu-area),所以不需要了
    // screenWidth: 0,

    // 巅峰榜数据,所有的榜单数据都放在一起
    rankingInfo: {}
  },
  onLoad(){
    // 获取屏幕尺寸
    // this.setData({
    //   screenWidth: app.globalData.screenWidth
    // })

    this.fetchMusicBanner()
    // this.fetchRecommendSongs()
    this.fetchSongMenuList()

    // 监听store的state值,一旦变化执行回调函数(默认第一次自动执行)
    recommendStore.onState("recommendInfo", this.handleRecommendSongs )
    rankingStore.onState("newRanking",this.handleNewRanking)
    rankingStore.onState("originRanking",this.handleOriginRanking)
    rankingStore.onState("upRanking",this.handleUpRanking)

    // 执行store中的函数
    recommendStore.dispatch("fetchRecommendSongsAction")
    rankingStore.dispatch("fetchRankingDataAction")

  },
  

  // 网络请求方法封装
  async fetchMusicBanner(){
    const res = await getMusicBanner()
    this.setData({
      banners: res.banners
    })
  },

  // 请求歌曲
  fetchSongMenuList(){
    // 为了不阻塞,统一用then
    // 热门榜单歌曲数据
    getSongMenuList().then(res => {
      this.setData({
        hotMenuList: res.playlists
      })
    })
    // 华语榜单歌曲数据
    getSongMenuList("华语").then(res => {
      this.setData({
        recMenuList: res.playlists
      })
    })
  },

  // async fetchRecommendSongs(){
  //   // 看文档 id=3778678 是请求的热歌榜榜单数据
  //   const res = await getPlaylistDetail(3778678)
  //   const playlist = res.playlist
  //   const recommendSongs = playlist.tracks.slice(0,6)
  //   this.setData({
  //     recommendSongs
  //   })
  // },

  // 点击搜索框触发
  onSearchClick(){
    // 跳到搜索页面
    wx.navigateTo({
      url: '/pages/detail-search/detail-search',
    })
  },

  // 点击'更多'监听函数
  onRecommendMoreClick(){
    wx.navigateTo({
      url: '/pages/detail-song/detail-song?type=recommend',
    })
  },

  // ============ 从store中获取数据 ==================
  // 推荐歌曲
  handleRecommendSongs(value){
    // 第一次监听获取不到推荐歌曲,之后执行网络请求函数后,才会获取对应的歌曲
    if(!value.tracks) return 
    this.setData({ recommendSongs: value.tracks.slice(1,7) })
  },
  // 巅峰榜歌曲 --- 新歌 + 原创 + 飙升 
  handleNewRanking(value){
    // console.log("新歌",value)
    const newRankingInfo = { ...this.data.rankingInfo, newRanking: value }
    this.setData({
      rankingInfo: newRankingInfo
    })
  },
  handleOriginRanking(value){
    // console.log("原创",value)
    const newRankingInfo = { ...this.data.rankingInfo, originRanking: value }
    this.setData({
      rankingInfo: newRankingInfo
    })
  },
  handleUpRanking(value){
    // console.log("飙升",value)
    const newRankingInfo = { ...this.data.rankingInfo, upRanking: value }
    this.setData({
      rankingInfo: newRankingInfo
    })
  },

  // 监听推荐歌曲点击事件
  onSongItemClick(ev){
    const index = ev.currentTarget.dataset.index
    // 设置播放列表,store共享数据,不使用app的globalData是因为这个数据会更新变化
    playerStore.setState("playSongList",this.data.recommendSongs)
    playerStore.setState("playSongIndex",index)
  },


  onUnload(){
    recommendStore.offState("recommendSongs",this.handleRecommendSongs)
    rankingStore.offState("newRanking",this.handleNewRanking)
    rankingStore.offState("originRanking",this.handleOriginRanking)
    rankingStore.offState("upRanking",this.handleUpRanking)
  }

  
})