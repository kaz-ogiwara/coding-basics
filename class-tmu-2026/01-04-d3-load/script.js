// 削除：前回のクリック動作とConsoleのサンプル
// const heading = document.querySelector("h1");
// console.log("JavaScriptが読み込まれました");
// console.log(heading);
// heading.addEventListener("click", function() {
//   heading.textContent = "クリックされました";
//   console.log("見出しがクリックされました");
// });

// 追加：棒グラフに使うデータ
const data = [40, 80, 120, 60, 100];

// 追加：SVGを選択
const svg = d3.select("#chart");

// 追加：データの数だけ長方形を追加
svg.selectAll("rect")

  // データを棒グラフの要素に割り当て
  .data(data)

  // データの数だけ新しい要素を作る準備
  .enter()

  // 長方形を追加
  .append("rect")

  // 棒の横方向の位置を設定
  .attr("x", (d, i) => i * 60)

  // 棒の縦方向の位置を設定
  .attr("y", d => 150 - d)

  // 棒の幅を設定
  .attr("width", 50)

  // データの値を棒の高さに設定
  .attr("height", d => d)

  // 棒の色を設定
  .attr("fill", "steelblue");


