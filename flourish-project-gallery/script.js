const grid = document.querySelector("#project-grid");

fetch("data.csv")
  .then((response) => {
    if (!response.ok) throw new Error("data.csvを読み込めませんでした。");
    return response.text();
  })
  .then((text) => {
    const urls = text
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);

    urls.forEach(addCard);
  })
  .catch((error) => {
    grid.textContent = error.message;
  });

function addCard(url) {
  const projectUrl = url.endsWith("/") ? url : `${url}/`;

  const card = document.createElement("a");
  card.className = "project-card";
  card.href = projectUrl;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const image = document.createElement("img");
  image.src = `${projectUrl}thumbnail`;
  image.alt = "Flourishプロジェクトのサムネイル";
  image.loading = "lazy";
  image.decoding = "async";

  image.addEventListener("load", () => resizeCard(card));
  card.append(image);
  grid.append(card);
  resizeCard(card);
}

function resizeCard(card) {
  const style = getComputedStyle(grid);
  const rowHeight = parseFloat(style.gridAutoRows);
  const gap = parseFloat(style.rowGap);
  const cardHeight = card.getBoundingClientRect().height;
  const span = Math.ceil((cardHeight + gap) / (rowHeight + gap));

  card.style.gridRowEnd = `span ${span}`;
}

window.addEventListener("resize", () => {
  document.querySelectorAll(".project-card").forEach(resizeCard);
});
