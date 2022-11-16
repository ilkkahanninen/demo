#version 300 es
//[
precision highp float;
//]

// #pragma glslify: sphere = require("./primitives/sphere.frag")
#pragma glslify: rayDirection = require("./projection/rayDirection.frag")
#pragma glslify: viewMatrix = require("./projection/viewMatrix.frag")
#pragma glslify: opUnion = require("./ops/opUnion.frag")
#pragma glslify: opIntersect = require("./ops/opIntersect.frag")
#pragma glslify: opDiff = require("./ops/opDiff.frag")
#pragma glslify: opRUnion = require("./ops/opRUnion.frag")
#pragma glslify: opRIntersect = require("./ops/opRIntersect.frag")
#pragma glslify: smMin = require("./ops/smMin.frag")
#pragma glslify: smMax = require("./ops/smMax.frag")
#pragma glslify: opRDiff = require("./ops/opRDiff.frag")
#pragma glslify: smUnion = require("./ops/smUnion.frag")
#pragma glslify: rotateX = require("./transform/rotateX.frag")
#pragma glslify: rotateZ = require("./transform/rotateZ.frag")
#pragma glslify: rotateY = require("./transform/rotateY.frag")

const int MAX_MARCHING_STEPS = 64;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1.7;
const float EPSILON = 0.0001;
const float STEP_CORRECTION = 1.5; // lower -> better quality, but slower
const float PI = 3.1415;

const vec2 RESOLUTION = vec2(1280, 500);

in vec2 textureCoord;
uniform float _T;
uniform float _R;
uniform float _I;
uniform sampler2D _S;
out vec4 _C;

// Result structure:
//  x = distance
//  y = material

const int MATERIAL_DEFAULT = 0;

float hash(vec3 p) {
  float a = 7.23 * p.x + 3.31 * p.y + 5.59 * p.z;
  float b = p.x * p.y * p.z;
  return fract(a + b);
}

float sph(vec3 i, vec3 f, vec3 c) {
  float h = hash(i + c);
  float rad = 0.4 * h;
  return length(f - vec3(c)) - rad;
}

float sdBase(vec3 p) {
  vec3 i = vec3(floor(p));
  vec3 f = fract(p);
  return min(min(min(sph(i, f, vec3(0., 0., 0.)), sph(i, f, vec3(0., 0., 1.))), min(sph(i, f, vec3(0., 1., 0.)), sph(i, f, vec3(0., 1., 1.)))), min(min(sph(i, f, vec3(1., 0., 0.)), sph(i, f, vec3(1., 0., 1.))), min(sph(i, f, vec3(1., 1., 0.)), sph(i, f, vec3(1., 1., 1.)))));
}

float sdFbm(vec3 p, float d, float th) {
  float s = 1.0;
  int octaves = 9;
  float glitchTime = _T * 0.02;
  if (fract(_T) > 1.0 - glitchTime * glitchTime) {
    octaves = int(5.0 + fract(_T * 200.0 * glitchTime) * 4.0);
  }

  for (int i = 0; i < octaves; i++) {
    float n = s * sdBase(p);

    n = smMax(n, d - 0.11 * s, 0.3 * s);
    d = smMin(n, d, 0.3 * s);
    if (d > MAX_DIST)
      break;

    s = 0.5 * s;

    if (s < th)
      break;

    p = mat3(0.00, 1.60, 1.20, -1.60, 0.72, -0.96, -1.20, -0.96, 1.28) * p;
    // p = rotateZ(p, sin(float(i)) * 3.0);
  }
  return d;
}

vec2 render(vec3 p) {
  const float size = 8.0;
  float d = length(p - vec3(0.0, -size, 0)) - size;
  float d2 = length(p + vec3(0.0, -0.02, 0.0) - vec3(0.0, -size, 0)) - size;
  float dmin = min(d, d2);
  return vec2(min(dmin, sdFbm(p, d, 0.02 * dmin)), MATERIAL_DEFAULT);
}

vec3 shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, vec3 lightPos) {
  float depth = MIN_DIST;
  float distanceToLight = 100000.0;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec3 p = eye + depth * marchingDirection;
    distanceToLight = min(distanceToLight, length(lightPos - p));
    vec3 r = vec3(render(p), distanceToLight);
    float dist = r.x;
    if (dist < EPSILON) {
      r.x = depth;
      return r;
    }
    depth += dist * STEP_CORRECTION;
    if (depth >= MAX_DIST) {
      r.x = MAX_DIST;
      return r;
    }
  }
  return vec3(MAX_DIST, -1, distanceToLight);
}

/**
 * Using the gradient of the SDF, estimate the normal on the surface at point p.
 */
vec3 estimateNormal(vec3 p) {
  return normalize(vec3(render(vec3(p.x + EPSILON, p.y, p.z)).x - render(vec3(p.x - EPSILON, p.y, p.z)).x, render(vec3(p.x, p.y + EPSILON, p.z)).x - render(vec3(p.x, p.y - EPSILON, p.z)).x, render(vec3(p.x, p.y, p.z + EPSILON)).x - render(vec3(p.x, p.y, p.z - EPSILON)).x));
}

