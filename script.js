const bar = document.getElementById('topbar');
const btn = document.getElementById('menu-btn');
const links = [...document.querySelectorAll('.topb')];

const setMenu = (open) => {
  bar.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open);
  btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

btn.addEventListener('click', () => setMenu(!bar.classList.contains('open')));
links.forEach((l) => l.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});
document.addEventListener('click', (e) => {
  if (!bar.contains(e.target)) setMenu(false);
});

let lastY = window.scrollY;
window.addEventListener(
  'scroll',
  () => {
    const y = window.scrollY;
    bar.classList.toggle('scrolled', y > 10);
    if (Math.abs(y - lastY) > 6) {
      bar.classList.toggle('hide', y > lastY && y > 120 && !bar.classList.contains('open'));
      lastY = y;
    }
  },
  { passive: true }
);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => {
        const on = l.getAttribute('href') === '#' + entry.target.id;
        l.classList.toggle('active', on);
        if (on) l.setAttribute('aria-current', 'page');
        else l.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-45% 0px -50% 0px' }
);

links.forEach((l) => {
  const t = document.querySelector(l.getAttribute('href'));
  if (t) spy.observe(t);
});

(() => {
  const box = document.getElementById('heroImage');
  const lens = box.querySelector('.lens');
  const R = 130;
  const FOLLOW = 14;
  const STIFF = 180;
  const DAMP = 17;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x = 0,
    y = 0,
    tx = 0,
    ty = 0,
    r = 0,
    vr = 0,
    tr = 0,
    raf = 0,
    last = 0;

  lens.style.width = lens.style.height = R * 2 + 'px';

  const draw = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;

    if (calm) {
      x = tx;
      y = ty;
      r = tr;
      vr = 0;
    } else {
      const k = 1 - Math.exp(-dt * FOLLOW);
      x += (tx - x) * k;
      y += (ty - y) * k;
      vr += ((tr - r) * STIFF - vr * DAMP) * dt;
      r = Math.max(0, r + vr * dt);
      if (r === 0 && tr === 0) vr = 0;
    }

    box.style.setProperty('--x', x.toFixed(2) + 'px');
    box.style.setProperty('--y', y.toFixed(2) + 'px');
    box.style.setProperty('--r', r.toFixed(2) + 'px');
    lens.style.transform = `translate3d(${x - R}px, ${y - R}px, 0) scale(${r / R})`;
    lens.style.opacity = Math.min(1, (r / R) * 2);

    const busy = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tr - r) + Math.abs(vr) > 0.05;
    if (busy) raf = requestAnimationFrame(draw);
    else {
      raf = 0;
      last = 0;
    }
  };

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(draw);
  };

  const aim = (e) => {
    const b = box.getBoundingClientRect();
    tx = e.clientX - b.left;
    ty = e.clientY - b.top;
  };

  box.addEventListener('pointerenter', (e) => {
    aim(e);
    x = tx;
    y = ty;
    tr = R;
    kick();
  });

  box.addEventListener('pointermove', (e) => {
    aim(e);
    kick();
  });

  box.addEventListener('pointerleave', () => {
    tr = 0;
    kick();
  });
})();

