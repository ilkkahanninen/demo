const { execSync } = require("child_process");

const output = execSync(
  "ffmpeg -i src/tekkno2.mp3 -f null - 2>&1 >/dev/null"
).toString();

let time = 0;
for (const i of output.matchAll(/.*time=(\d\d):(\d\d):(\d\d.\d\d).*/g)) {
  const [_, hh, mm, ss] = i;
  const t = parseFloat(ss) + parseInt(mm) * 60 + parseInt(hh) * 60 * 60;
  time = Math.max(time, t);
}

const width = Math.round(60 * time);

execSync(
  `ffmpeg -y -i src/tekkno2.mp3 -lavfi showspectrumpic=legend=0:color=green:saturation=0:s=${width}x2048 fft.png`
);
