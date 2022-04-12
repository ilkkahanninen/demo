attribute vec4 aVertexPosition;

uniform vec2 uResolution;
uniform float uTime;

varying lowp vec2 vResolution;
varying lowp float vTime;

void main() {
    gl_Position = aVertexPosition;
    vResolution = uResolution;
    vTime = uTime;
}