(() => {
  const EMAIL = 'yourname@email.com';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    let i = 0;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach((word) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      [...word].forEach((ch) => {
        const c = document.createElement('span');
        c.className = 'ch';
        c.textContent = ch;
        c.style.setProperty('--i', i++);
        w.appendChild(c);
      });
      el.append(w, ' ');
    });
  });

  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('[data-reveal], [data-split]').forEach((el) => io.observe(el));

  const bar = document.getElementById('progress');
  const track = document.getElementById('track');
  track.innerHTML += track.innerHTML;
  const pars = [...document.querySelectorAll('[data-par]')];
  const projs = [...document.querySelectorAll('.proj')];

  let lastY = scrollY;
  let vel = 0;
  let x = 0;

  (function frame() {
    const y = scrollY;
    vel += (y - lastY - vel) * 0.1;
    lastY = y;
    bar.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;

    if (!calm) {
      const half = track.scrollWidth / 2;
      x -= 0.6 + Math.abs(vel) * 0.35;
      if (x <= -half) x += half;
      track.style.transform = `translateX(${x}px) skewX(${clamp(-vel * 0.5, -12, 12)}deg)`;

      pars.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * el.dataset.par}px, 0)`;
      });

      projs.forEach((p, i) => {
        const next = projs[i + 1];
        if (!next) return;
        const t = next.getBoundingClientRect().top;
        const k = clamp((innerHeight * 0.9 - t) / (innerHeight * 0.9 - 120), 0, 1);
        p.firstElementChild.style.setProperty('--s', 1 - 0.06 * k);
        p.firstElementChild.style.setProperty('--b', 1 - 0.45 * k);
      });
    }

    requestAnimationFrame(frame);
  })();

  document.querySelectorAll('.pin').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
      el.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 8 + 'deg');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  document.querySelectorAll('[data-magnet]').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    b.addEventListener('pointerleave', () => {
      b.style.transform = '';
    });
  });

  document.getElementById('mail').href = 'mailto:' + EMAIL;
  document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Enquiry from ' + f.get('name'))}&body=${encodeURIComponent(f.get('message') + '\n\n' + f.get('name') + ' (' + f.get('email') + ')')}`;
  });

  document.getElementById('yr').textContent = new Date().getFullYear();
})();

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.getElementById('stage');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.autoClear = false;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121316);
scene.fog = new THREE.Fog(0x121316, 10, 22);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(4.5, 3.4, 6.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, 0);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.autoRotate = false;
renderer.domElement.style.touchAction = 'pan-y';

const penScene = new THREE.Scene();
penScene.environment = scene.environment;
const penCam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
penCam.position.set(0, 0, 9);
const penLight = new THREE.DirectionalLight(0xffffff, 1.6);
penLight.position.set(4, 8, 5);
penScene.add(penLight);

const penRig = (() => {
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x2f6fed, metalness: 0.3, roughness: 0.25 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xcfd3d8, metalness: 1, roughness: 0.2 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0, roughness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x222428, metalness: 0.6, roughness: 0.35 });

  const pen = new THREE.Group();
  const lathe = (points, mat) => new THREE.Mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 64), mat);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.4, 64), barrelMat);
  barrel.position.y = 0.5;
  pen.add(barrel);

  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.9, 64), rubberMat);
  grip.position.y = -1.65;
  pen.add(grip);
  for (let i = 0; i < 6; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.195, 0.018, 12, 48), darkMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.35 - i * 0.14;
    pen.add(ring);
  }

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.08, 64), metalMat);
  collar.position.y = -1.17;
  pen.add(collar);

  pen.add(lathe([[0.001, -3.0], [0.07, -3.0], [0.19, -2.1]], metalMat));

  const tip = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), darkMat);
  ball.position.y = -3.43;
  tip.add(lathe([[0.001, -3.45], [0.012, -3.4], [0.045, -3.05], [0.045, -2.7]], metalMat), ball);
  pen.add(tip);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.2, 0.3, 64), metalMat);
  cap.position.y = 2.35;
  pen.add(cap);

  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 32), darkMat);
  button.position.y = 2.7;
  pen.add(button);

  const clipBar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 0.14), metalMat);
  clipBar.position.set(0.25, 1.55, 0);
  const clipTop = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.14), metalMat);
  clipTop.position.set(0.17, 2.3, 0);
  const clipEnd = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), metalMat);
  clipEnd.position.set(0.23, 0.8, 0);
  clipEnd.scale.set(1, 1, 1.4);
  pen.add(clipBar, clipTop, clipEnd);

  pen.rotation.z = 0.5;
  const holder = new THREE.Group();
  holder.visible = false;
  holder.add(pen);
  penScene.add(holder);
  return { holder, tip, button };
})();

const PEN_HALF_H = 9 * Math.tan(THREE.MathUtils.degToRad(20));
const CORNER = { dx: 0.30, dy: 0.20, shrink: 0.4 };
const LAND_GAP = 0.025;
let penRestX = 0,
  penRestY = 0,
  penStartY = 6,
  penScaleRest = 0.45;
