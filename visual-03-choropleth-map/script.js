// script.js

Promise.all([
  d3.json("N03-21_210101_designated_city.json"),
  d3.json("data.json")
]).then(([topoData, data]) => {

  const width = 900;
  const height = 900;

  const svg = d3.select("#map");
  const tooltip = d3.select("#tooltip");

  // 色分けの区間を定義
  const colorRules = [
    [null, -1000, "#2166AC"],
    [-1000, -500, "#4393C3"],
    [-500, -50, "#92C5DE"],
    [-50, 0, "#D1E5F0"],
    [0, 50, "#FDDBC7"],
    [50, 500, "#F4A582"],
    [500, 1000, "#D6604D"],
    [1000, null, "#B2182B"]
  ];

  // 数値に対応する色を返す
  function getColor(value) {
    if (value == null || Number.isNaN(value)) {
      return "#eee";
    }

    value = value / 1000;

    for (const [min, max, color] of colorRules) {
      const lowerOk = min === null || value >= min;
      const upperOk = max === null || value < max;

      if (lowerOk && upperOk) {
        return color;
      }
    }

    return "#eee";
  }

  // TopoJSON内の地図オブジェクト名を取得
  const objectName = Object.keys(topoData.objects)[0];

  // TopoJSONをGeoJSONに変換
  const geojson = topojson.feature(topoData, topoData.objects[objectName]);

  // 自治体コードごとに「最後から3番目の値 − 最後の値」を計算
  const municipalityValues = new Map();

  for (const code in data) {
    const values = data[code];

    // 値が3つ未満の場合は計算しない
    if (!Array.isArray(values) || values.length < 3) {
      municipalityValues.set(code, null);
      continue;
    }

    const thirdFromLast = values[values.length - 3];
    const last = values[values.length - 1];

    const value = thirdFromLast - last;

    municipalityValues.set(code, value);
  }

  // 地図がSVG内に収まるように投影法を設定
  const projection = d3.geoMercator()
    .fitSize([width, height], geojson);

  const path = d3.geoPath()
    .projection(projection);

  // path要素をまとめて動かすためのグループを作る
  const g = svg.append("g");

  // ズーム機能を作る
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", event => {
      g.attr("transform", event.transform);
    });

  // svgにズーム機能を適用する
  svg.call(zoom);

  // 自治体ごとの地図を描画
  g.selectAll("path")
    .data(geojson.features)
    .join("path")
    .attr("class", "municipality")
    .attr("d", path)
    .attr("fill", d => {
      const code = d.properties.N03_007;
      const value = municipalityValues.get(code);

      return getColor(value);
    })
    .on("mousemove", (event, d) => {
      const code = d.properties.N03_007;
      const prefecture = d.properties.N03_001 || "";
      const city = d.properties.N03_003 || "";
      const town = d.properties.N03_004 || "";
      const value = municipalityValues.get(code);

      tooltip
        .style("display", "block")
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY + 12 + "px")
        .html(`
          <strong>${prefecture} ${city}${town}</strong><br>
          自治体コード：${code}<br>
          2020年度の寄付・控除額の差：${value ?? "データなし"} 千円
        `);
    })
    .on("mouseleave", () => {
      tooltip.style("display", "none");
    });

});