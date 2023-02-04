#version 300 es

in vec4 VERTEX_POS;
in vec2 TEXTURE_POS;

out vec2 textureCoord;

void main() {
    gl_Position = VERTEX_POS;
    textureCoord = TEXTURE_POS;

}