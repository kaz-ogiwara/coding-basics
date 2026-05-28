// EChartsのグラフを表示するHTML要素を取得して、グラフ本体を初期化
const chart = echarts.init(document.getElementById('chart'));

// 都道府県を選ぶドロップダウンのHTML要素を取得
const prefectureSelect = document.getElementById('prefectureSelect');

// 表示方法を選ぶドロップダウンのHTML要素を取得
const metricSelect = document.getElementById('metricSelect');

// CSVファイルを読み込み
fetch('population.csv')

// 読み込んだレスポンスをテキストとして取り出す
  .then(response => response.text())

  // CSVの文字列をJavaScriptで扱える配列に変換
  .then(csvText => {

    // 1行目は見出しなので除き、残りを1行ずつに分割
    const rows = csvText.trim().split('\n').slice(1);

    // 各行を「年・都道府県・人口」のオブジェクトに変換
    const data = rows.map(row => {

      // カンマで区切って、3つの値に分割
      const [year, prefecture, population] = row.split(',');

      // 数値として使う項目はNumberで変換
      return {
        year: Number(year),
        prefecture: prefecture,
        population: Number(population)
      };
    });

    // CSVに含まれる年だけを重複なしで取り出し、古い順に並べる
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);

    // CSVに含まれる都道府県名だけを重複なしで取り出す
    const prefectures = [...new Set(data.map(d => d.prefecture))];

    // 都道府県名をドロップダウンの選択肢として追加
    prefectures.forEach(prefecture => {

      // option要素を新しく作る
      const option = document.createElement('option');

      // valueは、選択されたときに使う値
      option.value = prefecture;

      // textContentは、画面に表示される文字
      option.textContent = prefecture;

      // 作ったoptionをselectの中に追加
      prefectureSelect.appendChild(option);
    });

    // 初期表示では東京都を選択状態に
    prefectureSelect.value = '東京都';

    // 最初のグラフを描画
    drawChart(data, years, prefectures, prefectureSelect.value, metricSelect.value);

    // 都道府県の選択が変更されたら、選択内容に合わせて描き直す
    prefectureSelect.addEventListener('change', () => {
      drawChart(data, years, prefectures, prefectureSelect.value, metricSelect.value);
    });

    // 表示方法が変更されたら、実数または1950年基準の指数で描き直す
    metricSelect.addEventListener('change', () => {
      drawChart(data, years, prefectures, prefectureSelect.value, metricSelect.value);
    });
  });

