// 收藏
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 收藏
exports.main = async (event, context) => {

    // 进行删除
    if (event.flag == 1) {
        // 对帖子进行修改，收藏数-1
        await db.collection('post_collection_jt')
            .where({
                _id: event.postId
            })
            .update({
                data: {
                    star_count: _.inc(-1)
                }
            })

        // 给帖子删除点赞的人id + 头像
        await db.collection('post_collection_jt')
            .doc(event.postId)
            .update({
                data: {
                    like_users: _.pull({
                        user_avatar: event.othersAvatar,
                        user_id: event.userInfo.openId,
                    })
                }
            })

        // 用户收藏列表 -1
        return await db.collection('user_collection_jt')
            .where({
                user_id: event.userInfo.openId
            })
            .update({
                data: {
                    like_list: _.pull(event.postId)
                }
            })
    }
    else { // 进行添加

        // 对帖子进行修改，收藏数 +1
        await db.collection('post_collection_jt')
            .where({
                _id: event.postId
            })
            .update({
                data: {
                    star_count: _.inc(1)
                }
            })

        // 给帖子添加点赞的人id + 头像
        await db.collection('post_collection_jt')
            .doc(event.postId)
            .update({
                data: {
                    like_users: _.push({
                        user_avatar: event.othersAvatar,
                        user_id: event.userInfo.openId,
                        time: event.publish_time
                    })
                }
            })

        // 给原作者添加通知
        // 多次收藏，应该只显示一次
        if (event.hasFlag == true) {
            // 先删除再添加
            await db.collection('user_collection_jt')
                .where({
                    user_id: event.authorId
                })
                .update({
                    data: {
                        inform_list: _.pull({
                            flag: 0,
                            postId: event.postId,
                            othersId: event.userInfo.openId
                        })
                    }
                })

            await db.collection('user_collection_jt')
                .where({
                    user_id: event.authorId
                })
                .update({
                    data: {
                        inform_list: _.push({
                            // 0表示收藏
                            flag: 0,
                            // 哪个帖子，方便索引
                            postId: event.postId,
                            // 图片
                            imageUrls: event.imageUrls,
                            // 帖子的内容
                            postContent: event.content,
                            // 没有内容
                            content: '',
                            // 收藏人的信息
                            othersId: event.userInfo.openId,
                            othersAvatar: event.othersAvatar,
                            othersNickName: event.othersNickName,
                            // 时间
                            publish_time: event.publish_time
                        })
                    }
                })

            // 给收藏的人在收藏列表里进行添加
            return await db.collection('user_collection_jt')
                .where({
                    user_id: event.userInfo.openId
                })
                .update({
                    data: {
                        like_list: _.push(event.postId)
                    }
                })
        }
        else {
            await db.collection('user_collection_jt')
                .where({
                    user_id: event.authorId
                })
                .update({
                    data: {
                        inform_list: _.push({
                            // 0表示收藏
                            flag: 0,
                            // 哪个帖子，方便索引
                            postId: event.postId,
                            // 图片
                            imageUrls: event.imageUrls,
                            // 帖子的内容
                            postContent: event.content,
                            // 没有内容
                            content: '',
                            // 收藏人的信息
                            othersId: event.userInfo.openId,
                            othersAvatar: event.othersAvatar,
                            othersNickName: event.othersNickName,
                            // 时间
                            publish_time: event.publish_time
                        })
                    }
                })

            // 给收藏的人在收藏列表里进行添加
            return await db.collection('user_collection_jt')
                .where({
                    user_id: event.userInfo.openId
                })
                .update({
                    data: {
                        like_list: _.push(event.postId)
                    }
                })
        }

    }
}