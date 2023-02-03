#version 300 es
//[
precision highp float;
//]

const int MAX_MARCHING_STEPS = 256;
const float MIN_DIST = 0.0;
const float MAX_DIST = 15.0;
const float EPSILON = 0.0001;
const float STEP_CORRECTION = 1.0; // lower -> better quality, but slower
const float PI = 3.14159265359;

const vec2 RESOLUTION = vec2(1280, 500);

out vec4 FRAG_COLOR;

uniform float TIME;

vec2 sphereUvMap(vec3 d) {
  float u = 0.5 + atan(d.z, d.x) / PI;
  float v = 0.5 + asin(d.y) / PI;
  return vec2(u, v);
}

// Result structure:
//  x = distance
//  y = material
//  z = u coordinate
//  w = v coordinate

vec4 sphere(vec3 samplePoint) {
  vec3 d = normalize(samplePoint);
  return vec4(length(samplePoint) - 1.0, 0.0, sphereUvMap(d));
}

vec4 render(vec3 p) {
  return sphere(p);
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

  for (int i = 0; i < 1; i++) {
    vec3 lightPos = eye / 2.0 + vec3(sin(TIME * 20.0) * 2.0, cos(TIME * 19.0) * 2.0, 0.0); //vec3(11.3 * sin(TIME), 0.21 - 0.1 * cos(TIME * 0.1), 1.3 * cos(TIME));
    vec3 lightColor = vec3(10.0, 9.0, 8.0);

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

vec3 calcMaterial(vec3 p, vec3 eye, vec3 worldDir, vec4 hitInfo) {
  float c1 = int((hitInfo.z) * 100.0) % 2 == 0 ? 1.0 : 0.0;
  float c2 = int((hitInfo.w) * 100.0) % 2 == 0 ? 1.0 : 0.0;
  float c = abs(c1 - c2);

  // vec3 K_a = vec3(c * 0.2);
  // vec3 K_d = vec3(c);
  // vec3 K_s = vec3(1.0, 1.0, 1.0);
  // float shininess = 10.0;

  // return phongIllumination(K_a, K_d, K_s, shininess, p, eye);

  vec3 albedo = vec3(1.0, 0.8, 0.0);
  float metallic = c;
  float roughness = c;
  float ambientOcclusion = 0.1;

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

  vec3 eye = vec3(2.3 * sin(TIME), 0.21 - 0.1 * cos(TIME * 0.1) + TIME * 0.05, 1.3 * cos(TIME));
  vec3 up = vec3(sin(TIME), 2.0 + cos(TIME * 1.1), sin(TIME * 1.7));
  up /= length(up);
  vec3 lookAt = vec3(0.0, 0.0, 0.0);

  mat4 viewToWorld = viewMatrix(eye, lookAt, up);
  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

  vec4 hitInfo = shortestDistanceToSurface(eye, worldDir);

  if (hitInfo.x > MAX_DIST - EPSILON) {
    // Didn't hit anything
    color = vec3(0.0, 0.0, 0.0);
  } else {
    vec3 p = eye + hitInfo.x * worldDir;
    color = calcMaterial(p, eye, worldDir, hitInfo);
  }

  FRAG_COLOR = vec4(postProcess(color), 1.0);
}