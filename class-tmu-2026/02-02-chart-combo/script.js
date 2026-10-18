const svg = d3.select("#chart");

const width = 600;
const height = 320;

// 変更：右側にも縦軸を置くため右余白を広げる
const margin = { top: 35, right: 70, bottom: 30, left: 70 };

d3.csv("data.csv").then(function(data) {
  console.log(data);

  data.forEach(function(d) {
    // 変更：高校生数を数値に変換
    d.students = +d.students;

    // 変更：高校野球部員数を数値に変換
    d.baseball = +d.baseball;
  });

  const x = d3.scalePoint()
    .domain(data.map(d => d.year))
    .range([margin.left, width - margin.right]);

  // 変更：高校生数に対応する左側の縦軸スケールを作成
  const yStudents = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.students)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // 追加：高校野球部員数に対応する右側の縦軸スケールを作成
  const yBaseball = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.baseball)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // 変更：左側の縦軸をもとに横のグリッド線を描画
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(yStudents)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
    );

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    // 変更：横軸ラベルを5年ごとに表示して重なりを防ぐ
    .call(
      d3.axisBottom(x)
        .tickValues(data.map(d => d.year).filter(year => +year % 5 === 0))
    );

  // 変更：高校生数の縦軸を左側に描画
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yStudents).ticks(5).tickFormat(d3.format(",")));

  // 追加：高校野球部員数の縦軸を右側に描画
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${width - margin.right},0)`)
    .call(d3.axisRight(yBaseball).ticks(5).tickFormat(d3.format(",")));

  // 追加：左側の縦軸が高校生数であることを表示
  svg.append("text")
    .attr("class", "axis-title students")
    .attr("x", margin.left)
    .attr("y", 18)
    .text("高校生数（人）");

  // 追加：右側の縦軸が高校野球部員数であることを表示
  svg.append("text")
    .attr("class", "axis-title baseball")
    .attr("x", width - margin.right)
    .attr("y", 18)
    .attr("text-anchor", "end")
    .text("高校野球部員数（人）");

  // 変更：高校生数の折れ線を作成
  const studentsLine = d3.line()
    .x(d => x(d.year))
    .y(d => yStudents(d.students));

  // 追加：高校野球部員数の折れ線を作成
  const baseballLine = d3.line()
    .x(d => x(d.year))
    .y(d => yBaseball(d.baseball));

  // 変更：高校生数の折れ線を描画
  svg.append("path")
    .datum(data)
    .attr("class", "line students")
    .attr("d", studentsLine);

  // 追加：高校野球部員数の折れ線を描画
  svg.append("path")
    .datum(data)
    .attr("class", "line baseball")
    .attr("d", baseballLine);

});
