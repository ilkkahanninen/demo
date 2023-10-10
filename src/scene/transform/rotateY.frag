vec3 rotateY(vec3 p, float theta) {
    float i_c = cos(theta);
    float i_s = sin(theta);

    mat4 i_m = mat4(vec4(i_c, 0, i_s, 0), vec4(0, 1, 0, 0), vec4(-i_s, 0, i_c, 0), vec4(0, 0, 0, 1));
    return (i_m * vec4(p, 1.0)).xyz;
}

#pragma glslify: export(rotateY)