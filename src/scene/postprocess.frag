#version 300 es
//[
precision highp float;
//]

uniform sampler2D FRAME;
uniform sampler2D NOISE;
uniform sampler2D BLOOM;
uniform vec2 NOISE_POS;
const float NOISE_STRENGTH = 0.06;

in vec2 OVERLAY_TEXTURE_COORD;
out vec4 FRAG_COLOR;

void main() {
    vec3 color = texture(FRAME, OVERLAY_TEXTURE_COORD).rgb * 2.0;
    vec4 noise = texture(NOISE, OVERLAY_TEXTURE_COORD + NOISE_POS);
    vec3 bloom = texture(BLOOM, OVERLAY_TEXTURE_COORD).rgb;

    color.r = mix(color.r, sqrt(color.r), 0.4);
    color.b = mix(color.b, color.b * color.b, 0.3);
    color = mix(color, vec3(0.2, 0.4, 1.0), 0.1);

    vec3 yuv = vec3(color.r * .299000 + color.g * .587000 + color.b * .114000, color.r * -.168736 + color.g * -.331264 + color.b * .500000 + 0.5, color.r * .500000 + color.g * -.418688 + color.b * -.081312 + 0.5);

    yuv += noise.rgb * NOISE_STRENGTH - vec3(NOISE_STRENGTH / 2.0);
    yuv.r += bloom.r * 1.5;
    yuv.g += bloom.g;

    vec3 rgb = vec3(yuv.r + 1.4075 * (yuv.b - 0.5), yuv.r - 0.3455 * (yuv.g - 0.5) - (0.7169 * (yuv.b - 0.5)), yuv.r + 1.7790 * (yuv.g - 0.5));

    // vec3 rgb = color + noise.rgb * 0.5 - vec3(0.25);
    FRAG_COLOR = vec4(rgb, 1.0);
}