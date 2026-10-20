import * as THREE from 'three';
import { blackholeRay } from '../../lib/discovery/cosmos';
/** Synthetic sky only. Radial deflection samples come from the same Schwarzschild null ODE as the evidence ray. */
export function blackholeSky() {
  const count = 256,
    min = 3 * Math.sqrt(3) + 0.0001,
    max = 24,
    data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const b = min + ((max - min) * i) / (count - 1),
      ray = blackholeRay(b);
    data[4 * i] = ray.phi - Math.PI + 2 * Math.asin(b / 80);
    data[4 * i + 3] = 1;
  }
  const map = new THREE.DataTexture(data, count, 1, THREE.RGBAFormat, THREE.FloatType);
  map.minFilter = THREE.NearestFilter;
  map.magFilter = THREE.NearestFilter;
  map.needsUpdate = true;
  const material = new THREE.ShaderMaterial({
    uniforms: {
      bending: { value: map },
      aspect: { value: 1.7 },
      orientation: { value: new THREE.Matrix3() },
      probe: { value: 6 },
    },
    vertexShader:
      'varying vec2 uvScreen; void main(){uvScreen=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `
 precision highp float;uniform sampler2D bending;uniform float aspect;uniform mat3 orientation;uniform float probe;varying vec2 uvScreen;
 float hash(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
 vec3 sky(vec3 d){float lon=atan(d.z,d.x),lat=asin(clamp(d.y,-1.,1.));vec2 p=vec2(lon,lat);vec2 grid=p*vec2(110.,100.);vec2 cell=floor(grid),f=fract(grid)-.5;float star=pow(max(0.,1.-length(f)/.21),5.)*step(.992,hash(cell));float dust=(.5+.5*sin(lon*9.+sin(lat*16.)))*(.55+.45*sin(lon*27.-lat*9.));float band=exp(-pow((lat-.25*sin(lon*2.))/.13,2.));vec3 gas=mix(vec3(.12,.18,.3),vec3(.75,.47,.23),dust)*band*.75;return vec3(.012,.022,.046)+gas+star*mix(vec3(.45,.75,1.),vec3(1.,.85,.6),hash(cell+8.))*3.;}
 void main(){vec2 q=(uvScreen-.5)*vec2(aspect,1.)*26.;float b=length(q);float critical=5.196152423;
 if(b<critical){gl_FragColor=vec4(.001,.003,.008,1.);return;}
 float index=clamp((b-5.196252423)/(24.-5.196252423),0.,1.);float bend=texture2D(bending,vec2(index,.5)).r;
 // Incoming screen angle at r=80 plus outward geodesic deflection; synthetic radiance conserves surface brightness.
 float theta=asin(clamp(b/80.,0.,1.))+bend;vec2 az=q/max(b,.0001);vec3 d=normalize(vec3(sin(theta)*az,cos(theta)));vec3 color=sky(orientation*d);
 float selected=1.-smoothstep(.018,.035,abs(b-probe));color=mix(color,vec3(.18,.72,.84),selected*.42);
 gl_FragColor=vec4(color,1.);}
 `,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 100;
  material.depthTest = false;
  material.depthWrite = false;
  return {
    mesh,
    update(camera: THREE.Camera, aspect: number, probe: number) {
      material.uniforms.orientation!.value.setFromMatrix4(camera.matrixWorld);
      material.uniforms.aspect!.value = aspect;
      material.uniforms.probe!.value = probe;
    },
    dispose() {
      map.dispose();
    },
  };
}
export function starField() {
  const points = new Float32Array(1200),
    random = (n: number) => {
      const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return v - Math.floor(v);
    };
  for (let i = 0; i < 400; i++) {
    const az = random(i * 3) * Math.PI * 2,
      y = 2 * random(i * 3 + 1) - 1,
      r = 40;
    points.set(
      [r * Math.sqrt(1 - y * y) * Math.cos(az), r * y, r * Math.sqrt(1 - y * y) * Math.sin(az)],
      i * 3,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: '#9cb9db',
      size: 0.07,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
    }),
  );
}
export function stellarMaterial(color: string) {
  return new THREE.ShaderMaterial({
    uniforms: { tint: { value: new THREE.Color(color) } },
    vertexShader:
      'varying vec2 vUv; varying vec3 normalView; varying vec3 eye;void main(){vUv=uv;normalView=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader:
      'uniform vec3 tint;varying vec2 vUv;varying vec3 normalView;varying vec3 eye;void main(){float noise=sin(vUv.x*180.+sin(vUv.y*93.)*3.)*sin(vUv.y*150.+sin(vUv.x*70.));float limb=.55+.45*max(0.,dot(normalize(normalView),normalize(eye)));gl_FragColor=vec4(tint*(limb+noise*.07),1.);}',
  });
}
export function glow(color: string, radius: number) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!,
    gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,.65)');
  gradient.addColorStop(0.22, 'rgba(255,255,255,.22)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const map = new THREE.CanvasTexture(c),
    sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map,
        color,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.75,
      }),
    );
  sprite.scale.setScalar(radius * 7);
  return sprite;
}
