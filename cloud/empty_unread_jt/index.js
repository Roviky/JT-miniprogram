// 清空未读
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 清空未读
exports.main = async (event, context) => {
    // 对方在我的列表中索引
    let heInMyIndex = event.heInMyIndex

    let heInMyUnReadStr = 'chat_list.' + heInMyIndex + '.unRead'

    return await db.collection('user_collection_jt')
        .where({
            user_id: event.userId
        })
        .update({
            data: {
                [heInMyUnReadStr]: 0
            }
        })
}