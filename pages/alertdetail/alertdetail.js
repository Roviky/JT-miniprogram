const util = require('../../utils/util.js');

Page({
    data: {
        tabs: [
            {
                id: 0,
                name: '点赞',
                isActive: true
            },
            {
                id: 1,
                name: '评论',
                isActive: false
            }
        ],
        // 该用户是否有消息提醒
        noMessage: true,
        // 消息列表
        inform_list: [],
    },

    // Tabs组件
    handleItemChange(e) {
        // console.log(e);
        const { index } = e.detail;
        let tabs = this.data.tabs;
        // 进行修改
        tabs.forEach((v, i) => {
            i === index ? v.isActive = true : v.isActive = false
        });
        this.setData({
            tabs
        })
    },

    onShow() {
        // 获取通知列表
        const userInfo = wx.getStorageSync('userInfo');
        const userId = userInfo.openId;
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: userId
            })
            .get()
            .then(res => {
                console.log("成功获取到用户的信息", res);
                let inform_list = res.data[0].inform_list;
                // 利用sort进行排序，保证最近的置顶
                inform_list = inform_list.sort(function (obj1, obj2) {
                    let a = obj1.publish_time;
                    let b = obj2.publish_time;
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
                // 规范时间
                inform_list.forEach(v => {
                    v.publish_time = util.formatTime(new Date(v.publish_time))
                })
                if (inform_list.length !== 0) {
                    this.setData({
                        noMessage: false,
                        inform_list
                    })
                }
            })
            .catch(err => {
                console.error("没有用户的信息", err)
            })
    },

    onLoad(options) {
        // console.log(options)
        const index = options.pageid;
        let tabs = this.data.tabs;
        // 进行修改
        tabs.forEach((v, i) => {
            i == index ? v.isActive = true : v.isActive = false
        });
        this.setData({
            tabs
        })
    },

    // 点击去往帖子
    showPostDetail(e) {
        wx.navigateTo({
            url: '../postdetail/postdetail?postid=' + e.currentTarget.dataset.postid,
        })
    },

    // 点击头像，查看用户的信息
    showUser(e) {
        // console.log(e);
        const id = e.currentTarget.dataset.userid;
        wx.navigateTo({
            url: '/pages/otherspage/otherspage?userid=' + id,
        });
    },
})