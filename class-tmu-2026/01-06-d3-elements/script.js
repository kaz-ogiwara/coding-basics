const svg = d3.select("#chart");

// 追加：SVGの横幅を設定
const width = 500;

// 追加：SVGの高さを設定
const height = 300;

// 追加：グラフの上下左右の余白を設定
const margin = { top: 20, right: 20, bottom: 20, left: 40 };

d3.csv("data.csv").then(function(data) {
  console.log(data);

  data.forEach(function(d) {
    d.value = +d.value;
  });

  // 追加：横方向の位置を決めるスケールを作成
  const x = d3.scaleBand()

    // 追加：CSVのmonth列を横軸の項目に設定
    .domain(data.map(d => d.month))

    // 追加：横方向に使う範囲を設定
    .range([margin.left, width - margin.right])

    // 追加：棒と棒の間隔を設定
    .padding(0.4);

  // 追加：横軸の位置を確認
  console.log(x("2026年2月")); 

  // 追加：縦方向の位置を決めるスケールを作成
  const y = d3.scaleLinear()

    // 追加：0からデータの最大値までを扱う
    .domain([0, d3.max(data, d => d.value)])

    // 追加：縦軸の最大値を見やすい数値に調整
    .nice()

    // 追加：数値をSVG上の縦方向の位置に変換
    .range([height - margin.bottom, margin.top]);

  // 縦軸の位置を確認
  console.log(y(100)); 

  // 追加：横のグリッド線を入れるグループを追加
  svg.append("g")

    // 追加：グリッド線を左余白の位置まで移動
    .attr("transform", `translate(${margin.left},0)`)

    // 追加：縦軸を利用してグリッド線を描画
    .call(
      // 追加：縦方向のスケールから軸を作成
      d3.axisLeft(y)

        // 追加：目盛線をグラフの横幅まで伸ばす
        .tickSize(-(width - margin.left - margin.right))

        // 追加：グリッド線では目盛の数値を表示しない
        .tickFormat("")
    );

  // 追加：横軸を入れるグループを追加
  svg.append("g")

    // 追加：横軸をグラフの下端に移動
    .attr("transform", `translate(0,${height - margin.bottom})`)

    // 追加：横方向のスケールから横軸を描画
    .call(d3.axisBottom(x));

  // 追加：縦軸を入れるグループを追加
  svg.append("g")

    // 追加：縦軸を左余白の位置に移動
    .attr("transform", `translate(${margin.left},0)`)

    // 追加：縦方向のスケールから縦軸を描画
    .call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")

    // 変更：month列を使って棒の横位置を設定
    .attr("x", d => x(d.month))

    // 変更：value列を使って棒の上端を設定
    .attr("y", d => y(d.value))

    // 変更：スケールに合わせて棒の幅を設定
    .attr("width", x.bandwidth())

    // 変更：value列を使って棒の高さを設定
    .attr("height", d => y(0) - y(d.value))

    .attr("fill", "steelblue");
});