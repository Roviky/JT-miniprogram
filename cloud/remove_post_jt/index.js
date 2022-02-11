// 删除帖子
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 删除一个帖子
exports.main = async (event, context) => {
    // 先从用户的post_list进行删除
    await db.collection('user_collection_jt')
        .where({
            user_id: event.userId
        })
        .update({
            data: {
                post_list: _.pull(event.postId)
            }
        })

    // 将帖子带的图片进行删除
    if (event.images.length !== 0) {
        const fileIDs = event.images
        await cloud.deleteFile({
            fileList: fileIDs,
        })
    }

    // 再从所有帖子的列表进行删除
    return await db.collection('post_collection_jt')
        .doc(event.postId)
        .remove()
}