#pragma glslify: sphere = require("./primitives/sphere.frag")
#pragma glslify: cube = require("./primitives/cube.frag")
#pragma glslify: smIntersect = require("./ops/smIntersect.frag")
#pragma glslify: smUnion = require("./ops/smUnion.frag")
#pragma glslify: smDiff = require("./ops/smDiff.frag")

precision highp float;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

varying lowp vec2 vResolution;
varying lowp float vTime;

float render(vec3 samplePoint) {
  float sphereDist = sphere(samplePoint / 1.5) * 1.5;
  float size = 1.0 + sin(vTime * 7.0) * 0.5;
  float sphereDist2 = sphere((samplePoint + 0.5 * vec3(sin(vTime * 1.4), sin(vTime * 1.1), sin(vTime * 1.2))) / size) * size;
  float cubeDist = cube(samplePoint + vec3(sin(vTime * 1.2), sin(vTime), sin(vTime * 1.3)));
  float cubeDist2 = cube((samplePoint + vec3(sin(vTime * 1.2), sin(vTime), sin(vTime * 1.3))) / 1.5) * 1.5;
  float distortion = sin((samplePoint.x * samplePoint.y * samplePoint.z) * 5.9 + vTime) * 0.02;
  return distortion + smUnion(smDiff(cubeDist, sphereDist, 0.1), smIntersect(sphereDist2, cubeDist2, 0.1), 0.3);
}

float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
  float depth = start;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    float dist = render(eye + depth * marchingDirection);
    if (dist < EPSILON) {
      return depth;
    }
    depth += dist;
    if (depth >= end) {
      return end;
    }
  }
  return end;
}

/**
 * Return the normalized direction to march in from the eye point for a single pixel.
 * 
 * fieldOfView: vertical field of view in degrees
 * size: resolution of the output image
 * fragCoord: the x,y coordinate of the pixel in the output image
 */
vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  vec2 xy = fragCoord - size / 2.0;
  float z = size.y / tan(radians(fieldOfView) / 2.0);
  return normalize(vec3(xy, -z));
}

/**
 * Return a transform matrix that will transform a ray from view space
 * to world coordinates, given the eye point, the camera target, and an up vector.
 *
 * This assumes that the center of the camera is aligned with the negative z axis in
 * view space when calculating the ray marching direction. See rayDirection.
 */
mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
    // Based on gluLookAt man page
  vec3 f = normalize(center - eye);
  vec3 s = normalize(cross(f, up));
  vec3 u = cross(s, f);
  return mat4(vec4(s, 0.0), vec4(u, 0.0), vec4(-f, 0.0), vec4(0.0, 0.0, 0.0, 1));
}

/**
 * Using the gradient of the SDF, estimate the normal on the surface at point p.
 */
vec3 estimateNormal(vec3 p) {
  return normalize(vec3(render(vec3(p.x + EPSILON, p.y, p.z)) - render(vec3(p.x - EPSILON, p.y, p.z)), render(vec3(p.x, p.y + EPSILON, p.z)) - render(vec3(p.x, p.y - EPSILON, p.z)), render(vec3(p.x, p.y, p.z + EPSILON)) - render(vec3(p.x, p.y, p.z - EPSILON))));
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
  const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
  vec3 color = ambientLight * k_a;

  vec3 light1Pos = vec3(4.0 * sin(vTime), 2.0, 4.0 * cos(vTime));
  vec3 light1Intensity = vec3(0.4, 0.4, 0.4);

  color += phongContribForLight(k_d, k_s, alpha, p, eye, light1Pos, light1Intensity);

  vec3 light2Pos = vec3(2.0 * sin(0.37 * vTime), 2.0 * cos(0.37 * vTime), 2.0);
  vec3 light2Intensity = vec3(0.4, 0.4, 0.4);

  color += phongContribForLight(k_d, k_s, alpha, p, eye, light2Pos, light2Intensity);
  return color;
}

void main() {
  vec3 viewDir = rayDirection(45.0, vResolution.xy, gl_FragCoord.xy);
  vec3 eye = vec3(8.0, 5.0, 7.0);

  mat4 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));

  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

  float dist = shortestDistanceToSurface(eye, worldDir, MIN_DIST, MAX_DIST);

  if (dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 p = eye + dist * worldDir;

  vec3 K_a = vec3(0.1, 0.15, 0.2);
  vec3 K_d = vec3(0.2, 0.7, 0.8);
  vec3 K_s = vec3(1.0, 1.0, 0.0);
  float shininess = 10.0;

  vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);

  gl_FragColor = vec4(color, 1.0);
}