const util = require('../../utils/util.js');
Page({
    data: {
        // 标志内容是否加载完毕
        contentLoaded: false,
        // 标志图片是否加载完毕
        imagesLoaded: false,
        // 标志评论是否加载完毕
        commentLoaded: false,
        // 对象，帖子的信息
        detail: {},
        // 图片在云存储中的路径
        imageUrls: [],
        // 评论最大字数
        maxContentLength: 150,
        // 评论列表，数组
        comments: [],
        // 帖子的唯一标识
        postid: '',
        // 输入框的值
        comment_value: '',
        // 评论框是否获得焦点
        isFocus: false,
        // 是否被收藏
        isCollect: false,
        // 浏览数
        watch_count: 0,
        // 收藏数
        collect_count: 0,
        // 评论数
        comment_count: 0,
        // 收藏的用户列表
        like_users: []
    },

    // 获取评论列表
    refreshComment: function (postid) {
        wx.cloud.callFunction({
            name: 'get_comment_for_post_jt',
            data: {
                postid: postid,
            }
        })
            .then(res => {
                console.log("获取该帖子的评论", res);
                // 评论的数组
                var commentList = res.result.data;
                // 获取格式化时间
                for (let i = 0; i < commentList.length; i++) {
                    commentList[i].time = util.formatTime(new Date(commentList[i].time))
                }
                console.log("评论的列表", commentList);
                this.setData({
                    comments: commentList,
                    commentLoaded: true,
                    comment_count: commentList.length
                })

                this.checkLoadFinish()
            })
            .catch(err => {
                console.log('没能获取到评论', err);
            })
    },

    // 能拿到传递过来的参数，postid表示是哪一个帖子
    onLoad: function (options) {
        // console.log(options.postid);
        wx.showLoading({
            title: '加载中',
        })

        const userInfo = wx.getStorageSync('userInfo');

        this.setData({
            postid: options.postid
        })

        // 判断是否收藏了
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: userInfo.openId
            })
            .get()
            .then(res => {
                console.log("读取用户收藏列表", res.data[0].like_list);
                const list = res.data[0].like_list;
                let index = list.findIndex(v => v === this.data.postid);
                if (index !== -1) {
                    console.log('用户收藏了这篇文章');
                    this.setData({
                        isCollect: true
                    })
                }
            })
            .catch(err => {
                console.error("读取用户收藏失败", err);
            })

        

        // 更新浏览次数
        wx.cloud.callFunction({
            name: 'update_watch_count_jt',
            data: {
                postid: options.postid
            }
        })
            .then(res => {
                console.log('更新浏览量成功', res);
            })
            .catch(err => {
                console.error('更新浏览量失败', err);
            })

        // 获取内容
        wx.cloud.callFunction({
            // 云函数名称 
            name: 'get_post_detail_jt',
            data: {
                postid: options.postid
            }
        })
            .then(res => {
                console.log("获取到该帖子的详细数据", res);
                var postdetail = res.result.data;
                postdetail.publish_time = util.formatTime(new Date(postdetail.publish_time))
                postdetail.carbon_reduction = postdetail.carbon_reduction.toFixed(1)
                this.setData({
                    detail: postdetail,
                    contentLoaded: true,
                    imageUrls: postdetail.image_url,
                    imagesLoaded: true,
                    watch_count: postdetail.watch_count,
                    collect_count: postdetail.star_count,
                    like_users: postdetail.like_users
                })
                // 获取评论
                this.refreshComment(options.postid)
            })
            .catch(err => {
                console.log("获取帖子数据失败", err);
                wx.hideLoading();
                wx.showModal({
                    title: '该帖子已经被删除啦～',
                    content: '',
                    showCancel: false,
                    cancelText: '取消',
                    cancelColor: '#000000',
                    confirmText: '确定',
                    confirmColor: '#3CC51F'
                })
                    .then(res => {
                        wx.navigateBack({
                            delta: 1
                        });
                    })
            })
    },

    // 发送评论
    sendComment: function () {
        this.setData({
            isFocus: true
        })

        if (this.data.comment.length < 1) {
            wx.showToast({
                icon: 'error',
                title: '评论不能为空',
            })
            this.setData({
                isFocus: false
            })
            return;
        }

        wx.showLoading({
            title: '发布中',
        })

        const userInfo = wx.getStorageSync('userInfo');
        // console.log(userInfo);

        wx.cloud.callFunction({
            // 云函数名称 
            name: 'add_comment_jt',
            data: {
                // 帖子的id
                postid: this.data.detail._id,
                // 用户的昵称
                name: userInfo.nickName,
                // 用户的头像
                avatarUrl: userInfo.avatarUrl,
                // 评论内容
                comment_content: this.data.comment,
                // 作者的id
                authorId: this.data.detail.author_id,
                // 图片
                imageUrls: this.data.imageUrls,
                // 帖子的文字内容
                post_content: this.data.detail.content,
                // 发评论用户的信息
                othersAvatar: userInfo.avatarUrl,
                othersNickName: userInfo.nickName
            }
        })
            .then(res => {
                console.log("评论成功！", res);

                const commentId = res.result._id;
                wx.cloud.callFunction({
                    name: 'user_add_comment_jt',
                    data: {
                        commentId: commentId
                    }
                })
                    .then(res => {
                        console.log("用户的评论列表更新", res);
                        wx.hideLoading()
                        this.refreshComment(this.data.postid)
                        this.setData({
                            comment_value: '',
                            isFocus: false
                        })
                        wx.setStorageSync('updateFlag', true);
                    })
                    .catch(err => {
                        console.error("用户评论列表更新失败", err);
                    })
            })
            .catch(err => {
                console.error("评论失败", err);
            })
    },

    // 获取评论框的值
    input: function (e) {
        // console.log(e);
        if (e.detail.value.length >= this.data.maxContentLength) {
            wx.showToast({
                title: '已达到最大字数限制',
            })
        }
        this.setData({
            comment: e.detail.value
        })
    },

    // 检查是否加载完毕，内容、图片、评论
    checkLoadFinish: function () {
        if (this.data.contentLoaded
            && this.data.imagesLoaded
            && this.data.commentLoaded) {
            wx.hideLoading()
        }
    },

    // 获得焦点
    handleFocus() {
        this.setData({
            isFocus: true
        })
    },

    // 失去焦点
    handleBlur() {
        this.setData({
            isFocus: false
        })
    },

    // 收藏
    handleCollect() {
        wx.showLoading({
            title: "正在请求中",
            mask: true
        });
        const userInfo = wx.getStorageSync('userInfo');
        // 判断有没有
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: userInfo.openId
            })
            .get()
            .then(res => {
                console.log('获取用户信息', res);
                let collect = res.data[0].like_list || [];
                // 2.判断该商品是否被收藏
                let index = collect.findIndex(v => v === this.data.postid);
                // 3.已经收藏过
                if (index !== -1) {
                    // 删除
                    wx.cloud.callFunction({
                        name: 'collect_post_jt',
                        data: {
                            flag: 1,
                            postId: this.data.postid
                        }
                    })
                        .then(res => {
                            console.log('取消收藏成功', res);
                            let like_users = this.data.like_users;
                            let index = like_users.findIndex(v => v.user_id === userInfo.openId);
                            if (index !== -1) {
                                like_users.splice(index, 1)
                            }
                            else {
                                console.log('出错了');
                            }

                            this.setData({
                                isCollect: false,
                                collect_count: this.data.collect_count - 1,
                                like_users: like_users
                            })
                            wx.showToast({
                                title: '取消成功',
                                icon: 'success',
                                mask: true,
                                duration: 2000
                            });
                            wx.hideLoading();
                        })
                        .catch(err => {
                            console.error("取消收藏失败", err);
                            wx.hideLoading();
                        })
                }
                else {
                    let authorId = this.data.detail.author_id;
                    // 添加
                    // 多次收藏，应该只添加一个消息通知，只不过时间是最新的
                    wx.cloud.database().collection('user_collection_jt')
                        .where({
                            user_id: authorId
                        })
                        .get()
                        .then(res => {
                            console.log('先查看用户的消息列表', res);
                            const inform_list = res.data[0].inform_list;

                            let like_users = this.data.like_users;
                            like_users.push({
                                user_avatar: userInfo.avatarUrl,
                                user_id: userInfo.openId,
                                time: Date.now()
                            })
                            this.setData({
                                like_users
                            })

                            // 之前是否有过收藏的标志
                            var hasFlag = false;
                            for (let i = 0; i < inform_list.length; i++) {
                                if (inform_list[i].postId == this.data.postid && inform_list[i].othersId == userInfo.openId) {
                                    // 说明该用户之前收藏过
                                    hasFlag = true;
                                    break;
                                }
                            }
                            // 如果之前收藏过，只需要修改一下时间
                            if (hasFlag === true) {
                                wx.cloud.callFunction({
                                    name: 'collect_post_jt',
                                    data: {
                                        // flag表示添加
                                        flag: 2,
                                        // 之前收藏过
                                        hasFlag: true,
                                        // 帖子的id
                                        postId: this.data.postid,
                                        // 是否有图片
                                        imageUrls: this.data.imageUrls,
                                        // 帖子的文字内容
                                        content: this.data.detail.content,
                                        // 原作者的id
                                        authorId: authorId,
                                        // 收藏用户的信息
                                        othersAvatar: userInfo.avatarUrl,
                                        othersNickName: userInfo.nickName,
                                        // 时间
                                        publish_time: Date.now()
                                    }
                                })
                                    .then(res => {
                                        console.log('收藏成功', res);
                                        this.setData({
                                            isCollect: true,
                                            collect_count: this.data.collect_count + 1
                                        })
                                        wx.showToast({
                                            title: '收藏成功',
                                            icon: 'success',
                                            mask: true,
                                            duration: 2000
                                        });
                                        wx.hideLoading();
                                    })
                                    .catch(err => {
                                        console.error("收藏失败", err);
                                        wx.hideLoading();
                                    })
                            }
                            else {
                                wx.cloud.callFunction({
                                    name: 'collect_post_jt',
                                    data: {
                                        // flag表示添加
                                        flag: 2,
                                        // 之前没收藏
                                        hasFlag: false,
                                        // 帖子的id
                                        postId: this.data.postid,
                                        // 是否有图片
                                        imageUrls: this.data.imageUrls,
                                        // 帖子的文字内容
                                        content: this.data.detail.content,
                                        // 原作者的id
                                        authorId: authorId,
                                        // 收藏用户的信息
                                        othersAvatar: userInfo.avatarUrl,
                                        othersNickName: userInfo.nickName,
                                        // 时间
                                        publish_time: Date.now()
                                    }
                                })
                                    .then(res => {
                                        console.log('收藏成功', res);
                                        this.setData({
                                            isCollect: true,
                                            collect_count: this.data.collect_count + 1
                                        })
                                        wx.showToast({
                                            title: '收藏成功',
                                            icon: 'success',
                                            mask: true,
                                            duration: 2000
                                        });
                                        wx.hideLoading();
                                    })
                                    .catch(err => {
                                        console.error("收藏失败", err);
                                        wx.hideLoading();
                                    })
                            }
                        })
                        .catch(err => {
                            console.error('先获取用户信息失败', err)
                        })
                }
                wx.setStorageSync('updateFlag', true);
            })
            .catch(err => {
                console.error('获取用户信息失败', err);
                wx.hideLoading();
            })
    },

    // 转发（障眼法，需要定位 + opacity）
    // 1.首先需要按钮是 share类型 2.还需要一个 下面的函数
    onShareAppMessage() {
        return {
            title: "刚刚在猫咪救助论坛看到个帖子，觉得很不错！",
            path: "/pages/postdetail/postdetail?postid=" + this.data.postid
        }
    },

    // 预览图片
    previewImage(e) {
        // console.log(e.currentTarget.dataset.url);
        // 1.先构造要预览的图片数组
        const urls = this.data.imageUrls;
        // 2.current不能写死，接收传递过来的图片 URL
        const current = e.currentTarget.dataset.url;
        wx.previewImage({
            current,
            urls
        });
    },

    // 点击头像，查看用户的信息
    showUser(e) {
        // console.log(e);
        const id = e.currentTarget.dataset.userid;
        wx.navigateTo({
            url: '/pages/otherspage/otherspage?userid=' + id,
        });
    }
})
