#version 300 es

in vec4 _VERTEX_POS;
in vec2 _TEXTURE_POS;

out vec2 textureCoord;

void main() {
    gl_Position = _VERTEX_POS;
    textureCoord = _TEXTURE_POS;

}