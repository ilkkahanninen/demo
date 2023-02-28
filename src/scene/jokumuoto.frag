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
uniform float RENDER_BALLS;
uniform float LIGHT_INTENSITY;

const int OUT_OF_VIEW = -1;
const int OBJ = 0;
const int LIGHT = 1;
const int ENVCUBE = 2;
const int CUT = 3;

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

result opDiff(result a, result b) {
  if (a.dist > -b.dist) {
    return a;
  }
  return result(-b.dist, a.p, a.kind);
}

// Valojen sijainnit ja värit - TODO: nämäkin voisi siirtää täältä pois ja laskea vain kerran

vec3 lightPosition(int index) {
  #ifndef RENDER_ENVIRONMENT_MAP
  if (index == 2)
    return vec3(0.);
  #endif
  float x = 3.0 * sin(RENDER_BALLS * 2.0 + float(index) * 1.1);
  float z = 3.0 * cos(RENDER_BALLS * 2.0 + float(index) * 1.1);
  float y = 3.0 * cos(RENDER_BALLS * .2 + float(index) * 0.98);
  return vec3(x, y, z);
}

vec3 lightColor(int index) {
  #ifndef RENDER_ENVIRONMENT_MAP
  if (index == 2)
    return vec3(300., 100., 0.) * LIGHT_INTENSITY;
  #endif
  vec3 col = index == 0 ? vec3(180.0, 1.5, 0.5) : vec3(2.0, 1.90, 180.0);
  col *= LIGHT_INTENSITY;
  return col;
}

result lightOrb(vec3 p, int index) {
  return result(length(p - lightPosition(index)) - 0.1, vec3(float(index)), LIGHT);
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
  return result(length(samplePoint) - 1.0, samplePoint, OBJ);
}

result cutSphere(vec3 samplePoint) {
  return result(length(samplePoint) - 1.0, samplePoint, CUT);
}

float smMin(float a, float b, float k) {
  float i_h = max(k - abs(a - b), 0.0);
  return min(a, b) - i_h * i_h * 0.25 / k;
}

result smoothUnion(result a, result b, float k) {
  float dist = smMin(a.dist, b.dist, k);
  return result(dist, a.p, a.kind);
}

// Kuutio

result cube(vec3 p) {
  vec3 b = vec3(1.);
  vec3 i_q = abs(p) - b;
  float dist = length(max(i_q, 0.0)) + min(max(i_q.x, max(i_q.y, i_q.z)), 0.0);
  return result(dist, p, OBJ);
}

result envCube(vec3 p) {
  vec3 b = vec3(3.);
  vec3 i_q = abs(p) - b;
  float dist = length(max(i_q, 0.0)) + min(max(i_q.x, max(i_q.y, i_q.z)), 0.0);
  return result(-dist, p, ENVCUBE);
}

// Skene yhdistettynä

