const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");

// 変更：右側の凡例と上下左右の軸を配置するため余白を調整
const margin = { top: 35, right: 245, bottom: 65, left: 70 };

d3.csv("data.csv", d3.autoType).then(function(data) {

  // 横軸：左端と右端を余白の内側に設定
  const x = d3.scaleLog()
    .domain([500, 150000])
    .range([margin.left, width - margin.right]);

  // 縦軸：下端と上端を余白の内側に設定
  const y = d3.scaleLinear()
    .domain([50, 90])
    .range([height - margin.bottom, margin.top]);

  // バブルの大きさ：変更なし
  const r = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.population)])
    .range([2, 28]);

  // 地域名は後で凡例を作るために配列として用意
  const regions = ["Asia", "Africa", "Europe", "Americas", "Oceania"];
  const color = d3.scaleOrdinal()
    .domain(regions)
    // D3の組み込みカラースキームを使う
    // 参考：https://d3js.org/d3-scale-chromatic/categorical
    .range(d3.schemeTableau10);

  // 縦軸・横軸に表示する目盛を指定
  const xTicks = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
  const yTicks = [50, 60, 70, 80, 90];

  // 縦方向のグリッド線を描くグループ
  svg.append("g")
    // 破線や色を指定するためclassを指定
    .attr("class", "grid")
    // グリッド線の起点をグラフの上端に移動
    .attr("transform", `translate(0,${margin.top})`)
    // 横軸のスケールxを使って縦方向の目盛線を作成
    .call(d3.axisBottom(x)
      // 目盛線の位置はラベル位置に等しい
      .tickValues(xTicks)
      // 目盛線の長さはグラフの内側＝上下の余白を除く
      .tickSize(height - margin.top - margin.bottom)
      // グリッド線には数字のラベルを表示しない
      .tickFormat(""));

  // 横方向のグリッド線を描くグループ
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${width - margin.right},0)`)
    .call(d3.axisLeft(y)
      .tickValues(yTicks)
      .tickSize(width - margin.left - margin.right)
      .tickFormat(""));

  // 後から横軸の数値に「ドル」を追加するため、横軸を変数に保存
  // 他の設定は基本的にグリッド線と同じ
  const xAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
      .tickValues(xTicks)
      // 横軸の数値を1,000のようにカンマ区切りで表示
      .tickFormat(d3.format(",")));

  // 横軸の各目盛の文字を選択
  xAxis.selectAll(".tick text")
    // 数値の後ろに文字を付け足すtspan要素を追加
    .append("tspan")
    // 単位だけを小さく薄く表示するためclassを設定
    .attr("class", "tick-unit")
    // テキストの内容は「ドル」
    .text(" ドル");

  // 後から縦軸の数値に「歳」を追加するため、縦軸を変数に保存
  const yAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y)
      .tickValues(yTicks));

  // 縦軸の各目盛の文字を選択
  yAxis.selectAll(".tick text")
    .append("tspan")
    .attr("class", "tick-unit")
    .text(" 歳");

  // 横軸の説明を表示するtext要素を作成
  svg.append("text")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", height - 12)
    .attr("text-anchor", "middle")
    .text("1人あたりGDP（対数目盛）");

  // 縦軸の説明を表示するtext要素を作成
  svg.append("text")
    .attr("x", 0)
    .attr("y", 18)
    .text("平均寿命");

  // バブルの描画
  svg.selectAll("circle")
    // 人口の多い順に並べ替える → 大きな円から描画 → 小さな円が上に表示される
    .data(data.sort((a, b) => b.population - a.population))
    .join("circle")
    .attr("cx", d => x(d.gdp_per_capita_ppp))
    .attr("cy", d => y(d.life_expectancy))
    .attr("r", d => r(d.population))
    .attr("fill", d => color(d.region))
    // 円を少し透過させ、重なった円を見やすくする
    .attr("opacity", 0.65)

  // 凡例の横位置
  const legendX = width - margin.right + 40;

  // 色の凡例のタイトル文字列
  svg.append("text")
    .attr("class", "legend-title")
    .attr("x", legendX)
    .attr("y", 50)
    .text("地域（色）");

  // 色の凡例をグループとして追加
  const colorLegend = svg.selectAll(".color-legend")
    // regionsの地域名を凡例のデータとして指定
    .data(regions)
    .join("g")
    .attr("class", "color-legend")
    // 位置は要素の番号を基準にして縦方向に配置
    .attr("transform", (d, i) => `translate(${legendX + 8},${75 + i * 27})`);

  // 左側に表示する小さな円
  colorLegend.append("circle")
    .attr("r", 6)
    .attr("fill", d => color(d));

  // 各地域の名前
  colorLegend.append("text")
    .attr("class", "legend-label")
    // xy座標はcolorLegendの各位置を基準とする
    .attr("x", 16)
    .attr("y", 4)
    .text(d => d);

  // 人口の大きさの凡例のタイトル文字列
  svg.append("text")
    .attr("class", "legend-title")
    .attr("x", legendX)
    .attr("y", 240)
    .text("人口（円の大きさ）");

  // 凡例に使う3つの人口規模を設定
  const sizeValues = [10000000, 100000000, 1000000000];

  // 人口の大きさの凡例をグループとして追加
  const sizeLegend = svg.selectAll(".size-legend")
    .data(sizeValues)
    .join("g")
    .attr("class", "size-legend")
    .attr("transform", (d, i) => `translate(${legendX + 28},${280 + i * 55})`);

  // 各人口規模に対応する円を描画
  sizeLegend.append("circle")
    .attr("r", d => r(d))
    .attr("fill", "none")
    .attr("stroke", "#64748b");

  // 人口の数値を表示するtext要素を作成
  sizeLegend.append("text")
    .attr("class", "legend-label")
    .attr("x", 39)
    .attr("y", 4)
    .text(d => `${d3.format(",")(d)}人`);
});
