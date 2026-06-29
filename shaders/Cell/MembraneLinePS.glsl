precision mediump float;

varying vec4 v_color;

const float MembraneLineBrightness = 0.8;

void main()
{
    gl_FragColor = v_color;
    gl_FragColor.rgb *= MembraneLineBrightness;
}