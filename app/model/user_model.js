const Model = require('./../../lib/model')
const {
  user,
  userInfo,
  userAuth,
  oAuth,
  userApply,
  userAddress,
  userDailySign,
  userEcard,
  userInvoice,
  userCollection,
  userTransaction
} = require('./../../config/models')
const Op = require('sequelize').Op
const uuid = require('uuid')

class UserModel extends Model {

  model() {
    return this.db().define('user', user()[0], user()[1])
  }

  oAuthModel() {
    return this.db().define('oauth', oAuth()[0], oAuth()[1])
  }

  infoModel() {
    return this.db().define('user_info', userInfo()[0], userInfo()[1])
  }

  authModel() {
    return this.db().define('user_auth', userAuth()[0], userAuth()[1])
  }

  applyModel() {
    return this.db().define('user_apply', userApply()[0], userApply()[1])
  }

  addressModel() {
    return this.db().define('user_address', userAddress()[0], userAddress()[1])
  }

  invoiceModel() {
    return this.db().define('user_invoice', userInvoice()[0], userInvoice()[1])
  }

  dailySignModel() {
    return this.db().define('user_daily_sign', userDailySign()[0], userDailySign()[1])
  }

  ecardModel() {
    return this.db().define('user_ecard', userEcard()[0], userEcard()[1])
  }

  collectionModel() {
    return this.db().define('user_collection', userCollection()[0], userCollection()[1])
  }

  transactionModel() {

    return this.db().define('user_transaction', userTransaction()[0], userTransaction()[1])
  }

  async checkAuth(ctx) {

    let token = ctx.query.token || ctx.body.token || ''
    console.log(ctx.uuid, 'UserController._init_ token ', token)
    if (!token) {
      ctx.ret.code = -101
      ctx.ret.message = 'token err'
      return ctx.ret
    }

    // let userModel = new this.models.user_model
    let userAuth = await this.authModel().findOne({
      where: {
        token: token
      }
    })

    if (!userAuth) {
      ctx.ret.code = -100
      ctx.ret.message = 'token check fail'
      return ctx.ret
    } else {
      console.log(ctx.uuid, 'UserController._init_ user ', userAuth.token || null)
    }

    ctx.body.user_id = userAuth.user_id

    this.model().findByPk(userAuth.user_id).then((user) => {
      user.last_signin_time = parseInt(Date.now() / 1000)
      user.last_signin_ip = ctx.ip
      user.save()
    }).catch((err) => {
      console.error(ctx.uuid, err.message || 'log sign err')
    })

    return ctx.ret

  }

  /**
   * 获取授权登录信息
   * @param {*} platform 
   * @param {*} openid 
   */
  async getOauthByPlatformAndOpenid(oauthData) {
    let oauth = await this.oAuthModel().findOne({
      where: {
        platform: oauthData.platform,
        type:oauthData.type,
        openid: oauthData.openid
      }
    })

    if (!oauth) {
      oauth = await this.oAuthModel().create({
        platform: oauthData.platform,
        type:oauthData.type,
        openid: oauthData.openid,
        avatar: oauthData.avatar || '',
        nickname: oauthData.nickname || ''
      })
    }

    return oauth
  }
  /**
   * 授权登录
   * @param {*} auth 
   */
  async authLogin(auth) {
    // console.log(JSON.stringify(auth))
    auth.token = uuid.v4()

    let userAuth = await this.authModel().findOne({
      where: {
        user_id: auth.user_id,
        platform: auth.platform,
        type: auth.type
      }
    })

    if (userAuth) {
      let saveRet = await userAuth.update(auth)
      console.log(JSON.stringify(saveRet))
      return saveRet
    } else {
      userAuth = await this.authModel().create(auth)
      console.log(JSON.stringify(userAuth))
      return userAuth
    }

  }

  /**
   * 获取邀请人
   * @param {*} userId 
   */
  async getInviteUser(userId) {
    let user = await this.model().findOne({
      where: {
        id: userId
      }
    })
    return user || null
  }

  async getInfoByUserId(userId, mobile = '') {
    let info = await this.infoModel().findOne({
      where: {
        user_id: userId
      }
    })
    if (!info) {
      info = await this.infoModel().create({
        user_id: userId,
        mobile: mobile
      })
    }

    return info
  }

  async getMiniOpenIdByUserId(userId){
    let where = {
      user_id : userId,
      type: 'mpwx',
      openid: {
        [Op.ne]:''
      }
    }

    let oauth = await this.oAuthModel().findOne({
      where:where,
      order:[
        ['id' , 'desc']
      ]
    })

    return oauth ? (oauth.openid || '') : ''
    
  }

