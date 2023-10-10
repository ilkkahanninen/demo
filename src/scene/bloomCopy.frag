#version 300 es
//[
precision highp float;
//]

uniform sampler2D FRAME;

in vec2 TEX_COORD;
out vec4 FRAG_COLOR;

void main() {
    vec4 color = texture(FRAME, TEX_COORD);
    vec3 brite = vec3(max(0.0, color.r - 1.0), max(0.0, color.g - 1.0), max(0.0, color.b - 1.0));
    FRAG_COLOR = vec4(brite * 0.5, 1.0);
}