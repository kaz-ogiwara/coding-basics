// 「data.csv」を読み込む
fetch('data.csv')
  // data.csvの中身を変数csvTextとして取得
  .then(response => response.text())
  .then(csvText => {

    // CSVファイルはテキストファイルなので、まず行ごとに分割して配列にする
    const rows = csvText.trim().split('\n').map(row => row.split(','));

    // rowsの中身を確認
    console.log("rows:", rows);

    // 最初の行はヘッダーなので、ヘッダーとデータ行を分ける
    const header = rows[0];
    const dataRows = rows.slice(1);

    // headerとdataRowsの中身を確認
    console.log("header:", header);
    console.log("dataRows:", dataRows);

    // カテゴリー（「SNS」「テレビ」など ）はデータ行の最初の列にあるので、カテゴリーの配列を作る
    const categories = dataRows.map(row => row[0]);

    // categoriesの中身を確認
    console.log("categories:", categories);

    // 色を定義
    const colors = ['#246', '#59b', '#9ce'];

    // 系列＝series（「毎日接触」「ほとんど接触しない」など）はヘッダーの2列目以降にあるので、系列の配列を作る
    const series = header.slice(1).map((name, colIndex) => {
      // ここで系列の名前、グラフの種類、データの中身を定義する
      return {
        name: name,
        type: 'bar',
        stack: 'total',
        data: dataRows.map(row => Number(row[colIndex + 1])),
        itemStyle: {
          color: colors[colIndex],
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1
        }
      };
    });

    // グラフの要素と、そのグラフを配置する場所（HTMLの「#chart」）を定義する
    const chart = echarts.init(document.getElementById('chart'));

    // グラフのさまざまな設定を行う
    chart.setOption({
      // タイトル部分
      title: {
        // タイトルの文章とスタイル
        text: 'ニュース接触手段別にみた接触頻度',
        textStyle: {
          fontWeight: 'bold',
          color: '#333',
          fontSize: 20
        },

        // サブタイトルの文章とスタイル
        subtext: 'SNS・テレビ・ニュースアプリ・新聞における利用頻度の違い',
        subtextStyle: {
          color: '#666',
          fontSize: 14
        },
        left: 'center'
      },

      // ツールチップ（マウスホバーやタップしたときに表示される情報）
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        valueFormatter: value => value + '％'
      },

      // 凡例（グラフの色と系列の名前を対応させて表示する部分）
      legend: {
        top: 95,
        left: 'center',
        icon: 'circle',
        // 凡例同士の間隔
        itemGap: 30,

        // アイコンのサイズ
        itemWidth: 12,
        itemHeight: 12
      },

      // データ部分の余白
      grid: {
        top: 160,
        left: 130,
        right: 30,
        bottom: 80
      },

      // X軸の設定
      xAxis: {
        type: 'value',
        position: 'top',
        axisLabel: {
          formatter: '{value}％'
        }
      },

      // Y軸の設定
      yAxis: {
        type: 'category',
        data: categories,
        inverse: true
      },

      // 上で定義した系列の配列を系列として指定する
      series: series,

      // graphic＝グラフ内に追加する要素。ここでは注記の文章を追加している
      graphic: [
        {
          type: 'text',
          left: 40,
          bottom: 20,
          style: {
            text: 'データは架空のもの。各手段についての接触頻度（毎日／週に数回／ほとんど接触しない）の割合を想定したもの。',
            fill: '#999',
            fontSize: 12
          }
        }
      ]
    });
  });