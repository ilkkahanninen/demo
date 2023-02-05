#version 300 es
//[
precision highp float;
//]

uniform sampler2D SAMPLER;
in vec2 OVERLAY_TEXTURE_COORD;
out vec4 FRAG_COLOR;

void main() {
    vec3 color = texture(SAMPLER, OVERLAY_TEXTURE_COORD).rgb;
    color.r = mix(color.r, sqrt(color.r), 0.4);
    color.b = mix(color.b, color.b * color.b, 0.3);
    color = mix(color, vec3(0.2, 0.4, 1.0), 0.1);
    FRAG_COLOR = vec4(color, 1.0);
}