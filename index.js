var language = "deDE";
var fileContent = "";
var fileName = "";
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

async function getTranslations() {
  // Read CSV File for the selected language
  const response = await fetch("./data/" + language + ".csv");
  const data = await response.text();

  lines = data.split("\n");
  lines.shift(); // Remove header line

  const translations = new Map();
  for (let line of lines) {
    const [key, value] = line.split("|");
    if (key && value) {
      translations.set(key.trim(), value.trim());
    }
  }
  return translations;
}
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function onTranslate() {
  const data = await getTranslations();
  data.forEach((value, key) => {
    const regex = new RegExp(`(?<!\\w)${escapeRegExp(key)}(?!\\w)`, "gi");
    fileContent = fileContent.replace(regex, value);
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
