/* =====================================================================
   ECOSYSTEM 3D — Constelação Three.js
   Logo central + 4 sacolas orbitando + linhas conectando + labels HTML
   Inspirado em "NEO Home Robot" e tutoriais iron.coding/Jimi Barkway
   ===================================================================== */

import * as THREE from 'three';

const canvas = document.getElementById('ecosystem3d');
if (!canvas) {
  console.warn('[ecosystem-3d] canvas não encontrado');
} else {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) initEcosystem();

  function initEcosystem() {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0.5, 6);
    camera.lookAt(0, 0, 0);

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // ====== Grupo principal (rotaciona inteiro) ======
    const group = new THREE.Group();
    scene.add(group);

    // ====== NÚCLEO CENTRAL — esfera dourada pulsando ======
    const coreGroup = new THREE.Group();
    group.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(0.55, 2);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0xE8B931) },
        uColorB: { value: new THREE.Color(0xB8841E) }
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vNormal;
        varying float vDisp;
        float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float noise(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          vec3 u = f*f*(3.0-2.0*f);
          float a = hash(i);
          float b = hash(i + vec3(1,0,0));
          float c = hash(i + vec3(0,1,0));
          float d = hash(i + vec3(1,1,0));
          float e = hash(i + vec3(0,0,1));
          float f1 = hash(i + vec3(1,0,1));
          float g = hash(i + vec3(0,1,1));
          float h = hash(i + vec3(1,1,1));
          return mix(mix(mix(a,b,u.x), mix(c,d,u.x), u.y),
                     mix(mix(e,f1,u.x), mix(g,h,u.x), u.y), u.z);
        }
        void main() {
          vNormal = normal;
          float n = noise(position * 2.0 + vec3(0.0, uTime * 0.3, 0.0));
          float disp = (n - 0.5) * 0.18;
          vDisp = disp;
          vec3 pos = position + normal * disp;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec3 vNormal;
        varying float vDisp;
        void main() {
          float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 col = mix(uColorB, uColorA, fresnel + vDisp * 1.5);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(core);

    // Halo ao redor do core
    const haloGeo = new THREE.RingGeometry(0.75, 0.78, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xE8B931,
      transparent: true,
      opacity: .3,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    coreGroup.add(halo);

    const halo2 = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 0.97, 64),
      new THREE.MeshBasicMaterial({ color: 0xE8B931, transparent: true, opacity: .15, side: THREE.DoubleSide })
    );
    coreGroup.add(halo2);

    // ====== NÓS ORBITANDO — 4 sacolas ======
    const texLoader = new THREE.TextureLoader();
    const bagTexture = texLoader.load(
      'assets/sacola-mascote.png',
      () => canvas.classList.add('is-ready'),
      undefined,
      (err) => console.warn('[ecosystem-3d] texture err', err)
    );
    if ('SRGBColorSpace' in THREE) bagTexture.colorSpace = THREE.SRGBColorSpace;

    const ORBIT_RADIUS = 2.4;
    const NODES = 4;
    const nodes = [];
    const lines = [];
    const labelEls = document.querySelectorAll('.ecosystem__label');

    for (let i = 0; i < NODES; i++) {
      const angle = (i / NODES) * Math.PI * 2;
      const x = Math.cos(angle) * ORBIT_RADIUS;
      const z = Math.sin(angle) * ORBIT_RADIUS;

      // Sacola PNG plane
      const bagMat = new THREE.MeshBasicMaterial({
        map: bagTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const bagGeo = new THREE.PlaneGeometry(0.85, 1.2);
      const bag = new THREE.Mesh(bagGeo, bagMat);
      bag.position.set(x, 0, z);
      bag.userData.angle = angle;
      bag.userData.index = i;
      group.add(bag);
      nodes.push(bag);

      // Halo dourado por trás de cada nó
      const nodeHaloMat = new THREE.MeshBasicMaterial({
        color: 0xE8B931,
        transparent: true,
        opacity: .15,
        side: THREE.DoubleSide
      });
      const nodeHaloGeo = new THREE.CircleGeometry(0.65, 32);
      const nodeHalo = new THREE.Mesh(nodeHaloGeo, nodeHaloMat);
      nodeHalo.position.set(x, 0, z);
      nodeHalo.position.z -= 0.01;
      group.add(nodeHalo);
      bag.userData.halo = nodeHalo;

      // Linha do centro pro nó
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xE8B931,
        transparent: true,
        opacity: .35
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, 0, z)
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
      lines.push(line);
    }

    // Anel orbital sutil no plano XZ
    const orbitRingGeo = new THREE.RingGeometry(ORBIT_RADIUS - 0.01, ORBIT_RADIUS + 0.01, 128);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0xC4D9C8,
      transparent: true,
      opacity: .15,
      side: THREE.DoubleSide
    });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x = -Math.PI / 2;
    group.add(orbitRing);

    // ====== Partículas estelares de fundo ======
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 120;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 5 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i*3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i*3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i*3 + 2] = r * Math.cos(phi);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xE8B931,
      size: 0.04,
      transparent: true,
      opacity: .5,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // ====== Mouse / Visibility ======
    let mxT = 0, myT = 0;
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      if (e.clientY > r.bottom || e.clientY < r.top) return;
      mxT = (e.clientX / window.innerWidth - 0.5) * 2;
      myT = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    let visible = false;
    const sec = document.getElementById('ecosystem');
    if (sec) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          visible = e.isIntersecting;
          if (visible) tick();
        });
      }, { threshold: 0.05 });
      io.observe(sec);
    }

    // ====== Project 3D coords → screen pixels for HTML labels ======
    function project(pos) {
      const v = pos.clone().project(camera);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      return {
        x: (v.x * 0.5 + 0.5) * w,
        y: (-v.y * 0.5 + 0.5) * h,
        visible: v.z < 1
      };
    }

    // ====== Animation loop ======
    const clock = new THREE.Clock();
    let started = false;
    function tick() {
      if (!visible) return;
      requestAnimationFrame(tick);

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = coreMat.uniforms.uTime.value + dt;
      coreMat.uniforms.uTime.value = t;

      // Auto-rotate do grupo inteiro
      group.rotation.y += dt * 0.18;

      // Mouse parallax (tilt sutil)
      mx += (mxT - mx) * 0.04;
      my += (myT - my) * 0.04;
      group.rotation.x = my * 0.25;
      group.rotation.z = mx * 0.08;

      // Core breathing
      const breathing = 1 + Math.sin(t * 1.8) * 0.06;
      core.scale.set(breathing, breathing, breathing);
      halo.scale.set(breathing * 1.05, breathing * 1.05, 1);
      halo.material.opacity = .3 + Math.sin(t * 1.5) * 0.15;
      halo2.scale.set(breathing * 1.1, breathing * 1.1, 1);

      // Cada nó "olha" pra câmera (billboard)
      nodes.forEach((node) => {
        const worldPos = new THREE.Vector3();
        node.getWorldPosition(worldPos);
        node.lookAt(camera.position);
        if (node.userData.halo) {
          node.userData.halo.getWorldPosition(worldPos);
          node.userData.halo.lookAt(camera.position);
        }
      });

      // Atualiza labels HTML
      if (labelEls.length === nodes.length) {
        nodes.forEach((node, i) => {
          const world = new THREE.Vector3();
          node.getWorldPosition(world);
          // Offset label um pouco fora do nó (na direção radial)
          const dir = world.clone().normalize().multiplyScalar(1.05);
          world.add(dir);
          const screen = project(world);
          const el = labelEls[i];
          if (!el) return;
          el.style.transform = `translate(calc(${screen.x}px - 50%), calc(${screen.y}px - 50%))`;
          el.classList.toggle('is-visible', screen.visible);
        });
      }

      renderer.render(scene, camera);
    }

    if (!started) {
      visible = true;
      tick();
      started = true;
    }

    console.log('%c Ecosystem 3D ativo ', 'background:#1F4530;color:#E8B931;padding:6px 12px;font-family:monospace;');
  }
}
