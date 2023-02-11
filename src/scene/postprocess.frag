#version 300 es
//[
precision highp float;
//]

uniform sampler2D FRAME;
uniform sampler2D NOISE;
uniform sampler2D BLOOM;
uniform vec2 NOISE_POS;
const float NOISE_STRENGTH = 0.08;

in vec2 OVERLAY_TEXTURE_COORD;
out vec4 FRAG_COLOR;

const float GAMMA = 1.2;

const vec3 RGB2YUV_Y = vec3(.299000, .587000, .114000);
const vec3 RGB2YUV_U = vec3(-.168736, -.331264, .500000);
const vec3 RGB2YUV_V = vec3(.500000, -.418688, -.081312);
const vec3 RGB2YUV_CONST = vec3(0.0, 0.5, 0.5);

const vec3 YUV2RGB_R = vec3(1.0, 0.0, 1.4075);
const vec3 YUV2RGB_G = vec3(1.0, -.3455, -.7169);
const vec3 YUV2RGB_B = vec3(1.0, 1.7790, 0.0);

void main() {
    vec3 hdrColor = texture(FRAME, OVERLAY_TEXTURE_COORD).rgb;
    vec3 color = pow(hdrColor / (hdrColor + vec3(1.0)), vec3(1.0 / GAMMA));

    vec4 noise = texture(NOISE, OVERLAY_TEXTURE_COORD + NOISE_POS);
    vec3 bloom = texture(BLOOM, OVERLAY_TEXTURE_COORD).rgb;

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