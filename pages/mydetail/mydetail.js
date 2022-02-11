const util = require('../../utils/util.js');
// 我的帖子 + 我的评论 + 我的收藏
/*
    采用了缓存，避免重复请求
    获取到点击事件以后，先查看有没有缓存or是否过去了5min
    1.先获取用户的id
    2.发布的和评论的直接通过用户id进行数据库搜索，收藏的先获取列表id，再一条一条查询
*/

Page({
    data: {
        // 时间的表示
        timeStrDay: '',
        timeStrWeek: '',
        timeStrTotal: '',
        tabs: [
            {
                id: 0,
                name: '我的减碳',
                isActive: true
            },
            {
                id: 1,
                name: '我的动态',
                isActive: false
            },
            {
                id: 2,
                name: '我的收藏',
                isActive: false
            },
            {
                id: 3,
                name: '我的评论',
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
        // 留言列表
        message_list: [],
        // 用户的 id
        openId: '',
        // 我的信息
        userInfo: {},
        // 三个爱心的颜色
        isCollectDay: false,
        isCollectWeek: false,
        isCollectTotal: false
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
            .orderBy('update_time', 'desc')
            .get()
            .then(res => {
                console.log('获取用户发布帖子成功', res);
                var data = res.data;
                data.forEach(v => {
                    v.publish_time = util.formatTime(new Date(v.publish_time))
                    v.imgLen = v.image_url.length
                })
                this.setData({
                    post_list: res.data || []
                })
                // 数据存入到本地存储中
                wx.setStorageSync('my_post_list', { time: Date.now(), data: this.data.post_list });
            })
            .catch(err => {
                console.error("获取用户帖子失败", err);
            })
    },

    // 获取用户评论的列表，同时存入缓存
    getCommentList() {
        // 获取用户评论的列表
        wx.cloud.database().collection('comment_collection_jt')
            .where({
                openid: this.data.openId
            })
            .orderBy('time', 'desc')
            .get()
            .then(res => {
                console.log('获取用户的评论成功', res);
                var data = res.data;
                data.forEach(v => {
                    v.time = util.formatTime(new Date(v.time))
                })
                this.setData({
                    comment_list: data || []
                })
                // 数据存入到本地存储中
                wx.setStorageSync('my_comment_list', { time: Date.now(), data: this.data.comment_list });
            })
            .catch(err => {
                console.error("获取用户评论失败", err);
            })
    },

    // 获取用户收藏的列表，同时存入缓存
    getCollectList() {
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
                console.log('获取用户的收藏id成功', res);
                this.setData({
                    collect_list_id: res.data[0].like_list || []
                })
                // 一条一条的查询
                for (let i = 0; i < this.data.collect_list_id.length; i++) {
                    wx.cloud.database().collection('post_collection_jt')
                        .doc(this.data.collect_list_id[i])
                        .get()
                        .then(res => {
                            console.log('获取单条收藏的成功', res);
                            var data = res.data;
                            data.publish_time = util.formatTime(new Date(data.publish_time));
                            let collect_list = this.data.collect_list;
                            collect_list.push(data);
                            this.setData({
                                collect_list
                            })
                            // 数据存入到本地存储中
                            wx.setStorageSync('my_collect_list', { time: Date.now(), data: this.data.collect_list });
                        })
                        .catch(err => {
                            console.error('获取单条收藏失败', err);
                        })
                }
            })
            .catch(err => {
                console.error("获取用户收藏id失败", err);
            })
    },

    // 获取留言列表
    getMessageList() {
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: this.data.openId
            })
            .get()
            .then(res => {
                console.log('获取用户的留言成功', res);
                var data = res.data[0].message_list;
                data.forEach(v => {
                    v.publish_time = util.formatTime(new Date(v.publish_time))
                })
                this.setData({
                    message_list: data || []
                })
                // // 数据存入到本地存储中
                wx.setStorageSync('my_message_list', { time: Date.now(), data: this.data.message_list });
            })
            .catch(err => {
                console.error("获取用户评论失败", err);
            })
    },

    // 加载，根据点击的页面先获取
    onLoad(options) {
        // console.log(options);
        // 获取用户点击的是哪一个页面
        const index = parseInt(options.pageId);
        let tabs = this.data.tabs;
        // 进行修改
        tabs.forEach((v, i) => {
            i === index ? v.isActive = true : v.isActive = false
        });
        this.setData({
            tabs
        })
        // 获取用户信息，为了 openId
        const userInfo = wx.getStorageSync('userInfo');
        this.setData({
            openId: userInfo.openId
        })

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
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: userInfo.openId
            })
            .get()
            .then(res => {
                console.log('获取到本人的信息', res)
                let data = res.data[0]
                data.day_data.carbon_reduction = data.day_data.carbon_reduction.toFixed(1)
                data.week_data.carbon_reduction = data.week_data.carbon_reduction.toFixed(1)
                data.total_data.carbon_reduction = data.total_data.carbon_reduction.toFixed(1)
                this.setData({
                    userInfo: data
                })
            })
            .catch(err => {
                console.error('获取本人信息失败', err)
            })

        // 根据不同的 index加载相应的内容
        this.getPostList();
        this.getCollectList();
        this.getCommentList();
        this.getMessageList();
    },

    // 根据 index加载内容，首先看有没有缓存，没有缓存的话或者超过了5min，进行请求
    loadContent(index) {
        // 我的帖子
        if (index === 0) {
            const my_post_list = wx.getStorageSync('my_post_list');
            if (!my_post_list) {
                // 不存在，发送请求数据
                this.getPostList();
            }
            else {
                // 有旧的数据
                // 判断是否过期 定义一个过期时间5min。
                if (Date.now() - my_post_list.time > 1000 * 300) {
                    this.getPostList();
                }
                else {
                    console.log("可以用旧的");
                    // 可以使用旧数据
                    this.setData({
                        post_list: my_post_list.data
                    })
                }
            }
        }
        // 我的收藏
        else if (index === 1) {
            const my_collect_list = wx.getStorageSync('my_collect_list');
            if (!my_collect_list) {
                // 不存在，发送请求数据
                this.getCollectList();
            }
            else {
                // 有旧的数据
                // 判断是否过期 定义一个过期时间 10s -> 5min。减完的结果是ms
                if (Date.now() - my_collect_list.time > 1000 * 300) {
                    this.getCollectList();
                }
                else {
                    console.log("可以用旧的");
                    // 可以使用旧数据
                    this.setData({
                        collect_list: my_collect_list.data
                    })
                }
            }
        }
        // 我的评论
        else if (index === 2) {
            const my_comment_list = wx.getStorageSync('my_comment_list');
            if (!my_comment_list) {
                // 不存在，发送请求数据
                this.getCommentList();
            }
            else {
                // 有旧的数据
                // 判断是否过期 定义一个过期时间 10s -> 5min。减完的结果是ms
                if (Date.now() - my_comment_list.time > 1000 * 300) {
                    this.getCommentList();
                }
                else {
                    console.log("可以用旧的");
                    // 可以使用旧数据
                    this.setData({
                        comment_list: my_comment_list.data
                    })
                }
            }
        }
        // 我的留言
        else if (index === 3) {
            const my_message_list = wx.getStorageSync('my_message_list');
            if (!my_message_list) {
                // 不存在，发送请求数据
                this.getMessageList();
            }
            else {
                // 有旧的数据
                // 判断是否过期 定义一个过期时间 10s -> 5min。减完的结果是ms
                if (Date.now() - my_message_list.time > 1000 * 300) {
                    this.getMessageList();
                }
                else {
                    console.log("可以用旧的");
                    // 可以使用旧数据
                    this.setData({
                        message_list: my_message_list.data
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

    // 删除帖子
    removePost(e) {
        // console.log(e)
        wx.showModal({
            title: '操作确定',
            content: '您确定要删除这个帖子吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#3CC51F',
        })
            .then(res => {
                console.log('用户点击了', res);
                if (res.confirm === true) {
                    wx.showLoading({
                        title: "删除中，请稍等"
                    });
                    wx.cloud.callFunction({
                        name: 'remove_post_jt',
                        data: {
                            // 帖子 id
                            postId: e.currentTarget.dataset.id,
                            // 用户的 id
                            userId: this.data.openId,
                            // 帖子带的图片
                            images: e.currentTarget.dataset.images
                        }
                    })
                        .then(res => {
                            console.log('删除成功', res);
                            // 刷新，让被删除的消失
                            wx.startPullDownRefresh();
                            // 回到主页要更新
                            wx.setStorageSync('updateFlag', true);
                            wx.hideLoading();
                        })
                        .catch(err => {
                            console.error('删除失败', err);
                        })
                }
                else
                    return;
            })
            .catch(err => {
                console.error('模态对话框调用失败', err);
            })
    },

    // 删除评论
    removeComment(e) {
        console.log(e)
        wx.showModal({
            title: '操作确定',
            content: '您确定要删除这条评论吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#3CC51F',
        })
            .then(res => {
                console.log('用户点击了', res);
                if (res.confirm === true) {
                    wx.showLoading({
                        title: "删除中，请稍等"
                    });
                    wx.cloud.callFunction({
                        name: 'remove_comment_jt',
                        data: {
                            // 评论 id
                            commentId: e.currentTarget.dataset.id,
                            // 用户的 id
                            userId: this.data.openId,
                            // 帖子的 id
                            postId: e.currentTarget.dataset.postid
                        }
                    })
                        .then(res => {
                            console.log('删除成功', res);
                            wx.startPullDownRefresh();
                            wx.hideLoading();
                            try {
                                wx.setStorageSync('updateFlag', true);
                            }
                            catch (err) {
                                console.error('缓存失败', err);
                            }
                        })
                        .catch(err => {
                            console.error('删除失败', err);
                        })
                }
                else
                    return;
            })
            .catch(err => {
                console.error('模态对话框调用失败', err);
            })
    },

    // 删除收藏
    removeCollect(e) {
        console.log(e)
        wx.showModal({
            title: '操作确定',
            content: '您确定要取消收藏这个帖子吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#3CC51F',
        })
            .then(res => {
                console.log('用户点击了', res);
                if (res.confirm === true) {
                    wx.showLoading({
                        title: "取消收藏中，请稍等"
                    });
                    wx.cloud.callFunction({
                        name: 'collect_post_jt',
                        data: {
                            // 删除标志
                            flag: 1,
                            // 帖子的id
                            postId: e.currentTarget.dataset.postid
                        }
                    })
                        .then(res => {
                            console.log('取消收藏成功', res);
                            wx.startPullDownRefresh();
                            wx.hideLoading();
                            try {
                                wx.setStorageSync('updateFlag', true);
                            }
                            catch (err) {
                                console.error('缓存失败', err);
                            }
                        })
                        .catch(err => {
                            console.error('删除失败', err);
                        })
                }
                else
                    return;
            })
            .catch(err => {
                console.error('模态对话框调用失败', err);
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
})