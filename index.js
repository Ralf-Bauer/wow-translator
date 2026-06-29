var language = "deDE";
var fileContent = "";
var fileName = "";
var translations;
var table;
var searchTimer = null;
var searchInput = document.getElementById("search");

if (window.Worker) {
  var TranslationWorker = new Worker("worker.js");
}

async function getTranslations() {
  if (translations) {
    return translations;
  }

  const response = await fetch("./data/all.csv"),
    text = await response.text(),
    lines = text.split("\n"),
    columns = lines[0].split("|");

  lines.shift();

  translations = new Map();

  lines.forEach((line) => {
    const lineData = line.split("|"),
      key = lineData[0],
      data = {};

    columns.forEach((column, index) => {
      if (index === 0) return;

      data[column] = lineData[index];

      if (data[column]) data[column].trim();
    });
    translations.set(key, data);
  });

  return translations;
}
function onSetLang(sourceButton) {
  const aButtons = document.getElementById("buttons").children;
  language = sourceButton.innerText;

  for (let button of aButtons) {
    if (button === sourceButton) {
      button.classList.remove("outline");
    } else {
      button.classList.add("contrast", "outline");
    }
  }
}

function onFileChange() {
  const file = event.target.files[0];

  fileName = file.name.split(".")[0];
  if (!file.name.toLowerCase().endsWith(".wts")) {
    alert("Please select a valid .wts file.");
    event.srcElement.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    fileContent = e.target.result;
  };
  reader.readAsText(file);
}

async function onTranslate() {
  let data = await getTranslations();
  data = Array.from(data, (oElement, oIndex) => {
    oElement[1].enUS = oElement[0];
    return oElement[1];
  });

  Swal.fire({
    title: "Translating...",
    html: `
        <progress id="progress" max="100" value="0" style="width:100%"></progress>
        <div id="status">0%</div>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
  });

  const progress = document.getElementById("progress"),
    status = document.getElementById("status");

  TranslationWorker.postMessage({
    translations: data,
    wtsFile: fileContent,
    language: language,
  });
  TranslationWorker.onmessage = (oEvent) => {
    let oData = oEvent.data;

    if (oData.Type === "Closed") {
      Swal.close();
      const blob = new Blob([oData.data], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName + "_" + language + ".wts";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    progress.value = oData.data;
    status.innerText = oData.data + "%";
  };
}

function applySearch() {
  const searchInput = document.getElementById("search");
  const value = searchInput.value.trim().toLowerCase();
  if (value === "") {
    table.clearFilter(true);
    return;
  }

  table.setFilter(function (data) {
    for (const key in data) {
      if (data[key] == null) {
        continue;
      }
      if (String(data[key]).toLowerCase().includes(value)) {
        return true;
      }
    }
    return false;
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applySearch, 500);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      clearTimeout(searchTimer);
      applySearch();
    }
  });
  document.getElementById("fileInput").value = "";
});

getTranslations().then((mapData) => {
  const data = Array.from(mapData, (oElement, oIndex) => {
    oElement[1].enUS = oElement[0];
    return oElement[1];
  });

  table = new Tabulator("#table", {
    height: 205,
    data: data,
    layout: "fitColumns",
    columns: [
      { title: "enUS", field: "enUS" },
      { title: "deDE", field: "deDE" },
      { title: "frFR", field: "frFR" },
      { title: "esES", field: "esES" },
      { title: "esMX", field: "esMX" },
      { title: "koKR", field: "koKR" },
      { title: "ruRU", field: "ruRU" },
      { title: "zhCN", field: "zhCN" },
      { title: "zhTW", field: "zhTW" },
    ],
  });
});
