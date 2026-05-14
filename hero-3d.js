/* =====================================================================
   HERO 3D — Sacola Qualità em WebGL (Three.js)
   PlaneGeometry com textura PNG + vertex shader fBm distortion
   Mouse parallax + auto-rotate + suspende fora do viewport
   ===================================================================== */

import * as THREE from 'three';

const canvas = document.getElementById('hero3d');
if (!canvas) {
  console.warn('[hero-3d] canvas #hero3d não encontrado');
} else {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  if (reduced || isCoarse || window.innerWidth < 1100) {
    // Skip 3D em mobile / reduced motion
  } else {
    init3D();
  }

  function init3D() {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 5;

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // Carrega a textura do PNG real
    const texLoader = new THREE.TextureLoader();
    const texture = texLoader.load(
      'assets/sacola-mascote.png',
      () => {
        // quando textura carrega, mostra o canvas
        canvas.classList.add('is-ready');
      },
      undefined,
      (err) => console.warn('[hero-3d] falhou texture', err)
    );
    if ('SRGBColorSpace' in THREE) texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Plane bem segmentado pra distortion suave
    const geometry = new THREE.PlaneGeometry(2.8, 4.0, 64, 64);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime:    { value: 0 },
        uMouseX:  { value: 0 },
        uMouseY:  { value: 0 },
        uAmp:     { value: 0.06 },
      },
      transparent: true,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uMouseX;
        uniform float uMouseY;
        uniform float uAmp;
        varying vec2 vUv;
        varying float vWave;

        // fBm noise simples
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f*f*(3.0-2.0*f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Distorção orgânica baseada em noise + tempo
          float n = noise(vec2(uv.x * 3.5 + uTime * 0.6, uv.y * 4.0 - uTime * 0.4));
          float wave = sin(pos.y * 2.5 + uTime * 1.2) * uAmp;
          wave += cos(pos.x * 1.8 + uTime * 0.9) * uAmp * 0.7;
          wave += (n - 0.5) * uAmp * 1.6;

          pos.z += wave;
          pos.x += uMouseX * 0.35;
          pos.y += uMouseY * 0.25;

          vWave = wave;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          // Ligeiro chromatic shift baseado na onda — efeito "plástico"
          vec2 offset = vec2(vWave * 0.02, 0.0);
          float r = texture2D(uTexture, vUv + offset).r;
          float g = texture2D(uTexture, vUv).g;
          float b = texture2D(uTexture, vUv - offset).b;
          float a = texture2D(uTexture, vUv).a;
          // Brilho sutil onde a onda é positiva
          float highlight = max(vWave, 0.0) * 1.5;
          vec3 col = vec3(r, g, b) + highlight * vec3(0.15, 0.15, 0.10);
          gl_FragColor = vec4(col, a);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Luzes não são necessárias pois o material é shader-only.

    // Mouse parallax
    let mxTarget = 0, myTarget = 0;
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mxTarget = (e.clientX / window.innerWidth - 0.5) * 2;
      myTarget = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Rotação alvo (mouse + auto-rotate)
    let rotYTarget = 0, rotXTarget = 0;

    // Visibilidade — suspende quando hero sai do viewport
    let visible = true;
    const hero = document.getElementById('hero');
    if (hero) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          visible = e.isIntersecting;
          if (visible) tick();
        });
      });
      io.observe(hero);
    }

    const clock = new THREE.Clock();
    function tick() {
      if (!visible) return;
      requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = material.uniforms.uTime.value + dt;
      material.uniforms.uTime.value = t;

      // Mouse interpolation (smoothing)
      mx += (mxTarget - mx) * 0.05;
      my += (myTarget - my) * 0.05;
      material.uniforms.uMouseX.value = mx;
      material.uniforms.uMouseY.value = my;

      // Rotação: auto-rotate Y + mouse tilt
      rotYTarget = mx * 0.4 + t * 0.06;
      rotXTarget = my * 0.25;
      mesh.rotation.y += (rotYTarget - mesh.rotation.y) * 0.05;
      mesh.rotation.x += (rotXTarget - mesh.rotation.x) * 0.05;

      // Subtle bobbing
      mesh.position.y = Math.sin(t * 0.8) * 0.08;

      renderer.render(scene, camera);
    }
    tick();

    console.log('%c Hero 3D ativo — Three.js + shader distortion ', 'background:#2A5238;color:#E8B931;padding:6px 12px;');
  }
}
