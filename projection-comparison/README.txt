世界地図の投影法を比較する

【起動方法】
ZIPをすべて展開し、projection-comparison/index.htmlをChrome、Edgeなどのブラウザで開く。
サーバーの起動、インストール、インターネット接続は不要。

【操作】
初期状態はOrthographic（正射図法）。投影法をセレクトボックスで選択すると約1.5秒かけて変形する。
「経緯線」「面積比較」で補助表示を切り替えられる。
中央経線は0度に固定。正射図法では赤道と本初子午線の交点が中心。

【ファイル】
index.html   画面構造
style.css    レイアウト・デザイン
script.js    投影式、D3の描画、座標の補間とアニメーション
vendor/d3.v3.min.js  D3.js v3.5.6（BSD 3-Clause、ライセンス同梱）
data/world.js  Natural Earth 1:110mの簡略国境データ（GeoJSONをJS変数に格納）

【アニメーションの仕様】
投影法ごとの平面座標を補間し、D3の地理投影とCanvasを使用して再描画する。
正射図法の見えない裏半球の各点は、同じ緯度の左右の外縁に折り畳んだ補助座標を用いる。
正射図法と平面図法の変換時は、その外縁から裏半球を連続的に展開・折り畳みする。
単一の地図を毎フレーム再投影し、透過合成（フェードイン・フェードアウト）は使用しない。
経緯線・国境・海岸線は同一の補間投影とD3の球面クリッピング・再サンプリングで描画する。
中間状態：説明用の座標補間（独立した正式な投影法ではない）。
投影法ごとに表示領域に収まる縮尺を設定しているので、異なる図法同士の画面上の絶対面積は比較できない。
同じ図法内での地域間の面積比を比較すること。
メルカトル図法は緯度±85.05112878°で表示を打ち切る。
簡略化された地図データ（国境・海岸線の精密な確認には不適切）。

【出典・ライセンス】
D3.js v3.5.6: https://github.com/d3/d3/tree/v3.5.6
Natural Earth（public domain）: https://www.naturalearthdata.com/about/terms-of-use/
地図データはpyogrioに同梱されたnaturalearth_lowresから、国名・大陸名・形状を抽出。D3の球面描画に合わせて南極の経度境界を調整。
データ取得年は不明。現在の国境を保証するものではない。

参考：投影座標補間の考え方
https://observablehq.com/@d3/projection-transitions

ヴィンケル図法：Winkel Tripel（標準緯線 arccos(2/π) ≈ 50.47°）
参考：https://proj.org/en/stable/operations/projections/wintri.html
