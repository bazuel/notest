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
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--allow-running-insecure-content",
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

    await page.setBypassCSP(true);

    const describe = (jsHandle) => {
      return jsHandle.executionContext().evaluate((obj) => {
        // serialize |obj| however you want
        return `OBJ: ${typeof obj}, ${obj}`;
      }, jsHandle);
    };

    // listen to browser console there
    page.on("console", async (message) => {
      const args = await Promise.all(
        message.args().map((arg) => describe(arg))
      );
      // make ability to paint different console[types]
      const type = message.type().substr(0, 3).toUpperCase();
      let text = "";
      for (let i = 0; i < args.length; ++i) {
        text += `[${i}] ${args[i]} `;
      }
      console.log(`CONSOLE.${type}: ${message.text()}\n${text} `);
    });

    page.on("error", (err) => {
      console.log("error happened on page: ", err);
    });

    page.on("pageerror", (pageerr) => {
      console.log("page error occurred: ", pageerr);
    });

    let resolver = () => {};
    let alreadyCalled = false;

    // await page.exposeFunction("bl_shotReady", async (data) => {
    //   console.log("DATA from Browser: ", data);
    //   resolver();
    //   alreadyCalled = true;
    // });

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
