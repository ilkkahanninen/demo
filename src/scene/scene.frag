// const int MAX_MARCHING_STEPS = 255;
// const float MIN_DIST = 0.0;
// const float MAX_DIST = 100.0;
// const float EPSILON = 0.0001;

varying lowp vec2 vResolution;
varying lowp float vTime;

void main() {
  gl_FragColor = vec4(
    0.5 + 0.5 * sin(gl_FragCoord.x / vResolution.x + vTime * 3.0),
    0.5 + 0.5 * sin(gl_FragCoord.y / vResolution.y + vTime * 4.1),
    0.5 + 0.5 * sin(vTime + 5.2),
    1.0
  );
}