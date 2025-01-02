// 封装为类--->返回实例 (扩展性比函数更好)
class HYrequestClass {
  // constructor构造器
  constructor(baseURL){
    this.baseURL = baseURL
  }

  // request方法
  request(options){
    return new Promise((resolve, reject) => {
      wx.request({
        ...options, // request的参数
        url: this.baseURL + options.url,
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  // get方法,进阶
  get(options){
    return this.request({...options,method:'get'})
  }
  // post方法
  post(options){
    return this.request({...options,method:'post'})
  }

}

// 给基本参数传递基本地址baseURL
export const hyRequest = new HYrequestClass('http://codercba.com:9002')