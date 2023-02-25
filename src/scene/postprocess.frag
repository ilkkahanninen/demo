#version 300 es
//[
precision highp float;
//]

uniform sampler2D FRAME;
uniform sampler2D NOISE;
uniform sampler2D BLOOM;
uniform sampler2D LAYER;
uniform vec2 NOISE_POS;
// uniform vec2 RESOLUTION;
const vec2 RESOLUTION = vec2(1920, 720);
uniform float TIME;
const float NOISE_STRENGTH = 0.08;
uniform float LAYER_FX;
uniform float LAYER_ALPHA;

in vec2 TEX_COORD;
out vec4 FRAG_COLOR;

const float GAMMA = 1.2;

const vec3 RGB2YUV_Y = vec3(.299000, .587000, .114000);
const vec3 RGB2YUV_U = vec3(-.168736, -.331264, .500000);
const vec3 RGB2YUV_V = vec3(.500000, -.418688, -.081312);
const vec3 RGB2YUV_CONST = vec3(0.0, 0.5, 0.5);

const vec3 YUV2RGB_R = vec3(1.0, 0.0, 1.4075);
const vec3 YUV2RGB_G = vec3(1.0, -.3455, -.7169);
const vec3 YUV2RGB_B = vec3(1.0, 1.7790, 0.0);

vec3 textLayer(vec4 noise) {
    if (LAYER_ALPHA <= 0.0) {
        return vec3(0.0);
    }

    float pixelSize = 40.0 * clamp((0.5 + sin(TIME * 1230.0)) - ((2.5 - 2.5 * LAYER_FX)) + TEX_COORD.y - noise.r * 0.01, 0.0, 1.0);
    vec2 coord = TEX_COORD;
    if (pixelSize > 1.0) {
        coord *= RESOLUTION;
        coord.x = floor(coord.x / pixelSize) * pixelSize;
        coord.y = floor(coord.y / pixelSize) * pixelSize;
        coord /= RESOLUTION;
    }

    vec3 layerColor = vec3(1.0);
    if (pixelSize > 0.0) {
        float a = 0.5 + sin(round(TIME * 71.0));
        float b = 0.5 + sin(round(TIME * 33.0));
        float layerY1 = min(a, b);
        float layerY2 = max(a, b);
        if (TEX_COORD.y > layerY1 && TEX_COORD.y < layerY2) {
            layerColor = vec3(1.0, 1.0, 1.0);
        } else {
            layerColor = vec3(noise.r, 0.0, 0.0);
            coord += vec2(noise.g * 0.005 - 0.0025, 0.0);
        }
    }

    return layerColor * texture(LAYER, coord).rgb * LAYER_ALPHA;
}

void main() {
    vec3 hdrColor = texture(FRAME, TEX_COORD).rgb;
    vec4 noise = texture(NOISE, TEX_COORD + NOISE_POS);
    vec3 layer = textLayer(noise);

    vec3 color = pow(hdrColor / (hdrColor + vec3(1.0)), vec3(1.0 / GAMMA)) + layer;

    vec3 bloom = texture(BLOOM, TEX_COORD).rgb;

    color.r = mix(color.r, sqrt(color.r), 0.4);
    color.b = mix(color.b, color.b * color.b, 0.3);
    color = mix(color, vec3(0.2, 0.4, 1.0), 0.05);

    vec3 yuv = vec3(dot(color, RGB2YUV_Y), dot(color, RGB2YUV_U), dot(color, RGB2YUV_V)) + RGB2YUV_CONST;

    yuv += noise.rgb * NOISE_STRENGTH - vec3(NOISE_STRENGTH / 2.0);
    yuv.r += bloom.r * 1.5;
    yuv.g += bloom.g;

    yuv -= RGB2YUV_CONST;
    vec3 rgb = vec3(dot(yuv, YUV2RGB_R), dot(yuv, YUV2RGB_G), dot(yuv, YUV2RGB_B));

    FRAG_COLOR = vec4(rgb, 1.0);
}