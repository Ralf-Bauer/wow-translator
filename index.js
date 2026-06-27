var language = "deDE";
var fileContent = "";
var fileName = "";
var translations;

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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function onTranslate() {
  const data = await getTranslations();
  data.forEach((value, key) => {
    const regex = new RegExp(`(?<!\\w)${escapeRegExp(key)}(?!\\w)`, "gi");

    const translation = value[language];
    if (translation) {
      fileContent = fileContent.replace(regex, translation);
    }
  });

  const blob = new Blob([fileContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName + "_" + language + ".wts";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

getTranslations();