  /**
   * 增加用户积分或者现金
   * @param {*} ctx 
   * @param {*} userId 
   * @param {*} balance 
   * @param {*} score 
   * @param {*} t 
   */
  async addUserAssets(ctx, userId, balance = 0, score = 0, t = null) {
    let ret = {
      code: 0,
      message: ''
    }

    let info = await this.getInfoByUserId(userId)
    info.balance = info.balance + balance
    info.score = info.score + score

    let opts = {
      transaction: t
    }
    let saveRet = await info.save(opts)
    if (!saveRet) {
      ret.code = 1
      ret.message = '更新用户资产失败'
    }

    return ret
  }

  /**
   * 弃用
   * @param {*} userId 
   */
  // async isVip(userId) {
  //   let user = await this.model().findByPk(userId)
  //   if (!user) {
  //     return false
  //   }
  //   let now = parseInt(Date.now() / 1000)
  //   if (user.vip && user.startline <= now && user.deadline >= now) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  async isVip(userId) {
    let user = await this.getInfoByUserId(userId)

    return this.isVipByInfo(user)
    if (!user) {
      return false
    }
    // let now = parseInt(Date.now() / 1000)
    // if (user.vip && user.startline <= now && user.deadline >= now) {
    //   return true
    // } else {
    //   return false
    // }
  }

  async isVipByInfo(user){
    let now = parseInt(Date.now() / 1000)
    if (user && user.vip && user.startline <= now && user.deadline >= now) {
      return 1
    } else {
      return 0
    }
  }

  /**
   * 获取用户发票信息
   * @param {*} userId 
   */
  async getUserInvoice(userId) {
    let userInvoice = await this.invoiceModel().findOne({
      where: {
        user_id: userId
      }
    })
    if (!userInvoice) {
      userInvoice = await this.invoiceModel().create({
        user_id: userId
      })
    }
    return userInvoice

  }

  async ecardUse(ctx, userId, ecardId, amount, t = null) {
    let ecard = await this.ecardModel().findOne({
      where: {
        id: ecardId,
        user_id: userEcard
      }
    })
    if (!ecard && ecard.amount <= 0 && ecard.status != 1) {
      return false
    }

    if (ecard.amount < amount) {
      return false
    }

    ecard.amount = ecard.amount - amount
    ecard.status = ecard.amount <= 0 ? 0 : 1

    let opt = {}
    if (t) opt.transaction = t
    let update = await ecard.save(opt)

    if (update) {
      return true
    } else {
      return false
    }
  }

  async isCollectPost(userId, postId) {
    let find = await this.collectionModel().findOne({
      where: {
        user_id: userId,
        post_id: postId,
        status: 1
      }
    })

    return find ? 1 : 0
  }

  async isCollectGoods(userId, goodsId) {
    let find = await this.collectionModel().findOne({
      where: {
        user_id: userId,
        goods_id: goodsId,
        status: 1
      }
    })

    return find ? 1 : 0
  }

  async getUserApplyByType(userId, type = 1) {
    let find = await this.applyModel().findOne({
      where: {
        user_id: userId,
        type: type
      },
      order: [
        ['create_time', 'desc']
      ]
    })

    return find
  }

  async transactionAdd(userId, type = 1, data, t = null) {
    let transactionData = {}
    transactionData.type = type || 1
    if (type == 2 || type == 3) {
      data.balance = -1 * data.balance
    }
    transactionData.balance = data.balance || 0
    transactionData.amount = data.amount || 0
    transactionData.score = data.score || 0
    transactionData.status = data.hasOwnProperty('status') ? data.status : 1
    transactionData.user_id = userId
    transactionData.method = data.method || 'alipay'
    transactionData.remark = data.remark || ''

    let opts = {}
    if (t) {
      opts.transaction = t
    }
    let transaction = await this.transactionModel().create(transactionData, opts)
    return transaction
  }

  setUserPushInfo(userId , data){
    
  }

  async getUserAuthDataById(userId){
    let ret = {
      h5:0,
      mpwx:0,
      app:0
    }

    let list = await this.authModel().findAll({
      where: {user_id: userId}
    })

    // console.log(JSON.stringify(list))
    list.forEach(item => {
      if(item.type == 'h5'){
        ret.h5 = 1
      }else if(item.type == 'mpwx'){
        ret.mpwx = 1
      }else if(item.type == 'app'){
        ret.app = 1
      }
    })

    return ret

  }

}

module.exports = UserModel