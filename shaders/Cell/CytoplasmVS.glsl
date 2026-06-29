#define Transform(pos) (WorldViewProjection * (pos))
#define WorldViewProjection uProjection

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec4 a_texCoord0;

uniform mat4 uProjection;

varying vec4 v_texCoord;
varying vec4 v_color;

#define Position a_position
#define Color a_color
#define Scaling a_texCoord0

uniform vec2 Centre;
uniform float CytoplasmScale;

void main() 
{
    vec2 pos;

    if (Scaling.z == 1.0)
    {
        pos = Position.xy + Scaling.xy * CytoplasmScale;
    }
    else
    {
        pos = Position.xy * CytoplasmScale + Centre * (1.0 - CytoplasmScale);
    }
    gl_Position = Transform(vec4(pos, Position.z, Position.w));

    v_texCoord = a_texCoord0;
    v_color = a_color;
}