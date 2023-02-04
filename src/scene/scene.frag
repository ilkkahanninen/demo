#version 300 es
//[
precision highp float;
//]

const int MAX_MARCHING_STEPS = 256;
const float MIN_DIST = 0.0;
const float MAX_DIST = 6.0;
const float EPSILON = 0.0001;
const float STEP_CORRECTION = 1.0; // lower -> better quality, but slower
const float PI = 3.14159265359;

const vec2 RESOLUTION = vec2(1280, 500);

out vec4 FRAG_COLOR;

uniform sampler2D ALBEDO_SAMPLER;
uniform sampler2D METALLIC_SAMPLER;
uniform sampler2D ROUGHNESS_SAMPLER;
uniform sampler2D AO_SAMPLER;
uniform float TIME;

vec2 sphereUvMap(vec3 d) {
  float u = 0.5 + atan(d.z, d.x) / (2.0 * PI);
  float v = 0.5 + asin(d.y) / PI;
  return vec2(u, v);
}

struct result {
  float dist;
  vec2 uv;
};

result sphere(vec3 samplePoint) {
  vec3 d = normalize(samplePoint);
  float distance = length(samplePoint) - 1.0;
  return result(distance, sphereUvMap(d));
}

float smMin(float a, float b, float k) {
  float i_h = max(k - abs(a - b), 0.0);
  return min(a, b) - i_h * i_h * 0.25 / k;
}

//    |    *            |
// a  0                 x
// b  x                 0
//         ^- 

result smoothUnion(result a, result b, float k) {
  float dist = smMin(a.dist, b.dist, k);
  return result(dist, a.uv);
}

result render(vec3 p) {
  vec3 p1 = p - 1.5 * vec3(cos(TIME * 2.0), 0.0, 0.0);
  vec3 p2 = p + 1.5 * vec3(cos(TIME * 2.0), 0.0, 0.0);
  return smoothUnion(sphere(p1), sphere(p2), 0.3);
}

result shortestDistanceToSurface(vec3 eye, vec3 marchingDirection) {
  float depth = MIN_DIST;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    vec3 p = eye + depth * marchingDirection;
    result r = render(p);
    if (r.dist < EPSILON) {
      r.dist = depth;
      return r;
    }
    depth += r.dist * STEP_CORRECTION;
    if (depth >= MAX_DIST) {
      r.dist = MAX_DIST;
      return r;
    }
  }
  return result(MAX_DIST, vec2(0.0));
}

/**
 * Using the gradient of the SDF, estimate the normal on the surface at point p.
 */
vec3 estimateNormal(vec3 p) {
  return normalize(vec3(render(vec3(p.x + EPSILON, p.y, p.z)).dist - render(vec3(p.x - EPSILON, p.y, p.z)).dist, render(vec3(p.x, p.y + EPSILON, p.z)).dist - render(vec3(p.x, p.y - EPSILON, p.z)).dist, render(vec3(p.x, p.y, p.z + EPSILON)).dist - render(vec3(p.x, p.y, p.z - EPSILON)).dist));
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;

  float num = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;

  return num / denom;
}

float geometryShlickGGX(float NdotV, float roughness) {
  float r = roughness + 1.0;
  float k = (r * r) / 8.0;

  float num = NdotV;
  float denom = NdotV * (1.0 - k) + k;

  return num / denom;
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);

  float ggx1 = geometryShlickGGX(NdotL, roughness);
  float ggx2 = geometryShlickGGX(NdotV, roughness);

  return ggx1 * ggx2;
}

vec3 pbrReflectance(vec3 p, vec3 eye, vec3 albedo, float metallic, float roughness, float ambientOcclusion) {
  vec3 N = estimateNormal(p);
  vec3 V = normalize(eye - p);

  vec3 lightColorSum = vec3(0.0);

  for (int i = 0; i < 12; i++) {
    vec3 lightPos = 1.2 * vec3(sin(TIME * 2.0 + float(i) * 4.2) * 2.0, cos(TIME * 2.0) * 2.0 + float(i) * 3.1, sin(TIME * 2.0 + float(i) * 3.0) * 2.0);
    vec3 lightColor = vec3(20.0, 19.0, 18.0);

    vec3 L = normalize(lightPos - p);
    vec3 H = normalize(V + L);

    float distance = length(lightPos - p);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightColor * attenuation;

    // Calculate the ratio between specular and diffuse reflection
    vec3 F0 = vec3(0.04); // most dielectric surfaces look visually correct with a constant F0 of 0.04
    F0 = mix(F0, albedo, metallic);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

    // Calculate distribution
    float NDF = distributionGGX(N, H, roughness);
    float G = geometrySmith(N, V, L, roughness);

    // Calculate specular
    vec3 specularNum = NDF * G * F;
    float specularDenom = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    vec3 specular = specularNum / specularDenom;

    vec3 kSpecular = F;
    vec3 kDiffuse = vec3(1.0) - kSpecular;
    kDiffuse *= 1.0 - metallic;

    float NdotL = max(dot(N, L), 0.0);
    lightColorSum += (kDiffuse * albedo / PI + specular) * radiance * NdotL;
  }

  vec3 ambient = vec3(0.03) * albedo * ambientOcclusion;
  vec3 color = ambient + lightColorSum;

  return color;
}

vec3 calcMaterial(vec3 p, vec3 eye, result r) {
  vec3 albedo = texture(ALBEDO_SAMPLER, r.uv).rgb;
  float metallic = texture(METALLIC_SAMPLER, r.uv).r;
  float roughness = texture(ROUGHNESS_SAMPLER, r.uv).r;
  float ambientOcclusion = texture(AO_SAMPLER, r.uv).r;

  return pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion);
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

  vec3 eye = vec3(0.0, 2.0, 0.0);// 1.6 * vec3(2.3 * sin(TIME * 4.0), 0.21 - 0.1 * cos(TIME * 0.1) + TIME * 0.05, 1.3 * cos(TIME * 4.0));
  vec3 up = vec3(sin(TIME), 2.0 + cos(TIME * 1.1), sin(TIME * 1.7));
  up /= length(up);
  vec3 lookAt = vec3(0.0, 0.0, 0.0);

  mat4 viewToWorld = viewMatrix(eye, lookAt, up);
  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

  result hitInfo = shortestDistanceToSurface(eye, worldDir);

  if (hitInfo.dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    color = vec3(.1, 0.1, 0.1);
  } else {
    vec3 p = eye + hitInfo.dist * worldDir;
    color = calcMaterial(p, eye, hitInfo);
  }

  FRAG_COLOR = vec4(postProcess(color), 1.0);
}