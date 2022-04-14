vec4 opRIntersect(vec4 a, vec4 b) {
    return a.x > b.x ? a : b;
}

#pragma glslify: export(opRIntersect)