// 用于转换时间

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  // 下面写得好
  // ``模版字符串，${}中间放变量，.map后面这个函数是格式化时间例如 8 - 08，.join是以什么连接
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 聊天里面的时间
const formatTimeChat = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  // 下面写得好
  // ``模版字符串，${}中间放变量，.map后面这个函数是格式化时间例如 8 - 08，.join是以什么连接
  return `${[month, day].map(formatNumber).join('-')} ${[hour, minute].map(formatNumber).join(':')}`
}

// 显示 20:56
const formatTimeHourMinute = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${[hour, minute].map(formatNumber).join(':')}`
}

// 显示 8-12
const formatTimeMonthDay = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[month, day].map(formatNumber).join('-')}`
}

// 显示 2020-8-12
const formatTimeYearMonthDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month, day].map(formatNumber).join('-')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const formatWeek = date => {
  // 按周日为一周的最后一天计算  

  // 今天是这周的第几天  
  var today = date.getDay();

  // 上周日距离今天的天数（负数表示）  
  var stepSunDay = -today + 1;

  // 如果今天是周日  
  if (today == 0) {
    stepSunDay = -7;
  }

  // 周一距离今天的天数（负数表示）  
  var stepMonday = 7 - today;

  var time = date.getTime();

  var monday = new Date(time + stepSunDay * 24 * 3600 * 1000);
  var sunday = new Date(time + stepMonday * 24 * 3600 * 1000);

  //本周一的日期 （起始日期）  
  var startDate = transferDate(monday); // 日期变换  
  //本周日的日期 （结束日期）  
  var endDate = transferDate(sunday); // 日期变换  

  return startDate + ' - ' + endDate;
}

const transferDate = date => {
  // 年  
  var year = date.getFullYear();
  // 月  
  var month = date.getMonth() + 1;
  // 日  
  var day = date.getDate();

  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 0 && day <= 9) {
    day = "0" + day;
  }

  var dateString = month + '月' + day + '日';

  return dateString;
}

module.exports = {
  formatTime,
  formatTimeHourMinute,
  formatTimeMonthDay,
  formatTimeYearMonthDay,
  formatTimeChat,
  formatWeek
}