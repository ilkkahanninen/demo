#version 300 es
//[
precision highp float;
//]

#env RENDER_ENVIRONMENT_MAP

const int MAX_MARCHING_STEPS = 256;
const float MIN_DIST = 0.0f;
const float MAX_DIST = 50.0f;
const float EPSILON = 0.0001f;
const float STEP_CORRECTION = 1.0f; // lower -> better quality, but slower
const float PI = 3.14159265359f;

in vec2 RESOLUTION;
in mat4 VIEW_MATRIX;
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
uniform float CAMERA_FOV;
uniform float ENV_GEOMETRY;
uniform float ENV_FACTOR;
uniform float NUMBER_OF_LIGHTS;
uniform float LIGHT_INTENSITY;
uniform float TIME_MOD;
uniform float OBJECT;

const int OUT_OF_VIEW = -1;
const int SPHERE = 0;
const int TUNNEL = 1;
const int CUBE = 2;
const int LIGHT = 3;
const int HOMMELI = 4;
const int DRUM = 5;
const int DEBUG = 10;

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

float sdLink(vec3 p, float le, float r1, float r2) {
  vec3 q = vec3(p.x, max(abs(p.y) - le, 0.0f), p.z);
  return length(vec2(length(q.xy) - r1, q.z)) - r2;
}

float sdCube(vec3 p, vec3 b) {
  vec3 i_q = abs(p) - b;
  return length(max(i_q, 0.0f)) + min(max(i_q.x, max(i_q.y, i_q.z)), 0.0f);
}

// Valojen sijainnit ja värit - TODO: nämäkin voisi siirtää täältä pois ja laskea vain kerran

vec3 lightPosition(int index) {
  float x = sin(TIME * 2.0f + float(index) * 1.1f);
  float z = cos(TIME * 2.0f + float(index) * 0.76f);
  float y = 5.0f * cos(TIME * .2f + float(index) * 0.98f);
  return 2.0f * vec3(x, y, z);
}

vec3 lightColor(int index) {
  vec3 col = index % 2 == 0 ? vec3(50.0f, 0.0f, 25.0f) : vec3(0.0f, 25.0f, 50.0f);
  col *= LIGHT_INTENSITY;
  return col;
}

result lightOrb(vec3 p, int index) {
  return result(length(p - lightPosition(index)) - 0.1f, vec3(float(index)), LIGHT);
}

result lightOrbs(vec3 p) {
  result l = lightOrb(p, 0);
  for (int i = 1; i < int(NUMBER_OF_LIGHTS); i++) {
    l = opUnion(l, lightOrb(p, i));
  }
  return l;
}

// Pallot

result sphere(vec3 samplePoint) {
  float distort = 0.005f * sin(TIME * 0.1f) * sin(samplePoint.x * 15.0f) * sin(samplePoint.y * 15.0f) * sin(samplePoint.z * 15.0f);
  return result(length(samplePoint) - 1.0f + distort, samplePoint, SPHERE);
}

float smMin(float a, float b, float k) {
  float i_h = max(k - abs(a - b), 0.0f);
  return min(a, b) - i_h * i_h * 0.25f / k;
}

result smoothUnion(result a, result b, float k) {
  float dist = smMin(a.dist, b.dist, k);
  return result(dist, a.p, a.kind);
}

// Kuutiot

float opUnion(float distA, float distB) {
  return min(distA, distB);
}

float sdCubes(vec3 p, float w, vec3 s) {
  vec3 q = p - s * round(p / s);
  return sdCube(q, vec3(w, 0.8f, w));
}

float opDiff(float distA, float distB) {
  return max(distA, -distB);
}

result palkit(vec3 p) {
  float a = sdCubes(p, 0.1f + 0.04f * sin(length(p)), vec3(1.7f + 0.5f * sin(TIME_MOD)));
  float b = sdCubes(p, 0.05f, vec3(0.6f + 0.5f * sin(TIME_MOD * 2.7f)));
  float d = opDiff(a, b);
  return result(d, p, SPHERE);
}

// maggarat

float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb) {
  p.x = abs(p.x);
  float k = (sc.y * p.x > sc.x * p.y) ? dot(p.xy, sc) : length(p.xy);
  return sqrt(dot(p, p) + ra * ra - 2.0f * ra * k) - rb;
}

