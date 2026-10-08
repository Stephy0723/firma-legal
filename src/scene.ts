import * as THREE from "three";
import { gsap } from "gsap";

export interface SceneApi {
  enter(): void;
  theme(dark: boolean): void;
  setScroll(p: number): void;
  destroy(): void;
}

/** Brass scale of justice, rendered behind the hero copy. */
export function createScene(canvas: HTMLCanvasElement, opts: { reduce: boolean; dark: boolean }): SceneApi | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    canvas.style.display = "none";
    return null;
  }
  const { reduce } = opts;
  const mobile = innerWidth < 900;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  cam.position.set(0, 0.2, mobile ? 11.5 : 12.5);

  // Environment of warm light panels so the metal has something to reflect.
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x0c0e12);
  const panel = (w: number, h: number, c: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(10, 4, 0xffffff, 0, 8, 4); panel(4, 10, 0xffc976, -8, 1, 2); panel(3, 8, 0xffd9a0, 8, 0, -3);
  panel(12, 2, 0x444444, 0, -6, 0); panel(6, 3, 0xffffff, 2, 3, -8);
  scene.environment = pm.fromScene(env, 0.04).texture;

  const brass = new THREE.MeshStandardMaterial({ color: 0xd2a24c, metalness: 1, roughness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1f29, metalness: 0.6, roughness: 0.35 });
  const G = new THREE.Group(); scene.add(G);
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = G) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m;
  };

  add(new THREE.CylinderGeometry(1.25, 1.4, 0.16, 96), dark, 0, -2.42);
  add(new THREE.CylinderGeometry(0.95, 1.1, 0.16, 96), brass, 0, -2.26);
  add(new THREE.TorusGeometry(0.98, 0.025, 16, 120), brass, 0, -2.18).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.42, 0.6, 0.32, 64), brass, 0, -2.02);
  add(new THREE.CylinderGeometry(0.085, 0.12, 3.5, 48), brass, 0, -0.12);
  for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.13, 0.022, 12, 48), brass, 0, -1.4 + i * 1.2).rotation.x = Math.PI / 2;
  add(new THREE.SphereGeometry(0.2, 48, 32), brass, 0, 1.82);
  add(new THREE.ConeGeometry(0.07, 0.36, 32), brass, 0, 2.15);

  const beam = new THREE.Group(); beam.position.y = 1.55; G.add(beam);
  add(new THREE.CylinderGeometry(0.045, 0.045, 3.9, 24), brass, 0, 0, 0, beam).rotation.z = Math.PI / 2;
  add(new THREE.SphereGeometry(0.12, 32, 24), brass, 0, 0, 0, beam);
  const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number, parent: THREE.Object3D) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 8), brass);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    parent.add(m);
  };
  const pans: THREE.Group[] = [];
  [-1.95, 1.95].forEach((x) => {
    add(new THREE.SphereGeometry(0.07, 24, 16), brass, x, 0, 0, beam);
    const p = new THREE.Group(); p.position.set(x, 0, 0); beam.add(p); pans.push(p);
    const rimY = -1.75, rr = 0.6;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + Math.PI / 6;
      rod(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * rr, rimY, Math.sin(a) * rr), 0.012, p);
    }
    const bowlMat = brass.clone(); bowlMat.side = THREE.DoubleSide;
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.66, 64, 24, 0, Math.PI * 2, Math.PI * 0.64, Math.PI * 0.36), bowlMat);
    bowl.position.y = rimY + 0.66 * Math.cos(Math.PI * 0.36); p.add(bowl);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.018, 12, 80), brass); lip.rotation.x = Math.PI / 2; lip.position.y = rimY; p.add(lip);
  });
  const bowlMats = pans.map((p) => (p.children.find((c) => (c as THREE.Mesh).geometry instanceof THREE.SphereGeometry) as THREE.Mesh).material as THREE.MeshStandardMaterial);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a560, transparent: true, opacity: 0.35 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.006, 8, 240), ringMat); ring1.rotation.set(1.25, 0.2, 0); scene.add(ring1);
  const ring2Mat = ringMat.clone(); ring2Mat.opacity = 0.18;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.004, 8, 240), ring2Mat); ring2.rotation.set(1.6, -0.5, 0); scene.add(ring2);

  const N = mobile ? 220 : 520, pos = new Float32Array(N * 3), spd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 10; pos[i * 3 + 1] = (Math.random() - 0.5) * 8; pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    spd[i] = 0.15 + Math.random() * 0.35;
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0xe4c78c, size: 0.028, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(pg, dustMat));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(4, 6, 6); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  G.scale.setScalar(0.001); G.position.y = -0.1; if (!mobile) G.position.x = 0.35;
  let entered = false, scrollP = 0;

  const api: SceneApi = {
    enter() {
      if (entered) return; entered = true;
      if (reduce) { G.scale.setScalar(1); return; }
      gsap.to(G.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: "expo.out" });
      gsap.from(G.rotation, { y: -Math.PI * 1.2, duration: 2.6, ease: "expo.out" });
    },
    theme(d) {
      const c = d ? 0xd2a24c : 0xb08a3e;
      brass.color.set(c); bowlMats.forEach((m) => m.color.set(c));
      dark.color.set(d ? 0x1a1f29 : 0x2a2f38);
      dustMat.blending = d ? THREE.AdditiveBlending : THREE.NormalBlending;
      dustMat.color.set(d ? 0xe4c78c : 0x8a6a2e); dustMat.opacity = d ? 0.75 : 0.5; dustMat.needsUpdate = true;
      ringMat.color.set(d ? 0xc9a560 : 0x8a6a2e); ring2Mat.color.copy(ringMat.color);
      renderer.toneMappingExposure = d ? 1.05 : 1.2;
    },
    setScroll(p) { scrollP = p; },
    destroy() {
      cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("pointermove", onMove);
      ro.disconnect(); io.disconnect();
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); });
      renderer.dispose();
    },
  };
  api.theme(opts.dark);

  let mx = 0, my = 0, tx = 0, ty = 0;
  const onMove = (e: PointerEvent) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
  addEventListener("pointermove", onMove, { passive: true });

  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  };
  size();
  addEventListener("resize", size);
  const ro = new ResizeObserver(size); ro.observe(canvas);
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);

  const clock = new THREE.Clock();
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const t = clock.getElapsedTime();
    mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
    const sway = reduce ? 0 : Math.sin(t * 0.7) * 0.07 + mx * 0.18;
    beam.rotation.z = sway; pans.forEach((p) => (p.rotation.z = -sway));
    G.rotation.y = (reduce ? 0 : t * 0.12) + mx * 0.5 + scrollP * 1.4;
    G.rotation.x = my * 0.15 + scrollP * 0.25;
    G.position.y = -0.1 + (reduce ? 0 : Math.sin(t * 0.9) * 0.06) - scrollP * 1.2;
    ring1.rotation.z = t * 0.08; ring2.rotation.z = -t * 0.05;
    if (!reduce) {
      const a = pg.attributes.position.array as Float32Array;
      for (let i = 0; i < N; i++) { a[i * 3 + 1] += spd[i] * 0.004; if (a[i * 3 + 1] > 4) a[i * 3 + 1] = -4; }
      pg.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, cam);
  };
  tick();
  return api;
}
