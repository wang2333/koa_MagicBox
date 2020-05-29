const router = require('koa-router')()
const path = require('path')
const send = require('koa-send')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'MagicBox',
  })
})

router.get('/download/:fileName', async (ctx) => {
  const fileName = ctx.params.fileName
  const pathName = `download/${fileName}`
  ctx.attachment(pathName)
  await send(ctx, pathName)
})

module.exports = router