let penLandX = 0,
  penLandY = 0,
  penScaleLand = 0.2;

const penShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    map: (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(0,0,0,0.55)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })(),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    toneMapped: false,
  })
);
penShadow.position.z = -0.5;
penScene.add(penShadow);
const proj = new THREE.Vector3();

function layoutPen() {
  const aspect = stageW / stageH;
  penCam.aspect = aspect;
  penCam.updateProjectionMatrix();
  const narrow = Math.min(1, aspect / 1.6);
  penScaleRest = 0.45 * Math.min(1, 0.55 + aspect * 0.45);
  penScaleLand = 0.2 * (0.45 + 0.55 * narrow);
  const unitsX = 2 * PEN_HALF_H * aspect;
  const unitsY = 2 * PEN_HALF_H;
  penRestX = (0.54 - 0.5) * unitsX;
  penRestY = (0.5 - 0.56) * unitsY;
  penStartY = PEN_HALF_H + 3.5 * penScaleRest + 0.5;

  const c = camera.clone();
  c.zoom = 1;
  c.aspect = aspect;
  c.clearViewOffset();
  c.lookAt(controls.target);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
  proj.set(0, 0.05, 0).project(c);
  const zEnd = baseZoom * (1 - CORNER.shrink);
  const visibleH0 = 2 * camera.position.distanceTo(controls.target) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const laptopX = 0.5 - CORNER.dx;
  const laptopY = (1 - (proj.y * zEnd - 2 * CORNER.dy)) / 2;
  const laptopHalfW = 1.95 * zEnd / (visibleH0 * aspect);
  const penLen = 6.35 * penScaleLand / unitsX;
  penLandX = (laptopX + laptopHalfW + LAND_GAP + penLen / 2 - 0.5) * unitsX;
  penLandY = (0.5 - laptopY) * unitsY;
}

let baseZoom = 1,
  stageW = 1,
  stageH = 1;

function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  if (!w || !h) return;
  stageW = w;
  stageH = h;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  baseZoom = Math.min(0.8, Math.max(0.4, camera.aspect * 0.8));
  camera.zoom = baseZoom;
  camera.updateProjectionMatrix();
  layoutPen();
}

new ResizeObserver(resize).observe(stage);
resize();

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(4, 7, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
Object.assign(keyLight.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
keyLight.shadow.bias = -0.0004;
keyLight.shadow.normalBias = 0.02;
keyLight.shadow.radius = 4;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x8fb4ff, 1.2);
rimLight.position.set(-5, 3, -5);
scene.add(rimLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(20, 64),
  new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.85 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const alu = new THREE.MeshStandardMaterial({ color: 0xc8cbd0, metalness: 1, roughness: 0.32 });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x3a3d44, metalness: 1, roughness: 0.4 });
const black = new THREE.MeshStandardMaterial({ color: 0x08090a, roughness: 0.4, metalness: 0.2 });
const keyMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.55, metalness: 0.1 });
const padMat = new THREE.MeshStandardMaterial({ color: 0xb7bbc1, metalness: 0.9, roughness: 0.25 });
const rubber = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.9 });

const W = 3.2,
  D = 2.2,
  BH = 0.14;
const laptop = new THREE.Group();
laptop.position.y = 0.03;
scene.add(laptop);

const base = new THREE.Mesh(new RoundedBoxGeometry(W, BH, D, 6, 0.06), alu);
base.position.y = BH / 2;
base.castShadow = base.receiveShadow = true;
laptop.add(base);

[[-1.35, -0.85], [1.35, -0.85], [-1.35, 0.85], [1.35, 0.85]].forEach(([x, z]) => {
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 20), rubber);
  foot.position.set(x, -0.015, z);
  laptop.add(foot);
});

const well = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.04), black);
well.rotation.x = -Math.PI / 2;
well.position.set(0, BH + 0.001, -0.38);
laptop.add(well);

const pitch = 0.2,
  ks = 0.17;
