// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 获取用户的 openid
exports.main = async (event, context) => {
    return event;
}