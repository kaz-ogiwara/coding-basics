const execSearch = () => {
  document.querySelector("#cover").classList.add("show");

  const semesters = ["前期", "後期"];
  const days = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜"];

  // data.csvを読み込んで表示する
  fetch("data/data.csv")
    .then(response => response.text())
    .then(csvText => {
      const sectionResult = document.querySelector("#section-result");

      sectionResult.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>科目名</th>
              <th>前期／後期</th>
              <th>曜日</th>
              <th>時限</th>
              <th>担当教員</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;

      const tbody = sectionResult.querySelector("tbody");

      csvText.trim().split("\n").forEach((row, index) => {
        if (index === 0) return;

        const cells = row.replace(/\r$/, "").split(",");

        const sem = semesters[cells[2]] || "";
        const day = days[cells[3]] || "";
        const time = cells[4] ? cells[4] + "限" : "";

        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${cells[0] || ""}</td>
          <td>${sem}</td>
          <td>${day}</td>
          <td>${time}</td>
          <td>${cells[5] || ""}</td>
        `;

        tbody.appendChild(tr);
      });
    })
    .finally(() => {
      document.querySelector("#cover").classList.remove("show");
    });
};

const bindEvents = () => {
  document.querySelectorAll(".checkbox").forEach(el => {
    el.addEventListener("click", function () {
      this.classList.toggle("on");
    });
  });

  document.querySelectorAll("#section-details .title").forEach(el => {
    el.addEventListener("click", function () {
      this.parentElement.classList.toggle("open");
    });
  });

  document.querySelector("#input-search").addEventListener("keydown", event => {
    // Enterキーが押されたとき。ただし漢字変換の確定は除く
    if (event.key === "Enter" && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      execSearch();
    }
  });

  document.querySelectorAll("#table-timetable td").forEach(td => {
    td.addEventListener("click", function () {
      this.classList.toggle("active");
    });
  });

  document.querySelector("#button-search").addEventListener("click", () => {
    execSearch();
  });
};

bindEvents();

document.querySelector("#cover").classList.remove("show");
