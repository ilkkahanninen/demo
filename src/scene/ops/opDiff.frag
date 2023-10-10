float opDiff(float distA, float distB) {
    return max(distA, -distB);
}

#pragma glslify: export(opDiff)