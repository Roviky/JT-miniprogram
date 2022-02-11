// 获取帖子的列表
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 主页拉取帖子列表（修改成分页加载了，触底再次加载的形式）
exports.main = async (event, context) => {
    return await db.collection('post_collection_jt')
        // field含义是返回那些字段
        .field({
            _id: true,
            author_name: true,
            author_id: true,
            author_avatar_url: true,
            content: true,
            title: true,
            watch_count: true,
            star_count: true,
            comment_count: true,
            update_time: true,
            publish_time: true,
            image_url: true,
            theme: true,
            carbon_reduction: true
        })
        .orderBy('publish_time', 'desc')
        .skip(event.length)
        .limit(event.pageNum)
        .get();
}