precision highp float;

#pragma glslify: sphere = require("./primitives/sphere.frag")
#pragma glslify: cube = require("./primitives/cube.frag")
#pragma glslify: cappedCylinder = require("./primitives/cappedCylinder.frag")
#pragma glslify: rayDirection = require("./projection/rayDirection.frag")
#pragma glslify: viewMatrix = require("./projection/viewMatrix.frag")
#pragma glslify: opUnion = require("./ops/opUnion.frag")
#pragma glslify: opIntersect = require("./ops/opIntersect.frag")
#pragma glslify: opDiff = require("./ops/opDiff.frag")
#pragma glslify: opRUnion = require("./ops/opRUnion.frag")
#pragma glslify: opRIntersect = require("./ops/opRIntersect.frag")
#pragma glslify: opRDiff = require("./ops/opRDiff.frag")
#pragma glslify: smUnion = require("./ops/smUnion.frag")
#pragma glslify: rotateX = require("./transform/rotateX.frag")
#pragma glslify: rotateZ = require("./transform/rotateZ.frag")
#pragma glslify: rotateY = require("./transform/rotateY.frag")

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 15.0;
const float EPSILON = 0.00001;
const float STEP_CORRECTION = 0.9; // lower -> better quality, but slower
const float PI = 3.1415926535897932384626433832795;

varying lowp vec2 vResolution;
varying lowp float vTime;

// Result structure:
//  x = distance
//  y = material
//  z = unused
//  w = unused

const int MATERIAL_ENV = 0;
const int MATERIAL_LOGO = 1;
const int MATERIAL_BALLS = 2;

vec4 result(float distance, int material) {
  return vec4(distance, float(material), 0.0, 0.0);
}

vec4 displace(float distance) {
  return vec4(distance, 0.0, 0.0, 0.0);
}

vec4 logo(vec3 p0) {
  vec3 p = p0 + vec3(0.0, 0.05, 0.0);
  float d = 0.181;
  float rJalka = cube(p + vec3(-0.2185, 0.044, 0.0), vec3(0.181, 0.819, d) / 2.0);
  float rJalkaLaajennos = cube(p + vec3(-0.175, -0.102, 0.0), vec3(0.28, 0.525, d) / 2.0);
  float rJalkaLeikkaus = cube(p + vec3(-0.053, -0.093, 0.0), vec3(0.15, 0.186, d * 2.0) / 2.0);
  float osa1 = opDiff(opUnion(rJalka, rJalkaLaajennos), rJalkaLeikkaus);

  float rKaari = cappedCylinder(rotateX(p + vec3(-0.029, -0.194, 0.0), PI / 2.0), 0.7 / 2.0, d / 2.0);
  float rKaariPuolitus = cube(p + vec3(-0.22, -0.203, 0.0), vec3(0.357, 0.8, d * 3.0) / 2.0);
  float rKaariSisus = cappedCylinder(rotateX(p + vec3(-0.029, -0.194, 0.0), PI / 2.0), 0.26 / 2.0, d * 2.0);
  float osa2 = opDiff(opDiff(rKaari, rKaariPuolitus), rKaariSisus);

  float rVino = cube(rotateZ(p + vec3(0.17, 0.25, 0.0), -0.537561), vec3(0.189, 0.589, d) / 2.0);
  float rVinoLeikkaus = cube(p + vec3(0.264, 0.537, 0.0), vec3(0.46, 0.164, d * 2.0) / 2.0);
  float osa3 = opDiff(rVino, rVinoLeikkaus);

  return result(opUnion(opUnion(osa1, osa2), osa3), MATERIAL_LOGO);
}

vec4 environment(vec3 p) {
  const float f = 8.0;
  const float size = 5.0;
  float s = sphere(p / size) * size;
  float distort = sin(p.x * 5.0) * sin(p.y * 2.0) * sin(p.z * f);
  return result(-s + distort * 0.1, MATERIAL_ENV);
}

