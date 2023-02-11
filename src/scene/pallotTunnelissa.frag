#version 300 es
//[
precision highp float;
//]

#env RENDER_ENVIRONMENT_MAP

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

#ifndef RENDER_ENVIRONMENT_MAP
uniform samplerCube ENVIRONMENT_SAMPLER;
#endif

uniform float TIME;

uniform vec3 CAMERA_POS;
uniform vec3 CAMERA_LOOKAT;
uniform vec3 CAMERA_UP;

const int OUT_OF_VIEW = -1;
const int SPHERE = 0;
const int TUNNEL = 1;
const int BOX = 2;
const int LIGHT = 3;

struct result {
  float dist;
  vec3 p; // osumakohta suhteessa objektin keskipisteeseen, käytetään uv-mappaukseen. valojen tapauksessa r kertoo valon indeksin.
  int kind;
};

result opUnion(result a, result b) {
  if (a.dist < b.dist) {
    return a;
  }
  return b;
}

// Valojen sijainnit ja värit - TODO: nämäkin voisi siirtää täältä pois ja laskea vain kerran

const int NUMBER_OF_LIGHTS = 4;

vec3 lightPosition(int index) {
  float x = sin(TIME * 20.0 + float(index) * 1.1);
  float z = cos(TIME * 20.0 + float(index) * 0.76);
  float y = 5.0 * cos(TIME * 2.0 + float(index) * 0.98);
  return 2.0 * vec3(x, y, z);
}

vec3 lightColor(int index) {
  return index == 0 ? vec3(30.0, 1.5, 0.5) : vec3(20.0, 19.0, 18.0);
}

result lightOrb(vec3 p, int index) {
  return result(length(p - lightPosition(index)) - 0.1, vec3(float(index)), LIGHT);
}

result lightOrbs(vec3 p) {
  result l = lightOrb(p, 0);
  for (int i = 1; i < NUMBER_OF_LIGHTS; i++) {
    l = opUnion(l, lightOrb(p, i));
  }
  return l;
}

// Pallot

result sphere(vec3 samplePoint) {
  float distort = 0.005 * sin(TIME) * sin(samplePoint.x * 15.0) * sin(samplePoint.y * 15.0) * sin(samplePoint.z * 15.0);
  return result(length(samplePoint) - 1.0 + distort, samplePoint, SPHERE);
}

float smMin(float a, float b, float k) {
  float i_h = max(k - abs(a - b), 0.0);
  return min(a, b) - i_h * i_h * 0.25 / k;
}

result smoothUnion(result a, result b, float k) {
  float dist = smMin(a.dist, b.dist, k);
  return result(dist, a.p, a.kind);
}

// Tunneli

vec2 tunnelUvMap(vec3 p) {
  vec3 d = normalize(p);
  float u = 0.5 + atan(d.z, d.x) / (2.0 * PI);
  return vec2(u, p.y * 0.05);
}

result tunnel(vec3 p) {
  // p.y += TIME * 8.0;
  float d = -length(p.xz) + 5.0;
  // float d2 = -length(p.xz) + 4.97;
  float wave = 0.05 * sin(p.y * 4.0);
  float t = d + wave; // max(d + wave, d2);

  return result(t, p, TUNNEL);
}

// Kuutio

result cube(vec3 p) {
  vec3 b = vec3(5.0, 30.0, 5.0);
  vec3 i_q = abs(p) - b;
  float dist = length(max(i_q, 0.0)) + min(max(i_q.x, max(i_q.y, i_q.z)), 0.0);
  return result(-dist, p, SPHERE);
}

// Skene yhdistettynä

