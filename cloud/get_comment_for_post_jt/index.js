// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 获取评论（评论数据库）
exports.main = async (event, context) => {
    return await db.collection('comment_collection_jt')
        .where({
            postid: event.postid
        })
        .orderBy('time', 'desc')
        .get();
}