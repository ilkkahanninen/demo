#version 300 es
//[
precision highp float;
//]

const int MAX_MARCHING_STEPS = 64;
const float MIN_DIST = 0.0;
const float MAX_DIST = 15.0;
const float EPSILON = 0.0001;
const float STEP_CORRECTION = 1.5; // lower -> better quality, but slower
const float PI = 3.1415;

const vec2 RESOLUTION = vec2(1280, 500);

in vec2 textureCoord;
uniform float _TIME;
uniform float _RANDOM;
uniform sampler2D _SAMPLER;
out vec4 _OUT;

const int MATERIAL_DEFAULT = 0;
const int MATERIAL_SEA = 1;

// Result structure:
//  x = distance
//  y = material
//  z = unused
//  w = unused

float sphere(vec3 samplePoint) {
  return length(samplePoint) - 1.0;
}

vec4 render(vec3 p) {
  return vec4(sphere(p), 0., 0., 0.);
}

vec4 shortestDistanceToSurface(vec3 eye, vec3 marchingDirection) {
  float depth = MIN_DIST;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec3 p = eye + depth * marchingDirection;
    vec4 r = render(p);
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
  return vec4(MAX_DIST, 0.0, -1, 0.0);
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

  float pos = min(1.0, _TIME * 0.1);
  vec3 light1Pos = (1.0 - pos) * vec3(1.3 * sin(_TIME), 0.21 - 0.1 * cos(_TIME * 0.1), 1.3 * cos(_TIME));
  vec3 light1Intensity = vec3(1.0, 1.0, 1.0);
  vec3 light1 = phongContribForLight(k_d, k_s, alpha, p, eye, light1Pos, light1Intensity);

  return ambientColor + light1;
}

vec3 calcMaterial(vec3 p, vec3 eye, vec3 worldDir, int material) {
  vec3 K_a = vec3(0.1, 0.1, 0.1);
  vec3 K_d = vec3(0.0, 0.5, 0.0);
  vec3 K_s = vec3(1.0, 1.0, 1.0);
  float shininess = 10.0;

  return phongIllumination(K_a, K_d, K_s, shininess, p, eye);
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  vec2 i_xy = fragCoord - size / 2.0;
  float i_z = size.y / tan(radians(fieldOfView) / 2.0);
  return normalize(vec3(i_xy, -i_z));
}

mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
  vec3 i_f = normalize(center - eye);
  vec3 i_s = normalize(cross(i_f, up));
  vec3 i_u = cross(i_s, i_f);
  return mat4(vec4(i_s, 0.0), vec4(i_u, 0.0), vec4(-i_f, 0.0), vec4(0.0, 0.0, 0.0, 1));
}

vec3 postProcess(vec3 color) {
  // vec3 overlay = texture(_SAMPLER, textureCoord).rgb;
  // return color + overlay;
  return color;
}

void main() {
  vec3 color = vec3(0.0);

  vec3 viewDir = rayDirection(90.0, RESOLUTION.xy, gl_FragCoord.xy);

  vec3 eye = vec3(2.3 * sin(_TIME), 0.21 - 0.1 * cos(_TIME * 0.1) + _TIME * 0.05, 1.3 * cos(_TIME));
  vec3 up = vec3(sin(_TIME), 2.0 + cos(_TIME * 1.1), sin(_TIME * 1.7));
  up /= length(up);
  vec3 lookAt = vec3(0.0, 0.0, 0.0);

  mat4 viewToWorld = viewMatrix(eye, lookAt, up);
  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

  vec4 r = shortestDistanceToSurface(eye, worldDir);
  float dist = r.x;
  float material = r.y;

  if (dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    color = vec3(0.0, 0.0, 0.0);
  } else {
    vec3 p = eye + dist * worldDir;
    color = calcMaterial(p, eye, worldDir, int(material));
  }

  _OUT = vec4(postProcess(color), 1.0);
}