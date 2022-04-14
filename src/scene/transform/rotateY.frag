vec3 rotateY(vec3 p, float theta) {
    float c = cos(theta);
    float s = sin(theta);

    mat4 m = mat4(vec4(c, 0, s, 0), vec4(0, 1, 0, 0), vec4(-s, 0, c, 0), vec4(0, 0, 0, 1));
    return (m * vec4(p, 1.0)).xyz;
}

#pragma glslify: export(rotateY)