onmessage = (oEvent) => {
  const { translations, language } = oEvent.data;
  let wtsFile = oEvent.data.wtsFile;
  translations.forEach((value, index) => {
    const regex = new RegExp(
      `(?<!\\w)${escapeRegExp(value.enUS)}(?!\\w)`,
      "gi",
    );
    const translation = value[language];
    if (translation) {
      wtsFile = wtsFile.replace(regex, translation);
    }

    if (index % 100 === 0) {
      let progress = Math.floor((index / translations.length) * 100);
      postMessage({ Type: "Progress", data: progress });
    }
  });

  postMessage({ Type: "Closed", data: wtsFile });
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
