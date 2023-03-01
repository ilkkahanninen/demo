const puppeteer = require("puppeteer");

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
  await page.click("canvas");
  await sleep(1000);
  console.log("click");

  while (frame < 60 * 30) {
    while ((await page.title()) !== frame.toString());
    console.log(await page.title());

    await page.screenshot({
      path: `./capture/${frame.toString().padStart(8, "0")}.png`,
    });

    frame++;
    await page.keyboard.press("Space");
  }
})();
