precision highp float;

/**
 * Signed distance function for a cube centered at the origin
 * with width = height = length = 2.0
 */
float cube(vec3 p) {
    vec3 d = abs(p) - vec3(1.0, 1.0, 1.0);
    float insideDistance = min(max(d.x, max(d.y, d.z)), 0.0);
    float outsideDistance = length(max(d, 0.0));
    return insideDistance + outsideDistance;
}

#pragma glslify: export(cube)
