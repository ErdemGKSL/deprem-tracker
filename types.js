const { Utils: { recursiveImport }, generatedPath } = require("@mostfeatured/dbi");
const { setNamespaceDataTypes } = require("@mostfeatured/namespace-types");
const path = require("path");
const dbi = require("./dbi");

(async () => {
  await recursiveImport("./src");
  await dbi.load();
  await setNamespaceDataTypes(dbi);
  console.log("Types set at: \".\\" + path.relative( process.cwd(),path.resolve(generatedPath, "./namespaceData.d.ts")) + "\"");
  process.exit(1);
})();