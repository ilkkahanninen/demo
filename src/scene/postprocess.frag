#version 300 es
//[
precision highp float;
//]

uniform sampler2D SAMPLER;
in vec2 OVERLAY_TEXTURE_COORD;
out vec4 FRAG_COLOR;

void main() {
    vec3 color = texture(SAMPLER, OVERLAY_TEXTURE_COORD).rgb;
    color.g *= 0.5;
    color.b *= 0.2;
    FRAG_COLOR = vec4(color, 1.0);
}