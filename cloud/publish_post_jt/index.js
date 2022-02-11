// 发布帖子
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 发布一个帖子
exports.main = async (event, context) => {

    return await db.collection('post_collection_jt')
        .add({
            // data 字段表示需新增的 JSON 数据
            data: {
                // 用户的唯一标识，云函数自动获得，不需要传递参数
                author_id: event.userInfo.openId,
                // 用户名
                author_name: event.author_name,
                // 用户头像
                author_avatar_url: event.author_avatar_url,
                // 内容
                content: event.content,
                // 图片的云端路径
                image_url: event.image_url,
                // 服务器时间和本地时间会造成什么影响，需要评估
                publish_time: event.publish_time,
                // update_time: event.update_time,// 最近一次更新时间，发布或者评论触发更新,目前用服务器端时间
                update_time: Date.now(),
                // 评论数
                comment_count: 0,
                //浏览数
                watch_count: 1,
                // 收藏人数
                star_count: 0,
                // 主题
                theme: event.theme,
                // 点赞的人头像 + id
                like_users: [],
                // 里程数
                mileCount: event.mileCount,
                // 减排量
                carbon_reduction: event.carbon_reduction
            }
        })

}