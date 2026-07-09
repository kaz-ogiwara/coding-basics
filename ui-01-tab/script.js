// タブのボタンそれぞれについて
document.querySelectorAll(".tab-button").forEach((button) => {

  // タブのボタンがクリックされたら
  button.addEventListener("click", () => {

    // data-tabの値を取得（「tab1」など）
    const target = button.dataset.tab;

    // クリックされたボタンが属しているタブ全体を取得
    const container = button.closest(".tab-container");

    // container内のタブのボタンのactiveクラスを外す
    container.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.remove("active");
    });

    // container内のタブのコンテンツのactiveクラスを外す
    container.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    // クリックされたボタンにactiveクラスをつける
    button.classList.add("active");

    // 対応するコンテンツにactiveクラスをつける
    container.querySelector(`.tab-content[data-tab="${target}"]`).classList.add("active");
  });
});