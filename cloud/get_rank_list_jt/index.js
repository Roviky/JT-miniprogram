// 获取帖子的列表
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// !!! orderBy竟然可以选择某个对象里面的数据进行排序

// 获取排行榜
exports.main = async (event, context) => {
    // 当天的
    if (event.flag == 0) {
        return await db.collection('user_collection_jt')
            .orderBy('day_data.carbon_reduction', 'desc')
            .get();
    } // 本周的
    else if (event.flag == 1) {
        return await db.collection('user_collection_jt')
            .orderBy('week_data.carbon_reduction', 'desc')
            .get();
    } // 全部
    else if (event.flag == 2) {
        return await db.collection('user_collection_jt')
            .orderBy('total_data.carbon_reduction', 'desc')
            .get();
    }
    else;
}