// CSVを読み込む
d3.csv("data.csv", d => ({

  // アーティスト名
  artist: d.artist,

  // 視聴率の順位
  tv_rank: +d.tv_rank,

  // YouTube動画再生数の順位。空欄の順位はnullとして扱う
  youtube_rank: d.youtube_rank === "" ? null : +d.youtube_rank

})).then(data => {

  // 1行の高さ
  const rowHeight = 23;

  // ライン部分の余白
  const top = 45;
  const left = 250;
  const right = 720;

  // 全体の幅と高さ
  const width = 1000;
  const height = top + 56 * rowHeight + 25;

  // 順位から縦座標を計算
  const y = rank => top + (rank - 1) * rowHeight;

  // SVGを用意
  const svg = d3.select("#chart").attr("viewBox", `0 0 ${width} ${height}`);

  // 左右の見出し
  svg.append("text")
    .attr("class", "heading")
    .attr("x", left)
    .attr("y", 15)
    .attr("text-anchor", "end")
    .text("テレビ視聴率順位");

  svg.append("text")
    .attr("class", "heading")
    .attr("x", right)
    .attr("y", 15)
    .text("YouTube再生回数順位");

  // 両方の順位がわかる出演者だけ線で結ぶ
  const curve = d3.linkHorizontal()
    .x(p => p[0])
    .y(p => p[1]);

  const paired = data.filter(d => d.youtube_rank !== null);
  svg.selectAll(".link")
    .data(paired)
    .join("path")
    .attr("class", "link")
    .attr("d", d => curve({
      source: [left, y(d.tv_rank)],
      target: [right, y(d.youtube_rank)]
    }));

  // テレビ側は56件すべて表示
  svg.selectAll(".tv-label")
    .data(data)
    .join("text")
    .attr("class", "label tv-label")
    .attr("x", left - 10)
    .attr("y", d => y(d.tv_rank) + 4)
    .attr("text-anchor", "end")
    .text(d => `${d.tv_rank}位  ${d.artist}`);

  // YouTube側は順位がある55件を表示
  svg.selectAll(".youtube-label")
    .data(paired)
    .join("text")
    .attr("class", "label youtube-label")
    .attr("x", right + 10)
    .attr("y", d => y(d.youtube_rank) + 4)
    .text(d => `${d.youtube_rank}位  ${d.artist}`);
});
