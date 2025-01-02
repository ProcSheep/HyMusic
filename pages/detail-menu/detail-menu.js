// pages/detail-menu/detail-menu.js
import { getSongMenuList, getSongMenuTag } from '../../services/music'

Page({
  data:{
    songMenus: []
  },
  onLoad(){
    this.fetchAllMenuList()
  },
  // 发送网络请求
  async fetchAllMenuList(){
    // 1.获取歌单分类tags
    const res = await getSongMenuTag()
    const tags = res.tags

    // 2.根据tags获取对应的歌单
    const allPromises = []
    for(const tag of tags){
      const promise = getSongMenuList(tag.name)
      allPromises.push(promise)
    }
      
    // 3.获取到所有的数据后,再次调用一次setData
    // 如何界定所有数据获取完成? 使用Promise.all()
    // 并且上面的获取数据的过程,也就是不会阻塞程序,一次性发送10条请求,等待所有请求都有数据后,执行then
    Promise.all(allPromises).then(res => {
      console.log(res)
      this.setData({
        songMenus: res
      })
    })
  }
})