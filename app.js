// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'jt-2gari7mwb9af3720' // 云开发环境id
    })

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    this.getDeviceSize().then(res => {
      const {bottomLift} = res
      this.globalData.bottomLift = bottomLift
    })
  },

  globalData: {
    bottomLift: 0,
  },

  // 获取设备信息
  getDeviceSize: function() {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success: function(res) {
          // console.log(res)
          const {screenHeight, safeArea} = res
          const {bottom} = safeArea
          const bottomLift = screenHeight - bottom
          resolve({bottomLift})
        }
      })
    })
  },
})
