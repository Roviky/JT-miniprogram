const util = require('../../utils/util.js');

Page({
    data: {
        // 日 排行榜
        rank_list_day: [],
        // 周 排行榜
        rank_list_week: [],
        // 全部 排行榜
        rank_list_total: [],
        // 用户信息
        userInfo: {},
        // “我”的索引 
        myIndexDay: 0,
        myIndexWeek: 0,
        myIndexTotal: 0,
        // 第一名的信息
        firstInfoDay: {},
        firstInfoWeek: {},
        firstInfoTotal: {},
        // 时间 - 今天
        timeStrDay: '',
        // 时间 - 本周
        timeStrWeek: '',
        // 时间 - 总共
        timeStrTotal: '',
        // 切换榜单
        tabs: [
            {
                id: 0,
                name: '今天',
                isActive: true
            },
            {
                id: 1,
                name: '本周',
                isActive: false
            },
            {
                id: 2,
                name: '总共',
                isActive: false
            }
        ],
    },

    onLoad() {
        // 如果有用户的信息
        if (wx.getStorageSync('userInfo')) {
            const userInfo = wx.getStorageSync('userInfo')
            console.log('本地存储有用户的数据');
            // 获取用户的数据
            wx.cloud.database().collection('user_collection_jt')
                .where({
                    user_id: userInfo.openId
                })
                .get()
                .then(res => {
                    console.log('获取到本人的信息', res)
                    let data = res.data[0]
                    this.setData({
                        userInfo: data
                    })
                })
                .catch(err => {
                    console.log('获取到本人的信息失败', err)
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
    },

    onShow() {
        // tabBar 加入的函数
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 1
            })
        }

        // 获取时间，三种模式的时间表示
        var date = new Date();
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        let timeStrDay = year + '年' + month + '月' + day + '日'
        this.setData({
            timeStrDay,
            timeStrWeek: util.formatWeek(date),
            timeStrTotal: '总共'
        })

        // 获取排行榜的数据  ---  今天
        wx.cloud.callFunction({
            name: 'get_rank_list_jt',
            data: {
                flag: 0
            }
        })
            .then(res => {
                console.log("拉取今天排行数据成功", res);
                //提取数据，是数组形式
                var data = res.result.data;
                data.forEach((v, i) => {
                    // 保留两位小数
                    v.day_data.carbon_reduction = v.day_data.carbon_reduction.toFixed(2)
                })
                this.setData({
                    rank_list_day: data
                })
                // 修改点赞的图标
                this.showItemCollect(0)
                // 获取我的索引
                let myIndexDay = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].user_id == this.data.userInfo.user_id) {
                        myIndexDay = i;
                        break;
                    }
                }
                // 获取第一个人的信息
                let firstInfoDay = data[0]
                this.setData({
                    myIndexDay,
                    firstInfoDay
                })
            })
            .catch(err => {
                console.error("获取今天排行数据失败", err);
            })

        // 获取排行榜的数据  ---  本周
        wx.cloud.callFunction({
            name: 'get_rank_list_jt',
            data: {
                flag: 1
            }
        })
            .then(res => {
                console.log("拉取本周排行数据成功", res);
                //提取数据，是数组形式
                var data = res.result.data;
                // 保留两位小数
                data.forEach((v, i) => {
                    v.week_data.carbon_reduction = v.week_data.carbon_reduction.toFixed(2)
                })
                this.setData({
                    rank_list_week: data
                })
                // 修改点赞的图标
                this.showItemCollect(1)
                // 获取我的索引
                let myIndexWeek = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].user_id == this.data.userInfo.user_id) {
                        myIndexWeek = i;
                        break;
                    }
                }
                // 获取第一个人的信息
                let firstInfoWeek = data[0]
                this.setData({
                    myIndexWeek,
                    firstInfoWeek
                })
            })
            .catch(err => {
                console.error("获取本周排行数据失败", err);
            })

        // 获取排行榜的数据  ---  总共
        wx.cloud.callFunction({
            name: 'get_rank_list_jt',
            data: {
                flag: 2
            }
        })
            .then(res => {
                console.log("拉取总共排行数据成功", res);
                //提取数据，是数组形式
                var data = res.result.data;
                // 保留两位小数
                data.forEach((v, i) => {
                    v.total_data.carbon_reduction = v.total_data.carbon_reduction.toFixed(2)
                })
                this.setData({
                    rank_list_total: data
                })
                // 修改点赞的图标
                this.showItemCollect(2)
                // 获取我的索引
                let myIndexTotal = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].user_id == this.data.userInfo.user_id) {
                        myIndexTotal = i;
                        break;
                    }
                }
                // 获取第一个人的信息
                let firstInfoTotal = data[0]
                this.setData({
                    myIndexTotal,
                    firstInfoTotal
                })
            })
            .catch(err => {
                console.error("获取总共排行数据失败", err);
            })
    },

    // 点击 今天 / 本周 / 总共触发
    handleItemTap(e) {
        // console.log(e)
        const index = e.currentTarget.dataset.index;
        let tabs = this.data.tabs;
        // 进行修改
        tabs.forEach((v, i) => {
            i == index ? v.isActive = true : v.isActive = false
        });
        this.setData({
            tabs
        })
    },

    // 用来修改是否被点赞，点赞图标的显示
    showItemCollect(likeFlag) {
        // 今天的
        if (likeFlag == 0) {
            let rank_list_day = this.data.rank_list_day
            rank_list_day.forEach((v, i) => {
                let index = this.data.userInfo.day_data.ranking_like.findIndex(item => item === v.user_id);
                if (index != -1) {
                    v.isCollect = true
                }
                else {
                    v.isCollect = false
                }
            })
            this.setData({
                rank_list_day
            })
        }
        // 本周的
        else if (likeFlag == 1) {
            let rank_list_week = this.data.rank_list_week
            rank_list_week.forEach((v, i) => {
                let index = this.data.userInfo.week_data.ranking_like.findIndex(item => item === v.user_id);
                if (index != -1) {
                    v.isCollect = true
                }
                else {
                    v.isCollect = false
                }
            })
            this.setData({
                rank_list_week
            })
        }
        // 全部的
        else if (likeFlag == 2) {
            let rank_list_total = this.data.rank_list_total
            rank_list_total.forEach((v, i) => {
                let index = this.data.userInfo.total_data.ranking_like.findIndex(item => item === v.user_id);
                if (index != -1) {
                    v.isCollect = true
                }
                else {
                    v.isCollect = false
                }
            })
            this.setData({
                rank_list_total
            })
        }
    },

    // 点赞
    handleCollect(e) {
        console.log(e)
        wx.showLoading({
            title: '请求中!',
            mask: true
        });
        // 被点赞人的 id
        const userId = e.currentTarget.dataset.userid
        // 被点赞人在排行榜中的 索引
        const userIndex = e.currentTarget.dataset.userindex
        // 当天 / 本周 / 全部 的区分
        const likeFlag = e.currentTarget.dataset.flag

        // 今天的
        if (likeFlag == 0) {
            // 判断用户在不在我们点赞的列表中
            // 下面的索引是 “我”点赞的人中对方的索引
            let index = this.data.userInfo.day_data.ranking_like.findIndex(item => item === userId)
            // 之前点赞了，取消
            if (index != -1) {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示今天的
                        likeFlag: 0,
                        // 0表示取消
                        flag: 0,
                        othersId: userId
                    }
                })
                    .then(res => {
                        console.log('取消成功', res)
                        wx.hideLoading();
                        // 进行本地的删除（因为不想点赞一个就请求全部的数据）
                        this.data.userInfo.day_data.ranking_like.splice(index, 1);
                        // 对应的点赞数 -1
                        this.data.rank_list_day[userIndex].day_data.like_num--;
                        // 修改点赞图标
                        this.showItemCollect(likeFlag)
                        wx.showToast({
                            title: '取消成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true
                        });
                    })
                    .catch(err => {
                        console.error('取消失败', err)
                    })
            }
            // 之前没有，点赞
            else {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示今天的
                        likeFlag: 0,
                        flag: 1,
                        othersId: userId
                    }
                })
                    .then(res => {
                        console.log('点赞成功', res)
                        wx.hideLoading();
                        // 本地的修改（因为不想点赞一个就请求全部的数据）
                        this.data.userInfo.day_data.ranking_like.push(userId);
                        // 对应的点赞数 +1
                        this.data.rank_list_day[userIndex].day_data.like_num++;
                        // 修改点赞的图标
                        this.showItemCollect(likeFlag)
                        wx.showToast({
                            title: '点赞成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true
                        });
                    })
                    .catch(err => {
                        console.error('点赞失败', err)
                    })
            }
        }
        // 本周的
        else if (likeFlag == 1) {
            // 判断用户在不在我们点赞的列表中
            // 下面的索引是 “我”点赞的人中对方的索引
            let index = this.data.userInfo.week_data.ranking_like.findIndex(item => item === userId)
            // 之前点赞了，取消
            if (index != -1) {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示本周的
                        likeFlag: 1,
                        // 0表示取消
                        flag: 0,
                        othersId: userId
                    }
                })
                    .then(res => {
                        console.log('取消成功', res)
                        wx.hideLoading();
                        // 进行本地的删除（因为不想点赞一个就请求全部的数据）
                        this.data.userInfo.week_data.ranking_like.splice(index, 1);
                        // 对应的点赞数 -1
                        this.data.rank_list_week[userIndex].week_data.like_num--;
                        // 修改点赞图标
                        this.showItemCollect(likeFlag)
                        wx.showToast({
                            title: '取消成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true
                        });
                    })
                    .catch(err => {
                        console.error('取消失败', err)
                    })
            }
            // 之前没有，点赞
            else {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示本周的
                        likeFlag: 1,
                        flag: 1,
                        othersId: userId
                    }
                })
                    .then(res => {
                        console.log('点赞成功', res)
                        wx.hideLoading();
                        // 本地的修改（因为不想点赞一个就请求全部的数据）
                        this.data.userInfo.week_data.ranking_like.push(userId);
                        // 对应的点赞数 +1
                        this.data.rank_list_week[userIndex].week_data.like_num++;
                        // 修改点赞的图标
                        this.showItemCollect(likeFlag)
                        wx.showToast({
                            title: '点赞成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true
                        });
                    })
                    .catch(err => {
                        console.error('点赞失败', err)
                    })
            }
        }
        // 全部的
        else if (likeFlag == 2) {
            // 判断用户在不在我们点赞的列表中
            // 下面的索引是 “我”点赞的人中对方的索引
            let index = this.data.userInfo.total_data.ranking_like.findIndex(item => item === userId)
            // 之前点赞了，取消
            if (index != -1) {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示全部的
                        likeFlag: 2,
                        // 0表示取消
                        flag: 0,
                        othersId: userId
                    }
                })
                    .then(res => {
                        console.log('取消成功', res)
                        wx.hideLoading();
                        // 进行本地的删除（因为不想点赞一个就请求全部的数据）
                        this.data.userInfo.total_data.ranking_like.splice(index, 1);
                        // 对应的点赞数 -1
                        this.data.rank_list_total[userIndex].total_data.like_num--;
                        // 修改点赞图标
                        this.showItemCollect(likeFlag)
                        wx.showToast({
                            title: '取消成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true
                        });
                    })
                    .catch(err => {
                        console.error('取消失败', err)
                    })
            }
            // 之前没有，点赞
            else {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示全部的
                        likeFlag: 2,
                        flag: 1,
                        othersId: userId
                    }
                })
                    .then(res => {
                        console.log('点赞成功', res)
                        wx.hideLoading();
                        // 本地的修改（因为不想点赞一个就请求全部的数据）
                        this.data.userInfo.total_data.ranking_like.push(userId);
                        // 对应的点赞数 +1
                        this.data.rank_list_total[userIndex].total_data.like_num++;
                        // 修改点赞的图标
                        this.showItemCollect(likeFlag)
                        wx.showToast({
                            title: '点赞成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true
                        });
                    })
                    .catch(err => {
                        console.error('点赞失败', err)
                    })
            }
        }
    },

    // 显示用户信息
    showUser(e) {
        // console.log(e)
        const userId = e.currentTarget.dataset.userid
        wx.navigateTo({
            url: '/pages/otherspage/otherspage?userid=' + userId,
        });
    },

    // 显示谁点赞了
    showWhoLike(e) {
        // console.log(e)
        const flag = e.currentTarget.dataset.flag
        if (flag == 0) {
            wx.navigateTo({
                url: '/pages/showWhoLike/showWhoLike?userlist=' + this.data.userInfo.day_data.who_like_list,
            });
        }
    }
})