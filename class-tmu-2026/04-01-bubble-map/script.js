// SVGの幅と高さ
const width = 800;
const height = 750;

// 地図を描画するSVGの作成
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// 温泉データと地図データを同時に読み込む
Promise.all([
  d3.csv("data.csv", d => ({
    prefecture: d.prefecture,
    location: d.location,
    lat: +d.lat,   // 緯度を数値に変換
    lon: +d.lon,   // 経度を数値に変換
    temp: +d.temp, // 水温を数値に変換
    flow: +d.flow  // 湧出量を数値に変換
  })),
  d3.json("map.json")
]).then(([data, map]) => {

  // 日本のTopoJSONをGeoJSONに変換
  const japan = topojson.feature(map, map.objects.japan);

  // 緯度・経度を画面の座標に変換する投影法
  const projection = d3.geoMercator()
    .fitExtent(
      [[30, 30], [width - 30, height - 30]],
      {
        type: "MultiPoint",
        coordinates: data.map(d => [d.lon, d.lat])
      }
    );

  // 地理データからSVGのパスを作る関数
  const path = d3.geoPath(projection);

  // 日本の輪郭を描画
  svg.append("path")
    .attr("class", "land")
    .attr("d", path(japan));

  // 湧出量を円の半径に変換（2000以上は半径7.5で固定）
  const radius = d3.scaleSqrt()
    .domain([0, 2000])
    .range([2, 7.5])
    // 値がdomainで設定した範囲を超えた場合にrangeの範囲に収める
    .clamp(true);

  // 水温を色に変換（0〜100度の範囲で色分け）
  const color = d3.scaleThreshold()
    .domain([20, 40, 60])
    .range([
      "#56b9d8", // 20℃未満
      "#fff4c6", // 20〜40℃未満
      "#f6a0a4", // 40〜60℃未満
      "#f56368"  // 60℃以上
    ]);

  // 大きな円を先に描画し、小さな円を見やすくする
  data.sort((a, b) => b.flow - a.flow);

  // 温泉データ1件につき円を1つ描画
  svg.selectAll(".spring")
    .data(data)
    .join("circle")
    .attr("class", "spring")
    .attr("cx", d => projection([d.lon, d.lat])[0]) // 経度からX座標
    .attr("cy", d => projection([d.lon, d.lat])[1]) // 緯度からY座標
    .attr("r", d => radius(d.flow)) // 湧出量を半径に反映
    .style("--spring-color", d => color(d.temp)); // 水温の色をCSSに渡す
});
