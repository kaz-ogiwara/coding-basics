// button-panelクラスのボタンがクリックされたら
document.querySelector(".button-panel").addEventListener("click", () => {

  // #panel-containerにactiveクラスをつける
  document.querySelector("#panel-container").classList.add("active");
});


// パネル全体がクリックされたら
document.querySelector("#panel-container").addEventListener("click", (event) => {

  // パネルの影部分のみイベントを実行する
  if (event.target === document.querySelector("#panel-container")) {
    // パネルのactiveクラスを取り除く
    document.querySelector("#panel-container").classList.remove("active");
  }
});


// 閉じるボタンがクリックされたら
document.querySelector(".button-close").addEventListener("click", (event) => {
  // パネルのactiveクラスを取り除く
  document.querySelector("#panel-container").classList.remove("active");
});



