const { Utils: { recursiveImport } } = require("@mostfeatured/dbi");
const dbi = require("./dbi");

(async () => {
  await recursiveImport("./src");
  await dbi.load();
  // if command line args includes "publish"
  if (process.argv.includes("publish")) {
    await dbi.publish();
    console.log("Published!");
  } else {
    await dbi.login();
    console.log("Discord Login: " + dbi.data.clients.map(c => c.client?.user?.tag).join(", "));
  }
})();