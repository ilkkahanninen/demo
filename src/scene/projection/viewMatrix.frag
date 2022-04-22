/**
 * Return a transform matrix that will transform a ray from view space
 * to world coordinates, given the eye point, the camera target, and an up vector.
 *
 * This assumes that the center of the camera is aligned with the negative z axis in
 * view space when calculating the ray marching direction. See rayDirection.
 */
mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
    // Based on gluLookAt man page
    vec3 i_f = normalize(center - eye);
    vec3 i_s = normalize(cross(i_f, up));
    vec3 i_u = cross(i_s, i_f);
    return mat4(vec4(i_s, 0.0), vec4(i_u, 0.0), vec4(-i_f, 0.0), vec4(0.0, 0.0, 0.0, 1));
}

#pragma glslify: export(viewMatrix)