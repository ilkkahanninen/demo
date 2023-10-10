vec2 opRUnion(vec2 a, vec2 b) {
    return a.x < b.x ? a : b;
}

#pragma glslify: export(opRUnion)
