// 通知の番号をカウントする変数
let count = 1;

document.querySelector(".button-notification").addEventListener("click", () => {

  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerHTML = count + `番目の通知のメッセージです。<button class="button-close"></button>`;

  document.querySelector("#notification-container").appendChild(notification);

  // 少しだけ遅れてactiveクラスを付与することで、アニメーションが発火する
  setTimeout(() => {
    notification.classList.add("active");
  }, 10);

  // activeクラスを消して1秒後に要素を削除する
  const removeNotification = () => {
    notification.classList.remove("active");

    // 1秒経ったら要素を削除する
    setTimeout(() => {
      notification.remove();
    }, 1000);
  };

  // 閉じるボタンがクリックされたらremoveNotification関数を呼び出す
  notification.querySelector(".button-close").addEventListener("click", removeNotification);

  // 5秒経ったらremoveNotification関数を呼び出す
  setTimeout(removeNotification, 5000);

  count++;
});