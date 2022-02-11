const util = require('../../utils/util.js');

Page({
    data: {
        // 输入框是否获得焦点
        isFocus: false,
        // 输入的内容
        inputValue: '',
        // 对方的信息
        othersId: '',
        othersAvatar: '',
        othersName: '',
        // 我的信息
        myInfo: {},
        // 对面在我 chat_list里面的索引
        heInMyIndex: -1,
        // 我在对面 chat_list里面的索引
        meInHeIndex: -1,

        // 聊天列表
        chat_list: [],
        // 上传图片的临时路径
        img_url: [],
        // 输入框的高度
        height: 0,
    },

    // 定时器 Id，定时刷新聊天
    TimeId: -1,

    // 输入框的值改变了，就会触发该事件
    handleInput(e) {
        // 1.获取输入框的值
        const { value } = e.detail;
        // 2.合法性验证
        if (!value.trim()) {
            this.setData({
                inputValue: '',
                isFocus: false,
            });
            return;
        }
        // 显示按钮
        this.setData({
            isFocus: true,
            inputValue: value
        });
    },

    // 点击发送
    handleSend() {
        wx.showLoading({
            title: '发送中',
            mask: true
        });

        // 要上传的临时路径
        let img_url = this.data.img_url;
        // 上传成功的图片在云端的路径
        let img_url_ok = [];

        // 有图片
        if (img_url.length > 0) {
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
                    cloudPath: 'chat_images_jt/' + fileName,
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

                            // 之所以分开写if，else以防先发送了，图片才上传成功
                            // 一定要这个时候再调用，不然先发送，再上传图片，顺序错了
                            wx.cloud.callFunction({
                                name: 'chat_jt',
                                data: {
                                    // 1表示已经创建
                                    flag: 1,
                                    // 对方的信息
                                    toId: this.data.othersId,
                                    toAvatar: this.data.othersAvatar,
                                    // 我的信息
                                    fromId: this.data.myInfo.openId,
                                    fromAvatar: this.data.myInfo.avatarUrl,
                                    // 发送的内容
                                    content: this.data.inputValue,
                                    // 图片，云端路径
                                    img_url: img_url_ok,
                                    // 时间
                                    time: Date.now(),
                                    // 两个索引
                                    meInHeIndex: this.data.meInHeIndex,
                                    heInMyIndex: this.data.heInMyIndex
                                }
                            })
                                .then(res => {
                                    wx.hideLoading();
                                    console.log('发送成功', res);
                                    wx.showToast({
                                        title: '发送成功！',
                                        icon: 'success',
                                        image: '',
                                        duration: 1500,
                                        mask: true
                                    })
                                        .then(res => {
                                            this.setData({
                                                inputValue: '',
                                                isFocus: false,
                                                img_url: []
                                            })
                                            this.getChatList()
                                        })
                                })
                                .catch(err => {
                                    console.error('发送失败', err)
                                })
                        }
                    })
                    .catch(err => {
                        wx.hideLoading();
                        wx.showToast({
                            image: '../../images/warn.png',
                            title: "图片上传失败",
                            mask: true,
                            duration: 2500
                        })
                        console.log('fail: ' + err)
                    })
            }
        } // 没有图片
        else {
            wx.cloud.callFunction({
                name: 'chat_jt',
                data: {
                    // 1表示已经创建
                    flag: 1,
                    // 对方的信息
                    toId: this.data.othersId,
                    toAvatar: this.data.othersAvatar,
                    // 我的信息
                    fromId: this.data.myInfo.openId,
                    fromAvatar: this.data.myInfo.avatarUrl,
                    // 发送的内容
                    content: this.data.inputValue,
                    // 图片，云端路径
                    img_url: img_url_ok,
                    // 时间
                    time: Date.now(),
                    // 两个索引
                    meInHeIndex: this.data.meInHeIndex,
                    heInMyIndex: this.data.heInMyIndex
                }
            })
                .then(res => {
                    wx.hideLoading();
                    console.log('发送成功', res);
                    wx.showToast({
                        title: '发送成功！',
                        icon: 'success',
                        image: '',
                        duration: 1500,
                        mask: true
                    })
                        .then(res => {
                            this.setData({
                                inputValue: '',
                                isFocus: false,
                                img_url: []
                            })
                            this.getChatList()
                        })
                })
                .catch(err => {
                    wx.hideLoading();
                    console.error('发送失败', err)
                })
        }
    },

    // 获取聊天记录
    getChatList() {
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: this.data.myInfo.openId
            })
            .get()
            .then(res => {
                console.log('准备渲染用户聊天列表', res)
                const chat_list = res.data[0].chat_list[this.data.heInMyIndex].list
                console.log('我们的聊天记录', chat_list)
                // 加入时间
                this.handleTime(chat_list)
            })
            .catch(err => {
                console.error('准备渲染用户聊天列表失败', err)
            })
    },

    // 加载，获取双方的信息，然后判断是否有过聊天，没有的话进行创建
    onLoad(options) {
        // 将对方和自己的信息全部获得
        console.log('options: ', options)
        const { othersId, othersAvatar, othersName } = options;
        this.setData({
            othersAvatar,
            othersId,
            othersName
        })
        const userInfo = wx.getStorageSync('userInfo');
        console.log('userInfo', userInfo)
        this.setData({
            myInfo: userInfo
        })

        // 判断与对方之前有没有过聊天记录
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: this.data.myInfo.openId
            })
            .get()
            .then(res => {
                console.log('查看用户聊天列表成功', res)
                let chat_list = res.data[0].chat_list;

                // 之前是否有过聊天的标志
                var hasFlag = false;
                for (let i = 0; i < chat_list.length; i++) {
                    if (chat_list[i].toId == this.data.othersId) {
                        // 说明该用户之前聊过
                        hasFlag = true;
                        break;
                    }
                }
                // 之前没聊过，添加进去
                if (hasFlag == false) {
                    wx.cloud.callFunction({
                        name: 'chat_jt',
                        data: {
                            // 0表示第一次创建
                            flag: 0,
                            // 对方的信息
                            toId: this.data.othersId,
                            toAvatar: this.data.othersAvatar,
                            toName: this.data.othersName,
                            // 我的信息
                            fromId: this.data.myInfo.openId,
                            fromAvatar: this.data.myInfo.avatarUrl,
                            fromName: this.data.myInfo.nickName,
                            // 时间
                            time: Date.now(),
                            // 未读消息数
                            unRead: 0
                        }
                    })
                        .then(res => {
                            console.log('创建成功', res);
                            this.getIndex()
                        })
                        .catch(err => {
                            console.error('创建失败', err)
                        })
                } // 聊过的话
                else {
                    this.getIndex()
                }
            })
            .catch(err => {
                console.error('查看用户聊天列表失败', err);
            })
    },

    // 显示时间，在聊天记录里面添加时间戳
    handleTime(chat_list) {
        if (chat_list.length == 0) {
            return
        }
        // 让时间是第一条的时间，永远显示第一条的时间
        let time = chat_list[0].time;
        // 开头插入第一条的时间
        chat_list.unshift({
            time: util.formatTimeChat(new Date(time)),
            // 3表示是时间
            contentFlag: 3
        })
        for (let i = 0; i < chat_list.length; i++) {
            // 超过了 10min
            if (chat_list[i].time > time + 1000 * 60 * 10) {
                time = chat_list[i].time;
                let obj = {
                    time: util.formatTimeChat(new Date(time)),
                    // 3表示是时间
                    contentFlag: 3
                }
                // 哪个位置插入
                chat_list.splice(i, 0, obj)
            }
        }
        this.setData({
            chat_list
        })
    },

    onUnload() {
        clearInterval(this.TimeId);
        console.log('清除定时器')
    },

    // 清空未读消息
    emptyUnRead() {
        wx.cloud.callFunction({
            name: 'empty_unread_jt',
            data: {
                userId: this.data.myInfo.openId,
                heInMyIndex: this.data.heInMyIndex
            }
        })
            .then(res => {
                console.log('清空未读消息成功', res);
            })
            .catch(err => {
                console.error('清空未读消息失败', err);
            })
    },

    // 获取双方在对方的chat_list中的索引
    getIndex() {
        // 对方在我的chat_list中的索引
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: this.data.myInfo.openId
            })
            .get()
            .then(res => {
                console.log('获取对方在我的索引成功', res)
                let chat_list = res.data[0].chat_list;
                var heInMyIndex = -1;
                for (let i = 0; i < chat_list.length; i++) {
                    if (chat_list[i].toId == this.data.othersId) {
                        heInMyIndex = i;
                        break;
                    }
                }
                this.setData({
                    heInMyIndex
                })

                this.getChatList()
                this.emptyUnRead()

                // 启动定时器，8s获取一次
                this.TimeId = setInterval(() => {
                    this.getChatList()
                    this.emptyUnRead()
                }, 8000);
            })
            .catch(err => {
                console.error('获取对方在我的索引失败', err)
            })

        // 我在对方的chat_list中的索引
        wx.cloud.database().collection('user_collection_jt')
            .where({
                user_id: this.data.othersId
            })
            .get()
            .then(res => {
                console.log('获取我在对方的索引成功', res)
                let chat_list = res.data[0].chat_list;
                var meInHeIndex = -1;
                for (let i = 0; i < chat_list.length; i++) {
                    if (chat_list[i].toId == this.data.myInfo.openId) {
                        meInHeIndex = i;
                        break;
                    }
                }
                this.setData({
                    meInHeIndex
                })
            })
            .catch(err => {
                console.error('获取我在对方的索引失败', err)
            })
    },

    // 选择图片
    chooseImg() {
        if (this.data.img_url.length >= 3) {
            wx.showToast({
                title: '1次最多发送3张图片～',
                icon: 'error',
                duration: 1500,
                mask: true
            })
        }
        else {
            wx.chooseImage({
                count: 3, // 默认9 
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有 
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
            })
                .then(res => {
                    console.log("选择图片成功", res);
                    // res.tempFilePaths显示了上传图片的临时路径
                    if (res.tempFilePaths.length > 0) {
                        //把每次选择的图 push进数组
                        let img_url = this.data.img_url;
                        for (let i = 0; i < res.tempFilePaths.length; i++) {
                            img_url.push(res.tempFilePaths[i])
                        }
                        this.setData({
                            img_url: img_url
                        })

                        // 把下面的高度弄高一点
                        //创建节点选择器
                        var query = wx.createSelectorQuery();
                        query.select('.search_row').boundingClientRect()
                        query.exec((res) => {
                            console.log("获取样式", res);
                            var height = res[0].height; // 获取list高度
                            this.setData({
                                height: height + 'rpx'
                            })
                        })
                    }
                })
                .catch(err => {
                    console.error("选择图片失败", err);
                })
        }

    },

    // 删除图片
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
        //创建节点选择器
        var query = wx.createSelectorQuery();
        query.select('.search_row').boundingClientRect()
        query.exec((res) => {
            console.log("获取样式", res);
            var height = res[0].height; // 获取list高度
            this.setData({
                height: height + 'rpx'
            })
        })
    },

    // 预览图片
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

    // 预览图片  聊天记录中
    handlePreview1(e) {
        const current = e.currentTarget.dataset.url;
        let urls = []
        urls.push(current)
        wx.previewImage({
            current,
            urls
        });
    },
})