const svg = d3.select("#chart");

// 変更：SVGの横幅に合わせて値を変更
const width = 600;

// 変更：SVGの高さに合わせて値を変更
const height = 320;

// 変更：6桁の縦軸ラベルが収まるよう左余白を広げる
const margin = { top: 20, right: 20, bottom: 30, left: 70 };

d3.csv("data.csv").then(function(data) {
  console.log(data);

  data.forEach(function(d) {
    // 変更：新宿駅の列をグラフで使える数値に変換
    d.shinjuku = +d.shinjuku;
  });

  // 変更：棒の位置を決めるscaleBandではなく、各年度の位置を決めるscalePointを使う
  const x = d3.scalePoint()

    // 変更：CSVのyear列を横軸の項目に設定
    .domain(data.map(d => d.year))

    .range([margin.left, width - margin.right]);

  // 変更：新宿駅の最大値をもとに縦軸の範囲を設定
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.shinjuku)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
    );

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)

    // 変更：大きな数値を読みやすくするため3桁ごとにカンマを表示
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",")));

  // 変更：各データをつないで折れ線を作る設定
  const line = d3.line()

    // 変更：year列を横方向の位置に変換
    .x(d => x(d.year))

    // 変更：shinjuku列を縦方向の位置に変換
    .y(d => y(d.shinjuku));

  // 変更：rectではなくpath要素を追加して折れ線を描画
  svg.append("path")

    // 変更：1本の折れ線にCSV全体のデータを渡す
    .datum(data)

    // 変更：CSSで折れ線のデザインを指定するためclassを追加
    .attr("class", "line")

    // 変更：lineで作った線の形をpathに設定
    .attr("d", line);
});