const keyList = [];
for (let i = 0; i < 14; i++) keyList.push({ x: (i - 6.5) * pitch, z: -0.8, w: ks, d: 0.1 });
[-0.6, -0.4, -0.2].forEach((z) => {
  for (let i = 0; i < 14; i++) keyList.push({ x: (i - 6.5) * pitch, z, w: ks, d: ks });
});
for (let i = 0; i < 4; i++) keyList.push({ x: -1.3 + i * pitch, z: 0, w: ks, d: ks });
keyList.push({ x: 0, z: 0, w: 1.18, d: ks });
for (let i = 0; i < 4; i++) keyList.push({ x: 0.7 + i * pitch, z: 0, w: ks, d: ks });

const geoCache = {};
keyList.forEach((k) => {
  const id = k.w + 'x' + k.d;
  geoCache[id] ??= new RoundedBoxGeometry(k.w, 0.05, k.d, 3, 0.02);
  const key = new THREE.Mesh(geoCache[id], keyMat);
  key.position.set(k.x, BH + 0.012, k.z);
  key.castShadow = true;
  laptop.add(key);
});

const pad = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.012, 0.78, 3, 0.005), padMat);
pad.position.set(0, BH + 0.0015, 0.62);
laptop.add(pad);

const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, W - 0.5, 32), darkMetal);
barrel.rotation.z = Math.PI / 2;
barrel.position.set(0, 0.15, -D / 2 + 0.03);
barrel.castShadow = true;
laptop.add(barrel);

const hinge = new THREE.Group();
hinge.position.set(0, 0.16, -D / 2 + 0.03);
laptop.add(hinge);

const lid = new THREE.Mesh(new RoundedBoxGeometry(W, 0.08, D, 6, 0.035), alu);
lid.position.set(0, 0.07, D / 2 - 0.03);
lid.castShadow = lid.receiveShadow = true;
hinge.add(lid);

const lidZ = D / 2 - 0.03;

const glass = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.12, D - 0.14), black);
glass.rotation.x = Math.PI / 2;
glass.position.set(0, 0.027, lidZ);
hinge.add(glass);

const cam = new THREE.Mesh(new THREE.CircleGeometry(0.015, 16), new THREE.MeshBasicMaterial({ color: 0x222831 }));
cam.rotation.x = Math.PI / 2;
cam.position.set(0, 0.0262, lidZ + 0.97);
hinge.add(cam);

const logo = new THREE.Mesh(
  new THREE.CircleGeometry(0.17, 48),
  new THREE.MeshStandardMaterial({ color: 0xeef0f3, metalness: 1, roughness: 0.1 })
);
logo.rotation.x = -Math.PI / 2;
logo.position.set(0, 0.1115, lidZ);
hinge.add(logo);

const cv = document.createElement('canvas');
cv.width = 1280;
cv.height = 800;
const g = cv.getContext('2d');

const screenTex = new THREE.CanvasTexture(cv);
screenTex.colorSpace = THREE.SRGBColorSpace;
screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });

const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.8125), screenMat);
screen.rotation.x = Math.PI / 2;
screen.position.set(0, 0.0255, lidZ);
hinge.add(screen);

const glow = new THREE.PointLight(0xaec8ff, 0, 6, 2);
glow.position.set(0, -0.8, lidZ);
hinge.add(glow);

const code = [
  "import * as THREE from 'three';",
  '',
  'const laptop = new THREE.Group();',
  'laptop.add(base, keys, lid);',
  '',
  'function animate(t) {',
  '  hinge.rotation.x = -Math.PI * 0.6;',
  '  renderer.render(scene, camera);',
  '  requestAnimationFrame(animate);',
  '}',
  'animate();',
];
const totalChars = code.join('\n').length;

function rr(x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}

