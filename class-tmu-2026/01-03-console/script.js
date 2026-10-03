const heading = document.querySelector("h1");

// 追加：Consoleにメッセージを表示
console.log("JavaScriptが読み込まれました");

// 追加：取得したh1要素をConsoleに表示
console.log(heading);

heading.addEventListener("click", function() {
  heading.textContent = "クリックされました";

  // 追加：クリックされたことをConsoleに表示
  console.log("見出しがクリックされました");
});