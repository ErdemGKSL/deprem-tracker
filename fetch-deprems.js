const fs = require("fs");
const JSDOM = require("jsdom").JSDOM;
const fetchDeprems = (async () => {
  const data = await fetch("http://www.koeri.boun.edu.tr/scripts/lst8.asp");
  const dom = new JSDOM(await data.arrayBuffer());
  const depremsText = dom.window.document.querySelector("pre").textContent;
  const deprems = depremsText.split("\n").slice(6, -2).map((deprem) => {
    let [date, time, lat, lng, depth, MD,ML,Mw, location, city] = deprem.split(/ +/g);
    if (!city || city === "İlksel") {
      const locs = location.split("-");
      city = locs.pop();
      location = locs.join("-");
    }
    if (!location) {
      location = city;
      city = "Bilinmiyor"
    }
    // generate id using date, time as hash
    const id = `${date}${time}`.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    return {
      id,
      date,
      time,
      lat: Number(lat),
      lng: Number(lng),
      depth: Number(depth),
      MD,
      ML: Number(ML),
      Mw,
      location,
      city,
    };
  })
  return deprems;
});

module.exports = fetchDeprems;

fetchDeprems().then((deprems) => {
  fs.writeFileSync("deprems.json", JSON.stringify(deprems, null, 2));
});