// 読み込むCSVファイル名index.htmlと同じフォルダに置く
const csvPath = 'data.csv';

// HTMLの<div id="chart"></div>を取得する
const chartElement = document.getElementById('chart');

// 取得したHTML要素の中に、EChartsのグラフを作る準備をする
const chart = echarts.init(chartElement);

// CSV文字列を、単純な2次元配列に変換する関数
function csvToArray(csvText) {

  // trim()で前後の空白を取り、split('\n')で1行ずつに分ける
  const lines = csvText.trim().split('\n');

  // 各行をカンマで分割し、「行」と「列」を持つ2次元配列にする
  return lines.map(line => line.trim().split(','));
}

// 2次元配列から、EChartsのTree Map用データを作る関数
function buildTreeData(csvArray) {

  // 1行目は列名なので、headerという変数に入れる
  const header = csvArray[0];

  // 2行目以降が実際のデータなので、rowsという変数に入れる
  const rows = csvArray.slice(1);

  // 必要な列が何番目にあるかを、列名から調べる
  const companyIndex = header.indexOf('社名');
  const codeIndex = header.indexOf('証券コード');
  const industryIndex = header.indexOf('業種');
  const weightIndex = header.indexOf('ウエイト');

  // 業種ごとに銘柄をまとめるための空のオブジェクト
  const industryMap = {};

  // rowsの中身を1行ずつ取り出して処理する
  rows.forEach(row => {

    // それぞれの行から、社名・証券コード・業種・ウエイトを取り出す
    const company = row[companyIndex];
    const code = row[codeIndex];
    const industry = row[industryIndex];
    const weight = Number(row[weightIndex]);

    // ウエイトが数値として読めない場合は、仮の値として1を使う
    const value = Number.isFinite(weight) ? weight : 1;

    // その業種がまだなければ、新しく空の配列を作る
    if (!industryMap[industry]) {
      industryMap[industry] = [];
    }

    // 業種の配列に、1銘柄分のデータを追加する
    industryMap[industry].push({
      name: `${company} (${code})`,
      value: value
    });
  });

  // EChartsのTree Mapは、親子関係を持つデータを使う
  return Object.keys(industryMap).map(industry => {

    // ある業種に含まれる銘柄一覧を取り出す
    const children = industryMap[industry];

    // 業種を親、銘柄を子として返す
    return {
      name: industry,
      value: children.reduce((sum, item) => sum + item.value, 0),
      children: children
    };
  });
}

// EChartsでTree Mapを描画する関数
function drawChart(treeData) {

  // optionは、EChartsに渡すグラフ設定全体
  const option = {

    // tooltipは、マウスを重ねたときに表示する情報
    tooltip: {
      // formatterは、tooltipに表示する文字列を作る設定
      formatter: info => `${info.name}<br>ウエイト: ${info.value}`
    },

    // seriesは、実際に描くグラフの種類とデータを指定する場所
    series: [
      {
        // typeで、グラフの種類をTree Mapに指定する
        type: 'treemap',

        // dataに、業種と銘柄の親子データを渡す
        data: treeData,

        // roamをfalseにすると、ズームや移動を無効にする
        roam: false,

        // nodeClickをfalseにすると、クリック時の階層移動を無効にする
        nodeClick: false,

        // breadcrumbは、階層移動用のパンくずリスト
        breadcrumb: {
          // showをfalseにすると、パンくずリストを表示しない
          show: false
        },

        // labelは、各四角形の中に表示する文字の設定
        label: {
          // showをtrueにすると、ラベルを表示する
          show: true,

          // formatterの{b}は、データのnameを表示する指定
          formatter: '{b}',

          // overflowは、文字が入りきらないときの処理
          overflow: 'truncate'
        },

        // upperLabelは、親階層である業種名の表示設定
        upperLabel: {

          // showをtrueにすると、業種名を上部に表示する
          show: true,

          // heightは、業種名を表示する部分の高さ
          height: 24,

          // overflowは、業種名が長いときに省略表示する設定
          overflow: 'truncate'
        },

        // levelsは、階層ごとの見た目を指定する設定
        levels: [
          {
            // itemStyleは、四角形の枠線や余白の見た目を指定する
            itemStyle: {

              // borderWidthは、全体の枠線の太さ
              borderWidth: 0,

              // gapWidthは、業種同士のすき間の広さ
              gapWidth: 4
            }
          },
          {
            // 2階層目、つまり業種単位の見た目を指定する
            itemStyle: {

              // borderWidthは、業種の枠線の太さ
              borderWidth: 2,

              // gapWidthは、銘柄同士のすき間の広さ
              gapWidth: 2
            }
          },
          {
            // 3階層目、つまり個別銘柄の見た目を指定する
            itemStyle: {

              // borderWidthは、個別銘柄の枠線の太さ
              borderWidth: 1
            }
          }
        ]
      }
    ]
  };

  // setOption()で、設定した内容をEChartsに反映して描画する
  chart.setOption(option);
}

// fetch()でCSVファイルを読み込む
fetch(csvPath)

  // 読み込んだファイルの中身を、文字列として取り出す
  .then(response => response.text())

  // CSV文字列を2次元配列にし、Tree Map用データに変換する
  .then(csvText => {
    const csvArray = csvToArray(csvText);
    const treeData = buildTreeData(csvArray);
    drawChart(treeData);
  });
