#pragma glslify: smMax = require("./smMax.frag")

float smDiff(float distA, float distB, float k) {
    return smMax(distA, -distB, k);
}

#pragma glslify: export(smDiff)
