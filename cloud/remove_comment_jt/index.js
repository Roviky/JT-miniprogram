// 删除评论
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 删除一个评论
exports.main = async (event, context) => {
    // 先从用户的 comment_list进行删除
    await db.collection('user_collection_jt')
        .where({
            user_id: event.userId
        })
        .update({
            data: {
                comment_list: _.pull(event.commentId)
            }
        })

    // 将帖子的评论数 -1
    await db.collection('post_collection_jt')
        .doc(event.postId)
        .update({
            data: {
                comment_count: _.inc(-1)
            }
        })

    // 再从评论列表进行删除
    return await db.collection('comment_collection_jt')
        .doc(event.commentId)
        .remove()
}