function drawScreen(t) {
  g.fillStyle = '#1b2433';
  g.fillRect(0, 0, 1280, 800);
  g.fillStyle = '#233149';
  g.beginPath();
  g.arc(1050, 720, 430, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#2b3d5c';
  g.beginPath();
  g.arc(1190, 800, 250, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#202c40';
  g.beginPath();
  g.arc(120, 60, 260, 0, Math.PI * 2);
  g.fill();

  g.fillStyle = 'rgba(10,14,20,0.55)';
  g.fillRect(0, 0, 1280, 40);
  g.fillStyle = '#e6e8ec';
  g.beginPath();
  g.arc(28, 20, 8, 0, Math.PI * 2);
  g.fill();
  g.font = '600 18px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText('Editor', 56, 21);
  g.fillStyle = '#aeb6c4';
  g.font = '18px system-ui, sans-serif';
  g.fillText('File     Edit     View     Window', 130, 21);
  g.textAlign = 'right';
  g.fillStyle = '#e6e8ec';
  g.fillText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 1250, 21);

  g.fillStyle = '#0f141b';
  rr(130, 90, 1020, 560, 16);
  g.fillStyle = '#1a212c';
  rr(130, 90, 1020, 46, [16, 16, 0, 0]);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(160 + i * 26, 113, 7, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = '#8a94a6';
  g.textAlign = 'center';
  g.font = '20px system-ui, sans-serif';
  g.fillText('laptop.js', 640, 114);

  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.font = '26px ui-monospace, Menlo, Consolas, monospace';
  let left = Math.min(Math.floor(t * 28) % (totalChars + 60), totalChars);
  let curX = 215;
  let curY = 190;
  for (let i = 0; i < code.length; i++) {
    const y = 190 + i * 38;
    const shown = code[i].slice(0, Math.max(0, left));
    g.fillStyle = '#4b566a';
    g.fillText(String(i + 1).padStart(2, ' '), 160, y);
    let x = 215;
    shown.split(/(\bimport\b|\bconst\b|\bnew\b|\bfunction\b|\bfrom\b|'[^']*'|\d+\.?\d*)/).forEach((part) => {
      if (!part) return;
      g.fillStyle = /^(import|const|new|function|from)$/.test(part)
        ? '#c792ea'
        : part[0] === "'"
          ? '#c3e88d'
          : /^\d/.test(part)
            ? '#f78c6c'
            : '#d6deeb';
      g.fillText(part, x, y);
      x += g.measureText(part).width;
    });
    curX = x;
    curY = y;
    left -= code[i].length + 1;
    if (left < 0) break;
  }
  if (Math.floor(t * 2) % 2 === 0) {
    g.fillStyle = '#7fb0ff';
    g.fillRect(curX + 2, curY - 24, 3, 30);
  }

  const icons = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#9775fa', '#f783ac'];
  const dockW = icons.length * 70 + 30;
  const x0 = (1280 - dockW) / 2;
  g.fillStyle = 'rgba(255,255,255,0.14)';
  rr(x0, 702, dockW, 82, 22);
  icons.forEach((c, i) => {
    g.fillStyle = c;
    rr(x0 + 20 + i * 70, 716, 54, 54, 14);
  });

  screenTex.needsUpdate = true;
}

drawScreen(0);

const OPEN = THREE.MathUtils.degToRad(108);
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
let target = 0,
  amount = 0;

setTimeout(() => {
  target = 1;
}, 600);

const track = document.getElementById('home');
const hero = document.getElementById('hero');
const lines = [...hero.querySelectorAll('.t')];
const SPIN_TURNS = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;
const PEN_TURNS = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
let prog = null;
let spin = 0;
let penSpin = 0;
let tipOut = true;
const easeOutBack = (x) => 1 + 2 * Math.pow(x - 1, 3) + Math.pow(x - 1, 2);
const bounceOut = (x) => {
  const n = 7.5625;
  const d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};
const TAU = Math.PI * 2;
const TEXT_SWAPS = [[36, 84], [174, 222], [348, 390], [468, 510], [640, 690]];

let visible = true;
new IntersectionObserver(([e]) => {
  visible = e.isIntersecting;
}).observe(stage);

const clock = new THREE.Clock();
let lastDraw = 0;

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!visible) return;
  const now = clock.elapsedTime;

  const rect = track.getBoundingClientRect();
  const p = clamp01(-rect.top / Math.max(1, rect.height - innerHeight));
  prog = prog === null ? p : prog + (p - prog) * (1 - Math.exp(-dt * 10));
  const rangeVh = Math.max(1, (rect.height - innerHeight) / innerHeight * 100);
  const win = (a, b) => smooth(a, b, prog * rangeVh);

  const move = win(90, 246);
  const tp = TEXT_SWAPS.reduce((sum, [a, b]) => sum + win(a, b), 0);
  lines.forEach((el, i) => {
    const x = Math.max(-1, Math.min(1, tp - i));
    const a = Math.abs(x);
    el.style.opacity = (1 - a).toFixed(3);
    el.style.transform = `translateY(${(-x * 0.4).toFixed(3)}em)`;
    el.style.filter = a > 0.001 ? `blur(${(a * 10).toFixed(2)}px)` : 'none';
  });
  const spinTarget = win(84, 270);
  spin += (spinTarget - spin) * (1 - Math.exp(-dt * 3.5));
  laptop.rotation.y = spin * Math.PI * 2 * SPIN_TURNS;
  camera.zoom = baseZoom * (1 - CORNER.shrink * move);
  camera.setViewOffset(stageW, stageH, stageW * CORNER.dx * move, -stageH * CORNER.dy * move, stageW, stageH);

  const step = dt * 0.7;
  amount += Math.max(-step, Math.min(step, target - amount));
  hinge.rotation.x = -ease(amount) * OPEN;

  const brightness = THREE.MathUtils.smoothstep(amount, 0.12, 0.45);
  screenMat.color.setScalar(brightness);
  glow.intensity = 1.5 * brightness;

  if (brightness > 0.01 && now - lastDraw > 0.066) {
    drawScreen(now);
    lastDraw = now;
  }

  const fall = win(276, 348);
  const penSpinTarget = win(372, 576);
  const land = win(590, 680);
  penSpin += (penSpinTarget - penSpin) * (1 - Math.exp(-dt * 3.5));
  const hold = fall * (1 - land);
  const fx = penRestX + (penLandX - penRestX) * land;
  const fyRest = penStartY + (penRestY - penStartY) * easeOutBack(fall);
  const fy = fyRest + (penLandY - fyRest) * bounceOut(land) + Math.sin(now * 1.2) * 0.05 * hold;
  const penScale = penScaleRest + (penScaleLand - penScaleRest) * land;
  const spinAngle = ((penSpin * TAU * PEN_TURNS) % TAU) * (1 - land);
  penRig.holder.visible = fall > 0.001;
  penRig.holder.scale.setScalar(penScale);
  penRig.holder.position.set(fx, fy, 0);
  penRig.holder.rotation.set(0, spinAngle, (1 - fall) * 0.9 + land * (Math.PI / 2 - 0.5 + 0.06));
  penShadow.position.set(fx, fy - 0.06, -0.5);
  penShadow.scale.set(6.35 * penScale * 1.1, 6.35 * penScale * 0.3, 1);
  penShadow.material.opacity = land;
  penRig.tip.position.y += ((tipOut ? 0 : 0.75) - penRig.tip.position.y) * (1 - Math.exp(-dt * 10));
  penRig.button.position.y += ((tipOut ? 2.7 : 2.6) - penRig.button.position.y) * (1 - Math.exp(-dt * 12));

  controls.update();
  renderer.clear();
  renderer.render(scene, camera);
  if (penRig.holder.visible) {
    renderer.clearDepth();
    renderer.render(penScene, penCam);
  }
});

const penRay = new THREE.Raycaster(), penPtr = new THREE.Vector2();
let penDown = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  penDown = [e.clientX, e.clientY];
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!penDown || Math.hypot(e.clientX - penDown[0], e.clientY - penDown[1]) > 5 || !penRig.holder.visible) return;
  const r = renderer.domElement.getBoundingClientRect();
  penPtr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  penRay.setFromCamera(penPtr, penCam);
  if (penRay.intersectObject(penRig.holder, true).length) tipOut = !tipOut;
});
