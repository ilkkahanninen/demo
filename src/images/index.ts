const images = [
  new URL("01-muntele.png", import.meta.url),
  new URL("02-azabovit.png", import.meta.url),
  new URL("03-innoapteanedorita.png", import.meta.url),
  new URL("04-solemntreaz.png", import.meta.url),
  new URL("05-unmonumentgrotesc.png", import.meta.url),
  new URL("06-afostuluisausine.png", import.meta.url),
  new URL("07-monstruozitate.png", import.meta.url),
  new URL("08-dintrecut.png", import.meta.url),
  new URL("09-priveainapoi.png", import.meta.url),
  new URL("10-credits.png", import.meta.url),
  new URL("warning.png", import.meta.url),
];

type ImageScript = {
  index: number;
  begin: number;
  end: number;
};

export const imageScript: ImageScript[] = [
  {
    index: 10,
    begin: 1,
    end: 7,
  },
  {
    index: 0,
    begin: 29.094,
    end: 30.61,
  },
  {
    index: 1,
    begin: 35.045,
    end: 36.681,
  },
  {
    index: 2,
    begin: 41.59,
    end: 43.909,
  },
  {
    index: 3,
    begin: 48.136,
    end: 50.318,
  },
  {
    index: 4,
    begin: 54.641,
    end: 57.223,
  },
  {
    index: 5,
    begin: 61.09,
    end: 64.09,
  },
  {
    index: 6,
    begin: 67.772,
    end: 70.031,
  },
  {
    index: 7,
    begin: 74.454,
    end: 76.363,
  },
  {
    index: 8,
    begin: 80.454,
    end: 82.909,
  },
  {
    index: 7,
    begin: 171.954,
    end: 180.545,
  },
  {
    index: 9,
    begin: 210,
    end: 220,
  },
].map((s) => ({ ...s, end: s.end + 1 }));

export const imageTime = (script: ImageScript, timeNow: number): number =>
  (timeNow - script.begin) / (script.end - script.begin);

const loadTexture =
  (gl: WebGL2RenderingContext) =>
  (url: URL): Promise<WebGLTexture> => {
    return new Promise((resolve, reject) => {
      const texture = gl.createTexture();
      if (texture) {
        const image = new Image();
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
          );
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

          resolve(texture);
        };

        image.onerror = reject;
        image.src = url.href;
      } else {
        reject(new Error("Could not create a texture"));
      }
    });
  };

export const loadTextures = (gl: WebGL2RenderingContext) =>
  Promise.all(images.map(loadTexture(gl)));
