Page({
    data: {
        list: [
            {
                flag: false,
                title: "不同交通工具每公里的减排数",
                content: "步行：1km减少碳排放0.3kg     公交：1km减少碳排放0.19kg      骑行：1km减少碳排放0.27kg      地铁：1km减少碳排放0.08kg"
            },
            {
                flag: false,
                title: "111",
                content: "111"
            },
            {
                flag: false,
                title: '222',
                content: "222"
            },
            {
                flag: false,
                title: "333",
                content: "333"
            },
            {
                flag: false,
                title: "444",
                content: "444"
            },
            {
                flag: false,
                title: "555",
                content: "555"
            }
        ],
        bottomLift: 0,
    },

    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function(options) {
        let bottomLift = App.globalData
        if(bottomLift>=0){
            app.getDeviceSize().then(res => {
            const {bottomLift} = res
            this.setData({
                bottomLift
            })
            })
        }else{
        this.setData({
            bottomLift
        })
        }
    },

    onShow() {
        // tabBar 加入的函数
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 0
            })
        }
    },

    // 下拉显示
    showDetail(e) {
        let index = e.currentTarget.dataset.index
        const list = this.data.list
        if (list[index].flag == false) {
            list[index].flag = true;
            this.setData({
                list: list
            })
        }
        else {
            list[index].flag = false;
            this.setData({
                list: list
            })
        }
    }
})