// h1要素を取得
const heading = document.querySelector("h1");

// 見出しをクリックしたときの処理を設定
heading.addEventListener("click", function() {
  // heading（＝h1要素）のテキストを「クリックされました」に変える
  heading.textContent = "クリックされました";
});
