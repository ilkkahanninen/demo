vec2 opRDiff(vec2 a, vec2 b) {
    return a.x > -b.x ? a : vec2(-b.x, b.y);
}

#pragma glslify: export(opRDiff)