// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 更新浏览量的数据（.doc只支持_id的查询）
exports.main = async (event, context) => {
    await db.collection('post_collection_jt')
        .doc(event.postid)
        .update({
            data: {
                // 数据库的操作，进行+1
                watch_count: _.inc(1)
            }
        })
}