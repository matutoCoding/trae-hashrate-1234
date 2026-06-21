export default defineAppConfig({
  pages: [
    'pages/scan/index',
    'pages/album/index',
    'pages/stats/index',
    'pages/album-detail/index',
    'pages/transfer-confirm/index',
    'pages/delete-confirm/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff8f5',
    navigationBarTitleText: '家庭云盘',
    navigationBarTextStyle: 'black',
    backgroundColor: '#fff8f5'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#ff7a45',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/scan/index',
        text: '扫描'
      },
      {
        pagePath: 'pages/album/index',
        text: '相册'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      }
    ]
  }
})
