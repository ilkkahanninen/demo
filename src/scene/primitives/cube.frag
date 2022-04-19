/**
 * Signed distance function for a cube centered at the origin
 * with width = height = length = 2.0
 */
float cube(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

#pragma glslify: export(cube)
