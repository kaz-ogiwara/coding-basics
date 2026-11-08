// SVGの幅と高さ
const width = 900;
const height = 800;

// 地図を描画するSVGの作成
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// CSVとTopoJSONの読み込み
Promise.all([
  d3.csv("data.csv", d => ({
    code: d.code,                       // 市区町村コード（文字列）
    pop2025: +d.pop2025,               // 2025年の人口
    pop2026: +d.pop2026,               // 2026年の人口
    change: d.change === "" ? null : +d.change // 増減率（空欄はnull）
  })),
  d3.json("N03-20260101.json")
]).then(([data, map]) => {

  // TopoJSONから市区町村のGeoJSONを作成
  const municipalities = topojson.feature(map, map.objects["N03-20260101"]);

  // 市区町村コードをキーにして人口データを検索できるようにする
  const dataByCode = new Map(data.map(d => [d.code, d]));

  // 日本地図をSVGの範囲に収める投影法
  const projection = d3.geoMercator()
    .fitExtent([[20, 20], [width - 20, height - 20]], municipalities);

  // 地理データをSVGのパスに変換する関数
  const path = d3.geoPath(projection);

  // 人口増減率の区切りと対応する色
  const color = d3.scaleThreshold()
    .domain([0])
    .range([
      "#d73027", // 0%未満
      "#4575b4"  // 0%以上
    ]);


  // 市区町村ごとの図形を描画
  svg.selectAll("path")
    .data(municipalities.features)
    .join("path")
    .attr("class", "municipality")
    .attr("d", path)
    .style("--map-color", d => {
      // 地図に登録された市区町村コードを取得
      const code = d.properties.N03_007;

      // コードが一致する人口データを取得
      const record = dataByCode.get(code);

      // データがない場合はグレーで表示
      if (!record || record.change === null) return "#dddddd";

      // 人口増減率を色に変換
      return color(record.change);
    })
    // 市区町村がマウスオーバーされたとき
    .on("mouseover", (event, d) => {

      // 市区町村名を取得
      const name = (d.properties.N03_003 || "") + (d.properties.N03_004 || "");

      // 市区町村コードを取得
      const code = d.properties.N03_007;

      // コードに対応する人口データを取得
      const record = dataByCode.get(code);

      // 市区町村名と人口増減率をConsoleに表示
      console.log(name, record ? record.change + "%" : "データなし");
    });

  // マウスホイールで拡大・縮小、ドラッグで移動
  const zoom = d3.zoom()
    .scaleExtent([1, 8]) // 拡大倍率を1〜8倍に制限
    .on("zoom", event => {
      // 地図全体に拡大・移動を反映
      svg.selectAll(".municipality").attr("transform", event.transform);
    });

  // SVGにズーム機能を適用
  svg.call(zoom);
});