// データと選択中の都道府県を受け取り、グラフを描画する関数
function drawChart(data, years, prefectures, selectedPrefecture, selectedMetric) {

  // 1950年を100にした指数表示かどうかを判定
  const isIndex = selectedMetric === 'index';

  // 実数表示なら人口、指数表示なら1950年を100にした値を返す関数
  const convertValues = values => {

    // 実数表示の場合は、人口データをそのまま返す
    if (!isIndex) return values;

    // 1950年の値を基準値として取り出す
    const baseValue = values[years.indexOf(1950)];

    // 各年の値を「1950年＝100」の指数に変換
    return values.map(value => Math.round((value / baseValue) * 1000) / 10);
  };

  // 各年について、47都道府県の人口の平均を計算
  const averagePopulation = years.map(year => {

    // 対象年の人口だけを取り出す
    const values = data
      .filter(d => d.year === year)
      .map(d => d.population);

    // 対象年の人口を合計
    const total = values.reduce((sum, value) => sum + value, 0);

    // 合計を都道府県数で割り、全国平均を出す
    return Math.round(total / values.length);
  });

  // 全国平均も、表示方法に合わせて実数または指数に変換
  const averageData = convertValues(averagePopulation);

  // 47都道府県それぞれの折れ線グラフ用データを作る
  const prefectureSeries = prefectures.map(prefecture => {

    // この都道府県について、年ごとの人口を並べる
    const populations = years.map(year => {
      // 年と都道府県が一致する1行を探
      const row = data.find(d => d.year === year && d.prefecture === prefecture);

      // 見つかった行の人口を返す
      return row.population;
    });

    // 表示方法に合わせて、実数または1950年基準の指数に変換
    const values = convertValues(populations);

    // この都道府県が現在選択されているかを判定
    const isSelected = prefecture === selectedPrefecture;

    // EChartsのseriesは、1本の線や棒などを表す設定
    return {

      // nameは、凡例やツールチップに表示される系列名
      name: prefecture,

      // type:'line'は、折れ線グラフ
      type: 'line',

      // dataは、x軸の各年に対応する表示用データ
      data: values,

      // symbol:'none'は、折れ線上の丸い記号を完全に非表示にする指定
      symbol: 'none',

      // showSymbol:falseは、各点の丸印を通常時は非表示にする指定
      showSymbol: false,

      // lineStyleは、折れ線の色や太さを指定する設定
      lineStyle: {
        // colorは、選択中なら黄色、それ以外なら薄いグレーに
        color: isSelected ? '#f2c200' : '#d0d0d0',

        // widthは、選択中なら太く、それ以外なら細く
        width: isSelected ? 4 : 1
      },

      // emphasisは、マウスを重ねたときなどの強調表示の設定
      emphasis: {
        // focus:'series'は、重ねた系列を見やすく強調する指定
        focus: 'series'
      },

      // zは、線の重なり順を指定し、数字が大きいほど前面に出
      z: isSelected ? 3 : 1
    };
  });

  // 全国平均の折れ線グラフ用データを作る
  const averageSeries = {

    // nameは、凡例やツールチップに表示される系列名
    name: '全国平均',

    // type:'line'は、全国平均も折れ線グラフとして表示する指定
    type: 'line',

    // dataは、各年の全国平均データを並べた配列
    data: averageData,

    // symbol:'none'は、全国平均の丸い記号も非表示にする指定
    symbol: false,

    // showSymbol:falseは、各点の丸印を通常時は非表示にする指定
    showSymbol: false,

    // lineStyleは、全国平均の線の見た目を指定
    lineStyle: {

      // colorは、全国平均を青色で表示する指定
      color: '#1f77b4',

      // widthは、全国平均の線を太く表示する指定
      width: 4
    },

    // zは、全国平均をグレーの線より前面に表示する指定
    z: 2
  };

  // optionは、EChartsのグラフ全体を定義する設定オブジェクト
  const option = {

    // tooltipは、マウスを重ねたときに出る吹き出しの設定
    tooltip: {

      // trigger:'axis'は、同じ年の値をまとめて表示する指定
      trigger: 'axis',

      // formatterは、ツールチップ内の数値の表示形式を整える指定
      formatter: function (params) {
        return params
          .map(function (item) {
            //return `${item.seriesName}: ${item.value}`;
            return item.seriesName + ": " + item.value.toLocaleString() + '人';
          })
          .join('<br>');
      }
    },

    // legendは、グラフ上部に出る凡例の設定
    legend: {
      show: false
    },

    // gridは、グラフ本体の余白を指定する設定
    grid: {

      // topは、グラフ本体の上側余白
      top: 60,

      // rightは、グラフ本体の右側余白
      right: 30,

      // bottomは、グラフ本体の下側余白
      bottom: 50,

      // leftは、グラフ本体の左側余白
      left: 80
    },

    // xAxisは、横軸の設定
    xAxis: {
      // type:'category'は、横軸を年のようなカテゴリとして扱う指定
      type: 'category',

      // dataは、横軸に表示する年の一覧
      data: years
    },

    // yAxisは、縦軸の設定
    yAxis: {
      // type:'value'は、縦軸を数値軸として扱う指定
      type: 'value',

      // axisLabelは、縦軸ラベルの表示形式を指定する設定
      axisLabel: {
        // formatterは、実数なら万人、指数なら数値のみで表示する指定
        formatter: value => isIndex ? value.toLocaleString() : (value / 10000).toLocaleString() + '万人'
      }
    },

    // seriesは、グラフに表示するすべての系列をまとめた配列
    series: [...prefectureSeries, averageSeries]
  };

  // setOptionは、作成したoptionをEChartsに渡して描画する命令
  chart.setOption(option, true);
}

// ブラウザ幅が変わったときにグラフのサイズを調整
window.addEventListener('resize', () => {
  // resizeは、表示領域に合わせてEChartsを再計算する命令
  chart.resize();
});
