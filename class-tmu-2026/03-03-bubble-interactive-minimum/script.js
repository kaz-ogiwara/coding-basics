const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");

const margin = { top: 35, right: 245, bottom: 65, left: 70 };

d3.csv("data.csv", d3.autoType).then(function(data) {

  const x = d3.scaleLog()
    .domain([500, 150000])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([50, 90])
    .range([height - margin.bottom, margin.top]);

  const r = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.population)])
    .range([2, 28]);

  const regions = ["Asia", "Africa", "Europe", "Americas", "Oceania"];
  const color = d3.scaleOrdinal()
    .domain(regions)
    .range(d3.schemeTableau10);

  const xTicks = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
  const yTicks = [50, 60, 70, 80, 90];

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisBottom(x)
      .tickValues(xTicks)
      .tickSize(height - margin.top - margin.bottom)
      .tickFormat(""));

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${width - margin.right},0)`)
    .call(d3.axisLeft(y)
      .tickValues(yTicks)
      .tickSize(width - margin.left - margin.right)
      .tickFormat(""));

  const xAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
      .tickValues(xTicks)
      .tickFormat(d3.format(",")));

  xAxis.selectAll(".tick text")
    .append("tspan")
    .attr("class", "tick-unit")
    .text(" ドル");

  const yAxis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y)
      .tickValues(yTicks));

  yAxis.selectAll(".tick text")
    .append("tspan")
    .attr("class", "tick-unit")
    .text(" 歳");

  svg.append("text")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", height - 12)
    .attr("text-anchor", "middle")
    .text("1人あたりGDP（対数目盛）");

  svg.append("text")
    .attr("x", 0)
    .attr("y", 18)
    .text("平均寿命");

  // ツールチップの表示先を取得し、検索・絞り込みで操作するバブルを変数に保存
  const tooltip = d3.select("#tooltip");

  const bubbles = svg.selectAll("circle")
    .data(data.sort((a, b) => b.population - a.population))
    .join("circle")
    .attr("cx", d => x(d.gdp_per_capita_ppp))
    .attr("cy", d => y(d.life_expectancy))
    .attr("r", d => r(d.population))
    .attr("fill", d => color(d.region))
    .attr("opacity", 0.65)

    // マウスを重ねた円の国名をツールチップに表示
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block").text(d.country_ja)
        .style("left", `${event.clientX + 12}px`)
        .style("top", `${event.clientY + 12}px`);
    })

    // 円からマウスが離れたらツールチップを非表示
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  const legendX = width - margin.right + 40;

  svg.append("text")
    .attr("class", "legend-title")
    .attr("x", legendX)
    .attr("y", 50)
    .text("地域（色）");

  const colorLegend = svg.selectAll(".color-legend")
    .data(regions)
    .join("g")
    .attr("class", "color-legend")
    .attr("transform", (d, i) => `translate(${legendX + 8},${75 + i * 27})`);

  colorLegend.append("circle")
    .attr("r", 6)
    .attr("fill", d => color(d));

  colorLegend.append("text")
    .attr("class", "legend-label")
    .attr("x", 16)
    .attr("y", 4)
    .text(d => d);

  // クリックした地域を保持する。nullは全地域の表示
  let selectedRegion = null;

  // 検索語と選択地域に合わせてバブルと凡例の表示を更新
  const updateBubbles = () => {

    // input #country-searchの値を取得し、前後の空白を削除して小文字に変換
    const keyword = d3.select("#country-search").property("value").trim().toLowerCase();

    // 国の日本語名または英語名に検索語が含まれるかどうかを判定
    const matchesSearch = d => d.country_ja.includes(keyword) || d.country_en.toLowerCase().includes(keyword);

    // 地域が違うバブルは非表示にし、検索語に合わないバブルは薄くする
    bubbles
      .attr("display", d => selectedRegion === null || d.region === selectedRegion ? null : "none")
      .attr("opacity", d => keyword === "" || matchesSearch(d) ? 0.65 : 0.12)
      .attr("stroke", d => keyword !== "" && matchesSearch(d) ? "#334155" : "none")
      .attr("stroke-width", 2);

    // 現在選択している地域を凡例の濃さで区別
    colorLegend.attr("opacity", d => selectedRegion === null || d === selectedRegion ? 1 : 0.3);
  }

  // 国名が入力されたらupdateBubblesを実行
  d3.select("#country-search").on("input", updateBubbles);

  // 凡例をクリックするとその地域だけを表示し、再クリックで全地域に戻す
  colorLegend
    .style("cursor", "pointer")
    .on("click", (event, region) => {
      selectedRegion = selectedRegion === region ? null : region;
      updateBubbles();
    });

  svg.append("text")
    .attr("class", "legend-title")
    .attr("x", legendX)
    .attr("y", 240)
    .text("人口（円の大きさ）");

  const sizeValues = [10000000, 100000000, 1000000000];

  const sizeLegend = svg.selectAll(".size-legend")
    .data(sizeValues)
    .join("g")
    .attr("class", "size-legend")
    .attr("transform", (d, i) => `translate(${legendX + 28},${280 + i * 55})`);

  sizeLegend.append("circle")
    .attr("r", d => r(d))
    .attr("fill", "none")
    .attr("stroke", "#64748b");

  sizeLegend.append("text")
    .attr("class", "legend-label")
    .attr("x", 39)
    .attr("y", 4)
    .text(d => `${d3.format(",")(d)}人`);
});
