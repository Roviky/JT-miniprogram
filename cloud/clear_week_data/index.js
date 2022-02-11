// 定时清空数据
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
    var checkStr = 'day_data.like_num'
    // 清空每周的
    var str1 = 'week_data.bike_mile'
    var str2 = 'week_data.bus_mile'
    var str3 = 'week_data.walk_mile'
    var str4 = 'week_data.subway_mile'
    var str5 = 'week_data.carbon_reduction'
    var str6 = 'week_data.like_num'
    var str7 = 'week_data.ranking_like'
    var str8 = 'week_data.related_post'
    var str9 = 'week_data.who_like_list'

    return await db.collection('user_collection_jt')
        .where({
            [checkStr]: _.gt(-100)
        })
        .update({
            data: {
                [str1]: 0,
                [str2]: 0,
                [str3]: 0,
                [str4]: 0,
                [str5]: 0,
                [str6]: 0,
                [str7]: [],
                [str8]: [],
                [str9]: []
            }
        })
}