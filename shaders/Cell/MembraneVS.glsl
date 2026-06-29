#define Transform(pos) (WorldViewProjection * (pos))
#define WorldViewProjection uProjection

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec4 a_texCoord0;

uniform mat4 uProjection;

varying vec4 v_texCoord;
varying vec4 v_color;

void main() 
{
    gl_Position = Transform(a_position);
    v_texCoord = a_texCoord0;
    v_color = a_color;
}