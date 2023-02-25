#version 300 es
//[
precision highp float;
//]

uniform sampler2D FRAME;

in vec2 TEX_COORD;
in vec2 RESOLUTION;

out vec4 FRAG_COLOR;

// Copied from https://www.shadertoy.com/view/3ltfzl
const float rad = 42.;
const float LOD = 2.;
const float dev = 7.;
const float m = 0.398942280401 / dev;

float gau(float x) {
    return m * exp(-x * x * 0.5 / (dev * dev));
}

void main() {
    vec4 sum = vec4(0.0);
    for (float i = -rad; i <= rad; i++) {
        sum += gau(i) * texture(FRAME, TEX_COORD + vec2(i * LOD, 0.) / RESOLUTION.xy);
    }

    FRAG_COLOR = vec4(sum.rgb / sum.a, 1.);
}