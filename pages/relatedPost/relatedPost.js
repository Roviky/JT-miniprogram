const util = require('../../utils/util.js');

Page({
    data: {
        // 所有的帖子
        postlist: [],
        // 筛选
        limit: ''
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

    onLoad(options) {
        // console.log(options)
        let limit = options.limit
        this.setData({
            limit
        })

        let postStr = options.postArr;
        // 进行字符串的分割
        let postArr = postStr.split(',')
        // Arr只是所有帖子的id
        var postlist = []
        for (let i = 0; i < postArr.length; i++) {
            wx.cloud.database().collection('post_collection_jt')
                .doc(postArr[i])
                .get()
                .then(res => {
                    console.log('获取单条帖子成功', res)
                    res.data.publish_time = util.formatTime(new Date(res.data.publish_time))
                    res.data.imgLen = res.data.image_url.length
                    res.data.carbon_reduction = res.data.carbon_reduction.toFixed(1)
                    // 添加进去
                    postlist.push(res.data)
                    // 会有点问题，有时候最后一个进不来
                    if (i == postArr.length - 1) {
                        this.setData({
                            postlist
                        })
                    }
                })
                .catch(err => {
                    console.error('获取单挑帖子失败', err)
                })
        }
        setTimeout(() => {
            this.setData({
                postlist
            })
        }, 1500);
    }
})