import { GlTFAsset } from "../index";
import { isURIImage } from "../types/Image";
import { Texture, TextureInfo } from "../types/Texture";
import { unsupported } from "../types/common";

export class GlTexture {
  texCoord: number;

  constructor(
    gl: WebGL2RenderingContext,
    asset: GlTFAsset,
    texture: Texture,
    texCoord: number = 0
  ) {
    this.texCoord = texCoord;

    if (texture.source !== undefined) {
      const imageInfo = asset.getImage(texture.source);
      if (isURIImage(imageInfo)) {
        throw unsupported("Support for external image files not implemented");
      }
      const view = asset.getBufferView(imageInfo.bufferView);

      const image = new Image();
      image.src = URL.createObjectURL(
        new Blob([asset.getData(view)], { type: imageInfo.mimeType })
      );

      const glTexture = gl.createTexture()!;
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image
        );

        const sampler =
          texture.sampler !== undefined
            ? asset.getSampler(texture.sampler)
            : undefined;

        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_S,
          sampler?.wrapS ?? gl.REPEAT
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_T,
          sampler?.wrapT ?? gl.REPEAT
        );
        if (sampler?.minFilter !== undefined) {
          gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            sampler.minFilter
          );
        }
        if (sampler?.magFilter !== undefined) {
          gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MAG_FILTER,
            sampler.magFilter
          );
        }

        gl.generateMipmap(gl.TEXTURE_2D);
      };
    }
  }

  static fromTextureInfo(
    gl: WebGL2RenderingContext,
    asset: GlTFAsset,
    info: TextureInfo
  ) {
    return new GlTexture(
      gl,
      asset,
      asset.getTexture(info.index),
      info.texCoord
    );
  }
}
