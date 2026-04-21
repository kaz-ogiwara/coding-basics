

// "button-01"というIDを持つ要素がクリックされたら
document.getElementById('button-01').addEventListener('click', function() {
  // アラートを表示する
  alert('ボタン01が押されました');
});



// "button-02"というIDを持つ要素がクリックされたら
document.getElementById('button-02').addEventListener('click', function () {
  const value = document.getElementById('input-02').value;
  document.getElementById('output-02').textContent = value + " と入力されました。";
});



// クラス.button-03を持つ要素それぞれについて処理を実行する
document.querySelectorAll('.button-03').forEach(function (button) {

  // ボタン（＝.button-03を持つボタン1つ1つ）がクリックされたとき
  button.addEventListener('click', function () {

    // アウトプット対象である要素を取得する
    const output = document.getElementById('output-03');

    // まずはアウトプット対象から、ボタンのIDに対応するクラスを全て削除する（2回目以降の処理を念頭に）
    output.classList.remove('background-red', 'background-yellow', 'background-blue');

    if (this.id === 'button-03-01') {
      output.classList.add('background-red');
    } else if (this.id === 'button-03-02') {
      output.classList.add('background-yellow');
    } else if (this.id === 'button-03-03') {
      output.classList.add('background-blue');
    }
  });
});


// クラス.button-04を持つ要素それぞれについて処理を実行する
document.querySelectorAll('.button-04').forEach(button => {

  // ボタン（＝.button-03を持つボタン1つ1つ）がクリックされたとき
  button.addEventListener('click', () => {

    // ボタンのidが「button-04-02」（＝「要素を増やす」）なら
    if (button.id === 'button-04-02') {
      const item = document.createElement('div');
      item.classList.add('output-04-item');
      document.getElementById('output-04').appendChild(item);

    // そうでない（＝ボタンが「要素を減らす」）なら
    } else if (button.id === 'button-04-01') {
      const items = document.getElementById('output-04').querySelectorAll('.output-04-item');
      if (items.length > 0) {
        items[items.length - 1].remove();
      }
    }
  });
});