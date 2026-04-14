import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Loader2 } from "lucide-react";

interface Earth3DProps {
  aiStatus?: string;
}

export default function Earth3D({ aiStatus }: Earth3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("Initializing Orbital View...");

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Earth Geometry
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Textures
    const textureLoader = new THREE.TextureLoader();
    // Using high-quality Earth textures from a reliable CDN
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', () => {
      setIsLoading(false);
      setStatus("Orbital Surveillance Active");
    });
    const bumpMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const specMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water-mask.png');

    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpMap,
      bumpScale: 0.05,
      specularMap: specMap,
      specular: new THREE.Color('grey'),
      shininess: 10
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Clouds
    const cloudGeometry = new THREE.SphereGeometry(2.05, 64, 64);
    const cloudTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // Atmosphere Glow
    const glowGeometry = new THREE.SphereGeometry(2.1, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.3 },
        p: { value: 4.5 },
        glowColor: { value: new THREE.Color(0x00cfff) },
        viewVector: { value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * viewVector );
          intensity = pow( c - dot(vNormal, vNormel), p );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    camera.position.z = 6;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      earth.rotation.y += 0.0015;
      clouds.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#020208]">
      <div ref={containerRef} className="w-full h-full opacity-60" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #00cfff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
