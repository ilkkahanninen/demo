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
uniform float NOISE_STRENGTH;
uniform float LAYER_FX;
uniform float LAYER_ALPHA;
uniform float POST_EFFECT;
uniform float DISTANCE_COLOR_FX;
uniform float SATURATION;
uniform float BLUE_PASS;
uniform float CONTRAST;

in vec2 TEX_COORD;
out vec4 FRAG_COLOR;

const float GAMMA = 1.5f;

const vec3 RGB2YUV_Y = vec3(.299000f, .587000f, .114000f);
const vec3 RGB2YUV_U = vec3(-.168736f, -.331264f, .500000f);
const vec3 RGB2YUV_V = vec3(.500000f, -.418688f, -.081312f);
const vec3 RGB2YUV_CONST = vec3(0.0f, 0.5f, 0.5f);

const vec3 YUV2RGB_R = vec3(1.0f, 0.0f, 1.4075f);
const vec3 YUV2RGB_G = vec3(1.0f, -.3455f, -.7169f);
const vec3 YUV2RGB_B = vec3(1.0f, 1.7790f, 0.0f);

vec3 textLayer(vec4 noise) {
    if (LAYER_ALPHA <= 0.0f) {
        return vec3(0.0f);
    }

    float pixelSize = 40.0f * clamp((0.5f + sin(TIME * 1230.0f)) - ((2.5f - 2.5f * LAYER_FX)) + TEX_COORD.y - noise.r * 0.01f, 0.0f, 1.0f);
    vec2 coord = mix(TEX_COORD, vec2(0.5), LAYER_FX * LAYER_FX * 0.05);
    if (pixelSize > 1.0f) {
        coord *= RESOLUTION;
        coord.x = floor(coord.x / pixelSize) * pixelSize;
        coord.y = floor(coord.y / pixelSize) * pixelSize;
        coord /= RESOLUTION;
    }

    vec3 layerColor = vec3(1.0f);
    if (pixelSize > 0.0f) {
        float a = 0.5f + sin(round(TIME * 71.0f));
        float b = 0.5f + sin(round(TIME * 33.0f));
        float layerY1 = min(a, b);
        float layerY2 = max(a, b);
        if (TEX_COORD.y > layerY1 && TEX_COORD.y < layerY2) {
            layerColor = vec3(1.0f, 1.0f, 1.0f);
        } else {
            layerColor = vec3(noise.r, 0.0f, 0.0f);
            coord += vec2(noise.g * 0.005f - 0.0025f, 0.0f);
        }
    }

    return layerColor * texture(LAYER, coord).rgb * LAYER_ALPHA;
}

void main() {
    vec4 noise = texture(NOISE, TEX_COORD + NOISE_POS);
    vec3 current = vec3(texture(FRAME, TEX_COORD - vec2(0.002f, 0.0f)).r, texture(FRAME, TEX_COORD).g, texture(FRAME, TEX_COORD + vec2(0.002f, 0.0f)).b);
    vec3 layer = textLayer(noise);
    vec3 basicColor = pow(current / (current + vec3(1.0f)), vec3(1.0f / GAMMA)) + layer;
    vec3 bloom = texture(BLOOM, TEX_COORD).rgb;

    vec3 color = basicColor;

    if (POST_EFFECT < 1.0f) {
        color = mix(basicColor, vec3(1.0f, 0.0f, 0.0f), POST_EFFECT);
        // NOP
    } else if (POST_EFFECT < 2.0f) {
        float hdrR = texture(FRAME, TEX_COORD + vec2(sin(current.r) * 0.1f, 0.0f)).r;
        float hdrG = texture(FRAME, TEX_COORD - vec2(sin(current.g) * 0.1f, 0.0f)).g;
        float hdrB = texture(FRAME, TEX_COORD + vec2(sin(current.b) * 0.1f, 0.0f)).b;
        vec3 hdrColor = vec3((hdrR), (hdrG), (hdrB));

        color = pow(hdrColor / (hdrColor + vec3(1.0f)), vec3(1.0f / GAMMA)) + layer;

        // color.r = mix(color.r, sqrt(color.r), 0.4f);
        // color.b = mix(color.b, color.b * color.b, 0.3f);
        color = mix(color, vec3(1.0f), 0.05f);
        color = mix(basicColor, color, POST_EFFECT - 1.f);
    }

    color += bloom;

    float p = sin(TEX_COORD.y * (5000.0f + 2000.0f * sin(TIME * 1.5f)) + TIME * 5.0f);
    vec3 stripedColor = color * vec3(.6f + 0.5f * sin(TEX_COORD.x * p), .6f + 0.5f * sin(TEX_COORD.x * p + 2.0944f), .6f + 0.5f * sin(TEX_COORD.x * p + 4.1888f));

    color = mix(color, stripedColor, 0.5f + 0.5f * sin(TEX_COORD.y + TIME));

    // vec3 yuv = vec3(dot(color, RGB2YUV_Y), dot(color, RGB2YUV_U), dot(color, RGB2YUV_V)) + RGB2YUV_CONST;

    // yuv += noise.rgb * NOISE_STRENGTH * 0.1 - vec3(NOISE_STRENGTH * 0.1);
    // yuv.r += bloom.r * 1.5;
    // yuv.g += bloom.g;

    // yuv -= RGB2YUV_CONST;
    // color = vec3(dot(yuv, YUV2RGB_R), dot(yuv, YUV2RGB_G), dot(yuv, YUV2RGB_B));

    float lol = texture(FRAME, TEX_COORD).a / 25.0f * DISTANCE_COLOR_FX;
    lol *= lol;
    color += vec3(lol, lol * 0.5f, lol * 0.1f);

    if (SATURATION < 1.0f) {
        float gray = (color.r + color.g + color.b) / 3.0f + noise.r * 0.1f;
        color = mix(vec3(gray * 0.9f, gray * 0.95f, gray), color, SATURATION);
    }
    color *= vec3(1.25 - 0.25 * BLUE_PASS,  1.5 - 0.5 * BLUE_PASS, BLUE_PASS);
    color = pow(color, vec3(CONTRAST));

    FRAG_COLOR = vec4(color, 1.0);
}