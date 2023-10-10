#pragma glslify: smMin = require("./smMin.frag")

float smUnion(float distA, float distB, float k) {
    return smMin(distA, distB, k);
}

#pragma glslify: export(smUnion)
