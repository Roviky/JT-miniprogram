// 给用户 评论列表 进行更新
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 更新评论列表
exports.main = async (event, context) => {
    return await db.collection('user_collection_jt')
        .where({
            user_id: event.userInfo.openId
        })
        .update({
            data: {
                comment_list: _.push(event.commentId)
            }
        })
}