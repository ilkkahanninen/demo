precision highp float;

/**
 * Signed distance function for a sphere centered at the origin with radius 1.0;
 */
float sphere(vec3 samplePoint) {
    return length(samplePoint) - 1.0;
}

// Exports
#pragma glslify: export(sphere)
