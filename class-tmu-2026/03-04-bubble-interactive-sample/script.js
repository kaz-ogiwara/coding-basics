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

  const tooltip = d3.select("#tooltip");

  const bubbles = svg.selectAll("circle")
    .data(data.sort((a, b) => b.population - a.population))
    .join("circle")
    .attr("class", "bubble visible")
    .attr("cx", d => x(d.gdp_per_capita_ppp))
    .attr("cy", d => y(d.life_expectancy))
    .attr("r", d => r(d.population))
    .attr("fill", d => color(d.region))

    .on("mouseover", function(event, d) {

      // マウスオーバーしたバブルにhighlightedクラスを付与
      d3.select(this).classed("highlighted", true);

      // 一度すべての要素を削除し、ツールチップに国名と数値を表示
      tooltip.selectAll("*").remove();
      tooltip.append("h4").text(d.country_ja);
      tooltip.append("h5").text(d.country_en);
      tooltip.append("p").text("平均寿命：" + d.life_expectancy.toFixed(1) + "歳");
      tooltip.append("p").text("1人あたりGDP：" + d3.format(",")(d.gdp_per_capita_ppp) + "ドル");
      tooltip.append("p").text("人口：" + d3.format(",")(d.population) + "人");

      // ツールチップの横幅から表示位置を計算
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const boxWidth = tooltip.node().getBoundingClientRect().width;
      const left = centerX - boxWidth / 2;
      tooltip
        .style("left", `${left}px`)
        .style("top", `${rect.bottom + window.scrollY + 8}px`)
        .style("--arrow-left", `${centerX - left}px`);

      // visibleクラスを付与する
      tooltip.classed("visible", true);
    })
    .on("mouseout", function() {

      // バブルのhighlightedクラスを削除
      d3.select(this).classed("highlighted", false);

      // ツールチップのvisibleクラスを削除
      tooltip.classed("visible", false);
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
    .attr("class", "color-legend visible")
    .attr("transform", (d, i) => `translate(${legendX + 8},${75 + i * 27})`);

  colorLegend.append("circle")
    .attr("r", 6)
    .attr("fill", d => color(d));

  colorLegend.append("text")
    .attr("class", "legend-label")
    .attr("x", 16)
    .attr("y", 4)
    .text(d => d);

  let selectedRegion = null;

  // 検索用に国名を小文字・ひらがなに統一する
  const normalizeSearch = (value) => value.normalize("NFKC").toLowerCase().replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 96));

  // 検索欄とサジェスト要素
  const searchInput = d3.select("#country-search");
  const suggestions = d3.select("#suggestions");

  // 日本語名または英語名が一致するかどうか判定する
  const matchesSearch = (d, keyword) =>
    normalizeSearch(d.country_ja).includes(keyword) ||
    normalizeSearch(d.country_en).includes(keyword);

  // 入力内容に一致する国名を検索欄の直下に一覧表示する
  const updateSuggestions = () => {

    // まず検索語を取得
    const keyword = normalizeSearch(searchInput.property("value").trim());

    // 現在選択されている地域も考慮しつつ検索語に一致する国を抽出 
    const matched = keyword === "" ? [] : data.filter(d =>
      (selectedRegion === null || d.region === selectedRegion) && matchesSearch(d, keyword));

    // サジェストの表示・非表示を切り替え
    suggestions.style("display", matched.length ? "block" : "none");

    // サジェストを表示
    suggestions.selectAll("button")
      .data(matched)
      .join("button")
      .attr("type", "button")
      .text(d => d.country_ja)
      // クリックされたら検索欄に国名を入力し、サジェストを非表示にしてバブルを更新
      .on("click", (event, d) => {
        searchInput.property("value", d.country_ja);
        suggestions.style("display", "none");
        updateBubbles();
      });
  }

  // バブル表示の更新
  const updateBubbles = (animate = false) => {
    const keyword = normalizeSearch(searchInput.property("value").trim());

    // opacity: 選択地域に該当＆検索語にヒットするなら0.65、そうでないなら0.2
    const isvisible = (d) => {
      return (selectedRegion === null || d.region === selectedRegion)
        && (keyword === "" || matchesSearch(d, keyword)) ? true : false;
    };

    // バブルのクラスを操作
    bubbles.classed("visible", isvisible);

    // 凡例のクラスを操作
    colorLegend.classed("visible", d => selectedRegion === null || d === selectedRegion);
  }

  // 検索入力時はバブルの強調表示とサジェストを更新する
  searchInput.on("input", () => {
    updateBubbles();
    updateSuggestions();
  });

  // 地域の凡例クリック時
  colorLegend
    .style("cursor", "pointer")
    .on("click", (event, region) => {
      selectedRegion = selectedRegion === region ? null : region;
      updateBubbles();
      updateSuggestions();
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