vec3 rotateY(vec3 p, float theta) {
  float i_c = cos(theta);
  float i_s = sin(theta);
  mat4 i_m = mat4(vec4(i_c, 0, i_s, 0), vec4(0, 1, 0, 0), vec4(-i_s, 0, i_c, 0), vec4(0, 0, 0, 1));
  return (i_m * vec4(p, 1.0f)).xyz;
}

vec3 rotateZ(vec3 p, float theta) {
  float i_c = cos(theta);
  float i_s = sin(theta);

  mat4 i_m = mat4(vec4(i_c, -i_s, 0, 0), vec4(i_s, i_c, 0, 0), vec4(0, 0, 1, 0), vec4(0, 0, 0, 1));
  return (i_m * vec4(p, 1.0f)).xyz;
}

vec3 rotateX(vec3 p, float theta) {
  float i_c = cos(theta);
  float i_s = sin(theta);

  mat4 i_m = mat4(vec4(1, 0, 0, 0), vec4(0, i_c, -i_s, 0), vec4(0, i_s, i_c, 0), vec4(0, 0, 0, 1));
  return (i_m * vec4(p, 1.0f)).xyz;
}

result maggarat(vec3 p) {
  p = rotateX(p, PI / 2.f);
  float z = p.z;
  p.z -= round(p.z);
  p = rotateZ(p, z * sin(TIME * 0.45f));

  float an = 0.5f + 2.5f * (0.5f + 0.5f * sin(TIME * 1.1f + 3.0f));
  vec2 c = vec2(sin(an), cos(an));
  float d = sdCappedTorus(p, c, 0.9f, 0.3f + 0.2f * sin(TIME * 0.7f + z));
  return result(d, p, SPHERE);
}

// Tunneli

vec2 tunnelUvMap(vec3 p) {
  vec3 d = normalize(p);
  float u = 0.5f + atan(d.z, d.x) / (2.0f * PI);
  return vec2(u, p.y * 0.05f + TIME * 0.5f);
}

float tunnelPrimitive(vec2 p) {
  float r = 5.0f;
  const vec3 k = vec3(-0.866025404f, 0.5f, 0.577350269f);
  p = abs(p);
  p -= 2.0f * min(dot(k.xy, p), 0.0f) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return -length(p) * sign(p.y);
}

result tunnel(vec3 p) {
  float d = tunnelPrimitive(p.xz);
  // float d = -length(p.xz) + 5.0f;
  // float d2 = -length(p.xz) + 4.97;
  //float wave = 0.025f * sin(length(p) * 32.0f + TIME);
  float t = d;// + wave; // max(d + wave, d2);

  return result(t, p, TUNNEL);
}

vec2 hommeliUvMap(vec3 p) {
  vec3 d = normalize(p);
  float u = 0.5f + atan(d.z, d.x) / (2.0f * PI);
  float dst = length(p.xz) * 0.05f;
  return vec2(u + dst, p.y * 0.05f);
}

// Pesurumpu

// const float drumRadius = 5.0f;
const float drumLength = 8.5f;
const float holeSize = 0.2f;

vec2 drumUvMap(vec3 p) {
  if (abs(p.y) < drumLength - EPSILON) {
    vec3 d = normalize(p);
    float u = 0.5f + atan(d.z, d.x) / (2.0f * PI);
    return vec2(u, p.y * 0.05f);
  }
  return p.xz / 10.0f;
}

float drumBody(vec3 p) {
  float d1 = ENV_FACTOR - length(p.xz);
  float dend = drumLength - abs(p.y);
  return min(d1, dend);
}

float drumHoles(vec3 p) {
  if (mod(abs(p.y + 20.5f), 2.0f) >= 1.0f) {
    p = rotateY(p, PI);
  }

  vec3 pn = normalize(p);
  float angle = atan(pn.z, pn.x);
  const float s = 3.0f;
  angle = round(angle * s) / s;

  float y = round(p.y);

  vec3 c = vec3(cos(angle) * ENV_FACTOR, y, sin(angle) * ENV_FACTOR);
  return length(p - c) - holeSize;
}

float opSmoothSubtraction(float d1, float d2, float k) {
  float h = clamp(0.5f - 0.5f * (d2 + d1) / k, 0.0f, 1.0f);
  return mix(d2, -d1, h) + k * h * (1.0f - h);
}

