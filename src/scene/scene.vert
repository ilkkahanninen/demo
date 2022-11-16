#version 300 es

in vec4 _V;
in vec2 _I;

out vec2 textureCoord;

void main() {
    gl_Position = _V;
    textureCoord = _I;

}