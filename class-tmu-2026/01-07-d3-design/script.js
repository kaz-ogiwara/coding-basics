const svg = d3.select("#chart");

const width = 500;
const height = 300;
const margin = { top: 20, right: 20, bottom: 20, left: 40 };

d3.csv("data.csv").then(function(data) {
  console.log(data);

  data.forEach(function(d) {
    d.value = +d.value;
  });

  const x = d3.scaleBand()
    .domain(data.map(d => d.month))
    .range([margin.left, width - margin.right])
    .padding(0.4);

  console.log(x("2026年2月"));

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  console.log(y(100));

  svg.append("g")

    // 変更：グリッド線をCSSで指定するためclassを追加
    .attr("class", "grid")

    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(y)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
    );

  svg.append("g")

    // 変更：横軸をCSSで指定するためclassを追加
    .attr("class", "axis x-axis")

    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")

    // 変更：縦軸をCSSで指定するためclassを追加
    .attr("class", "axis y-axis")

    .attr("transform", `translate(${margin.left},0)`)

    // 変更：縦軸の目盛を減らす
    .call(d3.axisLeft(y).ticks(6));

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")

    // 追加：棒をCSSで指定するためclassを追加
    .attr("class", "bar")

    .attr("x", d => x(d.month))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.value))

    // 削除：棒の色はstyle.cssで指定
    // .attr("fill", "steelblue");
});
