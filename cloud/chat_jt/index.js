// 聊天
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 聊天
exports.main = async (event, context) => {
    // 第一次创建
    if (event.flag == 0) {
        // 先给发送方添加
        await db.collection('user_collection_jt')
            .where({
                user_id: event.fromId
            })
            .update({
                data: {
                    chat_list: _.push({
                        // 对方的信息
                        toId: event.toId,
                        toAvatar: event.toAvatar,
                        toName: event.toName,
                        // 聊天记录
                        list: [],
                        // 最新的时间
                        updateTime: event.time,
                        // 未读消息数
                        unRead: event.unRead
                    })
                }
            })

        // 给接收方添加
        return await db.collection('user_collection_jt')
            .where({
                user_id: event.toId
            })
            .update({
                data: {
                    chat_list: _.push({
                        // 对方的信息
                        toId: event.fromId,
                        toAvatar: event.fromAvatar,
                        toName: event.fromName,
                        // 聊天记录
                        list: [],
                        // 最新的时间
                        updateTime: event.time,
                        // 未读消息数
                        unRead: event.unRead
                    })
                }
            })
    }
    // 已经创建了
    else {
        // 我在对方列表的索引
        let meInHeIndex = event.meInHeIndex
        // 对方在我的列表中索引
        let heInMyIndex = event.heInMyIndex

        let meInHeStr = 'chat_list.' + meInHeIndex + '.list'

        let heInMyStr = 'chat_list.' + heInMyIndex + '.list'
        
        // 更改时间用的
        let meInHeTimeStr = 'chat_list.' + meInHeIndex + '.updateTime'

        let heInMyTimeStr = 'chat_list.' + heInMyIndex + '.updateTime'

        // 未读数目
        let meInHeUnReadStr = 'chat_list.' + meInHeIndex + '.unRead'

        let heInMyUnReadStr = 'chat_list.' + heInMyIndex + '.unRead'

        // 有图片
        if (event.img_url.length > 0) {
            for (let i = 0; i < event.img_url.length; i++) {
                // 先给发送方添加
                await db.collection('user_collection_jt')
                    .where({
                        user_id: event.fromId
                    })
                    .update({
                        data: {
                            // 动态键！！！
                            [heInMyStr]: _.push({
                                content: event.img_url[i],
                                // 下面这个，0表示发送方，1表示接收方
                                authorFlag: 0,
                                // 下面这个，0表示文字，1表示图片
                                contentFlag: 1,
                                // 时间
                                time: event.time
                            }),
                            // 修改这个记录的最新时间
                            [heInMyTimeStr]: event.time
                        }
                    })

                // 再给接受方添加
                await db.collection('user_collection_jt')
                    .where({
                        user_id: event.toId
                    })
                    .update({
                        data: {
                            // 动态键！！！
                            [meInHeStr]: _.push({
                                content: event.img_url[i],
                                // 下面这个，0表示发送方，1表示接收方
                                authorFlag: 1,
                                // 下面这个，0表示文字，1表示图片
                                contentFlag: 1,
                                // 时间
                                time: event.time
                            }),
                            // 修改这个记录的最新时间
                            [meInHeTimeStr]: event.time,
                            // 修改未读数目，只修改接收方的就可以
                            [meInHeUnReadStr]: _.inc(1)
                        }
                    })
            }
        }
        // 以下文字内容

        // 先给发送方添加
        await db.collection('user_collection_jt')
            .where({
                user_id: event.fromId
            })
            .update({
                data: {
                    // 动态键！！！
                    [heInMyStr]: _.push({
                        content: event.content,
                        // 下面这个，0表示发送方，1表示接收方
                        authorFlag: 0,
                        // 下面这个，0表示文字，1表示图片
                        contentFlag: 0,
                        // 时间
                        time: event.time
                    }),
                    // 修改这个记录的最新时间
                    [heInMyTimeStr]: event.time
                }
            })

        // 再给接受方添加
        return await db.collection('user_collection_jt')
            .where({
                user_id: event.toId
            })
            .update({
                data: {
                    // 动态键！！！
                    [meInHeStr]: _.push({
                        content: event.content,
                        // 下面这个，0表示发送方，1表示接收方
                        authorFlag: 1,
                        // 下面这个，0表示文字，1表示图片
                        contentFlag: 0,
                        // 时间
                        time: event.time
                    }),
                    // 修改这个记录的最新时间
                    [meInHeTimeStr]: event.time,
                    // 修改未读数目，只修改接收方的就可以
                    [meInHeUnReadStr]: _.inc(1)
                }
            })
    }
}