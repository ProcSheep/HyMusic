// pages/music-player/music-player.js
import {getSongDetail,getSongLyric} from "../../services/player"
import {parseLyric} from '../../utils/parse-lyric'
import playerStore from '../../store/playerStore'
// 节流函数引入
import  {throttle} from 'underscore'

const app = getApp()
// 2.3 创建一个播放器实例 微信的新方法 --- 创建这个实例的时机后面在处理
// 这个实例一个就够,不需要重复创建
const audioContext = wx.createInnerAudioContext()

// 歌曲播放模式的映射表
const modeName = ['order','repeat','random']

Page({
  data: {
    id: 0,
    currentSong: {}, // 歌曲信息
    lrcString: '', // 歌词
    currentPage: 0, // 轮播图位置
    contentHeight: 0, // 内容高度
    pageTitles: ["歌曲","歌词"], // 播放页自定义导航栏的title

    currentTime: 0, // 播放器当前的时间
    durationTime: 0, // 播放歌曲的总时间
    sliderValue: 0, // 播放进度条位置

    isSliderChanging: false, // 是否滑动进度条
    isPlaying: true, // 是否正在播放歌曲

    lyricInfo: [], // 整理的歌词数据
    currentLyricText: "", // 现在的歌词(动态显示歌词)
    currentLyricIndex: -1, // 现在歌词的在lyricInfo数组中的索引
    lyricScrollTop: 0, // 歌词滚动的位置(随着歌曲动态变化)

    playSongList: [], // 播放列表
    playSongIndex: 0, // 当前歌曲在播放列表的索引
    playModeIndex: 0, // 播放模式 0:顺序播放 1:单曲播放 2:随机播放

    isFirstPlay: true, // 是否第一次播放歌曲
    playModeName: 'order', // 歌曲播放的模式
  },

  onLoad(options){
    // 0.设备信息更新 app.js
    this.setData({
      contentHeight: app.globalData.contentHeight
    })

    // 1.获取传入的id
    const id = options.id
    
    // 2.根据id播放歌曲
    this.setupPlaySong(id) // 把歌曲逻辑全封装到里面了

    // 3.获取store的共享数据 (一次监听多个)
    playerStore.onStates(["playSongList","playSongIndex"], this.getPlaySongInfoHandler)

  },

  // =============== 播放歌曲的逻辑 ================
  setupPlaySong(id){
    this.setData({ id })
    // 2.请求歌曲相关的数据
    // 2.1 根据id获取传入的歌曲详情
    getSongDetail(id).then(res => {
      // console.log(res)
      this.setData({ 
        currentSong: res.songs[0],
        durationTime: res.songs[0].dt // 设置播放总时间 ms
      })
    })

    // 2.2 获取歌词信息
    getSongLyric(id).then(res => {
      // console.log(res)
      const lrcString = res.lrc.lyric
      this.setData({ lrcString })
      // 获取解析好的歌词数据()
      const lyricInfo = parseLyric(lrcString)
      // console.log(lyricInfo); 
      this.setData({ lyricInfo })
    })

    // 2.3在最上面...
    // audioContext.stop()
    // 2.4 播放当前的歌曲 
    // 2.4.1 歌曲地址src --- 参数: 歌曲id 
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    // 2.4.2 自动播放(会等待歌曲加载完毕后再播放,不会立即播放)
    audioContext.autoplay = true
    // 2.4.3 获取歌曲总时长 (错误示范,问题来自3.2)
    // this.data.durationTime = audioContext.duration
    // 未必获取的到,因为在2.4.1获取src之后,需要加载歌曲内容,这是个异步过程,需要时间,如果歌曲没有加载完,你的代码执行获取歌曲总时长的操作,最后结果只能为0
    

    // 3.监听播放的进度(时间) --- 只要播放歌曲,就会一直调用里面的回调函数
    // 监听函数只需要挂载一次即可,因为实例对象audioContext一直都是同一个,在最上面定义的
    // 挂载多个监听器也会互相冲突,出问题的
    if(this.data.isFirstPlay){
      this.data.isFirstPlay = false
      audioContext.onTimeUpdate(()=>{
        // 只有不再滑动进度条时,才会实时更新进度条位置,滑动时禁止执行性更新进度条和时间的操作,防止滑动进度条时,出现进度条反复横跳闪现和时间频繁切换的行为
        if(!this.data.isSliderChanging){
          // 3.1 记录当前的时间 audioContext.currentTime
          this.setData({
            currentTime: audioContext.currentTime * 1000 // s -> ms 与durationTime统一单位
          })
          // console.log("time",audioContext.currentTime)
  
          // 3.2 设置播放总时间(一次即可,所以在外面设置 2.1)
          // 推展: 可不可以直接在2.4哪里拿总时长? 看上面的代码 2.4.3
  
          // 3.3 修改sliderValue *100是为了符合进度条组件value值的要求, 60 = 60%
          const sliderValue = this.data.currentTime / this.data.durationTime * 100
          this.setData({ sliderValue })
  
          if(!this.data.lyricInfo.length) return // 在没有解析歌词的情况下(异步请求),不进行匹配工作 
          // 2.匹配正确的歌词(一个简单的算法)
          // 这个默认值是为了显示最后一句歌词
          let index = this.data.lyricInfo.length - 1
          for(let i = 0; i< this.data.lyricInfo.length; i++){
            const info = this.data.lyricInfo[i]
            // audioContext.currentTime比data内部通过setData更新获取的数据要快
            if(info.time > audioContext.currentTime * 1000){
              index = i - 1 
              break
            }
          }
          // 3. 获取正确歌词与索引 + 4. 改变歌词滚动页面的位置
          // console.log(index,this.data.lyricInfo[index].text)
          if( index === this.data.currentLyricIndex) return // 优化: 如果index一样,就不需要重复设置
          this.setData({
            currentLyricText: this.data.lyricInfo[index].text,
            currentLyricIndex: index,
            lyricScrollTop: 40 * index // 每句歌词的高度固定为40px
          })
        }
      }),
      
      // 音频自然播放至结束的事件的监听函数
      audioContext.onEnded(()=>{
        if(audioContext.loop) return // 循环模式不执行播放下一首
        this.changNewSong() // 调用播放下一首
      })

    }
    
  },

  // =============== 事件监听 =================
  onNavBack(){
    wx.navigateBack()
  },

  onSwiperChange(ev){
    // console.log(ev);
    this.setData({currentPage: ev.detail.current})
  },

  onNavTabItemTap(ev){
    const index = ev.currentTarget.dataset.index
    // console.log(index)
    this.setData({ currentPage: index })
  },

  // 滑动进度条松手后(执行一次拖动完成后)
  onSliderChange(ev){
    // console.log(ev)
    // 1.获取点击滑块位置对应的值 ()
    const value = ev.detail.value

    // 2.根据点击位置获取进度条的value后,计算当前播放的时间 (ms)
    const currentTime = this.data.durationTime * (value / 100)

    // 3.设置播放器,播放计算出的时间
    // audioContext.currentTime = currentTime // 错误,这个属性是只读的
    audioContext.seek(currentTime / 1000) // 要求参数单位为s,所以转化ms -> s
    this.setData({currentTime})

    // 4.不再滑动进度条
    this.data.isSliderChanging = false
  },

  // 节流操作throttle---setData的渲染过于频繁会造成页面渲染卡顿,每次setData改变某些data的值后,页面都会重新进行一次判定渲染,确定应该重新渲染哪些元素,这个过程很慢
  // 滑动进度条进行中
  onSliderChanging: throttle(function(ev){
    // 1.获取滑动时位置的值
    const value = ev.detail.value

    // 2.根据当前的值,计算出对应的时间,改变currentTime
    // 实现效果为,拖动进度条移动时,对应的播放时间也随时跟着进度条的进度实时变化
    const currentTime = value / 100 * this.data.durationTime
    this.setData({
      currentTime
    })

    // 3.当前正在滑动进度条
    this.data.isSliderChanging = true
  },100),


  // 监听点击播放按钮的事件
  onPlayOrPauseTap(){
    // 判断现在的状态,执行对应的措施(暂停/播放),然后记得同步新的状态
    // if(this.data.isPlaying){
    //   audioContext.pause()
    //   this.setData({ isPlaying: false })
    // }else{
    //   audioContext.play()
    //   this.setData({ isPlaying: true })
    // }

    // 还可以用方法2: audioContext.paused 这个可以判断播放是否处于暂停状态,暂停即为true
    if(!audioContext.paused){ // 没有暂停的情况下,点击按钮执行暂停操作
      audioContext.pause()
      this.setData({ isPlaying: false }) // 这个还用,负责前面html的三目运算,切换播放图标
    }else{
      audioContext.play()
      this.setData({ isPlaying: true })
    }
  },

  // 切换上一首/下一首
  // onPrevBtnTap(){
  //   // 1.获取之前的数据
  //   const length = this.data.playSongList.length
  //   let index = this.data.playSongIndex
  //   // 2.根据之前的数据计算新的数据
  //   index = index - 1
  //   // 越界问题Min: 如果index已经到达歌曲列表的开头,则有index = 0
  //   // 点击上一首则有index = -1; 此时歌曲将会跳到list的最后首歌重新开始,即索引index为length - 1
  //   if(index === -1) index = length - 1

  //   // 3.根据索引获取当前歌曲的信息(拿的下一首歌曲)
  //   const newSong = this.data.playSongList[index]
  //   console.log(newSong.id)
  //   // 4.更新并保存索引 保存到共享Store中的索引,大家可以一起用
  //   playerStore.setState("playSongIndex",index)
  // },
  // onNextBtnTap(){
  //   // console.log('+1')
  //   // 1.获取之前的数据
  //   const length = this.data.playSongList.length
  //   let index = this.data.playSongIndex
  //   // 2.根据之前的数据计算新的数据
  //   index = index + 1
  //   // 越界问题Max: 如果index已经到达歌曲列表的末尾,则有index = length - 1
  //   // 点击下一首则有index = length; 此时歌曲将会跳到list的第一首歌重新开始,即索引index为0
  //   if(index === length) index = 0

  //   // 3.根据索引获取当前歌曲的信息(拿的下一首歌曲)
  //   const newSong = this.data.playSongList[index]
  //   console.log(newSong.id)
  //   // 4.更新并保存索引 保存到共享Store中的索引,大家可以一起用
  //   playerStore.setState("playSongIndex",index)  
  // },
  
  // 封装切换歌曲的函数
  changNewSong(isNext = true){
    const length = this.data.playSongList.length
    let index = this.data.playSongIndex
    // 根据模式选择更新index的方式
    // 优化单曲循环,即可切换歌曲的单曲循环
    switch(this.data.playModeIndex){
      case 1: // 单曲循环 --- 已完成可切换功能
      case 0: // 顺序播放
        index = isNext ? index + 1 : index -1 
        // 边界判断
        if(index === length) index = 0
        if(index === -1) index = length - 1
        break
      case 2: // 随机播放
        // 小算法: floor向下取整, Math.random() 介于0和1之间
        // 最终index范围为 [0,length - 1] 
        let orginIndex = index 
        index = Math.floor(Math.random() * length)
        // 随机不能随机到自己
        while(index === orginIndex){
          index = Math.floor(Math.random() * length)
        }
        break
    }

    

    const newSong = this.data.playSongList[index]
    // console.log(newSong.id)
    // 切换页面时,将之前的数据初始化为0
    this.setData({currentSong: {}, sliderValue: 0, currentTime: 0, durationTime: 0})
    // 请求到新歌曲数据后,在重新渲染新的页面并播放歌曲
    this.setupPlaySong(newSong.id)
    
    playerStore.setState("playSongIndex",index)  
  },

  onPrevBtnTap(){
    this.changNewSong(false)
  },
  onNextBtnTap(){
    this.changNewSong()
  },
  // 切换歌曲的模式
  onModeBtnTap(){
    let modeIndex = this.data.playModeIndex
    modeIndex = (modeIndex + 1) % 3 // 在 0 1 2 三个模式之间切换
    // console.log(modeIndex)
    // this.data.playModeIndex = modeIndex

    // 根据模式判断循环与否 
    // 在 onLoad audioContext.onEnded 中操作循环
    if(modeIndex === 1){
      audioContext.loop = true
    }else {
      audioContext.loop = false
    }

    this.setData({
      playModeIndex: modeIndex,
      playModeName: modeName[modeIndex]
    })
  },

  // ============== store ==================
  // 监听playStore的处理事件函数
  
  getPlaySongInfoHandler({playSongList,playSongIndex}){
    // 监听多个,打印时就是对象 { 点击歌曲的索引和歌单列表 }
    // console.log(value)

    // 把获取的歌曲列表和当前歌曲在这个列表的索引保存到data:{...}中
    // 回忆: 封装工具监听多个store变量时,如果有变化返回变化值,如果没有变化就返回undefined
    // 所以下面的意思为,如果对应的state没有变化,即为undefiend,那么就不更新对应的数据(setData)
    if(playSongList){
      this.setData({ playSongList })
    }
    // 不能直接写playSongIndex,因为索引为0时也属于undefined状态,优化一下(0 !== undefined --> true)
    if(playSongIndex !== undefined){
      this.setData({ playSongIndex })
    }
  },
  onUnload(){
    // 销毁监听
    playerStore.offState(["playSongList","playSongIndex"],this.getPlaySongListHandler)
  }

})