// 帖子列表的展示页面
const util = require('../../utils/util.js');

Page({
  data: {
    // 输入框是否获得焦点
    isFocus: false,
    // 输入的关键字
    searchKey: '',
    // 是否有搜索，显示 相关信息
    noSearch: true,
    // 所有的帖子
    postlist: [],
    // 搜索到用户的信息
    userlist: [],
    // 轮播图
    swiperList: ['/images/text.png', '/images/text1.png', '/images/text2.png'],
    commentLoaded: false,
    inputValue: ''
  },

  // 输入框的值改变了，就会触发该事件
  handleInput(e) {
    // 1.获取输入框的值
    const { value } = e.detail;
    // 2.合法性验证
    if (!value.trim()) {
      this.setData({
        searchKey: '',
        isFocus: false,
        noSearch: true
      });
      // 清空以后，再次刷新
      if (value === '') {
        this.refresh(0)
      }
      return;
    }
    // 显示按钮
    this.setData({
      isFocus: true,
      searchKey: value
    });
  },

  // 点击查询按钮，使用模糊搜索
  handleSearch() {
    // 先清空上次的
    this.setData({
      postlist: [],
      userlist: []
    })

    wx.showLoading({
      title: '查询中',
      mask: true
    });

    let db = wx.cloud.database();
    // 实现模糊搜索
    // 先查询帖子
    db.collection('post_collection_jt')
      .where({
        // 使用正则查询
        content: db.RegExp({
          regexp: this.data.searchKey,
          options: 'i' // 不区分大小写
        })
      })
      .orderBy('publish_time', 'desc')
      .get()
      .then(res => {
        console.log('查询帖子信息成功', res);
        let postlist = res.data || []

        postlist.forEach((v, index_iter) => {
          v.publish_time = util.formatTimeHourMinute(new Date(v.publish_time))
          v.imgLen = v.image_url.length
          v.carbon_reduction = v.carbon_reduction.toFixed(1)
        })
        // 再去查询用户信息
        db.collection('user_collection_jt')
          .where({
            // 使用正则查询
            user_name: db.RegExp({
              regexp: this.data.searchKey,
              options: 'i' // 不区分大小写
            })
          })
          .get()
          .then(res => {
            console.log('查询用户信息成功', res);
            let userlist = res.data;
            if (postlist.length === 0 && userlist.length === 0) {
              wx.showModal({
                title: '没有相关内容～',
                content: '',
                showCancel: false,
                cancelText: '取消',
                cancelColor: '#000000',
                confirmText: '确定',
                confirmColor: '#3CC51F',
              });
            }
            this.setData({
              noSearch: false,
              postlist,
              userlist
            })
            wx.hideLoading();
          })
          .catch(err => {
            console.error('查询用户信息失败', err)
            wx.hideLoading();
          })
      })
      .catch(err => {
        console.error('查询帖子信息失败', err);
        wx.hideLoading();
      })
  },

  // 分页获取数据
  refresh: function (flag) {
    // flag = 0表示刷新，获取前几个就行
    // flag = 1表示加载剩余的，即分页获取
    wx.showLoading({
      title: '加载中',
    })
    if (flag == 0) {
      // 清空之前的
      this.setData({
        postlist: []
      })
      wx.cloud.callFunction({
        name: 'get_post_list_jt',
        // 传递的参数，修改为分页加载，触底再次加载
        data: {
          // 一页多少条数据
          pageNum: 15,
          // 当前的长度，即从哪里开始
          length: 0
        }
      })
        .then(res => {
          console.log("拉取帖子数据成功", res);
          //提取数据，是数组形式
          var data = res.result.data;
          wx.hideLoading();
          // 标准化时间戳
          data.forEach((v, index_iter) => {
            v.publish_time = util.formatTimeHourMinute(new Date(v.publish_time))
            v.imgLen = v.image_url.length
            v.carbon_reduction = v.carbon_reduction.toFixed(1)
            // console.log('获取'+ v._id + '的评论')
            wx.cloud.callFunction({
                name: 'get_comment_for_post_jt',
                data: {
                    postid: v._id,
                }
            })
                .then(res => {
                    console.log("获取该帖子的评论", res);
                    // 评论的数组
                    var commentList = res.result.data;
                    console.log("评论的列表", commentList);
                    v.commentlist = commentList
                    if (index_iter == (data.length - 1)) {
                      console.log('到最后一个啦')
                      this.setData({
                        commentLoaded: true
                      })
                    this.setData({
                      postlist: data
                      // postlist: [...this.data.postlist, ...data]
                    })
                    wx.stopPullDownRefresh()
                    wx.setStorageSync('updateFlag', false);
                    }
                })
                .catch(err => {
                    console.log('没能获取到评论', err);
                    return null
                })
          })
        })
        .catch(err => {
          console.error("获取帖子数据失败", err);
        })
    }
    else {
      wx.cloud.callFunction({
        name: 'get_post_list_jt',
        // 传递的参数，修改为分页加载，触底再次加载
        data: {
          // 一页多少条数据
          pageNum: 15,
          // 当前的长度，即从哪里开始
          length: this.data.postlist.length
        }
      })
        .then(res => {
          console.log("拉取帖子数据成功", res);
          //提取数据，是数组形式
          var data = res.result.data;
          wx.hideLoading();
          // 标准化时间戳
          data.forEach((v, index_iter) => {
            v.publish_time = util.formatTimeHourMinute(new Date(v.publish_time))
            v.imgLen = v.image_url.length
            v.carbon_reduction = v.carbon_reduction.toFixed(1)
            // console.log('获取'+ v._id + '的评论')
            wx.cloud.callFunction({
                name: 'get_comment_for_post_jt',
                data: {
                    postid: v._id,
                }
            })
                .then(res => {
                    console.log("获取该帖子的评论", res);
                    // 评论的数组
                    var commentList = res.result.data;
                    console.log("评论的列表", commentList);
                    v.commentlist = commentList
                    if (index_iter == data.length - 1) {
                      console.log('到最后一个啦')
                      this.setData({
                        commentLoaded: true
                      })
                      this.setData({
                        // postlist: data
                        postlist: [...this.data.postlist, ...data]
                      })
                    }
                })
                .catch(err => {
                    console.log('没能获取到评论', err);
                })
          })
          
          wx.stopPullDownRefresh()
          wx.setStorageSync('updateFlag', false);
        })
        .catch(err => {
          console.error("获取帖子数据失败", err);
        })
    }
    
  },

  onLoad() {
    // 更新标志
    wx.setStorageSync('updateFlag', true);
  },

  // 页面显示
  onShow: function () {
    // tabBar 加入的函数
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    // 如果有用户的信息
    if (wx.getStorageSync('userInfo')) {
      const updateFlag = wx.getStorageSync('updateFlag')
      console.log('本地存储有用户的数据');
      if (updateFlag) {
        // 先清空一下，如果发布了在最上面显示
        this.setData({
          postlist: []
        })
        wx.startPullDownRefresh();
      }
    }
    else {
      console.log('本地存储没有用户的数据');
      // 跳转到授权页面 
      wx.switchTab({
        url: '/pages/user/user',
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.refresh(0)
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

  // 预览图片
  previewImage(e) {
    // console.log(e);
    // 1.先构造要预览的图片数组
    const urls = e.currentTarget.dataset.list;
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
  },

  // 触底再次请求
  onReachBottom() {
    // 当搜索的时候，就不要再加载了
    if (this.data.noSearch === true) {
      this.refresh(1)
    }
  },

  // 发表
  newPost() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    });
  },

  // 板块信息
  showClassDetail(e) {
    // console.log(e);
    let { theme, index } = e.currentTarget.dataset;
    if (theme == '经验交流') {
      index = 0;
    }
    else if (theme == '猫咪信息') {
      index = 1;
    }
    else if (theme == '流浪猫领养') {
      index = 2;
    }
    else if (theme == '投喂点日常') {
      index = 3;
    }
    else if (theme == '其他') {
      index = 4;
    }
    else {
      ;
    }
    console.log(index);
    wx.navigateTo({
      url: '/pages/classdetail/classdetail?classid=' + index,
    });
  },

  showText() {
    wx.navigateTo({
      url: '/pages/showText/showText'
    });
  },

  down() {

  },

  // 发送评论
  sendComment: function (e) {
    console.log(e)
    let { authorid, postid, content, image_url, index } = e.currentTarget.dataset;
    let value = e.detail.value
    if (value.length < 1) {
        wx.showToast({
            icon: 'error',
            title: '评论不能为空',
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
            postid: postid,
            // 用户的昵称
            name: userInfo.nickName,
            // 用户的头像
            avatarUrl: userInfo.avatarUrl,
            // 评论内容
            comment_content: value,
            // 作者的id
            authorId: authorid,
            // 图片
            imageUrls: image_url,
            // 帖子的文字内容
            post_content: content,
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
                    this.setData({
                        inputValue: ''
                    })
                    wx.setStorageSync('updateFlag', true);
                    let postdata = this.data.postlist

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
                          console.log("评论的列表", commentList);
                          postdata[index].commentlist = commentList
                          this.setData({
                            postlist: postdata
                      
                          })
                          wx.stopPullDownRefresh()
                          wx.setStorageSync('updateFlag', false);
                          
                      })
                      .catch(err => {
                          console.log('没能获取到评论', err);
                          return null
                      })
               })
                .catch(err => {
                    console.error("用户评论列表更新失败", err);
                })
        })
        .catch(err => {
            console.error("评论失败", err);
        })
},
})