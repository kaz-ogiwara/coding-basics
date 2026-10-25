const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");

// CSVを読み込み、数値の列を自動的に数値へ変換
d3.csv("data.csv", d3.autoType).then(function(data) {

  // 横軸：1人あたりGDP（値の差が大きいため対数スケール）
  const x = d3.scaleLog()
    .domain([500, 150000])
    .range([0, width - 30]);

  // 縦軸：平均寿命
  const y = d3.scaleLinear()
    .domain([50, 90])
    .range([height - 30, 0]);

  // 横軸を描画（ただし微調整していないので少しずれている）
  svg.append("g")
    .attr("transform", `translate(0,${height - 30})`)
    .call(d3.axisBottom(x).ticks(5, "~s"));

  // 縦軸を描画
  svg.append("g")
    .attr("transform", `translate(${30},0)`)
    .call(d3.axisLeft(y));

    // バブルの大きさ：人口（面積が人口に比例するスケール）
  const r = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.population)])
    .range([2, 28]);

  // バブルの色：地域
  const color = d3.scaleOrdinal()
    .domain(["Asia", "Africa", "Europe", "Americas", "Oceania"])
    .range(["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]);

  // バブルの描画
  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.gdp_per_capita_ppp))
    .attr("cy", d => y(d.life_expectancy))
    .attr("r", d => r(d.population))
    .attr("fill", d => color(d.region))
});
