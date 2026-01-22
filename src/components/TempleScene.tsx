import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Shikhara (Temple Spire) Wireframe Component
function Shikhara({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Create the temple spire geometry using primitives
  const spirePoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 8;
    const levels = 12;
    
    for (let level = 0; level < levels; level++) {
      const y = level * 0.4 - 2;
      const radius = Math.max(0.1, 1.5 - level * 0.12);
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push([
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ]);
      }
    }
    return points;
  }, []);

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
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  // Color transitions based on scroll
  const goldColor = new THREE.Color().setHSL(0.11, 0.7, 0.5 + scrollProgress * 0.1);

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Horizontal rings */}
        {horizontalRings.map((ring, idx) => (
          <Line
            key={`ring-${idx}`}
            points={ring}
            color={goldColor}
            lineWidth={1}
            transparent
            opacity={0.6 + (idx / horizontalRings.length) * 0.4}
          />
        ))}
        
        {/* Vertical lines */}
        {verticalLines.map((line, idx) => (
          <Line
            key={`vert-${idx}`}
            points={line}
            color={goldColor}
            lineWidth={1.5}
            transparent
            opacity={0.8}
          />
        ))}

        {/* Top finial (kalasha) */}
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color={goldColor} wireframe />
        </mesh>

        {/* Base platform */}
        <mesh position={[0, -2.2, 0]}>
          <boxGeometry args={[3.5, 0.3, 3.5]} />
          <meshBasicMaterial color={goldColor} wireframe transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, -2.6, 0]}>
          <boxGeometry args={[4, 0.3, 4]} />
          <meshBasicMaterial color={goldColor} wireframe transparent opacity={0.3} />
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

    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const pos = -size / 2 + i * step;
      lines.push([
        [-size / 2, pos, 0],
        [size / 2, pos, 0]
      ]);
    }

    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const pos = -size / 2 + i * step;
      lines.push([
        [pos, -size / 2, 0],
        [pos, size / 2, 0]
      ]);
    }

    // Diagonal lines
    lines.push([[-size / 2, -size / 2, 0], [size / 2, size / 2, 0]]);
    lines.push([[size / 2, -size / 2, 0], [-size / 2, size / 2, 0]]);

    return lines;
  }, []);

  const goldColor = new THREE.Color().setHSL(0.11, 0.7, 0.5);

  if (!visible) return null;

  return (
    <group ref={gridRef} position={[0, 0, -5]}>
      {gridLines.map((line, idx) => (
        <Line
          key={`grid-${idx}`}
          points={line}
          color={goldColor}
          lineWidth={0.5}
          transparent
          opacity={0.15}
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
        
        // Reset particles that go too far
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
        size={0.05}
        color={new THREE.Color().setHSL(0.11, 0.8, 0.6)}
        transparent
        opacity={0.8}
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
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0a0a0c']} />
        <fog attach="fog" args={['#0a0a0c', 10, 30]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#d4a84b" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#d4a84b" />
        
        <Shikhara scrollProgress={scrollProgress} />
        <MandalaGrid visible={showMandala} />
        <SoundParticles active={showParticles} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
