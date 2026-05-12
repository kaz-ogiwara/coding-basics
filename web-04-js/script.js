// "button-01"というIDを持つ要素がクリックされたら
// 要素を選択する際の「#xxx」は「id="xxx"」を示す
document.querySelector('#button-01').addEventListener('click', function() {
  // アラートを表示する
  alert('ボタン01が押されました');
});



// "button-02"というIDを持つ要素がクリックされたら
document.querySelector('#button-02').addEventListener('click', function () {

  // 変数valueにid="input-02"の要素の値を代入する
  let value = document.querySelector('#input-02').value;

  // id="output-02"の要素のテキストを値＋「と入力されました。」に変える
  document.querySelector('#output-02').textContent = value + " と入力されました。";
});



// "button-03"というIDを持つ要素がクリックされたら
document.querySelector('#button-03').addEventListener('click', function () {

  // コンソールにメッセージを表示する
  // コンソールは右クリック「要素を検証」（または「検証」）→ 表示されたメニューの上側「Console」をクリック
  console.log("ボタン03がクリックされました");

  // コンソールには変数も表示できるので、開発中のデバッグ（＝バグの検証）に役立つ
  let abc = "テキスト";
  console.log(abc);
});



// "button-04"というIDを持つ要素がクリックされたら
document.querySelector('#button-04').addEventListener('click', function () {

  // 配列：連続する値。配列を格納した変数に[ ]でインデックスを指定することで個別の値が取得できる
  // ただし最初の値は[1]ではなく[0]なので注意
  let array = ["AAA", "BBB", "CCC", 100, 200, 300];
  console.log(array[1]);

  // 二次元配列：配列を入れ子にして2次元の
  // 表形式のデータを扱う際によく使う
  let array2d = [
    ["AAA", "BBB", "CCC"],
    ["DDD", "EEE", "FFF"],
    ["GGG", "HHH", "III"]
  ];

  // 取り出す際は二重に[ ]を使う
  console.log(array2d[2][0]);

  // 連想配列：配列がキーと値に別れたもの。辞書とも呼ばれる
  // 連想配列の値を取得する際は[キー名]で取り出す
  let dictionary = {
    "key1": "value1",
    "key2": 400
  };
  
  console.log(dictionary["key1"]);
});


// クラス「button-05」を持つ要素それぞれについて処理を実行する
// 要素を選択する際の「.xxx」は「class="xxx"」を示す
document.querySelectorAll('.button-05').forEach(function (button) {

  // ボタン（＝.button-05を持つボタン1つ1つ）がクリックされたとき
  button.addEventListener('click', function () {

    // アウトプット対象である要素を取得する
    const output = document.querySelector('#output-03');

    // まずはアウトプット対象から、ボタンのIDに対応するクラスを全て削除する（2回目以降の処理を念頭に）
    output.classList.remove('background-red', 'background-yellow', 'background-blue');

    if (this.id === 'button-05-01') {
      output.classList.add('background-red');
    } else if (this.id === 'button-05-02') {
      output.classList.add('background-yellow');
    } else if (this.id === 'button-05-03') {
      output.classList.add('background-blue');
    }
  });
});


// クラス「button-06」を持つ要素それぞれについて処理を実行する
document.querySelectorAll('.button-06').forEach(button => {

  // ボタン（＝.button-06を持つボタン1つ1つ）がクリックされたとき
  button.addEventListener('click', () => {

    // ボタンのidが「button-06-02」（＝「要素を増やす」）なら
    if (button.id === 'button-06-02') {
      const item = document.createElement('div');
      item.classList.add('output-06-item');
      document.querySelector('#output-06').appendChild(item);

    // そうでない（＝ボタンが「要素を減らす」）なら
    } else if (button.id === 'button-06-01') {
      const items = document.querySelector('#output-06').querySelectorAll('.output-06-item');
      if (items.length > 0) {
        items[items.length - 1].remove();
      }
    }
  });
});