vec4 metaBalls(vec3 p) {
  const float size = 0.15;
  float dist = 1000.0;
  for (int i = 0; i < 16; i++) {
    float f = pow(float(i), 2.0) + vTime * (1.0 + float(i) * 0.2);
    vec3 p1 = p + vec3(sin(f), cos(f * 0.9), sin(f * 0.4)) * 0.3;
    float s = sphere(p1 / size) * size;
    dist = smUnion(dist, s, 0.3 + sin(vTime) * 0.3);
  }
  return result(dist, MATERIAL_BALLS);
}

vec4 render(vec3 p) {
  vec3 p1 = rotateY(p, vTime);

  float logoDisplacement = sin(30.0 * p1.x + 27.0 * p1.y + 250.0 * p1.z) + sin(30.0 * p.y + 10.0 * vTime);
  vec4 displacedLogo = logo(p1) + displace(logoDisplacement * sin(vTime) * 0.005);

  vec4 balls = metaBalls(p);

  return opRUnion(environment(p), mod(vTime, 2.0) < 1.0 ? displacedLogo : balls);
}

vec4 shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
  float depth = start;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec4 r = render(eye + depth * marchingDirection);
    float dist = r.x;
    if (dist < EPSILON) {
      r.x = depth;
      return r;
    }
    depth += dist * STEP_CORRECTION;
    if (depth >= end) {
      r.x = end;
      return r;
    }
  }
  return result(end, -1);
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
  const vec3 ambientLight = 0.1 * vec3(1.0, 1.0, 1.0);
  vec3 color = ambientLight * k_a;
  float y = sin(vTime * 2.0) * 4.0;

  vec3 light1Pos = vec3(4.0 * sin(vTime), y, 4.0 * cos(vTime));
  vec3 light1Intensity = vec3(0.4, 0.4, 0.4);

  color += phongContribForLight(k_d, k_s, alpha, p, eye, light1Pos, light1Intensity);

  vec3 light2Pos = vec3(3.0 * sin(0.37 * vTime), y, 3.0 * cos(0.37 * vTime));
  vec3 light2Intensity = vec3(0.4, 0.4, 0.4);

  color += phongContribForLight(k_d, k_s, alpha, p, eye, light2Pos, light2Intensity);
  return color;
}

vec3 vignette(vec3 color) {
  float maxDist = length(vResolution.xy) / 2.0;
  float strength = pow(length(gl_FragCoord.xy - vResolution.xy / 2.0) / maxDist, 5.0);
  strength *= 0.6 + 0.6 * sin(gl_FragCoord.y * 2.0 + vTime * 5.0); // scanlines

  return color * (1.3 - strength);
}

void main() {
  vec3 viewDir = rayDirection(45.0, vResolution.xy, gl_FragCoord.xy);
  vec3 eye = vec3(3.0 * cos(vTime * 0.2), 1.0 * sin(vTime * 0.3), 3.0 * sin(vTime * 0.2));

  eye.x += sin(gl_FragCoord.y * 0.001 + vTime);

  mat4 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));

  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

  vec4 r = shortestDistanceToSurface(eye, worldDir, MIN_DIST, MAX_DIST);
  float dist = r.x;
  float material = r.y;

  if (dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 p = eye + dist * worldDir;
  vec3 color = vec3(1.0, 0.0, 0.0);

  if (material > 1.5) {
    // Balls
    vec3 K_a = vec3(0.0, 0.0, 0.2);
    vec3 K_d = vec3(0.4, 0.8, 0.3);
    vec3 K_s = vec3(1.0, 1.0, 1.0);
    float shininess = 200.0;
    color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);
  } else if (material > 0.5) {
    // Logo
    vec3 K_a = vec3(0.2, 0.1, 0.1);
    vec3 K_d = vec3(1.0, 0.9, 0.5);
    vec3 K_s = vec3(1.0, 1.0, 0.5);
    float shininess = 2.0;
    color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);
  } else if (material > -0.5) {
    // Env
    vec3 K_a = vec3(0.0, 0.15, 0.2);
    vec3 K_d = vec3(0.0, 0.5, 0.8);
    vec3 K_s = vec3(1.0, 1.0, 1.0);
    float shininess = 100.0;
    color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);
  }

  gl_FragColor = vec4(vignette(color), 1.0);
}