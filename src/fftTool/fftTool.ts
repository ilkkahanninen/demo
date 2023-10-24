const fft = document.querySelector<HTMLImageElement>("#fft")!;
const width = fft.naturalWidth;
console.log(width);

const preview = document.querySelector<HTMLCanvasElement>("#preview")!;
const previewCtx = preview.getContext("2d")!;
preview.width = width;
preview.height = 1;

const output = document.querySelector<HTMLTextAreaElement>("#output")!;

const update = (ctx: CanvasRenderingContext2D, y: number) => {
  ctx.drawImage(fft, 0, y, width, 1, 0, 0, width, 1);

  const img = ctx.getImageData(0, 0, width, 1);
  let max = 0;
  for (let p = 0; p < img.data.length; p += 4) {
    max = Math.max(max, img.data[p]);
  }
  const gain = 255 / max;
  const result = [];
  for (let p = 0; p < img.data.length; p += 4) {
    const c = Math.floor(img.data[p] * gain);
    result.push(c);
    img.data[p] = c;
    img.data[p + 1] = c;
    img.data[p + 2] = c;
  }
  ctx.putImageData(img, 0, 0);

  return result;
};

let current: number[] = [];

fft.addEventListener("mousemove", (event) => {
  // @ts-ignore
  const y = (event.layerY * fft.naturalHeight) / fft.clientHeight;
  current = update(previewCtx, y);
});

fft.addEventListener("mousedown", () => {
  output.value = JSON.stringify(current);
});
