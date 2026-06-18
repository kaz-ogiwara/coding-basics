Promise.all([
  d3.json("map.json"),
  d3.csv("data.csv", d => ({
    code: d.code,
    value: Number(d.value)
  }))
]).then(([topoData, data]) => {
  const width = 900;
  const height = 900;

  const svg = d3.select("#map");
  const tooltip = d3.select("#tooltip");

  // TopoJSON内の最初のオブジェクト名を使う
  const objectName = Object.keys(topoData.objects)[0];

  // TopoJSONをGeoJSONに変換する
  const geojson = topojson.feature(topoData, topoData.objects[objectName]);

  // 自治体コードから値を引けるMapを作る
  const valueByCode = new Map(
    data.map(d => [d.code, Number.isNaN(d.value) ? null : d.value])
  );

  // 色分けに使う値だけを取り出す
  const values = Array.from(valueByCode.values()).filter(value => value !== null);

  // 値を8段階の色に分ける
  const colorScale = d3.scaleQuantile()
    .domain(values)
    .range(["#2166AC","#4393C3","#92C5DE","#D1E5F0","#FDDBC7","#F4A582","#D6604D","#B2182B"]);


  // 値に対応する色を返す
  function getColor(value) {
    if (value === null || Number.isNaN(value)) return "#ddd";
    return colorScale(value);
  }

  // 数値をカンマ区切りで表示する
  const formatValue = d3.format(",");

  // 地図がSVG内に収まるように投影法を作る
  const projection = d3.geoMercator().fitSize([width, height], geojson);

  // GeoJSONからSVGのpath文字列を作る関数を用意する
  const path = d3.geoPath().projection(projection);

  // ズーム時にまとめて動かすグループを作る
  const g = svg.append("g");

  // ズームとドラッグの動きを作る
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("start", () => svg.style("cursor", "grabbing"))
    .on("zoom", event => g.attr("transform", event.transform))
    .on("end", () => svg.style("cursor", "grab"));

  // SVGにズームとドラッグを適用する
  svg.call(zoom);

  // 市区町村名を作る
  function getMunicipalityName(properties) {
    return [
      properties.N03_001,
      properties.N03_002,
      properties.N03_003,
      properties.N03_004
    ].filter(Boolean).join(" ");
  }

  // ツールチップを地図の左上に置く
  function moveTooltipToMapTopLeft() {
    const rect = svg.node().getBoundingClientRect();

    tooltip
      .style("left", `${rect.left + 12}px`)
      .style("top", `${rect.top + 12}px`);
  }

  // ホバー中の市区町村情報を表示する
  function showTooltip(event, d) {
    const code = d.properties.N03_007;
    const name = getMunicipalityName(d.properties);
    const value = valueByCode.get(code);
    const textValue = value === null || value === undefined ? "データなし" : formatValue(value);

    moveTooltipToMapTopLeft();

    tooltip
      .style("display", "block")
      .html(`
        <strong>${name}</strong><br>
        自治体コード：${code}<br>
        値：${textValue}
      `);
  }

  // 自治体ごとの地図を描画する
  g.selectAll("path")
    .data(geojson.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => getColor(valueByCode.get(d.properties.N03_007)))
    .attr("stroke", "rgba(20,40,60,0.5)")
    .attr("stroke-width", 0.4)
    .style("vector-effect", "non-scaling-stroke")
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("stroke", "rgba(240,240,0,0.9)").attr("stroke-width", 4);
      showTooltip(event, d);
    })
    .on("mousemove", showTooltip)
    .on("mouseleave", function () {
      d3.select(this).attr("stroke", "rgba(20,40,60,0.5)").attr("stroke-width", 0.4);
      tooltip.style("display", "none");
    });
});