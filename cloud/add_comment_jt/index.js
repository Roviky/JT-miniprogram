// 云函数入口文件
const cloud = require('wx-server-sdk')


cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 添加评论
exports.main = async (event, context) => {
    // 获取当前的时间
    const timestamp = Date.now()

    // 给帖子列表进行时间的更新，评论数更新
    await db.collection('post_collection_jt')
        .where({
            _id: event.postid
        })
        .update({
            data: {
                update_time: timestamp,
                comment_count: _.inc(1)
            }
        })

    // 给原作者添加通知
    await db.collection('user_collection_jt')
        .where({
            user_id: event.authorId
        })
        .update({
            data: {
                inform_list: _.push({
                    // 1表示评论
                    flag: 1,
                    // 哪个帖子，方便索引
                    postId: event.postid,
                    // 图片
                    imageUrls: event.imageUrls,
                    // 帖子的内容
                    postContent: event.post_content,
                    // 评论内容
                    commentContent: event.comment_content,
                    // 收藏人的信息
                    othersId: event.userInfo.openId,
                    othersAvatar: event.othersAvatar,
                    othersNickName: event.othersNickName,
                    // 时间
                    publish_time: timestamp
                })
            }
        })

    // 给评论的数据库添加数据
    return await db.collection('comment_collection_jt')
        .add({
            data: {
                // 对应帖子的id
                postid: event.postid,
                // 用户的id
                openid: event.userInfo.openId,
                // 用户昵称
                name: event.name,
                // 评论者头像
                avatarUrl: event.avatarUrl,
                //评论发生的时间
                time: timestamp,
                //评论内容
                content: event.comment_content
            }
        })
}