/**
 * Lighting contribution of a single point light source via Phong illumination.
 * 
 * The vec3 returned is the RGB color of the light's contribution.
 *
 * k_a: Ambient color
 * k_d: Diffuse color
 * k_s: Specular color
 * alpha: Shininess coefficient
 * p: position of point being lit
 * eye: the position of the camera
 * lightPos: the position of the light
 * lightIntensity: color/intensity of the light
 *
 * See https://en.wikipedia.org/wiki/Phong_reflection_model#Description
 */
vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye, vec3 lightPos, vec3 lightIntensity) {
  vec3 N = estimateNormal(p);
  vec3 L = normalize(lightPos - p);
  vec3 V = normalize(eye - p);
  vec3 R = normalize(reflect(-L, N));

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  if (dotLN < 0.0) {
    // Light not visible from this point on the surface
    return vec3(0.0, 0.0, 0.0);
  }

  if (dotRV < 0.0) {
    // Light reflection in opposite direction as viewer, apply only diffuse
    // component
    return lightIntensity * (k_d * dotLN);
  }
  return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

/**
 * Lighting via Phong illumination.
 * 
 * The vec3 returned is the RGB color of that point after lighting is applied.
 * k_a: Ambient color
 * k_d: Diffuse color
 * k_s: Specular color
 * alpha: Shininess coefficient
 * p: position of point being lit
 * eye: the position of the camera
 *
 * See https://en.wikipedia.org/wiki/Phong_reflection_model#Description
 */
vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
  const vec3 ambientLight = vec3(0.5, 0.5, 0.5);
  vec3 ambientColor = ambientLight * k_a;

  float pos = min(1.0, _T * 0.1);
  vec3 light1Pos = (1.0 - pos) * vec3(1.3 * sin(_T), 0.21 - 0.1 * cos(_T * 0.1), 1.3 * cos(_T));
  vec3 light1Intensity = vec3(1.0, 1.0, 1.0);
  vec3 light1 = phongContribForLight(k_d, k_s, alpha, p, eye, light1Pos, light1Intensity);

  return ambientColor + light1;
}

vec3 calcMaterial(vec3 p, vec3 eye, vec3 worldDir, int material, float dist) {
  float fog = min(1.0, dist / MAX_DIST);
  fog *= fog * fog;

  vec3 K_a = vec3(0.0, 0.0, 0.1) * min(1.0, _T);
  vec3 K_d = vec3(0.2, 0.25, 0.3) * min(1.0, _T * 0.5);
  vec3 K_s = vec3(1.0, 0.9, 0.8) * min(1.0, _T * 0.25);
  float shininess = max(10.0, 1000.0 - _T * 10.0);
  vec3 bodyColor = phongIllumination(K_a, K_d, K_s, shininess, p, eye);

  float red = min(1.0, fog * _T * 0.07);
  return (1.0 - fog) * bodyColor + vec3(red * red, 0.0, 0.0);
}

float rand(float s) {
  float s1 = 0.0;
  float s2 = 0.0;
  if (fract(s) < 0.5) {
    s1 = sin(2984.32 * s);
    s2 = sin(8495.123 * s);
  } else {
    s1 = sin(9984.32 * s);
    s2 = sin(1495.123 * s);
  }
  s = fract(s1) < 0.5 ? s1 + s2 : s1 - s2;
  s = fract(s2) < 0.5 ? s + s1 : s + s2;
  return abs(fract(s));
}

vec3 postProcess(vec3 color) {
  color *= 1.1;
  float noiseCoef = rand(color.r + color.g + color.b + _T + _R * 5839.0);
  color = vec3(0.01) + vec3(noiseCoef * 0.03) + color;
  float textFukup = 0.001;
  if (_T > 1.0) {
    textFukup = max(0.01, 0.3 * pow((min(0.0, _I - 0.9)) * 10.0, 2.0));
  }
  vec3 overlay = texture(_S, textureCoord + vec2(noiseCoef * textFukup, 0.0)).rgb;
  return color + overlay;
}

void main() {
  vec3 color = vec3(0.0);

  if (_T > 0.8897 && _T < 21.1) {
    vec3 viewDir = rayDirection(90.0, RESOLUTION.xy, gl_FragCoord.xy);

    vec3 eye = vec3(1.3 * sin(_T), 0.21 - 0.1 * cos(_T * 0.1) + _T * 0.05, 1.3 * cos(_T));
    vec3 up = vec3(sin(_T), 2.0 + cos(_T * 1.1), sin(_T * 1.7));
    up /= length(up);

    mat4 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), up);

    vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

    vec3 lightPos = vec3(0.0, max(0.0, (18.9 - _T) / 3.0), 0.0);

    vec3 r = shortestDistanceToSurface(eye, worldDir, lightPos);
    float dist = r.x;
    float material = r.y;
    float lightDistance = r.z;

    if (dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
      color = vec3(0.0, 0.0, 0.0);
    } else {
      vec3 p = eye + dist * worldDir;
      color = calcMaterial(p, eye, worldDir, int(material), dist);
    }

    float b = 1.5 / (lightDistance * lightDistance + 1.0);
    color += vec3(b, b * 0.7, b * 0.4);
  }

  _C = vec4(postProcess(color), 1.0);
}