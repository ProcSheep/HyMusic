// 正则表达式: 匹配字符串的利器
// 里面的[]和.都是正则的一些公式符号,所以使用转义字符\
const timeReg = /\[(\d{2}):(\d{2})\.(\d{3})\]/

export function parseLyric(lrcString){
  const lyricInfo = []
  const lyricLines = lrcString.split('\n')
  // console.log(lyricLines);

  for(const lineString of lyricLines){
    // [00:30.550]全部都小心地收集 ---> { text: "全部都小心地收集", time: XX(ms) }
    // 使用正则表达式匹配字符串中的日期
    const results = timeReg.exec(lineString)
    // console.log(results);
    // 如果有的一行lineString直接为换行符\n,没有任何time和歌曲text的信息,跳过本次循环
    if(!results) continue
    // 提取每个部分的数据,然后计算为毫秒
    // 字符串与数字类型数据(Number)相乘最后转化为数字类型
    const minute = results[1] * 60 * 1000
    const seconds = results[2] * 1000
    const mSeconds = results[3] * 1
    const time = minute + seconds + mSeconds
    // 意为把内部的符合正则表达式的字符串片段替换为"",这样剩下的字符串内容即为歌曲内容
    const text = lineString.replace(timeReg,"")
    if(text === ""){
      lyricInfo.push({time,text: " . . . . . . "})
    }else{
      lyricInfo.push({ time,text })
    }
    
  }

  return lyricInfo
}