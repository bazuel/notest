const { Cluster } = require("puppeteer-cluster");

const express = require("express");
const app = express();
const sharp = require("sharp");

(async () => {
  const cluster = await Cluster.launch({
    monitor: true,
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 6,
    timeout: 120000,
    puppeteerOptions: {
      args: [
        "--ignore-certificate-errors",
        "--no-sandbox",
        "--incognito",
        "--disable-infobars",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--start-maximized",
        "--disable-gpu",
      ],
      headless: true,
    },
  });
  await cluster.task(async ({ page, data: { url, width, height, wait } }) => {
    // make a screenshot
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1,
    });
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("error", (err) => {
      console.log("error happened on page: ", err);
    });

    page.on("pageerror", (pageerr) => {
      console.log("page error occurred: ", pageerr);
    });

    let resolver = () => {};
    let alreadyCalled = false;

    await page.exposeFunction("bl_shotReady", async (data) => {
      console.log("DATA from Browser: ", data);
      resolver();
      alreadyCalled = true;
    });

    console.log("URL:" + url);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60 * 1000,
    });

    let rtimeout = () => {};
    setTimeout(() => {
      rtimeout();
    }, wait);

    await new Promise(async (r) => {
      if (!alreadyCalled) {
        resolver = r;
        rtimeout = r;
      } else r();
    });

    const screen = await page.screenshot({
      encoding: "binary",
    });
    return screen;
  });

  // setup server
  app.get("/", async function (req, res) {
    if (!req.query.url) {
      return res.end("Please specify url like this: ?url=example.com");
    }
    console.log("req: ", JSON.stringify(req.query).replace(/\\n/g, " "));
    try {
      const screen = await cluster.execute({
        url: req.query.url,
        width: +req.query.width || 1200,
        height: +req.query.height || 900,
        wait: req.query.wait || 15000,
      });

      let image = screen;
      let size = screen.length;
      try {
        if (req.query.resize) {
          let newHeight = +req.query.resize;
          image = await sharp(screen)
            .resize({
              fit: sharp.fit.contain,
              height: newHeight,
            })
            .jpeg({ quality: 70 })
            .toBuffer();
          size = image.length;
        }
      } catch (e) {
        // ignore and return full shot
      }
      res.writeHead(200, {
        "Content-Type": "image/jpg",
        "Content-Length": size,
      });
      res.end(image);
    } catch (err) {
      // catch error
      res.end("Error: " + err.message);
    }
  });

  app.listen(8054, function () {
    console.log("Screenshot server listening on port 8054");
  });
})();
