Component({
    // 要从父组件接收的数据
    properties: {
        tabs: {
            type: Array,
            value: []
        }
    },

    // 自己的数据
    data: {

    },

    methods: {
        handleItemTap(e) {
            // console.log(e);
            const index = e.currentTarget.dataset.index;
            // 子向父传递数据，需要通过事件
            // 获取点击后，触发父组件的事件，同时传递参数过去
            this.triggerEvent('itemChange', { index });
        }
    }
})
