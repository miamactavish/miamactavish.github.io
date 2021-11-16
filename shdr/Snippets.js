var Snippets = {
  'DefaultVertex': ['precision highp float;', 'attribute vec3 position;', 'attribute vec3 normal;', 'uniform mat3 normalMatrix;', 'uniform mat4 modelViewMatrix;', 'uniform mat4 projectionMatrix;', 'uniform mat2 faceVertexUvs;', 'varying vec3 fNormal;', 'varying vec3 fPosition;', 'varying vec2 vUv;', '', 'void main()', '{', '  vUv = faceVertexUvs * vec2(1, 1);', '  fNormal = normalize(normalMatrix * normal);', '  vec4 pos = modelViewMatrix * vec4(position, 1.0);', '  fPosition = pos.xyz;', '  gl_Position = projectionMatrix * pos;', '}'].join('\n'),
  'DefaultFragment': ['precision highp float;', 'uniform float time;', 'uniform vec2 resolution;', 'varying vec3 fPosition;', 'varying vec3 fNormal;', 'varying vec2 vUv;', 'uniform vec3 objectColor;', '', 'void main()', '{', '  gl_FragColor = vec4(fNormal, 1.0);', '}'].join('\n'),
  'DefaultUniforms': ['vec3 objectColor = vec3(1.0, 0.0, 0.0);', 'sampler2D my_texture = "textures/beanie.jpg";'].join('\n'),
  'Texture': ['precision highp float;', 'uniform float time;', 'uniform vec2 resolution;', 'varying vec3 fPosition;', 'varying vec3 fNormal;', 'uniform sampler2D my_texture;', '', 'void main()', '{', '  vec4 color = texture2D(my_texture, vec2((0.4 * fNormal.x) + 0.6, (0.4 * fNormal.y) + 0.4));', '  gl_FragColor = vec4(color.x, color.y, color.z, 1.0);', '}'].join('\n'),
  'DemoVertex': ['precision highp float;', 'attribute vec3 position;', '', 'void main()', '{', '  gl_Position = vec4(position, 1.0);', '}'].join('\n'),
  'DemoFragment': ['precision highp float;', '', 'uniform float time;', 'uniform vec2 resolution;', '', 'uniform mat4 modelViewMatrix;', 'uniform mat4 projectionMatrix;', '', 'void main()', '{', '  vec2 pixel = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;', '  pixel.x *= resolution.x/resolution.y;', '  gl_FragColor = vec4(pixel,.0,1.);', '}'].join('\n'),
  'ExtractCameraPosition': ['vec3 ExtractCameraPos(mat4 a_modelView)', '{', '  mat3 rotMat =mat3(a_modelView[0].xyz,a_modelView[1].xyz,a_modelView[2].xyz);', '  vec3 d =  a_modelView[3].xyz;', '  vec3 retVec = -d * rotMat;', '  return retVec;', '}'].join('\n'),
  'GetDirection': ['vec3 getDirection(vec3 origine, vec2 pixel)', '{', '  vec3 ww = normalize(vec3(0.0) - origine);', '  vec3 uu = normalize(cross( vec3(0.0,1.0,0.0), ww ));', '  vec3 vv = normalize(cross(ww,uu));', '  return normalize( pixel.x*uu + pixel.y*vv + 1.5*ww );', '}'].join('\n'),

  'TextureFragment': `precision highp float;
uniform sampler2D tex;
varying vec2 fPosition;
varying vec2 fUv;

void main()
{
  gl_FragColor = texture2D(tex, fUv);
}`,
  'BlinnPhongFragment': `precision highp float;
uniform float time;
uniform vec2 resolution;
uniform vec3 objectColor;
varying vec3 fPosition;
varying vec3 fNormal;
varying mat4 fModelView;

// Code provided to us from the website - give it the modelview matrix, it returns the camera's position
vec3 ExtractCameraPos(mat4 a_modelView)
{
  mat3 rotMat =mat3(a_modelView[0].xyz,a_modelView[1].xyz,a_modelView[2].xyz);
  vec3 d =  a_modelView[3].xyz;
  vec3 retVec = -d * rotMat;
  return retVec;
}

void main()
{
  // We're setting up our own configuration for lighting:
  vec3 lightPos = vec3(2.0, 0.0, 2.0);
  vec3 lightDir = normalize(lightPos - fPosition); // Vector from fragment position to light position
  vec3 lightColor = vec3(1.0, 1.0, 1.0); // White light
  
  // Blinn-Phong shading has three components: ambient, diffuse, and specular
  
  // Ambient component
  vec3 ambient = 0.25 * lightColor; // Doesn't have to be 0.25, can adjust for different intensities 
  
  // Diffuse component (flat shading)
  float diff = max(dot(lightDir, fNormal), 0.0); // Tells us how much this fragment is facing the light
  vec3 diffuse = diff * lightColor;
  
  // Specular component (reflections from light)
  // Need the direction from the fragment to the light, and to the camera
  
  vec3 reflectDir = reflect(-lightDir, fNormal);
  
  vec3 viewPos = ExtractCameraPos(fModelView);
  vec3 viewDir = normalize(viewPos - fPosition);
  
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = 0.5 * spec * lightColor; // Again, doesn't need to be 0.5 - just reduces the intensity a bit
  
  // Color of the object
  vec3 color = objectColor;
  
  gl_FragColor = vec4((ambient + diffuse) * color + (specular * lightColor), 1.0);

}`,
'BlinnPhongVertex': `precision highp float;
attribute vec3 position;
attribute vec3 normal;
uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 fNormal;
varying vec3 fPosition;
varying mat4 fModelView;

void main()
{
  fModelView = modelViewMatrix;
  fNormal = normalize(normalMatrix * normal);
  vec4 pos = modelViewMatrix * vec4(position, 1.0);
  fPosition = pos.xyz;
  gl_Position = projectionMatrix * pos;
}`,
'ViewDepthBuffer': `precision highp float;
uniform sampler2D depth_buffer;
varying vec2 fPosition;
varying vec2 fUv;

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
  return ( viewZ + near ) / ( near - far );
}

float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
  return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

float readDepth( sampler2D depthSampler, vec2 coord ) {
  float cameraNear = 0.1;
  float cameraFar = 100.0;
	float fragCoordZ = texture2D( depthSampler, coord ).x;

	float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );

	return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

void main() {
	float depth = readDepth( depth_buffer, fUv );

	gl_FragColor.rgb = 1.0 - vec3( depth );
	gl_FragColor.a = 1.0;
}`,
  
};

window.shdr.Snippets = Snippets;

var hiddenSnippets = {
  'TextureVertex': `precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 fUv;
varying vec2 fPosition;

void main()
{
  fUv = uv;
  vec4 pos = modelViewMatrix * vec4(position, 1.0);
  fPosition = pos.xy;
  gl_Position = projectionMatrix * pos;
}`,
}

window.shdr.HiddenSnippets = hiddenSnippets;
