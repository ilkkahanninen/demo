/**
 * Signed distance function for a cube centered at the origin
 * with width = height = length = 2.0
 */
float cube(vec3 p, vec3 b) {
    vec3 i_q = abs(p) - b;
    return length(max(i_q, 0.0)) + min(max(i_q.x, max(i_q.y, i_q.z)), 0.0);
}

#pragma glslify: export(cube)
