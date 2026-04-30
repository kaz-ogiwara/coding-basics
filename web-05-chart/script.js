// グラフの要素と、そのグラフを配置する場所（HTMLの「#chart」）を定義する
const chart = echarts.init(document.getElementById('chart'));

// グラフの設定を行う
chart.setOption({
  // X軸の設定
  xAxis: {
    // グラフのカテゴリーの一覧
    data: ["カテゴリー1","カテゴリー2","カテゴリー3"]
  },
  // Y軸の設定
  yAxis: {
  },
  // 系列（データの列）の設定
  series: [
    // この{ }の中身が1つの系列の設定になる。今回は3系列あるので、{ }が3つある
    {
      // グラフの種類をbar = 棒グラフにする
      type: 'bar',
      // 数値の定義
      data: [10,20,30]
    },
    {
      type: 'bar',
      data: [40,50,60]
    },
    {
      type: 'bar',
      data: [70,80,90]
    }
  ]
});
