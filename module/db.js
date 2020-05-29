const Config = require('./config')
const mongoose = require('mongoose')

mongoose.connect(Config.dbUrl)

const db = mongoose.connection
// 连接成功
db.on('connected', () => {
  console.log('Mongoose connection open to ' + Config.dbUrl)
})
// 连接异常
db.on('error', (err) => {
  console.log('Mongoose connection error: ' + err)
})
// 断开连接
db.on('disconnected', () => {
  console.log('Mongoose connection disconnected')
})

module.exports = mongoose;