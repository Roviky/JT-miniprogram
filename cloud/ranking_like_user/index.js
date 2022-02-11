// 收藏
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 收藏
exports.main = async (event, context) => {
    // 今天的
    if (event.likeFlag == 0) {
        var str1 = 'day_data.like_num'
        var str2 = 'day_data.ranking_like'
        var str3 = 'day_data.who_like_list'
        // 进行删除
        if (event.flag == 0) {
            // 对方点赞数 -1 todo:添加通知，一个列表
            await db.collection('user_collection_jt')
                .where({
                    user_id: event.othersId
                })
                .update({
                    data: {
                        [str1]: _.inc(-1),
                        [str3]: _.pull(event.userInfo.openId)
                    }
                })

            // 我点赞列表 -1
            return await db.collection('user_collection_jt')
                .where({
                    user_id: event.userInfo.openId
                })
                .update({
                    data: {
                        [str2]: _.pull(event.othersId)
                    }
                })
        }
        else { // 进行添加    todo:添加通知，一个列表
            // 对方点赞数 +1 
            await db.collection('user_collection_jt')
                .where({
                    user_id: event.othersId
                })
                .update({
                    data: {
                        [str1]: _.inc(1),
                        [str3]: _.push(event.userInfo.openId)
                    }
                })

            // 我点赞列表 +1
            return await db.collection('user_collection_jt')
                .where({
                    user_id: event.userInfo.openId
                })
                .update({
                    data: {
                        [str2]: _.push(event.othersId)
                    }
                })
        }
    }
    // 本周的
    else if (event.likeFlag == 1) {
        var str1 = 'week_data.like_num'
        var str2 = 'week_data.ranking_like'
        var str3 = 'week_data.who_like_list'
        // 进行删除
        if (event.flag == 0) {
            // 对方点赞数 -1 todo:添加通知，一个列表
            await db.collection('user_collection_jt')
                .where({
                    user_id: event.othersId
                })
                .update({
                    data: {
                        [str1]: _.inc(-1),
                        [str3]: _.pull(event.userInfo.openId)
                    }
                })

            // 我点赞列表 -1
            return await db.collection('user_collection_jt')
                .where({
                    user_id: event.userInfo.openId
                })
                .update({
                    data: {
                        [str2]: _.pull(event.othersId)
                    }
                })
        }
        else { // 进行添加    todo:添加通知，一个列表
            // 对方点赞数 +1 
            await db.collection('user_collection_jt')
                .where({
                    user_id: event.othersId
                })
                .update({
                    data: {
                        [str1]: _.inc(1),
                        [str3]: _.push(event.userInfo.openId)
                    }
                })

            // 我点赞列表 +1
            return await db.collection('user_collection_jt')
                .where({
                    user_id: event.userInfo.openId
                })
                .update({
                    data: {
                        [str2]: _.push(event.othersId)
                    }
                })
        }
    }
    // 全部的
    else if (event.likeFlag == 2) {
        var str1 = 'total_data.like_num'
        var str2 = 'total_data.ranking_like'
        var str3 = 'total_data.who_like_list'
        // 进行删除
        if (event.flag == 0) {
            // 对方点赞数 -1 todo:添加通知，一个列表
            await db.collection('user_collection_jt')
                .where({
                    user_id: event.othersId
                })
                .update({
                    data: {
                        [str1]: _.inc(-1),
                        [str3]: _.pull(event.userInfo.openId)
                    }
                })

            // 我点赞列表 -1
            return await db.collection('user_collection_jt')
                .where({
                    user_id: event.userInfo.openId
                })
                .update({
                    data: {
                        [str2]: _.pull(event.othersId)
                    }
                })
        }
        else { // 进行添加    todo:添加通知，一个列表
            // 对方点赞数 +1 
            await db.collection('user_collection_jt')
                .where({
                    user_id: event.othersId
                })
                .update({
                    data: {
                        [str1]: _.inc(1),
                        [str3]: _.push(event.userInfo.openId)
                    }
                })

            // 我点赞列表 +1
            return await db.collection('user_collection_jt')
                .where({
                    user_id: event.userInfo.openId
                })
                .update({
                    data: {
                        [str2]: _.push(event.othersId)
                    }
                })
        }
    }
}