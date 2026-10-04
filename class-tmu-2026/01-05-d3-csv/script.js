// 削除：JavaScriptに直接データを書く
// const data = [40, 80, 120, 60, 100];

const svg = d3.select("#chart");

// 追加：CSVファイルを読み込む
d3.csv("data.csv").then(function(data) {

  // 追加：読み込んだデータをConsoleに表示
  console.log(data);

  // 追加：value列を数値に変換
  data.forEach(function(d) {
    d.value = +d.value;
  });

  // このブロックは前回と同じ
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 60)

    // 変更：棒の上端の位置と高さをvalue列を使って設定
    .attr("y", d => 150 - d.value)
    .attr("width", 50)
    .attr("height", d => d.value)
    .attr("fill", "steelblue");
});
