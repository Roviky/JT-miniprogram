// 授权页面
Page({
    data: {
        // 用户信息
        userInfo: {}
    },

    onShow() {
        // tabBar的函数
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 4
            })
        }

        const userInfo = wx.getStorageSync('userInfo');
        this.setData({
            userInfo
        })
    },

    // 调用微信提供的api，获取用户信息
    getUserProfile() {
        wx.getUserProfile({
            // 下面这个字段必须有
            "desc": "完善信息"
        })
            .then(res => {
                console.log("获取用户信息成功", res);
                const { userInfo } = res;
                // 获取用户的openid
                wx.cloud.callFunction({
                    name: 'get_user_info_jt'
                })
                    .then(res => {
                        console.log("获取到用户id", res);
                        // 将用户的 openId放入到 userInfo中
                        userInfo.openId = res.result.userInfo.openId;
                        // 将用户的个人信息存到缓存中
                        wx.setStorageSync('userInfo', userInfo);
                        // 用于页面渲染
                        this.setData({
                            userInfo
                        })

                        // 先看用户数据库中有没有用户的信息
                        wx.cloud.database().collection('user_collection_jt')
                            .where({
                                user_id: userInfo.openId
                            })
                            .get()
                            .then(res => {
                                console.log('用户数据库的信息', res);
                                // 如果返回的数组长度为0，说明用户还没被添加到数据库
                                if (res.data.length === 0) {
                                    wx.cloud.callFunction({
                                        name: 'add_user_jt',
                                        data: {
                                            // 用户名
                                            user_name: userInfo.nickName,
                                            // 用户头像
                                            user_avatar_url: userInfo.avatarUrl,
                                            // 用户地区
                                            user_position: userInfo.country + " " + userInfo.province + " " + userInfo.city
                                        }
                                    })
                                        .then(res => {
                                            console.log('添加用户成功', res);
                                            wx.switchTab({
                                                url: '/pages/index/index',
                                            })
                                        })
                                        .catch(err => {
                                            console.error('添加用户失败', err);
                                        })
                                }
                                else {
                                    console.log('数据库中已经存在该用户的信息了');
                                    wx.switchTab({
                                        url: '/pages/index/index',
                                    })
                                }
                            })
                            .catch(err => {
                                console.log('没有获取到用户数据库的信息', err)
                            });
                    })
                    .catch(err => {
                        console.error("没获取用户id", err);
                    })
            })
            .catch(err => {
                console.error("获取用户信息失败", err);
            })
    }
})