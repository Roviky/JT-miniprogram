const util = require('../../utils/util.js');
// 别人通过点击头像看到的页面
Page({
    data: {
        // 时间的表示
        timeStrDay: '',
        timeStrWeek: '',
        timeStrTotal: '',
        // 标识哪一个用户，当前界面展示的用户的id，别人的id
        openId: '',
        // 用户的信息，当前界面展示的用户的信息
        userInfo: {},
        // 我的信息
        myInfo: {},
        // tab栏目
        tabs: [
            {
                id: 0,
                name: 'TA的减碳',
                isActive: true
            },
            {
                id: 1,
                name: 'TA的动态',
                isActive: false
            },
            {
                id: 2,
                name: 'TA的收藏',
                isActive: false
            },
            {
                id: 3,
                name: 'TA的评论',
                isActive: false
            }
        ],
        // 发布列表
        post_list: [],
        // 评论列表
        comment_list: [],
        // 收藏列表的id
        collect_list_id: [],
        // 收藏列表
        collect_list: [],
        // 文本框的内容
        content: '',
        // 最大字数限制
        maxContentLength: 100,
        // 最少字数限制
        minContentLength: 5,
        // 三个爱心的颜色
        isCollectDay: false,
        isCollectWeek: false,
        isCollectTotal: false
    },

    // 显示相关的帖子
    showRelatedPost(e) {
        // console.log(e)
        const showFlag = e.currentTarget.dataset.flag
        const limit = e.currentTarget.dataset.limit

        // 多个参数跳转，用 &连接

        // 今天的
        if (showFlag == 0) {
            wx.navigateTo({
                url: '/pages/relatedPost/relatedPost?postArr=' + this.data.userInfo.day_data.related_post + '&limit=' + limit
            });
        } // 本周的
        else if (showFlag == 1) {
            wx.navigateTo({
                url: '/pages/relatedPost/relatedPost?postArr=' + this.data.userInfo.week_data.related_post + '&limit=' + limit
            });
        } // 全部的
        else if (showFlag == 2) {
            wx.navigateTo({
                url: '/pages/relatedPost/relatedPost?postArr=' + this.data.userInfo.total_data.related_post + '&limit=' + limit
            });
        }
    },

    // 获取时间，我的信息，对方的信息
    onLoad(options) {
        // 获取时间，三种模式的时间表示
        var date = new Date();
        const month = date.getMonth() + 1
        const day = date.getDate()
        let timeStrDay = month + '月' + day + '日'

        this.setData({
            timeStrDay,
            timeStrWeek: util.formatWeek(date),
            timeStrTotal: '总共'
        })

        // 获取我的信息
        const myInfo = wx.getStorageSync('userInfo')
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: myInfo.openId
            })
            .get()
            .then(res => {
                console.log('获取到本人的信息', res)
                let data = res.data[0]
                this.setData({
                    myInfo: data
                })
                // 获取对方的信息
                const openId = options.userid;
                this.setData({
                    openId
                })
                wx.cloud.database().collection('user_collection_jt')
                    .where({
                        user_id: openId
                    })
                    .get()
                    .then(res => {
                        console.log('获取他人信息成功', res);
                        let userInfo = res.data[0]
                        userInfo.day_data.carbon_reduction = userInfo.day_data.carbon_reduction.toFixed(1)
                        userInfo.week_data.carbon_reduction = userInfo.week_data.carbon_reduction.toFixed(1)
                        userInfo.total_data.carbon_reduction = userInfo.total_data.carbon_reduction.toFixed(1)
                        this.setData({
                            userInfo
                        })
                        // 点赞图标的内容
                        this.showItemCollect(0)
                        this.showItemCollect(1)
                        this.showItemCollect(2)
                        // 获取信息
                        this.getPostList();
                        this.getCollectList();
                        this.getCommentList();
                    })
                    .catch(err => {
                        console.error('获取他人信息失败', err);
                    })
            })
            .catch(err => {
                console.log('获取到本人的信息失败', err)
            })
    },

    // Tabs组件被点击以后，会触发这个事件
    // 必须这么写，否则父页面的内容无法变化
    // 同时修改页面展示内容
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
        this.loadContent(index);
    },

    // 获取用户发表帖子的列表，同时存入缓存
    getPostList() {
        // 获取用户发布的帖子列表
        wx.cloud.database().collection('post_collection_jt')
            .where({
                author_id: this.data.openId
            })
            .get()
            .then(res => {
                console.log('获取他人发布帖子成功', res);
                var data = res.data;
                data.forEach(v => {
                    v.publish_time = util.formatTime(new Date(v.publish_time))
                    v.imgLen = v.image_url.length
                    v.carbon_reduction = v.carbon_reduction.toFixed(1)
                })
                this.setData({
                    post_list: res.data || []
                })
                // 数据存入到本地存储中
                wx.setStorageSync('others_post_list', { time: Date.now(), data: this.data.post_list });
            })
            .catch(err => {
                console.error("获取他人帖子失败", err);
            })
    },

    // 获取用户评论的列表，同时存入缓存
    getCommentList() {
        // 获取用户评论的列表
        wx.cloud.database().collection('comment_collection_jt')
            .where({
                openid: this.data.openId
            })
            .get()
            .then(res => {
                console.log('获取他人的评论成功', res);
                var data = res.data;
                data.forEach(v => {
                    v.publish_time = util.formatTime(new Date(v.publish_time))
                })
                this.setData({
                    comment_list: data || []
                })
                // 数据存入到本地存储中
                wx.setStorageSync('others_comment_list', { time: Date.now(), data: this.data.comment_list });
            })
            .catch(err => {
                console.error("获取他人评论失败", err);
            })
    },

    // 获取用户收藏的列表，同时存入缓存
    getCollectList() {
        // 需要清空，因为这个是挨个push进去，导致重复
        this.setData({
            collect_list: [],
            collect_list_id: []
        })
        // 获取用户收藏的 id列表
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: this.data.openId
            })
            .get()
            .then(res => {
                console.log('获取他人的收藏id成功', res);
                this.setData({
                    collect_list_id: res.data[0].like_list || []
                })
                // 一条一条的查询
                for (let i = 0; i < this.data.collect_list_id.length; i++) {
                    wx.cloud.database().collection('post_collection_jt')
                        .doc(this.data.collect_list_id[i])
                        .get()
                        .then(res => {
                            console.log('获取他人的单条收藏的成功', res);
                            var data = res.data;
                            data.publish_time = util.formatTime(new Date(data.publish_time));
                            data.carbon_reduction = data.carbon_reduction.toFixed(1)
                            let collect_list = this.data.collect_list;
                            collect_list.push(data);
                            this.setData({
                                collect_list
                            })
                            // 数据存入到本地存储中
                            wx.setStorageSync('others_collect_list', { time: Date.now(), data: this.data.collect_list });
                        })
                        .catch(err => {
                            console.error('获取他人的单条收藏失败', err);
                        })
                }
            })
            .catch(err => {
                console.error("获取他人的收藏id失败", err);
            })
    },

    // 根据 index加载内容，首先看有没有缓存，没有缓存的话或者超过了5min，进行请求
    loadContent(index) {
        // 他的帖子
        if (index === 0) {
            const others_post_list = wx.getStorageSync('others_post_list');
            if (!others_post_list) {
                // 不存在，发送请求数据
                this.getPostList();
            }
            else {
                // 有旧的数据
                // 判断是否过期 定义一个过期时间5min。
                if (Date.now() - others_post_list.time > 1000) {
                    this.getPostList();
                }
                else {
                    console.log("可以用旧的");
                    // 可以使用旧数据
                    this.setData({
                        post_list: others_post_list.data
                    })
                }
            }
        }
        // 我的收藏
        else if (index === 1) {
            const others_collect_list = wx.getStorageSync('others_collect_list');
            if (!others_collect_list) {
                // 不存在，发送请求数据
                this.getCollectList();
            }
            else {
                // 有旧的数据
                // 判断是否过期 定义一个过期时间 10s -> 5min。减完的结果是ms
                if (Date.now() - others_collect_list.time > 1000) {
                    this.getCollectList();
                }
                else {
                    console.log("可以用旧的");
                    // 可以使用旧数据
                    this.setData({
                        collect_list: others_collect_list.data
                    })
                }
            }
        }
        // 我的评论
        else if (index === 2) {
            const others_comment_list = wx.getStorageSync('others_comment_list');
            if (!others_comment_list) {
                // 不存在，发送请求数据
                this.getCommentList();
            }
            else {
                // 有旧的数据
                // 判断是否过期 定义一个过期时间 10s -> 5min。减完的结果是ms
                if (Date.now() - others_comment_list.time > 1000) {
                    this.getCommentList();
                }
                else {
                    console.log("可以用旧的");
                    // 可以使用旧数据
                    this.setData({
                        comment_list: others_comment_list.data
                    })
                }
            }
        }
    },

    // 跳转到某一个帖子，有传递过来的云数据库 id
    onItemClick: function (e) {
        // console.log(e);
        // 下面传递的这个id是数据库自动添加的用来表示不同帖子的id
        // console.log(e.currentTarget.dataset.postid)
        wx.navigateTo({
            url: '../postdetail/postdetail?postid=' + e.currentTarget.dataset.postid,
        })
    },

    // 预览图片
    previewImage(e) {
        // console.log(e);
        // 1.先构造要预览的图片数组
        const urls = e.currentTarget.dataset.list;
        // 2.current不能写死，接收传递过来的图片 URL
        const current = e.currentTarget.dataset.url;
        wx.previewImage({
            current,
            urls
        });
    },

    // 下拉刷新
    onPullDownRefresh() {
        this.getPostList();
        this.getCollectList();
        this.getCommentList();
        wx.stopPullDownRefresh();
    },

    // 文本框输入事件
    input(e) {
        if (e.detail.value.length >= this.data.maxContentLength) {
            wx.showToast({
                title: '已达到最大字数限制',
            })
        }
        else {
            // 给 content赋值
            this.setData({
                content: e.detail.value,
                totalNum: e.detail.value.length
            })
        }
    },

    // 点击聊天
    chat() {
        const userInfo = this.data.userInfo;
        // 多个参数的跳转
        wx.navigateTo({
            url: '/pages/chat/chat?othersId=' + userInfo.user_id + '&othersAvatar=' + userInfo.user_avatar_url + '&othersName=' + userInfo.user_name,
        })
    },

    // 用来修改是否被点赞，点赞图标的显示
    showItemCollect(likeFlag) {
        // 今天的
        if (likeFlag == 0) {
            let ranking_like = this.data.myInfo.day_data.ranking_like
            let index = ranking_like.findIndex(item => item === this.data.openId);
            // 说明用户点赞了
            if (index != -1) {
                this.setData({
                    isCollectDay: true
                })
            }
            else {
                this.setData({
                    isCollectDay: false
                })
            }
        }
        // 本周的
        else if (likeFlag == 1) {
            let ranking_like = this.data.myInfo.week_data.ranking_like
            let index = ranking_like.findIndex(item => item === this.data.openId);
            // 说明用户点赞了
            if (index != -1) {
                this.setData({
                    isCollectWeek: true
                })
            }
            else {
                this.setData({
                    isCollectWeek: false
                })
            }
        }
        // 全部的
        else if (likeFlag == 2) {
            let ranking_like = this.data.myInfo.total_data.ranking_like
            let index = ranking_like.findIndex(item => item === this.data.openId);
            // 说明用户点赞了
            if (index != -1) {
                this.setData({
                    isCollectTotal: true
                })
            }
            else {
                this.setData({
                    isCollectTotal: false
                })
            }
        }
    },

    // 点赞
    handleCollect(e) {
        console.log(e)
        wx.showLoading({
            title: '请求中!',
            mask: true
        });

        // 当天 / 本周 / 全部 的区分
        const likeFlag = e.currentTarget.dataset.flag
        var userInfo = this.data.userInfo

        // 今天的
        if (likeFlag == 0) {
            // 之前点赞了，取消
            if (this.data.isCollectDay == true) {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示今天的
                        likeFlag: 0,
                        // 0表示取消
                        flag: 0,
                        othersId: this.data.openId
                    }
                })
                    .then(res => {
                        console.log('取消成功', res)
                        wx.hideLoading();
                        userInfo.day_data.like_num--;
                        // 修改点赞图标
                        this.setData({
                            isCollectDay: false,
                            userInfo
                        })
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
                        othersId: this.data.openId
                    }
                })
                    .then(res => {
                        console.log('点赞成功', res)
                        wx.hideLoading();
                        userInfo.day_data.like_num++;
                        // 修改点赞的图标
                        this.setData({
                            isCollectDay: true,
                            userInfo
                        })
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
            // 之前点赞了，取消
            if (this.data.isCollectWeek == true) {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示本周的
                        likeFlag: 1,
                        // 0表示取消
                        flag: 0,
                        othersId: this.data.openId
                    }
                })
                    .then(res => {
                        console.log('取消成功', res)
                        wx.hideLoading();
                        userInfo.week_data.like_num--;
                        // 修改点赞图标
                        this.setData({
                            isCollectWeek: false,
                            userInfo
                        })
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
                        othersId: this.data.openId
                    }
                })
                    .then(res => {
                        console.log('点赞成功', res)
                        wx.hideLoading();
                        userInfo.week_data.like_num++;
                        // 修改点赞的图标
                        this.setData({
                            isCollectWeek: true,
                            userInfo
                        })
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
            // 之前点赞了，取消
            if (this.data.isCollectTotal == true) {
                wx.cloud.callFunction({
                    name: 'ranking_like_user',
                    data: {
                        // likeFlag 表示全部的
                        likeFlag: 2,
                        // 0表示取消
                        flag: 0,
                        othersId: this.data.openId
                    }
                })
                    .then(res => {
                        console.log('取消成功', res)
                        wx.hideLoading();
                        userInfo.total_data.like_num--;
                        // 修改点赞图标
                        this.setData({
                            isCollectTotal: false,
                            userInfo
                        })
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
                        othersId: this.data.openId
                    }
                })
                    .then(res => {
                        console.log('点赞成功', res)
                        wx.hideLoading();
                        userInfo.total_data.like_num++;
                        // 修改点赞的图标
                        this.setData({
                            isCollectTotal: true,
                            userInfo
                        })
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
})