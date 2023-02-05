#version 300 es

in vec4 VERTEX_POS;
in vec2 OVERLAY_TEXTURE_POS;

out vec2 overlayTextureCoord;

void main() {
    gl_Position = VERTEX_POS;
    overlayTextureCoord = OVERLAY_TEXTURE_POS;
}