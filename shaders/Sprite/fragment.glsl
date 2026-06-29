precision mediump float;

varying vec4 v_texCoord;
varying vec4 v_color;

uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_texCoord.xy) * v_color;
}