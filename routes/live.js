const router = require('koa-router')()
const Util = require('../module/Util')

router.prefix('/live')

router.get('/list', async (ctx) => {
  const query = ctx.query

  let params = {}
  // 不同直播平台请求参数不一样
  switch (query.type) {
    case 'douyu':
      params = { offset: query.page * 30, limit: 30 }
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
    case 'bilibili':
      params = { page: query.page, page_size: 30 }
      break
    case 'huya':
      params = {
        m: 'LiveList',
        do: 'getLiveListByPage',
        tagAll: 0,
        page: query.page,
      }
      break
    case 'huomao':
      params = {
        game_url_rule: 'all',
        page: query.page,
      }
      break

    default:
      break
  }
  const res = await Util.request(query.type, params)
  const data = format(query.type, res)
  // const video = await Util.getVideoUrl(query.type, data[0].roomId)
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
    if (type == 'douyu') {
      obj = {
        roomId: item.room_id, // 房间号
        roomName: item.room_name, // 房间名称
        roomUrl: item.room_src, // 房间图片
        nickname: item.nickname, // 用户名
        anchorUrl: item.avatar, // 用户头像
        online: item.online, // 在线人数
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
    }
    arr.push(obj)
  }
  return { data: arr }
}

module.exports = router
