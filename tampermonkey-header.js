module.exports = {
  headers: {
    name: "FUT Trade Enhancer",
    namespace: "http://tampermonkey.net/",
    version: "2.0.7",
    description: "FUT Trade Enhancer",
    author: "Mohamed Sayed",
    match: [
      "https://www.ea.com/*/ea-sports-fc/ultimate-team/web-app/*",
      "https://www.ea.com/ea-sports-fc/ultimate-team/web-app/*",
    ],
    require: [
      "https://code.jquery.com/jquery-3.6.1.min.js",
      "https://greasyfork.org/scripts/47911-font-awesome-all-js/code/Font-awesome%20AllJs.js?version=275337",
    ],
    grant: ["GM_xmlhttpRequest", "GM_download"],
    connect: [
      "ea.com",
      "ea2.com",
      "futwiz.com",
      "futbin.com",
      "amazonaws.com",
      "futbin.org",
      "futhelpers.com",
      "on.aws",
    ],
    updateURL:
      "https://github.com/MohamedSayed9392/fut-trade-enhancer/releases/latest/download/fut-trade-enhancer.user.js",
    downloadURL:
      "https://github.com/MohamedSayed9392/fut-trade-enhancer/releases/latest/download/fut-trade-enhancer.user.js",
  },
};
