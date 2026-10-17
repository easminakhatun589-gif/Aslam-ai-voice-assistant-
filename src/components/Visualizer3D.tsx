import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ThemeConfig } from "../types/themes";
import { CompanionModeInfo } from "../types/modes";

type VisualizerState = "idle" | "listening" | "processing" | "speaking" | "reconnecting";

interface Visualizer3DProps {
  state: VisualizerState;
  theme: ThemeConfig;
  mode: CompanionModeInfo;
}

export default function Visualizer3D({ state, theme, mode }: Visualizer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References for dynamic animation
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const outerRing1Ref = useRef<THREE.LineLoop | null>(null);
  const outerRing2Ref = useRef<THREE.LineLoop | null>(null);
  const outerRing3Ref = useRef<THREE.LineLoop | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const stateRef = useRef(state);
  const themeRef = useRef(theme);
  const modeRef = useRef(mode);

  // Update refs when props change
  useEffect(() => {
    stateRef.current = state;
    themeRef.current = theme;
    modeRef.current = mode;
  }, [state, theme, mode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Color Palette parsing
    const primaryColorHex = theme.primaryColor || mode.color;
    const secondaryColorHex = theme.secondaryColor;
    const pColor = new THREE.Color(primaryColorHex);
    const sColor = new THREE.Color(secondaryColorHex);

    // 5. Central Holographic Core
    const geometry = new THREE.IcosahedronGeometry(1.2, 3);
    const material = new THREE.MeshPhongMaterial({
      color: pColor,
      emissive: pColor,
      emissiveIntensity: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
    });
    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // Inner glowing solid core
    const innerCoreGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: sColor,
      transparent: true,
      opacity: 0.6,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    sphereMesh.add(innerCore);

    // 6. Orbital Rings
    const createRing = (radius: number, color: THREE.Color, rotX: number, rotY: number) => {
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
      }
      ringGeo.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const ring = new THREE.LineLoop(ringGeo, ringMat);
      ring.rotation.x = rotX;
      ring.rotation.y = rotY;
      return ring;
    };

    const ring1 = createRing(1.8, pColor, Math.PI / 3, Math.PI / 6);
    const ring2 = createRing(2.1, sColor, -Math.PI / 4, Math.PI / 4);
    const ring3 = createRing(2.4, new THREE.Color("#ffffff"), Math.PI / 2, 0);

    scene.add(ring1);
    scene.add(ring2);
    scene.add(ring3);

    outerRing1Ref.current = ring1;
    outerRing2Ref.current = ring2;
    outerRing3Ref.current = ring3;

    // 7. Ambient Particle Field
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.2 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
      particleScales[i] = Math.random();
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: pColor,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(primaryColorHex, 2, 10);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(secondaryColorHex, 2, 10);
    pointLight2.position.set(-3, -3, -3);
    scene.add(pointLight2);

    // 9. Interactive Touch / Mouse Drag Rotation
    let isDragging = false;
    let previousPointerPosition = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerPosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !sphereMesh) return;
      const deltaX = e.clientX - previousPointerPosition.x;
      const deltaY = e.clientY - previousPointerPosition.y;

      sphereMesh.rotation.y += deltaX * 0.008;
      sphereMesh.rotation.x += deltaY * 0.008;

      previousPointerPosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // 10. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      const currState = stateRef.current;
      const currTheme = themeRef.current;

      // Dynamic colors sync
      const targetPColor = new THREE.Color(currTheme.primaryColor);
      const targetSColor = new THREE.Color(currTheme.secondaryColor);

      if (material.color) material.color.lerp(targetPColor, 0.05);
      if (material.emissive) material.emissive.lerp(targetPColor, 0.05);
      if (innerCoreMat.color) innerCoreMat.color.lerp(targetSColor, 0.05);
      if (particleMat.color) particleMat.color.lerp(targetPColor, 0.05);

      // Speed & Amplitude modifiers based on Voice/Audio state
      let speedMult = 1;
      let pulseAmplitude = 0.02;

      if (currState === "speaking") {
        speedMult = 2.8;
        pulseAmplitude = 0.18 * Math.sin(time * 12);
      } else if (currState === "listening") {
        speedMult = 1.8;
        pulseAmplitude = 0.08 * Math.sin(time * 8);
      } else if (currState === "processing") {
        speedMult = 2.2;
        pulseAmplitude = 0.12 * Math.cos(time * 10);
      } else if (currState === "reconnecting") {
        speedMult = 1.5;
        pulseAmplitude = 0.1 * Math.sin(time * 6);
      } else {
        speedMult = 0.8; // Idle
        pulseAmplitude = 0.03 * Math.sin(time * 2);
      }

      // Sphere rotation & pulse
      if (sphereMesh) {
        if (!isDragging) {
          sphereMesh.rotation.y += 0.008 * speedMult;
          sphereMesh.rotation.x += 0.004 * speedMult;
        }
        const baseScale = 1 + pulseAmplitude;
        sphereMesh.scale.set(baseScale, baseScale, baseScale);
      }

      // Ring rotations
      if (ring1) ring1.rotation.z += 0.012 * speedMult;
      if (ring2) ring2.rotation.z -= 0.015 * speedMult;
      if (ring3) ring3.rotation.y += 0.009 * speedMult;

      // Particle rotations
      if (particles) {
        particles.rotation.y += 0.003 * speedMult;
        particles.rotation.x -= 0.001 * speedMult;
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);

      // Clean up WebGL resources
      geometry.dispose();
      material.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center relative touch-none select-none">
      <div ref={containerRef} className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[350px] md:h-[350px] relative z-10 cursor-grab active:cursor-grabbing" />
      
      {/* Radial Backlight Ambient Aura */}
      <div 
        className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-60"
        style={{
          background: `radial-gradient(circle, ${theme.primaryColor} 0%, ${theme.secondaryColor} 60%, transparent 100%)`,
        }}
      />
    </div>
  );
}
