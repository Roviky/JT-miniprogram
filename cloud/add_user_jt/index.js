// 添加用户
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 添加用户
exports.main = async (event, context) => {
    return await db.collection('user_collection_jt')
        .add({
            data: {
                // 用户的唯一标识，云函数自动获得，不需要传递参数
                user_id: event.userInfo.openId,
                // 用户名
                user_name: event.user_name,
                // 用户头像
                user_avatar_url: event.user_avatar_url,
                // 地区
                user_position: event.user_position,
                // 发布帖子的列表
                post_list: [],
                // 评论列表
                comment_list: [],
                // 点赞列表
                like_list: [],
                // 收藏列表
                shoucang_list: [],
                // 通知列表
                inform_list: [],
                // 给别人留言的列表
                message_list: [],
                // 聊天的列表
                chat_list: [],
                // 每天的数据
                day_data: {
                    // 每天在排行榜给谁点赞了
                    ranking_like: [],
                    // 每天被点赞的数量
                    like_num: 0,
                    // 都被谁点赞了
                    who_like_list: [],
                    // 每天的减排量
                    carbon_reduction: 0,
                    // 每天相关的帖子
                    related_post: [],
                    // 每天的四种交通工具数量
                    bus_mile: 0,
                    bike_mile: 0,
                    subway_mile: 0,
                    walk_mile: 0
                },
                // 每周的数据
                week_data: {
                    // 每周在排行榜给谁点赞了
                    ranking_like: [],
                    // 每周被点赞的数量
                    like_num: 0,
                    // 都被谁点赞了
                    who_like_list: [],
                    // 每周的减排量
                    carbon_reduction: 0,
                    // 每周相关的帖子
                    related_post: [],
                    // 每周的四种交通工具数量
                    bus_mile: 0,
                    bike_mile: 0,
                    subway_mile: 0,
                    walk_mile: 0
                },
                // 总共的数据
                total_data: {
                    // 在总共排行榜给谁点赞了
                    ranking_like: [],
                    // 总共被点赞的数量
                    like_num: 0,
                    // 都被谁点赞了
                    who_like_list: [],
                    // 总共的减排量
                    carbon_reduction: 0,
                    // 总共相关的帖子
                    related_post: [],
                    // 总共的四种交通工具数量
                    bus_mile: 0,
                    bike_mile: 0,
                    subway_mile: 0,
                    walk_mile: 0
                }
            }
        })
}