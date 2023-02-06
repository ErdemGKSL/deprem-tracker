const { Utils: { recursiveImport } } = require("@mostfeatured/dbi");
const dbi = require("./dbi");

(async () => {
  await recursiveImport("./src");
  await dbi.load();
  await dbi.publish("Global");
  console.log("Commands Published");
  process.exit(1);
})();