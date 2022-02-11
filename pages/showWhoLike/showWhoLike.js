Page({
    data: {
        // 点赞的人的数据
        userList: []
    },

    onLoad(options) {
        console.log(options)
        let userStr = options.userlist;
        // 进行字符串的分割
        let userArr = userStr.split(',')
        // Arr只是所有帖子的id
        var userList = []
        for (let i = 0; i < userArr.length; i++) {
            wx.cloud.database().collection('user_collection_jt')
                .where({
                    user_id: userArr[i]
                })
                .get()
                .then(res => {
                    console.log('获取单个用户成功', res)
                    let user = res.data[0]
                    // 添加进去
                    userList.push(user)
                    // 会有点问题，有时候最后一个进不来
                    if (i == userArr.length - 1) {
                        this.setData({
                            userList
                        })
                    }
                })
                .catch(err => {
                    console.error('获取单个用户失败', err)
                })
        }
        setTimeout(() => {
            this.setData({
                userList
            })
        }, 1500);
    }
})