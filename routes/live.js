const router = require('koa-router')()
const Util = require('../module/Util')
const LiveType = require('../module/schema/LiveType')

router.prefix('/live')

const insert = (model, data) => {
  return new Promise((resolve, reject) => {
    const name = new model(data)
    name.save((err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}
const find = (model, data) => {
  return new Promise((resolve, reject) => {
    var wherestr = data
    model.find(wherestr, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}
const update = (model, query, updatestr) => {
  return new Promise((resolve, reject) => {
    var query = query
    var updatestr = updatestr
    model.findOneAndUpdate(query, updatestr, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

router.get('/type', async (ctx) => {
  // let res = await update()
  // let res = await insert(LiveType, { type: '企鹅', value: 'egame' })
  let res = await find(LiveType, {})
  ctx.body = {
    data: res,
  }
})

router.get('/list', async (ctx) => {
  const query = ctx.query
  let url = ''
  let params = {}
  // 不同直播平台请求参数不一样
  switch (query.type) {
    case 'zhanqi':
      url = `/30/${query.page}.json`
      break
    case 'douyu':
      params = { offset: (query.page - 1) * 30, limit: 30 }
      break
    case 'bilibili':
      params = { page: query.page, page_size: 30 }
      break
    case 'huomao':
      params = {
        game_url_rule: 'all',
        page: query.page,
      }
      break
    case 'cc':
      params = {
        format: 'json',
        start: (query.page - 1) * 30,
        size: 30,
      }
      break
    case 'huya':
      params = {
        m: 'LiveList',
        do: 'getLiveListByPage',
        tagAll: 0,
        page: query.page,
      }
      break
    case 'egame':
      params = {
        param: JSON.stringify({
          key: {
            module: 'pgg_live_read_ifc_mt_svr',
            method: 'get_pc_live_list',
            param: {
              appid: 'hot',
              page_num: Number(query.page),
              page_size: 30,
            },
          },
        }),
      }
      break
    default:
      break
  }
  const res = await Util.request(url, query.type, params)
  const data = format(query.type, res)
  ctx.body = data
})

router.get('/video', async (ctx) => {
  const query = ctx.query
  const video = await Util.getVideoUrl(query.type, query.id)
  // 处理换行符
  ctx.body = { data: video.split('\n')[0] }
})

// 根据平台处理返回结果,格式为统一字段
const format = (type, rasult) => {
  let list = []
  switch (type) {
    case 'zhanqi':
      list = rasult.data.rooms
      break
    case 'cc':
      list = rasult.lives
      break
    case 'douyu':
      list = rasult.data
      break
    case 'egame':
      list = rasult.data.key.retBody.data.live_data.live_list
      break
    case 'bilibili':
      list = rasult.data
      break
    case 'huya':
      list = rasult.data.datas
      break
    case 'huomao':
      list = rasult.data.channelList
      break
    default:
      break
  }

  let arr = []
  for (const item of list) {
    let obj = {}
    if (type == 'zhanqi') {
      obj = {
        roomId: item.code, // 房间号
        roomName: item.title, // 房间名称
        roomUrl: item.spic, // 房间图片
        nickname: item.nickname, // 用户名
        anchorUrl: item.avatar, // 用户头像
        online: item.online, // 在线人数
      }
    } else if (type == 'douyu') {
      obj = {
        roomId: item.room_id,
        roomName: item.room_name,
        roomUrl: item.room_src,
        nickname: item.nickname,
        anchorUrl: item.avatar,
        online: item.online,
      }
    } else if (type == 'egame') {
      obj = {
        roomId: item.anchor_id,
        roomName: item.title,
        roomUrl: item.video_info.url,
        anchorUrl: item.anchor_face_url,
        nickname: item.anchor_name,
        online: item.online,
      }
    } else if (type == 'huya') {
      obj = {
        roomId: item.profileRoom,
        roomName: item.roomName,
        roomUrl: item.screenshot,
        anchorUrl: item.avatar180,
        nickname: item.nick,
        online: item.totalCount,
      }
    } else if (type == 'bilibili') {
      obj = {
        roomId: item.roomid,
        roomName: item.title,
        roomUrl: item.system_cover,
        anchorUrl: item.face,
        nickname: item.uname,
        online: item.online,
      }
    } else if (type == 'huomao') {
      obj = {
        roomId: item.room_number,
        roomName: item.channel,
        roomUrl: item.image,
        anchorUrl: item.headimg.normal,
        nickname: item.nickname,
        online: item.originviews,
      }
    } else if (type == 'cc') {
      obj = {
        roomId: item.cuteid,
        roomName: item.title,
        roomUrl: item.poster,
        anchorUrl: item.purl,
        nickname: item.nickname,
        online: item.total_visitor,
      }
    }
    arr.push(obj)
  }
  let data = arr.sort((a, b) => {
    return b.online - a.online
  })
  return { data: data }
}

module.exports = router