result render(vec3 p) {
  result env = opUnion(tunnel(p), lightOrbs(p));

  #ifdef RENDER_ENVIRONMENT_MAP
  return env;
  #endif

  vec3 p1 = p - CAMERA_LOOKAT;
  vec3 p2 = p + CAMERA_LOOKAT + vec3(sin(TIME * 6.0));

  result balls = smoothUnion(sphere(p1), sphere(p2), 2.5);

  return opUnion(balls, env);
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

  float ggx2 = geometryShlickGGX(NdotV, roughness);
  float ggx1 = geometryShlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

vec3 pbrReflectance(vec3 p, vec3 eye, vec3 albedo, float metallic, float roughness, float ambientOcclusion, float reflectCoef) {
  vec3 N = estimateNormal(p);
  vec3 V = normalize(eye - p);

  vec3 F0 = vec3(0.04); // most dielectric surfaces look visually correct with a constant F0 of 0.04
  F0 = mix(F0, albedo, metallic);

  vec3 lightColorSum = vec3(0.0);
  for (int i = 0; i < NUMBER_OF_LIGHTS; i++) {
    vec3 lightPos = lightPosition(i);
    vec3 lightCol = lightColor(i);

    vec3 L = normalize(lightPos - p);
    vec3 H = normalize(V + L);

    float distance = length(lightPos - p);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightCol * attenuation;

    // Calculate the ratio between specular and diffuse reflection
    vec3 F = fresnelSchlick(clamp(dot(H, V), 0.0, 1.0), F0);

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

    float NdotL = max(dot(N, L), 0.0); // y oli 0.0, mutta sillä ilmestyi niitä mustia läikkiä
    lightColorSum += (kDiffuse * albedo / PI + specular) * radiance * NdotL;
  }

  vec3 ambient = vec3(0.03) * albedo * ambientOcclusion;

  #ifndef RENDER_ENVIRONMENT_MAP
  vec3 reflection = vec3(0.0);
  if (metallic > 0.0 && reflectCoef > 0.0) {
    vec3 R = reflect(V, N);
    reflection = texture(ENVIRONMENT_SAMPLER, R).rgb * metallic * reflectCoef;
  }

  return ambient + lightColorSum + reflection;
  #else
  return ambient + lightColorSum;
  #endif
}

vec2 sphereUvMap(vec3 d) {
  float u = 0.5 + atan(d.z, d.x) / (2.0 * PI);
  float v = 0.5 + asin(d.y) / PI;
  return vec2(u, v);
}

vec3 calcMaterial(vec3 p, vec3 eye, result r) {
  #ifndef RENDER_ENVIRONMENT_MAP
  if (r.kind == SPHERE) {
    vec2 uv = sphereUvMap(normalize(r.p));

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    return pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion, 0.5);
  }
  #endif

  if (r.kind == TUNNEL) {
    vec2 uv = tunnelUvMap(r.p);

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    vec3 color = pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion, 0.0);
    color.r *= 0.25;
    color.g *= 0.5;
    return color;
  }

  if (r.kind == LIGHT) {
    return lightColor(int(r.p.r)) + vec3(1.0);
  }

  #ifndef RENDER_ENVIRONMENT_MAP
  if (r.kind == BOX) {
    return texture(ENVIRONMENT_SAMPLER, r.p).rgb;
  }
  #endif

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
  #ifdef RENDER_ENVIRONMENT_MAP
  float fieldOfView = 90.0;
  #else
  float fieldOfView = 60.0 + 15.0 * sin(TIME * 5.0);
  #endif

  vec3 cameraPos = CAMERA_POS;
  vec3 viewDir = rayDirection(fieldOfView, RESOLUTION.xy, gl_FragCoord.xy);

  mat4 viewToWorld = viewMatrix(cameraPos, CAMERA_LOOKAT, CAMERA_UP);

  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

  result hitInfo = shortestDistanceToSurface(cameraPos, worldDir);

  if (hitInfo.dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    color = vec3(0.0, 0.0, 0.0);
  } else {
    vec3 p = cameraPos + hitInfo.dist * worldDir;
    color = calcMaterial(p, cameraPos, hitInfo);
  }

  FRAG_COLOR = vec4(color, 1.0);
}