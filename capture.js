const puppeteer = require("puppeteer");

const seconds = 3 * 60 + 35;

const sleep = (msecs) => new Promise((resolve) => setTimeout(resolve, msecs));

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720,
  });
  await page.goto("http://localhost:1234?capture");

  let frame = 0;
  await page.click(".progressbar");
  await sleep(1000);

  while (frame < 60 * seconds) {
    while ((await page.title()) !== frame.toString());
    console.log(await page.title());

    await page.screenshot({
      path: `./capture/${frame.toString().padStart(8, "0")}.png`,
    });

    frame++;
    await page.keyboard.press("Space");
  }
})();
