// const config = require('./config')
// const notes = ['测试安装更新']

const updateData = {
  ios: {
    version: '2.0.2',
    notes: [
      `发现焦点2.0.2
(务必删除原APP后重新下载安装)
`,
      `发现焦点2.0`,
      `优化调整`,
      `1.修复bug
2.京选商城调整`,
      `1.修复程序明显bug
2.退款，文本检验，累计登录
3.页面部分修改`,
      `1.修复评测关联商品跳转商品详情bug，
2.修复签到日历界面记录显示bug，
3.添加开机图，
4.修复一些bug及优化`,
      '修复一些bug及优化'
    ],
    // url: 'https://www.pgyer.com/DFcd'
    url: 'https://www.pgyer.com/QcuX'
  },
  android: {
    version: '2.0.3',
    notes: [
      `修改前期已知Bug，优化用户注册流程
(温馨提示:务必删除原APP后重新下载安装)
`,
      `发现焦点2.0.2
(务必删除原APP后重新下载安装)
`,
      `发现焦点2.0`,
      `优化调整`,
      `1.修复bug
2.京选商城调整`,
      `1.修复程序明显bug
2.退款，文本检验，累计登录
3.页面部分修改`,
      `1.修复评测关联商品跳转商品详情bug，
2.修复签到日历界面记录显示bug，
3.添加开机图，
4.修复一些bug及优化`,
      '修复一些bug及优化'
    ],
    // url: 'https://www.pgyer.com/iHri',
    // url: 'https://www.pgyer.com/j5Um',
    // url:'http://img-juren.oss-cn-shenzhen.aliyuncs.com/app/2.0.3_prod.apk',
    url: 'https://a.app.qq.com/o/simple.jsp?pkgname=com.dfn.newdiscoverfocusnews'
  }
}

module.exports = (req, res) => {

  let ret = {
    status: 0
  }

  let query = req.query
  let version = query.version || ''
  let platform = query.platform || ''

  let data = updateData[platform]
  console.log('version ============================', data.version)
  if (data && version && version != data.version) {
    ret.status = 1
    ret.note = data.notes[0],
      ret.url = data.url
  }

  console.log('update ====================================================', ret)
  return res.json(ret)
}