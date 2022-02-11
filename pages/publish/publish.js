// 发布页面
/*
    核心思路：
    1.如果有图片，将图片上传到云存储，获取返回的路径
    2.将文字内容和图片路径以及其他信息上传到云数据库
*/
Page({
    data: {
        // 上传图片的临时路径
        img_url: [],
        // 文本框的内容
        content: '',
        // 最大字数限制
        maxContentLength: 100,
        // 最少字数限制
        minContentLength: 5,
        // 是否隐藏 + 图标，满 9张图片不能添加
        hideAdd: false,
        // 总字数
        totalNum: 0,
        // 主题数组
        themeArray: ['公交', '骑行', '步行', '地铁'],
        // 初始索引
        themeIndex: 0,
        // 里程数
        mileCount: ' ',
        // 减排量
        carbon_reduction: 0
    },

    bindPickerChange(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            themeIndex: e.detail.value
        })
    },

    // 输入里程数
    handleMileCount(e) {
        // console.log(e)
        const mileCount = e.detail.value
        this.setData({
            mileCount
        })
    },

    // 文本框输入事件
    input: function (e) {
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

    // 选择图片
    chooseImage: function () {
        wx.chooseImage({
            count: 9, // 默认9 
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有 
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
        })
            .then(res => {
                console.log("选择图片成功", res);
                // res.tempFilePaths显示了上传图片的临时路径
                if (res.tempFilePaths.length > 0) {
                    //图如果满了9张，不显示加图
                    if (res.tempFilePaths.length == 9) {
                        this.setData({
                            // 隐藏 + 号
                            hideAdd: true
                        })
                    }
                    else {
                        this.setData({
                            hideAdd: false
                        })
                    }
                    //把每次选择的图 push进数组
                    let img_url = this.data.img_url;
                    for (let i = 0; i < res.tempFilePaths.length; i++) {
                        if (img_url.length >= 9) {
                            wx.showToast({
                                image: '../../images/warn.png',
                                title: '图片过多'
                            })
                            this.setData({
                                hideAdd: 1
                            })
                            break;
                        }
                        img_url.push(res.tempFilePaths[i])
                    }
                    this.setData({
                        img_url: img_url
                    })
                }
            })
            .catch(err => {
                console.error("选择图片失败", err);
            })
    },

    // 将帖子上传到云数据库，img_url_ok是如果有图片的云端路径
    publish: function (img_url_ok) {
        // 获取本地存储中当前用户信息
        let userInfo = wx.getStorageSync('userInfo');

        // 发布帖子的时候，同时公布里程数，交通工具，减排量，共同监督
        wx.cloud.callFunction({
            name: 'publish_post_jt',
            // 下面是向云函数传递的参数
            data: {
                // 用户名
                author_name: userInfo.nickName,
                // 用户头像
                author_avatar_url: userInfo.avatarUrl,
                // 文本框的内容
                content: this.data.content,
                // 云端的图片路径
                image_url: img_url_ok,
                // 发布时间
                publish_time: Date.now(),
                // 更新时间
                update_time: "",
                // 主题
                theme: this.data.themeArray[this.data.themeIndex],
                // 里程数
                mileCount: this.data.mileCount,
                // 减排量
                carbon_reduction: this.data.carbon_reduction
            }
        })
            .then(res => {
                // 成功后回到首页，并且刷新
                console.log("发布成功", res);
                const postId = res.result._id;

                // 将这个帖子添加到用户发送的帖子列表中，同时更新减排量
                wx.cloud.callFunction({
                    name: 'user_add_post_jt',
                    data: {
                        // 新的帖子的id
                        postId: postId,
                        // 减排量
                        carbon_reduction: this.data.carbon_reduction,
                        // 主题
                        theme: this.data.themeArray[this.data.themeIndex],
                        // 里程数
                        mileCount: this.data.mileCount,
                    }
                })
                    .then(res => {
                        console.log("用户发表帖子列表更新", res);
                        wx.hideLoading();
                        wx.setStorageSync('updateFlag', true);
                        this.setData({
                            content: '',
                            img_url: [],
                            hideAdd: false,
                            mileCount: ' '
                        })
                        wx.showToast({
                            title: '发布成功',
                            icon: 'success',
                            duration: 1000,
                            mask: true,
                        })
                            .then(res => {
                                setTimeout(function () {
                                    //要延时执行的代码
                                    wx.navigateBack({
                                        delta: 1
                                    })
                                }, 1000) //延迟时间
                            })
                    })
                    .catch(err => {
                        console.error('用户帖子列表更新失败', err);
                    })
            })
            .catch(err => {
                wx.showToast({
                    icon: 'error',
                    title: "发布失败",
                    mask: true,
                    duration: 2500
                })
                console.log('发布失败' + err)
            })
    },


    // 点击发布，如果有图片将图片上传到云存储，然后调用 publish函数，上传到数据库
    send: function () {
        if (this.data.content.length < this.data.minContentLength) {
            wx.showToast({
                icon: 'error',
                title: '内容太短!',
            })
            return;
        }

        const mileCount = this.data.mileCount;
        // 判断里程的输入
        var regPos = /^[0-9]+.?[0-9]*/;
        if (regPos.test(mileCount) && !isNaN(mileCount)) {
            console.log('输入的里程数是数字')
            this.setData({
                mileCount: parseFloat(mileCount)
            })
        }
        else {
            wx.showToast({
                title: '里程数错误！',
                icon: 'error',
                duration: 1500,
                mask: true
            });
            return;
        }
        // 这里计算一下减排量
        var carbon_reduction = 0;
        // 公交
        if (this.data.themeIndex == 0) {
            carbon_reduction = this.data.mileCount * 0.19
        } // 骑行
        else if (this.data.themeIndex == 1) {
            carbon_reduction = this.data.mileCount * 0.27
        } // 步行
        else if (this.data.themeIndex == 2) {
            carbon_reduction = this.data.mileCount * 0.3
        } // 地铁
        else if (this.data.themeIndex == 3) {
            carbon_reduction = this.data.mileCount * 0.08
        }
        this.setData({
            carbon_reduction
        })
        console.log('里程数,', this.data.mileCount)
        console.log('减排量,', this.data.carbon_reduction)

        wx.showLoading({
            title: '发布中',
            mask: true
        })

        // 要上传的临时路径
        let img_url = this.data.img_url;
        // 上传成功的图片在云端的路径
        let img_url_ok = [];

        // 由于图片只能一张一张地上传，所以用循环
        // 不带图片，发送文字，直接返回
        if (img_url.length == 0) {
            this.publish([])
            return;
        }

        // 一张一张上传
        for (let i = 0; i < img_url.length; i++) {
            var str = img_url[i];
            // 获取临时路径的最后一个 /，前面都一样
            var pos = str.lastIndexOf("/");
            // 从这个地方截取到最后
            var fileName = str.substr(pos + 1)

            // 上传图片到云存储
            wx.cloud.uploadFile({
                // 云端的路径
                cloudPath: 'post_images_jt/' + fileName,
                // 上传图片的路径，小程序临时文件路径
                filePath: img_url[i]
            })
                .then(res => {
                    // console.log("试试能不能获取到上面的数据", img_url.length)
                    // 返回值有图片在云存储的 fileID 
                    console.log("图片上传成功", res);

                    //把上传成功的图片的地址放入数组中
                    img_url_ok.push(res.fileID)

                    //如果全部传完，则可以将图片路径保存到数据库
                    if (img_url_ok.length == img_url.length) {
                        console.log(img_url_ok)
                        this.publish(img_url_ok)
                    }
                })
                .catch(err => {
                    wx.showToast({
                        icon: 'error',
                        title: "图片上传失败",
                        mask: true,
                        duration: 2500
                    })
                    console.log('fail: ' + err)
                })
        }

    },

    handleRemove(e) {
        // console.log(e);
        const index = e.currentTarget.dataset.index;
        // 获取 data中的图片数组
        let { img_url } = this.data;
        // 删除元素
        img_url.splice(index, 1);
        // 填充回去
        this.setData({
            img_url
        })
    },

    handlePreview(e) {
        // 1.先构造要预览的图片数组
        const urls = this.data.img_url;
        // 2.current不能写死，接收传递过来的图片 URL
        const current = e.currentTarget.dataset.url;
        wx.previewImage({
            current,
            urls
        });
    },

    onShareAppMessage() {
        console.log("path:/pages/postdetail/postdetail?posid=" + this.data.postid)
        return {
            title: "刚刚在聊大社区看到个帖子，真是绝了！",
            path: "/pages/index/index?id=" + this.data.id + "&fenxiang=true&liuyan=" + this.data.liuyan
        }
    },
})