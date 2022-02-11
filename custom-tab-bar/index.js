
Component({
  data: {
    selected: 0,
    "color": "#000",
    "selectedColor": "#A9EA8C",
    "position": "bottom",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "/pages/public_notice/public_notice",
        "text": "公示",
        "iconPath": "/images/gonggao.png",
        "selectedIconPath": "/images/gonggao.png"
      },
      {
        "pagePath": "/pages/ranking/ranking",
        "text": "排行",
        "iconPath": "/images/paihang.png",
        "selectedIconPath": "/images/paihang.png"
      },
      {
        "heigher": "true",
        "pagePath": "/pages/index/index",
        "text": "首页",
        "iconPath": "/images/huanbao.png",
        "selectedIconPath": "/images/huanbao.png"
      },
      {
        "pagePath": "/pages/alert/alert",
        "text": "消息",
        "iconPath": "/images/tishi.png",
        "selectedIconPath": "/images/tishi.png"
      },
      {
        "pagePath": "/pages/user/user",
        "text": "我的",
        "iconPath": "/images/wode.png",
        "selectedIconPath": "/images/wode.png"
      }
    ]
  },

  attached() {
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      // 去往的路径
      const url = data.path
      // 选中的页面
      this.setData({
        selected: data.index
      })
      wx.switchTab({ url })
    }
  }
})