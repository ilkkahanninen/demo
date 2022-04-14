vec4 opRUnion(vec4 a, vec4 b) {
    return a.x < b.x ? a : b;
}

#pragma glslify: export(opRUnion)
