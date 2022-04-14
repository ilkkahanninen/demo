vec4 opRDiff(vec4 a, vec4 b) {
    return a.x > -b.x ? a : vec4(-b.x, b.y, b.z, b.w);
}

#pragma glslify: export(opRDiff)