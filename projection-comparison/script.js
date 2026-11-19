'use strict';

(() => {
  const canvas = document.getElementById('map');
  if (!window.d3 || !window.WORLD_DATA || !canvas.getContext('2d')) {
    document.getElementById('error').hidden = false;
    return;
  }
  const W = 1040, H = 620, PAD = 32, PI = Math.PI;
  const select = document.getElementById('projection');
  const grid = document.getElementById('grid');
  const highlight = document.getElementById('highlight');
  const sphere = { type: 'Sphere' };
  const graticule = d3.geo.graticule().step([15, 15])();
  const countries = WORLD_DATA;
  const africa = { type: 'FeatureCollection', features: countries.features.filter(f => f.properties.continent === 'Africa') };
  const greenland = countries.features.find(f => f.properties.name === 'Greenland');

  // 裏半球は同緯度の地球儀の外縁に折り畳む。正射図法の表示半球は厳密な投影式。
  // 平面図法への補間が始まると、折り畳んだ裏半球が外縁から展開する。
  function orthographicExtended(lambda, phi) {
    const l = Math.max(-PI / 2, Math.min(PI / 2, lambda));
    return [Math.cos(phi) * Math.sin(l), Math.sin(phi)];
  }

  // メルカトル図法の投影式。極での発散だけを数値的に回避し、表示範囲は後段で切り取る。
  function mercator(lambda, phi) {
    const p = Math.max(-PI / 2 + 1e-10, Math.min(PI / 2 - 1e-10, phi));
    return [lambda, Math.log(Math.tan(PI / 4 + p / 2))];
  }

  function mollweide(lambda, phi) {
    let theta = phi;
    if (Math.abs(Math.abs(phi) - PI / 2) < 1e-7) {
      theta = Math.sign(phi) * PI / 2;
    } else {
      const target = PI * Math.sin(phi);
      for (let i = 0; i < 30; i++) {
        const delta = (2 * theta + Math.sin(2 * theta) - target) / (2 + 2 * Math.cos(2 * theta));
        theta -= delta;
        if (Math.abs(delta) < 1e-11) break;
      }
    }
    return [2 * Math.SQRT2 / PI * lambda * Math.cos(theta), Math.SQRT2 * Math.sin(theta)];
  }

  function equalEarth(lambda, phi) {
    const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
    const M = Math.sqrt(3) / 2;
    const l = Math.asin(M * Math.sin(phi));
    const l2 = l * l, l6 = l2 * l2 * l2;
    const d = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
    return [lambda * Math.cos(l) / (M * d), l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))];
  }

  // アイトフ図法と標準緯線約50.47°の正距円筒図法の座標平均。
  function winkelTripel(lambda, phi) {
    const alpha = Math.acos(Math.max(-1, Math.min(1, Math.cos(phi) * Math.cos(lambda / 2))));
    const k = alpha < 1e-8 ? 1 : alpha / Math.sin(alpha);
    return [lambda / PI + k * Math.cos(phi) * Math.sin(lambda / 2),
      (phi + k * Math.sin(phi)) / 2];
  }

  // 各図法の投影式・表示範囲・授業用の説明。
  const projections = {
    orthographic: {
      en: 'Orthographic', ja: '正射図法',
      raw: orthographicExtended, extent: [1, 1],
      description: '地球を遠方から見たように表現する図法。手前の半球のみを表示。周辺部ほど大きな形状・面積のゆがみ。'
    },
    mercator: {
      en: 'Mercator', ja: 'メルカトル図法',
      raw: mercator, extent: [PI, PI],
      description: '局所的な角度を保つ正角図法。高緯度ほど大きな面積の拡大。極は無限遠のため、本教材では緯度約±85.05°までの表示。'
    },
    equirectangular: {
      en: 'Equirectangular', ja: '正距円筒図法',
      raw: d3.geo.equirectangular.raw, extent: [PI, PI / 2],
      description: '経度と緯度を等間隔の直交座標に対応させる図法。子午線に沿った一定の距離縮尺。高緯度ほど大きな面積・形状のゆがみ。'
    },
    mollweide: {
      en: 'Mollweide', ja: 'モルワイデ図法',
      raw: mollweide, extent: [2 * Math.SQRT2, Math.SQRT2],
      description: '世界全体を楕円形に表現し、面積の比率を保つ正積図法。周辺部における形状・角度のゆがみ。'
    },
    equalEarth: {
      en: 'Equal Earth', ja: 'イコールアース図法',
      raw: equalEarth, extent: [equalEarth(PI, 0)[0], equalEarth(0, PI / 2)[1]],
      description: '大陸の形状と世界地図の見やすさにも配慮した正積図法。面積の比率の維持。'
    },
    winkelTripel: {
      en: 'Winkel Tripel', ja: 'ヴィンケル図法',
      raw: winkelTripel, extent: [1 + PI / 2, PI / 2],
      description: '面積・方向・距離のゆがみを総合的に抑える折衷図法。正積でも正角でもないが、世界全体の形状と大きさのバランスを重視した表現。'
    }
  };
  const keys = Object.keys(projections);
  keys.forEach(key => {
    const p = projections[key];
    p.scale = Math.min((W / 2 - PAD) / p.extent[0], (H / 2 - PAD) / p.extent[1]);
  });

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  function setupCanvas(c) {
    c.width = Math.round(W * ratio);
    c.height = Math.round(H * ratio);
    const ctx = c.getContext('2d');
    ctx.setTransform(c.width / W, 0, 0, c.height / H, 0, 0);
    return ctx;
  }
  const context = setupCanvas(canvas);

  function oneHot(key) {
    return keys.map(k => k === key ? 1 : 0);
  }
  let weights = oneHot('orthographic');
  let running = null;
  let destination = 'orthographic';

  // 補間した投影座標をD3の地理投影に渡す。SVGパス文字列の直接補間は行わない。
  function makeProjection(blend) {
    const active = keys.map((key, i) => ({ p: projections[key], w: blend[i] })).filter(a => a.w > 0);
    const raw = (lambda, phi) => {
      let x = 0, y = 0;
      for (const { p, w } of active) {
        const xy = p.raw(lambda, phi);
        x += xy[0] * p.scale * w;
        y += xy[1] * p.scale * w;
      }
      return [x, y];
    };
    const hemisphere = blend[0] === 1 && active.length === 1;
    const projection = d3.geo.projection(raw).scale(1).translate([W / 2, H / 2])
      .precision(.35).clipAngle(hemisphere ? 90 : null);
    // 極付近は地図の表示範囲で幾何学的にクリップする（緯度を押し潰さない）。
    if (blend[keys.indexOf('mercator')] > 0) {
      const halfHeight = active.reduce((sum, { p, w }) => sum + p.extent[1] * p.scale * w, 0);
      projection.clipExtent([[0, H / 2 - halfHeight], [W, H / 2 + halfHeight]]);
    }
    return projection;
  }

  function drawLayer(ctx, projection) {
    const path = d3.geo.path().projection(projection).context(ctx);
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    function fill(feature, color) {
      ctx.beginPath(); path(feature); ctx.fillStyle = color; ctx.fill();
    }
    function stroke(feature, color, width) {
      ctx.beginPath(); path(feature); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    }
    fill(sphere, '#e5f0f6');
    fill(countries, '#a9bdc4');
    if (highlight.checked) {
      fill(africa, '#559d98');
      if (greenland) fill(greenland, '#d6a054');
    }
    stroke(countries, '#607c89', .55);
    if (grid.checked) stroke(graticule, 'rgba(52, 97, 124, .34)', .75);
    stroke(sphere, '#6e8999', 1.2);
  }

  function render() {
    // 単一の地図を毎フレーム再投影。透過合成・フェードは行わない。
    drawLayer(context, makeProjection(weights));
  }

  function showDescription(key) {
    const p = projections[key];
    document.getElementById('name').replaceChildren(document.createTextNode(p.ja + ' '));
    const span = document.createElement('span');
    span.textContent = p.en;
    document.getElementById('name').append(span);
    document.getElementById('description').textContent = p.description;
  }

  // 連続で選択された場合も、直前の描画状態からアニメーションを再開。
  function changeProjection(key) {
    if (!projections[key] || (key === destination && running === null)) return;
    if (running !== null) cancelAnimationFrame(running);
    destination = key;
    const from = weights.slice(), to = oneHot(key);
    const duration = 1500;
    let start = null;
    showDescription(key);
    function frame(now) {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = t * t * (3 - 2 * t);
      weights = from.map((w, i) => w + (to[i] - w) * eased);
      if (t === 1) weights = to;
      render();
      if (t < 1) running = requestAnimationFrame(frame);
      else {
        running = null;
        canvas.setAttribute('aria-label', projections[key].ja + 'による世界地図');
      }
    }
    running = requestAnimationFrame(frame);
  }

  select.addEventListener('change', () => changeProjection(select.value));
  grid.addEventListener('change', render);
  highlight.addEventListener('change', () => {
    document.getElementById('legend').hidden = !highlight.checked;
    render();
  });
  render();
})();
