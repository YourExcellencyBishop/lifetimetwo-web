precision mediump float;

varying vec4 v_color;

const float  CytoplasmBrightness = 1.1;

void main()
{
    gl_FragColor = v_color;
    gl_FragColor.rgb *= CytoplasmBrightness;
}