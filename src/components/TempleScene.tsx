import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line } from '@react-three/drei';
import * as THREE from 'three';

// Glow Sphere for ethereal effect
function GlowSphere({ position, scale }: { position: [number, number, number]; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 0.5) * 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshBasicMaterial
        color={new THREE.Color().setHSL(0.11, 0.6, 0.3)}
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Shikhara (Temple Spire) Wireframe Component
function Shikhara({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Create connecting lines for wireframe effect
  const verticalLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    const segments = 8;
    const levels = 12;
    
    for (let i = 0; i < segments; i++) {
      const line: [number, number, number][] = [];
      for (let level = 0; level < levels; level++) {
        const y = level * 0.4 - 2;
        const radius = Math.max(0.1, 1.5 - level * 0.12);
        const angle = (i / segments) * Math.PI * 2;
        line.push([
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ]);
      }
      lines.push(line);
    }
    return lines;
  }, []);

  // Horizontal rings
  const horizontalRings = useMemo(() => {
    const rings: [number, number, number][][] = [];
    const segments = 32;
    const levels = 12;
    
    for (let level = 0; level < levels; level++) {
      const ring: [number, number, number][] = [];
      const y = level * 0.4 - 2;
      const radius = Math.max(0.1, 1.5 - level * 0.12);
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        ring.push([
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ]);
      }
      rings.push(ring);
    }
    return rings;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.04) * 0.08;
    }
  });

  // Bright gold color for high visibility
  const goldColor = new THREE.Color().setHSL(0.11, 0.85, 0.55 + scrollProgress * 0.1);
  const glowColor = new THREE.Color().setHSL(0.11, 0.9, 0.65);

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, 0, 0]} scale={1.3}>
        {/* Inner glow effect */}
        <GlowSphere position={[0, 1, 0]} scale={1.2} />
        
        {/* Outer glow halo */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[3.5, 32, 32]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.03}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Horizontal rings - high opacity */}
        {horizontalRings.map((ring, idx) => (
          <Line
            key={`ring-${idx}`}
            points={ring}
            color={goldColor}
            lineWidth={1.5}
            transparent
            opacity={0.7 + (idx / horizontalRings.length) * 0.3}
          />
        ))}
        
        {/* Vertical lines - high opacity */}
        {verticalLines.map((line, idx) => (
          <Line
            key={`vert-${idx}`}
            points={line}
            color={goldColor}
            lineWidth={2}
            transparent
            opacity={0.85}
          />
        ))}

        {/* Top finial (kalasha) with glow */}
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color={goldColor} wireframe transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.15} />
        </mesh>

        {/* Base platform - solid */}
        <mesh position={[0, -2.2, 0]}>
          <boxGeometry args={[3.5, 0.3, 3.5]} />
          <meshBasicMaterial color={goldColor} wireframe transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, -2.6, 0]}>
          <boxGeometry args={[4, 0.3, 4]} />
          <meshBasicMaterial color={goldColor} wireframe transparent opacity={0.55} />
        </mesh>
        
        {/* Base glow */}
        <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6, 6]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

// Mandala Grid Component
function MandalaGrid({ visible }: { visible: boolean }) {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  const gridLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    const size = 8;
    const divisions = 9;
    const step = size / divisions;

    for (let i = 0; i <= divisions; i++) {
      const pos = -size / 2 + i * step;
      lines.push([[-size / 2, pos, 0], [size / 2, pos, 0]]);
    }

    for (let i = 0; i <= divisions; i++) {
      const pos = -size / 2 + i * step;
      lines.push([[pos, -size / 2, 0], [pos, size / 2, 0]]);
    }

    lines.push([[-size / 2, -size / 2, 0], [size / 2, size / 2, 0]]);
    lines.push([[size / 2, -size / 2, 0], [-size / 2, size / 2, 0]]);

    return lines;
  }, []);

  const goldColor = new THREE.Color().setHSL(0.11, 0.7, 0.5);

  if (!visible) return null;

  return (
    <group ref={gridRef} position={[0, 0, -10]}>
      {gridLines.map((line, idx) => (
        <Line
          key={`grid-${idx}`}
          points={line}
          color={goldColor}
          lineWidth={0.5}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}

// Particle System for Sound Visualization
function SoundParticles({ active }: { active: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 4;
      
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.sin(theta) * radius;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = Math.random() * 0.03;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (particlesRef.current && active) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];
        
        const y = positions[i * 3 + 1];
        if (y > 4 || y < -4) {
          positions[i * 3 + 1] = 0;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={new THREE.Color().setHSL(0.11, 0.85, 0.65)}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

interface TempleSceneProps {
  scrollProgress: number;
  showMandala: boolean;
  showParticles: boolean;
}

export default function TempleScene({ scrollProgress, showMandala, showParticles }: TempleSceneProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0a0a0c']} />
        
        {/* Enhanced lighting for glow effect */}
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 5, 5]} intensity={1.2} color="#d4a84b" />
        <pointLight position={[5, 0, 5]} intensity={0.8} color="#f0c060" />
        <pointLight position={[-5, 0, 5]} intensity={0.8} color="#f0c060" />
        <pointLight position={[0, -3, 3]} intensity={0.5} color="#d4a84b" />
        
        <Shikhara scrollProgress={scrollProgress} />
        <MandalaGrid visible={showMandala} />
        <SoundParticles active={showParticles} />
      </Canvas>
    </div>
  );
}
