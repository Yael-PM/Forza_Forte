/** Visor Three.js de la playera: carga el modelo y anima su orientación al hacer scroll. */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import shirtModelUrl from '../../assets/forza-forte-shirt.glb';

export interface StoryShirt3DRef {
  setMotion: (
    nextRotY: number,
    nextRotX: number,
    nextRotZ: number,
    nextZoom: number,
    nextFocusY?: number
  ) => void;
}

interface MotionTargets {
  rotationY: number;
  rotationX: number;
  rotationZ: number;
  zoom: number;
  focusY: number;
}

export const StoryShirt3D = forwardRef<StoryShirt3DRef>((_, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const mouseInfluence = useRef({ current: 0, target: 0 });
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targets = useRef<MotionTargets>({
    rotationY: -0.65,
    rotationX: 0.05,
    rotationZ: -0.05,
    zoom: 1.18,
    focusY: 0.03,
  });

  useImperativeHandle(ref, () => ({
    setMotion(nextRotY, nextRotX, nextRotZ, nextZoom, nextFocusY = 0) {
      targets.current.rotationY = nextRotY;
      targets.current.rotationX = nextRotX;
      targets.current.rotationZ = nextRotZ;
      targets.current.zoom = nextZoom;
      targets.current.focusY = nextFocusY;

      mouseInfluence.current.target = 0;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        mouseInfluence.current.target = 1;
      }, 150);
    },
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── ILUMINACIÓN ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const hemi = new THREE.HemisphereLight(0xf5f7fb, 0x06080d, 1.15);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3.5, 7, 7);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x6ac2d0, 1.05);
    fill.position.set(-5, 3, 5);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xeef3ff, 1.1);
    rim.position.set(-1, 2, -6);
    scene.add(rim);

    const top = new THREE.DirectionalLight(0xffffff, 0.72);
    top.position.set(0, 10, 0);
    scene.add(top);

    const group = new THREE.Group();
    scene.add(group);

    let baseZ = 6.5;
    let loadedModel: THREE.Object3D | null = null;

    const loader = new GLTFLoader();
    loader.load(shirtModelUrl, (gltf) => {
      loadedModel = gltf.scene;
      const initialBox = new THREE.Box3().setFromObject(loadedModel);
      const initialSize = new THREE.Vector3();
      const initialCenter = new THREE.Vector3();
      initialBox.getSize(initialSize);
      initialBox.getCenter(initialCenter);

      loadedModel.position.sub(initialCenter);
      const maxDim = Math.max(initialSize.x, initialSize.y, initialSize.z) || 1;
      const scale = 2.45 / maxDim;
      loadedModel.scale.setScalar(scale);
      loadedModel.rotation.x = 0.02;
      loadedModel.rotation.y = Math.PI;

      loadedModel.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const paintMaterial = (mat: THREE.MeshStandardMaterial) => {
            const nextMat = mat.clone();
            nextMat.color = new THREE.Color('#17191d');
            nextMat.emissive = new THREE.Color('#0b0d12');
            nextMat.emissiveIntensity = 0.14;
            nextMat.roughness = 0.58;
            nextMat.metalness = 0.12;
            nextMat.envMapIntensity = 0.85;
            nextMat.side = THREE.DoubleSide;
            nextMat.needsUpdate = true;
            return nextMat;
          };

          child.material = Array.isArray(child.material)
            ? child.material.map((m) => paintMaterial(m as THREE.MeshStandardMaterial))
            : paintMaterial(child.material as THREE.MeshStandardMaterial);
        }
      });

      const fittedBox = new THREE.Box3().setFromObject(loadedModel);
      const fittedSize = new THREE.Vector3();
      const fittedCenter = new THREE.Vector3();
      fittedBox.getSize(fittedSize);
      fittedBox.getCenter(fittedCenter);

      loadedModel.position.x -= fittedCenter.x;
      loadedModel.position.y -= fittedCenter.y;
      loadedModel.position.y -= fittedSize.y * 0.02;
      loadedModel.position.z -= fittedCenter.z;

      group.add(loadedModel);

      const radius = fittedBox.getBoundingSphere(new THREE.Sphere()).radius || 1;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      baseZ = Math.max((radius * 1.18) / Math.tan(fov / 2), 3.85);
      camera.position.z = baseZ;
      camera.lookAt(0, 0, 0);
    });

    // ── RENDER LOOP ──
    let frameId = 0;
    const factor = 0.075;

    const renderLoop = () => {
      frameId = requestAnimationFrame(renderLoop);

      mouseInfluence.current.current += (mouseInfluence.current.target - mouseInfluence.current.current) * 0.1;
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.1;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.1;

      const mouseParallaxX = mouse.current.x * 0.22 * mouseInfluence.current.current;
      const mouseParallaxY = mouse.current.y * 0.14 * mouseInfluence.current.current;

      // Interpolación 3D
      const targetRotY = targets.current.rotationY + mouseParallaxX;
      group.rotation.y += (targetRotY - group.rotation.y) * factor;

      const targetRotX = targets.current.rotationX + mouseParallaxY;
      group.rotation.x += (targetRotX - group.rotation.x) * factor;

      const targetRotZ = targets.current.rotationZ + mouseParallaxX * 0.3;
      group.rotation.z += (targetRotZ - group.rotation.z) * factor;

      group.position.y += (targets.current.focusY - group.position.y) * factor;
      const targetZ = baseZ / targets.current.zoom;
      camera.position.z += (targetZ - camera.position.z) * factor;

      renderer.render(scene, camera);
    };

    renderLoop();

    // ── EVENT LISTENERS ──
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    // ── LIMPIEZA DE MEMORIA Y RECURSOS (MEMORY LEAKS) ──
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      cancelAnimationFrame(frameId);

      // Limpieza exhaustiva de nodos Three.js
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else if (object.material) {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
});

StoryShirt3D.displayName = 'StoryShirt3D';
export default StoryShirt3D;
