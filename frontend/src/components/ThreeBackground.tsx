
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const targetScrollY = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 1. Particle Cloud (Stars/Data Bits)
    const particlesCount = 4000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 30;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 2. Spatial Grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x8b5cf6, 0x111111);
    gridHelper.position.y = -5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.1;
    scene.add(gridHelper);

    // 3. Floating Nodes
    const nodesGroup = new THREE.Group();
    const octaGeom = new THREE.OctahedronGeometry(0.2, 0);
    const nodeMat = new THREE.MeshPhongMaterial({ 
      color: 0xa78bfa, 
      transparent: true, 
      opacity: 0.15, 
      wireframe: true 
    });

    for (let i = 0; i < 40; i++) {
      const node = new THREE.Mesh(octaGeom, nodeMat);
      node.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 15
      );
      node.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      nodesGroup.add(node);
    }
    scene.add(nodesGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x8b5cf6, 5);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);

    camera.position.z = 8;

    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) - 0.5;
      mouseY = (event.clientY / window.innerHeight) - 0.5;
    };

    const onScroll = () => {
      targetScrollY.current = window.scrollY;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

    const animate = () => {
      requestAnimationFrame(animate);
      
      scrollY.current = lerp(scrollY.current, targetScrollY.current, 0.04);
      const scrollFactor = scrollY.current * 0.004;

      // Interaction
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.position.z = scrollFactor * 2;
      
      gridHelper.position.z = (scrollFactor * 5) % 2; // Endless grid feel
      
      nodesGroup.position.y = scrollFactor * 0.8;
      nodesGroup.children.forEach((node, i) => {
        node.rotation.x += 0.01;
        node.rotation.y += 0.01;
        // Subtle floating movement
        node.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
      });

      // Camera parallax
      const targetX = mouseX * 2;
      const targetY = -mouseY * 2;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-60 bg-[#020202]" 
    />
  );
};

export default ThreeBackground;
