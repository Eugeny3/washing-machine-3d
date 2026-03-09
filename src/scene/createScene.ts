import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  resize: () => void;
  dispose: () => void;
}

type CameraLayout = 'desktop' | 'mobile';

export function createScene(container: HTMLElement): SceneContext {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  let activeLayout: CameraLayout | null = null;

  const setCameraLayout = (layout: CameraLayout) => {
    if (activeLayout === layout) {
      return;
    }

    activeLayout = layout;

    if (layout === 'mobile') {
      camera.position.set(8.25, 4.2, 9.85);
      return;
    }

    camera.position.set(7.2, 3.8, 8.4);
  };

  setCameraLayout('desktop');

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.domElement.classList.add('webgl-canvas');

  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 5;
  controls.maxDistance = 15;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.target.set(0, -0.1, 0);
  controls.update();

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xb7c7d9, 1.4);
  scene.add(hemisphereLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(6, 8, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xc9e6ff, 1.2);
  rimLight.position.set(-5, 4, -6);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(0xffffff, 18, 25, 2);
  fillLight.position.set(0, 2.6, 4.5);
  scene.add(fillLight);

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xf7fbff,
    roughness: 0.92,
    metalness: 0.02,
  });

  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.8, 96), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.28;
  floor.receiveShadow = true;
  scene.add(floor);

  const accentDisc = new THREE.Mesh(
    new THREE.RingGeometry(3.1, 5.4, 96),
    new THREE.MeshBasicMaterial({
      color: 0xdfeaf4,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    }),
  );
  accentDisc.rotation.x = -Math.PI / 2;
  accentDisc.position.y = -2.275;
  scene.add(accentDisc);

  const resize = () => {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    setCameraLayout(width <= 720 ? 'mobile' : 'desktop');

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    controls.target.set(0, -0.1, 0);
    controls.update();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
  };

  const handleResize = () => resize();

  window.addEventListener('resize', handleResize);
  resize();

  return {
    scene,
    camera,
    renderer,
    controls,
    resize,
    dispose: () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
