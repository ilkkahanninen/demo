#version 300 es
//[
precision highp float;
//]

const int MAX_MARCHING_STEPS = 256;
const float MIN_DIST = 0.0;
const float MAX_DIST = 50.0;
const float EPSILON = 0.0001;
const float STEP_CORRECTION = 1.0; // lower -> better quality, but slower
const float PI = 3.14159265359;

in vec2 RESOLUTION;
out vec4 FRAG_COLOR;

uniform sampler2D ALBEDO_SAMPLER;
uniform sampler2D METALLIC_SAMPLER;
uniform sampler2D ROUGHNESS_SAMPLER;
uniform sampler2D AO_SAMPLER;

uniform float TIME;

uniform vec3 CAMERA_POS;
uniform vec3 CAMERA_LOOKAT;
uniform vec3 CAMERA_UP;

const int OUT_OF_VIEW = -1;
const int SPHERE = 0;
const int TUNNEL = 1;

struct result {
  float dist;
  vec3 p; // osumakohta suhteessa objektin keskipisteeseen, käytetään uv-mappaukseen
  int kind;
};

// Tunneli

vec2 tunnelUvMap(vec3 p) {
  vec3 d = normalize(p);
  float u = 0.5 + atan(d.z, d.x) / (2.0 * PI);
  return vec2(u, p.y * 0.05);
}

result tunnel(vec3 p) {
  p.y += TIME * 8.0;
  float d = -length(p.xz) + 5.0;
  // float d2 = -length(p.xz) + 4.97;
  float wave = 0.05 * sin(p.y * 4.0);
  float t = d + wave; // max(d + wave, d2);

  return result(t, p, TUNNEL);
}

result render(vec3 p) {
  return tunnel(p);
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
  return result(MAX_DIST, vec3(0.0), OUT_OF_VIEW);
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

  for (int i = 0; i < 4; i++) {
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

vec2 sphereUvMap(vec3 d) {
  float u = 0.5 + atan(d.z, d.x) / (2.0 * PI);
  float v = 0.5 + asin(d.y) / PI;
  return vec2(u, v);
}

vec3 calcMaterial(vec3 p, vec3 eye, result r) {
  if (r.kind == SPHERE) {
    vec2 uv = sphereUvMap(normalize(r.p));

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    return pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion);
  }

  if (r.kind == TUNNEL) {
    vec2 uv = tunnelUvMap(r.p);

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    vec3 color = pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion);
    color.r *= 0.25;
    color.g *= 0.5;
    return color;
  }

  return vec3(1.0);
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  size *= 0.5;
  vec2 i_xy = fragCoord - size;
  float i_z = size.y / tan(radians(fieldOfView) / 2.0);
  return normalize(vec3(i_xy, -i_z));
}

mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
  vec3 i_f = normalize(center - eye);
  vec3 i_s = normalize(cross(i_f, up));
  vec3 i_u = cross(i_s, i_f);
  return mat4(vec4(i_s, 0.0), vec4(i_u, 0.0), vec4(-i_f, 0.0), vec4(0.0, 0.0, 0.0, 1));
}

void main() {
  vec3 color = vec3(0.0);

  // TODO: Siirrä koko matriisin laskenta cpun puolelle
  float fieldOfView = 90.0;
  vec3 viewDir = rayDirection(fieldOfView, RESOLUTION.xy, gl_FragCoord.xy);

  mat4 viewToWorld = viewMatrix(CAMERA_POS, CAMERA_LOOKAT, CAMERA_UP);
  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

  result hitInfo = shortestDistanceToSurface(CAMERA_POS, worldDir);

  if (hitInfo.dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    color = vec3(0.0);
  } else {
    vec3 p = CAMERA_POS + hitInfo.dist * worldDir;
    color = calcMaterial(p, CAMERA_POS, hitInfo);
  }

  FRAG_COLOR = vec4(color, 1.0);
}