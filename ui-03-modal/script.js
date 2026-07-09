// モーダルウインドウを表示するボタンがクリックされたら
document.querySelector(".button-modal").addEventListener("click", () => {

  // #modal-containerにactiveクラスをつける
  document.querySelector("#modal-container").classList.add("active");
});


// モーダル部分全体がクリックされたら
document.querySelector("#modal-container").addEventListener("click", (event) => {

  // 影部分のみイベントを実行する
  if (event.target === document.querySelector("#modal-container")) {

    // モーダルのactiveクラスを取り除く
    document.querySelector("#modal-container").classList.remove("active");
  }
});


// 閉じるボタンがクリックされたら
document.querySelector(".button-close").addEventListener("click", (event) => {

  // モーダルのactiveクラスを取り除く
  document.querySelector("#modal-container").classList.remove("active");
});



