// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 获取 postid 帖子的详细信息
exports.main = async (event, context) => {
    try {
        return await db.collection('post_collection_jt')
            .doc(event.postid)
            .get()
    }
    catch (err) {
        return err;
    }
}