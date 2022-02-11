// 给用户发表的帖子列表进行更新
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 更新发表帖子的列表，同时更新他的减排量
exports.main = async (event, context) => {
    // 排放量添加
    var str1 = 'day_data.carbon_reduction'
    var str2 = 'week_data.carbon_reduction'
    var str3 = 'total_data.carbon_reduction'
    // 排放量添加
    var str4 = 'day_data.related_post'
    var str5 = 'week_data.related_post'
    var str6 = 'total_data.related_post'
    // 判断主题 ['公交', '骑行', '步行', '地铁']
    if (event.theme == '公交') {
        var str7 = 'day_data.bus_mile'
        var str8 = 'week_data.bus_mile'
        var str9 = 'total_data.bus_mile'
    }
    else if (event.theme == '骑行') {
        var str7 = 'day_data.bike_mile'
        var str8 = 'week_data.bike_mile'
        var str9 = 'total_data.bike_mile'
    }
    else if (event.theme == '步行') {
        var str7 = 'day_data.walk_mile'
        var str8 = 'week_data.walk_mile'
        var str9 = 'total_data.walk_mile'
    }
    else if (event.theme == '地铁') {
        var str7 = 'day_data.subway_mile'
        var str8 = 'week_data.subway_mile'
        var str9 = 'total_data.subway_mile'
    }
    return await db.collection('user_collection_jt')
        .where({
            user_id: event.userInfo.openId
        })
        .update({
            data: {
                post_list: _.push(event.postId),
                // 碳排放量的添加
                [str1]: _.inc(event.carbon_reduction),
                [str2]: _.inc(event.carbon_reduction),
                [str3]: _.inc(event.carbon_reduction),
                // 相关帖子的添加
                [str4]: _.push(event.postId),
                [str5]: _.push(event.postId),
                [str6]: _.push(event.postId),
                // 里程数添加
                [str7]: _.inc(event.mileCount),
                [str8]: _.inc(event.mileCount),
                [str9]: _.inc(event.mileCount)
            }
        })
}