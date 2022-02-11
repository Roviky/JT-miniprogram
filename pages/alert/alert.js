const util = require('../../utils/util.js');

Page({
    data: {
        // 聊天列表
        chat_list: [],
        // 用户信息
        userInfo: {}
    },

    // 跳转到点赞 和 评论
    showAlertDetail(e) {
        // console.log(e);
        const pageId = e.currentTarget.dataset.pageid;
        wx.navigateTo({
            url: '/pages/alertdetail/alertdetail?pageid=' + pageId
        });
    },

    onShow() {
        // tabBar的函数
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 3
            })
        }

        // 如果有用户的信息
        if (wx.getStorageSync('userInfo')) {
            const userInfo = wx.getStorageSync('userInfo')
            console.log('本地存储有用户的数据');
            this.setData({
                userInfo
            })
        }
        else {
            console.log('本地存储没有用户的数据');
            // 跳转到授权页面 
            wx.switchTab({
                url: '/pages/user/user',
            })
            return;
        }

        // 获取消息列表
        const userInfo = wx.getStorageSync('userInfo');
        const userId = userInfo.openId;
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: userId
            })
            .get()
            .then(res => {
                console.log("成功获取到用户的信息", res);
                let chat_list = res.data[0].chat_list;
                // 利用sort进行排序，保证最近的聊天置顶
                chat_list = chat_list.sort(function (obj1, obj2) {
                    let a = obj1.updateTime;
                    let b = obj2.updateTime;
                    if (a > b) {
                        return -1;
                    }
                    else if (a < b) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                })
                // 处理时间
                var myDate = new Date();
                var year = myDate.getFullYear();
                var month = myDate.getMonth();
                var day = myDate.getDate();
                // 年月日与当前相同，显示  小时:分钟
                // 不同，显示日期
                chat_list.forEach(v => {
                    if (v.list.length === 0) {
                        v.lastMsg = '';
                    }
                    else if (v.list[v.list.length - 1].contentFlag == 0) {
                        v.lastMsg = v.list[v.list.length - 1].content;
                    }
                    else if (v.list[v.list.length - 1].contentFlag == 1) {
                        v.lastMsg = "[图片]";
                    }

                    let tmpDate = new Date(v.updateTime);
                    // 当天的  08:56
                    if (tmpDate.getFullYear() == year && tmpDate.getMonth() == month && tmpDate.getDate() == day) {
                        v.updateTime = util.formatTimeHourMinute(new Date(v.updateTime))
                    }
                    // 昨天的 昨天
                    else if (tmpDate.getFullYear() == year && tmpDate.getMonth() == month && (tmpDate.getDate() + 1) == day) {
                        v.updateTime = '昨天'
                    }
                    // 一年之内的  08-11
                    else if (tmpDate.getFullYear() == year) {
                        v.updateTime = util.formatTimeMonthDay(new Date(v.updateTime))
                    }
                    else { // 不在这一年
                        v.updateTime = util.formatTimeYearMonthDay(new Date(v.updateTime))
                    }
                })
                if (chat_list.length !== 0) {
                    this.setData({
                        chat_list
                    })
                }
            })
            .catch(err => {
                console.error("没有用户的信息", err)
            })
    },

    // 某个聊天
    showChatDetail(e) {
        // console.log(e);
        let user_id = e.currentTarget.dataset.userid;
        let user_avatar_url = e.currentTarget.dataset.useravatar;
        let user_name = e.currentTarget.dataset.username;

        // 多个参数的跳转
        wx.navigateTo({
            url: '/pages/chat/chat?othersId=' + user_id + '&othersAvatar=' + user_avatar_url + '&othersName=' + user_name,
        })
    }
})