const svg = d3.select("#chart");

const width = 600;

// 変更：グラフの高さを少し広げる
const height = 340;

// 変更：左右の軸ラベルが収まるよう余白を調整
const margin = { top: 35, right: 75, bottom: 30, left: 80 };

d3.csv("data.csv").then(function(data) {
  console.log(data);

  data.forEach(function(d) {
    // 変更：入園者数を数値に変換
    d.visitors = +d.visitors;

    // 変更：最低料金を数値に変換
    d.price_min = +d.price_min;

    // 追加：最高料金がある年度だけ数値に変換
    d.price_max = d.price_max === "" ? null : +d.price_max;
  });

  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  // 変更：入園者数に対応する左軸のスケール
  const yVisitors = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.visitors)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // 変更：入園料に対応する右軸のスケール
  const yPrice = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.price_min, d.price_max || 0))])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(yVisitors)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
    );

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3.axisBottom(x)
        // 変更：最初・最後と5年ごとの年度だけ表示
        .tickValues(data.map(d => d.year).filter((year, i) =>
          i === 0 || i === data.length - 1 || +year % 5 === 0
        ))
    );

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    // 変更：左軸に入園者数を表示
    .call(d3.axisLeft(yVisitors).ticks(5).tickFormat(d3.format(",")));

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${width - margin.right},0)`)
    // 変更：右軸に入園料を表示
    .call(d3.axisRight(yPrice).ticks(5).tickFormat(d3.format(",")));

  svg.append("text")
    .attr("class", "axis-title visitors")
    .attr("x", margin.left)
    .attr("y", 18)
    // 変更：左軸のタイトルを入園者数に変更
    .text("年間入園者数（人）");

  svg.append("text")
    .attr("class", "axis-title price")
    .attr("x", width - margin.right)
    .attr("y", 18)
    .attr("text-anchor", "end")
    // 変更：右軸のタイトルを入園料に変更
    .text("入園料（円）");

  // 変更：年間入園者数を棒グラフで描画
  svg.selectAll(".visitors-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "visitors-bar")
    .attr("x", d => x(d.year))
    .attr("width", x.bandwidth())
    .attr("y", d => yVisitors(d.visitors))
    .attr("height", d => yVisitors(0) - yVisitors(d.visitors));

  // 追加：入園料を階段状の折れ線にする
  const priceMinLine = d3.line()
    .curve(d3.curveStepAfter)
    .x(d => x(d.year) + x.bandwidth() / 2)
    .y(d => yPrice(d.price_min));

  // 追加：最低料金の折れ線を描画
  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", priceMinLine);

  // 追加：最高料金の線を分岐させるため、2019年度からのデータを作る
  const priceMaxData = data
    .filter(d => +d.year >= 2019)
    .map(d => ({
      year: d.year,
      price_max: d.price_max === null ? d.price_min : d.price_max
    }));

  // 追加：最高料金も階段状の折れ線にする
  const priceMaxLine = d3.line()
    .curve(d3.curveStepAfter)
    .x(d => x(d.year) + x.bandwidth() / 2)
    .y(d => yPrice(d.price_max));

  // 追加：2020年度以降に分岐する最高料金の折れ線を描画
  svg.append("path")
    .datum(priceMaxData)
    .attr("class", "line")
    .attr("d", priceMaxLine);
});