result render(vec3 p) {
  vec3 q = p;

  if (ENV_FACTOR > 0.0) {
    float k = ENV_FACTOR;
    float c = cos(k * p.y);
    float s = sin(k * p.y);
    mat2 m = mat2(c, -s, s, c);
    q = vec3(m * p.xz, p.y);
  }

  result env = lightOrbs(p);
  env = opUnion(envCube(p), env);

  #ifdef RENDER_ENVIRONMENT_MAP
  return env;
  #endif

  result cut = sphere(q + vec3(0.5));
  cut = opUnion(cut, sphere(q - vec3(0.5)));

  result foo = opDiff(cube(q), cut);

  // if (length(p) < 5.0) {
  vec3 c = vec3(0.0);
  vec3 r = mod(q * 5.0 + 0.5 * c, c) - 0.5 * c;
  foo = opUnion(foo, cutSphere(r));
  // }

  foo = opUnion(foo, sphere(q * 1.5 + vec3(0.6)));
  foo = opUnion(foo, sphere(q * 1.5 - vec3(0.6)));

  foo.dist -= 0.05 + 0.001 * sin(20. * q.x) * sin(20. * q.y) * sin(20. * q.z);

  return opUnion(foo, env);
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

const int NO_SHADOWS = 0;
const int CUBE_SHADOWS = 1;

float getShadowCoef(vec3 pos, vec3 lightPos) {
  vec3 dir = normalize(lightPos - pos);
  result r = shortestDistanceToSurface(pos, dir);
  return r.kind == OBJ ? 0.0 : 1.0;
}

vec3 pbrReflectance(vec3 p, vec3 eye, vec3 albedo, float metallic, float roughness, float ambientOcclusion, float reflectCoef, int shadows) {
  vec3 N = estimateNormal(p);
  vec3 V = normalize(eye - p);

  vec3 F0 = vec3(0.04); // most dielectric surfaces look visually correct with a constant F0 of 0.04
  F0 = mix(F0, albedo, metallic);

  vec3 lightColorSum = vec3(0.0);
  for (int i = 0; i < int(NUMBER_OF_LIGHTS); i++) {
    vec3 lightPos = lightPosition(i);

    float distance = length(lightPos - p);

    float shadowCoef = 1.0;
    if (shadows == CUBE_SHADOWS) {
      shadowCoef = getShadowCoef(p, lightPos);
      if (shadowCoef < EPSILON) {
        continue;
      }
    }

    vec3 lightCol = lightColor(i);

    vec3 L = normalize(lightPos - p);
    vec3 H = normalize(V + L);

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

    float NdotL = max(dot(N, L), 0.0);
    lightColorSum += (kDiffuse * albedo / PI + specular) * radiance * NdotL * shadowCoef;
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
  if (r.kind == OBJ) {
    vec2 uv = sphereUvMap(normalize(r.p));

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    return pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion, 0.5, NO_SHADOWS);
  }
  #endif

  if (r.kind == LIGHT) {
    return lightColor(int(r.p.r)) + vec3(1.0);
  }

  if (r.kind == ENVCUBE) {
    vec2 uv = vec2(TIME, TIME);
    vec2 uv2 = sphereUvMap(normalize(r.p));

    vec3 albedo = texture(ALBEDO_SAMPLER, uv).rgb;
    float metallic = texture(METALLIC_SAMPLER, uv).r;
    float roughness = texture(ROUGHNESS_SAMPLER, uv).r;
    float ambientOcclusion = texture(AO_SAMPLER, uv).r;

    vec3 line = vec3(0.);
    if (mod(uv2.x, 0.05) < 0.001) {
      line = LIGHT_INTENSITY * vec3(5.0 + 5.0 * sin(uv2.x * 2. * PI + TIME * 3.0));
    }

    return line + 0.2 * pbrReflectance(p, eye, albedo, metallic, roughness, ambientOcclusion, 0.5, CUBE_SHADOWS);
  }

  if (r.kind == CUT) {
    return vec3(1.);
  }

  return vec3(0.0);
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  size *= 0.5;
  vec2 i_xy = fragCoord - size;
  float i_z = size.y / tan(radians(fieldOfView) / 2.0);
  return normalize(vec3(i_xy, -i_z));
}

void main() {
  vec3 color = vec3(0.0);

  float fieldOfView = CAMERA_FOV;
  vec3 viewDir = rayDirection(fieldOfView, RESOLUTION.xy, gl_FragCoord.xy);
  vec3 worldDir = (VIEW_MATRIX * vec4(viewDir, 0.0)).xyz;

  result hitInfo = shortestDistanceToSurface(CAMERA_POS, worldDir);

  if (hitInfo.dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    color = vec3(0.0, 0.0, 0.0);
  } else {
    vec3 p = CAMERA_POS + hitInfo.dist * worldDir;
    color = calcMaterial(p, CAMERA_POS, hitInfo);
  }

  FRAG_COLOR = vec4(color, 1.0);
}