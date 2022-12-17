const images = [
  new URL("10-credits.png", import.meta.url),
  new URL("warning.png", import.meta.url),
];

type ImageScript = {
  index: number;
  begin: number;
  end: number;
};

export const imageScript: ImageScript[] = [];

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
