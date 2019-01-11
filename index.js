const express = require('express')
const app = express()

const bodyParser = require('body-parser') // 处理请求中body的内容
const methodOverride = require('method-override')
// const uuid = require('uuid')
const config = require('./config')

// parse request bodies (req.body)
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(bodyParser.raw({
  type: 'application/xml'
}))
app.use(bodyParser.text({
  type: 'text/xml'
}))

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'))

// 请求处理
app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8080");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next()
})

app.use('/upload', require('./lib/upload'))
// 路由
app.use(require('./app/controller'))

// 错误处理
let logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}
let clientErrorHandler = (err, req, res, next) => {
  if (req.xhr) {
    res.status(500).send({
      error: 'Something failed!'
    })
  } else {
    next(err)
  }
}
let errorHandler = (err, req, res, next) => {
  res.status(500)
  res.render('error', {
    error: err
  })
}
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

const port = config.port || process.env.PORT || 5001
app.listen(port, () => {
  console.log(`apiSvr listening on port ${port}`)
})