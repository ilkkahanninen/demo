float smMin(float a, float b, float k) {
    float i_h = max(k - abs(a - b), 0.0);
    return min(a, b) - i_h * i_h * 0.25 / k;
}

#pragma glslify: export(smMin)
