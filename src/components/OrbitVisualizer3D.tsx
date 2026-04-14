import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Asteroid {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_max: number;
    };
  };
  close_approach_data: Array<{
    miss_distance: {
      kilometers: string;
    };
    relative_velocity: {
      kilometers_per_hour: string;
    };
  }>;
}

interface OrbitVisualizer3DProps {
  asteroids: Asteroid[];
  onSelect?: (id: string) => void;
}

export default function OrbitVisualizer3D({ asteroids, onSelect }: OrbitVisualizer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredAsteroid, setHoveredAsteroid] = useState<Asteroid | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03030a);

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 2000);
    camera.position.set(0, 150, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 1.5);
    sunLight.position.set(500, 200, 500);
    scene.add(sunLight);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(20, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      specular: 0x555555,
      shininess: 25,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Earth Glow
    const glowGeometry = new THREE.SphereGeometry(22, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00cfff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Grid helper for reference
    const gridHelper = new THREE.GridHelper(1000, 20, 0x00cfff, 0x111122);
    gridHelper.position.y = -50;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Asteroids and Orbits
    const asteroidGroup = new THREE.Group();
    scene.add(asteroidGroup);

    const significantNEOs = asteroids.slice(0, 15); // Show top 15 significant NEOs
    const asteroidMeshes: THREE.Mesh[] = [];

    significantNEOs.forEach((ast, index) => {
      const missDistance = parseFloat(ast.close_approach_data[0].miss_distance.kilometers);
      // Scale distance for visualization (Earth is 20 units, real Earth radius is ~6371km)
      // Let's say 1 unit = 10,000 km for visualization purposes
      const scaleFactor = 0.00005; 
      const radius = Math.max(40, missDistance * scaleFactor);
      
      // Orbit Path
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,            // ax, ay
        radius, radius * (0.8 + Math.random() * 0.4), // xRadius, yRadius
        0, 2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
      );

      const points = orbitCurve.getPoints(100);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: ast.is_potentially_hazardous_asteroid ? 0xff2d2d : 0x00cfff,
        transparent: true,
        opacity: 0.3
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      
      // Randomize orbit inclination
      orbitLine.rotation.x = Math.random() * Math.PI * 0.2;
      orbitLine.rotation.z = Math.random() * Math.PI * 2;
      asteroidGroup.add(orbitLine);

      // Asteroid Mesh
      const astSize = Math.max(1, ast.estimated_diameter.kilometers.estimated_diameter_max * 5);
      const astGeometry = new THREE.SphereGeometry(astSize, 8, 8);
      const astMaterial = new THREE.MeshPhongMaterial({
        color: ast.is_potentially_hazardous_asteroid ? 0xff4444 : 0xaaaaaa,
        emissive: ast.is_potentially_hazardous_asteroid ? 0x440000 : 0x222222,
      });
      const asteroidMesh = new THREE.Mesh(astGeometry, astMaterial);
      
      // Collision Aura
      const auraGeometry = new THREE.SphereGeometry(astSize * 2.5, 16, 16);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
      });
      const aura = new THREE.Mesh(auraGeometry, auraMaterial);
      asteroidMesh.add(aura);

      // Position asteroid on orbit
      const angle = Math.random() * Math.PI * 2;
      const pos = orbitCurve.getPoint(angle / (2 * Math.PI));
      asteroidMesh.position.set(pos.x, 0, pos.y);
      
      // Parent the asteroid to a pivot that matches the orbit's rotation
      const pivot = new THREE.Group();
      pivot.rotation.copy(orbitLine.rotation);
      pivot.add(asteroidMesh);
      asteroidGroup.add(pivot);

      // Animation data
      (asteroidMesh as any).userData = {
        asteroidData: ast,
        orbitCurve,
        angle,
        speed: 0.001 + Math.random() * 0.005,
        aura
      };
      asteroidMeshes.push(asteroidMesh);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setTooltipPos({ x: event.clientX, y: event.clientY });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(asteroidMeshes);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        setHoveredAsteroid(mesh.userData.asteroidData);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredAsteroid(null);
        document.body.style.cursor = 'default';
      }
    };

    const onMouseClick = () => {
      if (hoveredAsteroid && onSelect) {
        onSelect(hoveredAsteroid.id);
      }
    };

    const onMouseLeave = () => {
      setHoveredAsteroid(null);
      document.body.style.cursor = 'default';
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mouseleave', onMouseLeave);

    const clock = new THREE.Clock();

    // Animation loop
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      requestAnimationFrame(animate);
      
      asteroidMeshes.forEach(mesh => {
        if (mesh.userData.orbitCurve) {
          mesh.userData.angle += mesh.userData.speed;
          const pos = mesh.userData.orbitCurve.getPoint((mesh.userData.angle % (2 * Math.PI)) / (2 * Math.PI));
          mesh.position.set(pos.x, 0, pos.y);
          
          // Reset aura
          mesh.userData.aura.material.opacity = 0;
        }
      });

      // Collision Detection (Simplified)
      const threshold = 25;
      const tempPos1 = new THREE.Vector3();
      const tempPos2 = new THREE.Vector3();

      for (let i = 0; i < asteroidMeshes.length; i++) {
        for (let j = i + 1; j < asteroidMeshes.length; j++) {
          const m1 = asteroidMeshes[i];
          const m2 = asteroidMeshes[j];
          
          m1.getWorldPosition(tempPos1);
          m2.getWorldPosition(tempPos2);

          if (tempPos1.distanceTo(tempPos2) < threshold) {
            const flash = Math.sin(elapsedTime * 10) * 0.5 + 0.5;
            m1.userData.aura.material.opacity = flash * 0.4;
            m2.userData.aura.material.opacity = flash * 0.4;
          }
        }
      }

      earth.rotation.y += 0.002;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('mouseleave', onMouseLeave);
      document.body.style.cursor = 'default';
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [asteroids]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm">
      <div ref={containerRef} className="w-full h-full absolute inset-0" />
      
      {/* Overlay UI */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#00cfff] animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">3D Orbital Projection</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">Earth Proximity Field</h3>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Hazardous Object</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00cfff]/40 border border-[#00cfff]" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Safe Trajectory</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredAsteroid && (
        <div 
          className="fixed z-[2000] pointer-events-none px-4 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl min-w-[180px]"
          style={{ 
            left: tooltipPos.x + 20, 
            top: tooltipPos.y - 40,
            transform: 'translate(0, -50%)'
          }}
        >
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-xs font-bold text-white tracking-tight">
              {hoveredAsteroid.name.replace(/[()]/g, '')}
            </span>
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${
              hoveredAsteroid.is_potentially_hazardous_asteroid 
                ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                : 'bg-[#00cfff]/20 text-[#00cfff] border border-[#00cfff]/30'
            }`}>
              {hoveredAsteroid.is_potentially_hazardous_asteroid ? 'Hazardous' : 'Safe'}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-widest text-white/40">Approach Distance</p>
            <p className="text-xs font-mono text-white">
              {Math.round(parseFloat(hoveredAsteroid.close_approach_data[0].miss_distance.kilometers)).toLocaleString()} km
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-[8px] text-white/30 italic">Click to view full telemetry</p>
          </div>
        </div>
      )}
    </div>
  );
}
