// グラフを表示するHTML要素を取得する
const chartElement = document.querySelector('#chart');

// 取得したHTML要素をもとにEChartsを初期化する
const chart = echarts.init(chartElement);

// CSVファイルを読み込む
fetch('data.csv')

// 読み込んだファイルをテキストとして取得する
  .then(response => response.text())

  // CSVのテキストをグラフ用データに変換する
  .then(csvText => {

    // CSVを行ごとに分割する
    const lines = csvText.trim().split('\n');

    // 1行目を見出し行として取り出す
    const header = lines[0].split(',');

    // 2行目以降をデータ行として取り出す
    const dataLines = lines.slice(1);

    // 各行をオブジェクト形式のデータに変換する
    const data = dataLines.map(line => {
      // 1行をカンマで分割して列ごとの値にする
      const values = line.split(',');

      // 各列の値に名前をつけて扱いやすくする
      return {
        nameJa: values[0],
        nameEn: values[1],
        region: values[2],
        population: Number(values[3]),
        lifeExpectancy: Number(values[4]),
        gdpPerCapita: Number(values[5])
      };
    });

    // 地域名だけを取り出す
    const regionNames = data.map(d => d.region);

    // 重複を除いた地域名の一覧を作る
    const regions = [...new Set(regionNames)];

    // 地域ごとにEChartsのseriesを作る
    const series = regions.map(region => {

      // 対象地域の国だけを取り出す
      const countriesInRegion = data.filter(d => d.region === region);

      // EChartsのscatterで使う配列形式に変換する
      const chartData = countriesInRegion.map(d => [
        d.gdpPerCapita,
        d.lifeExpectancy,
        d.population,
        d.nameJa,
        d.nameEn,
        d.region
      ]);

      // 1つの地域を1つの系列として返す
      return {
        name: region,
        type: 'scatter',
        data: chartData,
        symbolSize: value => {
          const population = value[2];

          const minSize = 10;
          const maxSize = 400;

          const size = Math.sqrt(population) / 1000;

          return Math.max(minSize, Math.min(size, maxSize));
        }
      };
    });

    // EChartsに渡す設定を作る
    const option = {
      // グラフのタイトルを設定する
      title: {
        text: '平均寿命・GDP・人口'
      },

      // 地域ごとの凡例を表示する
      legend: {
        top: 40
      },

      // グラフ本体の余白を設定する
      grid: {
        top: 90,
        right: 40,
        bottom: 60,
        left: 70
      },

      // 横軸を1人あたりGDPにする
      xAxis: {
        name: '1人あたりGDP（USD）',
        type: 'value'
      },

      // 縦軸を平均寿命にする
      yAxis: {
        name: '平均寿命',
        type: 'value',
        min: 40
      },

      // マウスホバーやタップ時の表示を設定する
      tooltip: {
        trigger: 'item',
        formatter: params => {
          // バブル1つ分のデータを取得する
          const value = params.value;

          // ツールチップに表示するHTMLを返す
          return `
            <strong>${value[3]}</strong><br>
            国名（英語）: ${value[4]}<br>
            地域: ${value[5]}<br>
            人口: ${value[2].toLocaleString()}人<br>
            平均寿命: ${value[1].toFixed(1)}歳<br>
            1人あたりGDP: ${value[0].toLocaleString()} USD
          `;
        }
      },

      // 地域ごとに作成した系列データを設定する
      series: series
    };

    // 作成した設定をEChartsに反映する
    chart.setOption(option);
  });
