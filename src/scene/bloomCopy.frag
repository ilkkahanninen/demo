#version 300 es
//[
precision highp float;
//]

uniform sampler2D FRAME;

in vec2 OVERLAY_TEXTURE_COORD;
out vec4 FRAG_COLOR;

void main() {
    vec4 color = texture(FRAME, OVERLAY_TEXTURE_COORD);
    float brightness = color.r * .299000 + color.g * .587000 + color.b * .114000;
    brightness = brightness * 2.0 - 1.0;

    FRAG_COLOR = vec4(vec3(brightness), 1.0);
}