result drum(vec3 p) {
  float body = drumBody(p);
  float holes = drumHoles(p);
  float d = opDiff(opSmoothSubtraction(holes, body, 0.1f), body + 0.1f);

  return result(d, p, DRUM);
}

// Skene yhdistettynä

vec3 ballPos(int index) {
  float t = TIME + TIME_MOD;
  vec3 v = vec3(sin(t * 0.6f), cos(t * 0.5f), sin(t * 0.45f));
  return index == 0 ? v : -v;
}

result render(vec3 p) {
  result env = lightOrbs(p);
  if (ENV_GEOMETRY == 1.0f) {
    env = opUnion(tunnel(p), env);
  } else if (ENV_GEOMETRY == 2.0f) {
    env = opUnion(drum(p), env);
  }

  #ifdef RENDER_ENVIRONMENT_MAP
  return env;
  #endif

  if (OBJECT == 0.0f) {
    return env;
  } else if (OBJECT == 1.0f) {
    vec3 p1 = p - ballPos(0);
    vec3 p2 = p - ballPos(1);

    result balls = smoothUnion(sphere(p1), sphere(p2), 2.5f);

    return opUnion(balls, env);
  } else if (OBJECT == 2.0f) {
    return opUnion(palkit(p), env);
  }
  return opUnion(maggarat(p), env);
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
  return result(MAX_DIST, vec3(0.0f), OUT_OF_VIEW);
}

/**
 * Using the gradient of the SDF, estimate the normal on the surface at point p.
 */
vec3 estimateNormal(vec3 p) {
  return normalize(vec3(render(vec3(p.x + EPSILON, p.y, p.z)).dist - render(vec3(p.x - EPSILON, p.y, p.z)).dist, render(vec3(p.x, p.y + EPSILON, p.z)).dist - render(vec3(p.x, p.y - EPSILON, p.z)).dist, render(vec3(p.x, p.y, p.z + EPSILON)).dist - render(vec3(p.x, p.y, p.z - EPSILON)).dist));
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0f - F0) * pow(clamp(1.0f - cosTheta, 0.0f, 1.0f), 5.0f);
}

float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0f);
  float NdotH2 = NdotH * NdotH;

  float num = a2;
  float denom = (NdotH2 * (a2 - 1.0f) + 1.0f);
  denom = PI * denom * denom;

  return num / denom;
}

float geometryShlickGGX(float NdotV, float roughness) {
  float r = roughness + 1.0f;
  float k = (r * r) / 8.0f;

  float num = NdotV;
  float denom = NdotV * (1.0f - k) + k;

  return num / denom;
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0f);
  float NdotL = max(dot(N, L), 0.0f);

  float ggx2 = geometryShlickGGX(NdotV, roughness);
  float ggx1 = geometryShlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

const int NO_SHADOWS = 0;
const int BALL_SHADOWS = 1;
const float SHADOW_SMOOTHING = 0.33f; // pienempi -> pehmeämpi varjon reuna

float vectorIntersectsSphere(vec3 worldPos, vec3 spherePos, float radius, vec3 dir) {
  float a = dot(dir, dir);
  vec3 rayToSphere = worldPos - spherePos;
  float b = 2.0f * dot(dir, rayToSphere);
  float c = dot(rayToSphere, rayToSphere) - (radius * radius);
  return clamp(SHADOW_SMOOTHING * (4.0f * a * c - b * b), 0.0f, 1.0f);
}

float getShadowCoef(vec3 pos, vec3 lightPos) {
  vec3 dir = normalize(lightPos - pos);
  return min(vectorIntersectsSphere(pos, ballPos(0), 1.0f, dir), vectorIntersectsSphere(pos, ballPos(1), 1.0f, dir));
}

