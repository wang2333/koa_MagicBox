const request = require('request') //node封装的请求中间件
const path = require('path')
const config = require('./config')
const { execSync } = require('child_process')

const Util = {
  request: (url, type, params = {}) => {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'get',
          uri: config[type] + url,
          qs: params,
          json: true, //设置返回的数据为json
        },
        (error, response, body) => {
          if (!error && response.statusCode == 200) {
            resolve(body)
          } else {
            reject(response.statusCode)
          }
        }
      )
    })
  },

  getVideoUrl: (type, room) => {
    return new Promise((resolve, reject) => {
      const fileUrl = path.join(__dirname, `/py/${type}.py`)
      const output = execSync(`python ${fileUrl} --room=${room}`)
      const result = new Buffer(output, 'utf8').toString('utf8')
      if (result.startsWith('http')) {
        resolve(result)
      } else {
        reject('解析失败')
      }
    })
  },
}

module.exports = Util