vec3 pbrReflectance(vec3 p, vec3 eye, vec3 albedo, float metallic, float roughness, float ambientOcclusion, float reflectCoef, int shadows) {
  vec3 N = estimateNormal(p);
  vec3 V = normalize(eye - p);

  vec3 F0 = vec3(0.04f); // most dielectric surfaces look visually correct with a constant F0 of 0.04
  F0 = mix(F0, albedo, metallic);

  vec3 lightColorSum = vec3(0.0f);
  for (int i = 0; i < int(NUMBER_OF_LIGHTS); i++) {
    vec3 lightPos = lightPosition(i);

    float distance = length(lightPos - p);

    float shadowCoef = 1.0f;
    if (shadows == BALL_SHADOWS) {
      shadowCoef = getShadowCoef(p, lightPos);
      if (shadowCoef < EPSILON) {
        continue;
      }
    }

    vec3 lightCol = lightColor(i);

    vec3 L = normalize(lightPos - p);
    vec3 H = normalize(V + L);

    float attenuation = 1.0f / (distance * distance);
    vec3 radiance = lightCol * attenuation;

    // Calculate the ratio between specular and diffuse reflection
    vec3 F = fresnelSchlick(clamp(dot(H, V), 0.0f, 1.0f), F0);

    // Calculate distribution
    float NDF = distributionGGX(N, H, roughness);
    float G = geometrySmith(N, V, L, roughness);

    // Calculate specular
    vec3 specularNum = NDF * G * F;
    float specularDenom = 4.0f * max(dot(N, V), 0.0f) * max(dot(N, L), 0.0f) + 0.0001f;
    vec3 specular = specularNum / specularDenom;

    vec3 kSpecular = F;
    vec3 kDiffuse = vec3(1.0f) - kSpecular;
    kDiffuse *= 1.0f - metallic;

    float NdotL = max(dot(N, L), 0.0f);
    lightColorSum += (kDiffuse * albedo / PI + specular) * radiance * NdotL * shadowCoef;
  }

  vec3 ambient = vec3(0.03f) * albedo * ambientOcclusion;

  #ifndef RENDER_ENVIRONMENT_MAP
  vec3 reflection = vec3(0.0f);
  if (metallic > 0.0f && reflectCoef > 0.0f) {
    vec3 R = reflect(V, N);
    reflection = texture(ENVIRONMENT_SAMPLER, R).rgb * metallic * reflectCoef;
  }

  return ambient + lightColorSum + reflection;
  #else
  return ambient + lightColorSum;
  #endif
}

vec2 sphereUvMap(vec3 d) {
  float u = 0.5f + atan(d.z, d.x) / (2.0f * PI);
  float v = 0.5f + asin(d.y) / PI;
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

    return pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion, 0.5f, NO_SHADOWS);
  }
  #endif

  if (r.kind == TUNNEL) {
    vec2 uv = tunnelUvMap(r.p);

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    vec3 color = pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion, 0.0f, BALL_SHADOWS);
    return color * vec3(0.25f, 0.5f, 1.0f);
  }

  if (r.kind == DRUM) {
    vec2 uv = drumUvMap(r.p);

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    vec3 color = pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion, 0.0f, BALL_SHADOWS);
    return color * vec3(0.25f, 0.5f, 1.0f);
  }

  if (r.kind == HOMMELI) {
    vec2 uv = hommeliUvMap(r.p);

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    vec3 color = pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion, 0.0f, BALL_SHADOWS);
    return color * vec3(0.25f, 0.5f, 1.0f);
  }

  if (r.kind == LIGHT) {
    return lightColor(int(r.p.r)) + vec3(1.0f);
  }

  #ifndef RENDER_ENVIRONMENT_MAP
  if (r.kind == CUBE) {
    return texture(ENVIRONMENT_SAMPLER, r.p).rgb;
  }
  #endif

  if (r.kind == DEBUG) {
    return vec3(1.0f, 0.5f, 0.0f);
  }

  return vec3(1.0f);
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  size *= 0.5f;
  vec2 i_xy = fragCoord - size;
  float i_z = size.y / tan(radians(fieldOfView) / 2.0f);
  return normalize(vec3(i_xy, -i_z));
}

void main() {
  vec3 color = vec3(0.0f);

  float fieldOfView = CAMERA_FOV;
  vec3 viewDir = rayDirection(fieldOfView, RESOLUTION.xy, gl_FragCoord.xy);
  vec3 worldDir = (VIEW_MATRIX * vec4(viewDir, 0.0f)).xyz;

  result hitInfo = shortestDistanceToSurface(CAMERA_POS, worldDir);

  if (hitInfo.dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    color = vec3(0.0f, 0.0f, 0.0f);
  } else {
    vec3 p = CAMERA_POS + hitInfo.dist * worldDir;
    color = calcMaterial(p, CAMERA_POS, hitInfo);
  }

  FRAG_COLOR = vec4(color, hitInfo.dist);
}