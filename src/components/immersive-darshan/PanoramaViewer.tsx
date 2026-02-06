import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3d, 
  Smartphone,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImmersiveTemple, TempleZone } from '@/data/immersiveTemples';

interface PanoramaViewerProps {
  temple: ImmersiveTemple;
  currentZone: TempleZone;
  onZoneChange: (zoneId: string) => void;
  onClose: () => void;
  onRitualInteract: (ritualType: string, position: { x: number; y: number; z: number }) => void;
  onMeditationStart: (spotId: string) => void;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

// Helper to check if URL is external
const isExternalUrl = (url: string): boolean => {
  if (url.startsWith('data:') || url.startsWith('blob:')) return false;
  try {
    return new URL(url).origin !== window.location.origin;
  } catch {
    return false;
  }
};

// Panorama sphere component with proper CORS handling
const PanoramaSphere = ({ 
  imageUrl, 
  lightColor, 
  lightIntensity 
}: { 
  imageUrl: string; 
  lightColor: string;
  lightIntensity: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const loader = new THREE.TextureLoader();
    
    // Set crossOrigin for external URLs BEFORE loading
    if (isExternalUrl(imageUrl)) {
      loader.setCrossOrigin('anonymous');
    }
    
    loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.repeat.x = -1;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTexture);
        setIsLoading(false);
      },
      undefined, // onProgress
      (err) => {
        console.error('Failed to load panorama texture:', err);
        setError('Failed to load panorama');
        setIsLoading(false);
      }
    );

    // Cleanup previous texture
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [imageUrl]);

  return (
    <>
      <ambientLight intensity={lightIntensity * 0.5} color={lightColor} />
      <pointLight position={[0, 10, 0]} intensity={lightIntensity} color={lightColor} />
      
      {/* Loading indicator */}
      {isLoading && (
        <Html center>
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading panorama...</span>
          </div>
        </Html>
      )}
      
      {/* Error message */}
      {error && (
        <Html center>
          <div className="bg-destructive/80 text-white px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </Html>
      )}
      
      {/* Panorama sphere */}
      {texture && (
        <Sphere ref={meshRef} args={[500, 64, 64]} scale={[-1, 1, 1]}>
          <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </Sphere>
      )}
    </>
  );
};

// Hotspot marker component
const HotspotMarker = ({ 
  position, 
  label, 
  onClick,
  type = 'navigation'
}: { 
  position: { x: number; y: number; z: number }; 
  label: string;
  onClick: () => void;
  type?: 'navigation' | 'ritual' | 'meditation';
}) => {
  const [hovered, setHovered] = useState(false);
  
  const getColor = () => {
    switch (type) {
      case 'ritual': return '#FFD700';
      case 'meditation': return '#9370DB';
      default: return '#00BFFF';
    }
  };

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[hovered ? 0.6 : 0.4, 16, 16]} />
        <meshStandardMaterial 
          color={getColor()} 
          emissive={getColor()} 
          emissiveIntensity={hovered ? 1 : 0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={10}>
          <div className="bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border border-primary/50">
            {label}
          </div>
        </Html>
      )}
      {/* Pulsing ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Camera controller with gyroscope support
const CameraController = ({ enableGyroscope }: { enableGyroscope: boolean }) => {
  const { camera } = useThree();
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });

  useEffect(() => {
    if (!enableGyroscope) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      });
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enableGyroscope]);

  useFrame(() => {
    if (enableGyroscope) {
      const { alpha, beta, gamma } = deviceOrientation;
      // Convert device orientation to camera rotation
      camera.rotation.x = THREE.MathUtils.degToRad(beta - 90);
      camera.rotation.y = THREE.MathUtils.degToRad(alpha);
      camera.rotation.z = THREE.MathUtils.degToRad(-gamma);
    }
  });

  return null;
};

// Scene component
const PanoramaScene = ({
  zone,
  temple,
  onZoneChange,
  onRitualInteract,
  onMeditationStart,
  timeOfDay,
  enableGyroscope
}: {
  zone: TempleZone;
  temple: ImmersiveTemple;
  onZoneChange: (zoneId: string) => void;
  onRitualInteract: (ritualType: string, position: { x: number; y: number; z: number }) => void;
  onMeditationStart: (spotId: string) => void;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  enableGyroscope: boolean;
}) => {
  const theme = temple.themes[timeOfDay];

  return (
    <>
      <CameraController enableGyroscope={enableGyroscope} />
      <PanoramaSphere 
        imageUrl={zone.panoramaUrl} 
        lightColor={theme.lightColor}
        lightIntensity={theme.intensity}
      />
      
      {/* Navigation hotspots */}
      {zone.hotspots.map((hotspot) => (
        <HotspotMarker
          key={hotspot.id}
          position={hotspot.position}
          label={hotspot.label}
          type="navigation"
          onClick={() => onZoneChange(hotspot.targetZoneId)}
        />
      ))}
      
      {/* Ritual hotspots */}
      {zone.ritualPoints.map((ritual) => (
        <HotspotMarker
          key={ritual.id}
          position={ritual.position}
          label={ritual.label}
          type="ritual"
          onClick={() => onRitualInteract(ritual.type, ritual.position)}
        />
      ))}
      
      {/* Meditation spots */}
      {zone.meditationSpots.map((spot) => (
        <HotspotMarker
          key={spot.id}
          position={spot.position}
          label={`Meditate: ${spot.name}`}
          type="meditation"
          onClick={() => onMeditationStart(spot.id)}
        />
      ))}
      
      {!enableGyroscope && (
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          rotateSpeed={-0.5}
          zoomSpeed={0.5}
          minDistance={0.1}
          maxDistance={100}
          reverseOrbit={true}
        />
      )}
    </>
  );
};

const PanoramaViewer = ({
  temple,
  currentZone,
  onZoneChange,
  onClose,
  onRitualInteract,
  onMeditationStart,
  timeOfDay
}: PanoramaViewerProps) => {
  const [enableGyroscope, setEnableGyroscope] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleGyroscopeToggle = useCallback(async () => {
    if (!enableGyroscope) {
      // Request permission on iOS
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const response = await (DeviceOrientationEvent as any).requestPermission();
          if (response === 'granted') {
            setEnableGyroscope(true);
          }
        } catch (error) {
          console.error('Gyroscope permission denied:', error);
        }
      } else {
        setEnableGyroscope(true);
      }
    } else {
      setEnableGyroscope(false);
    }
  }, [enableGyroscope]);

  // Get zone index for navigation
  const zoneIndex = temple.zones.findIndex(z => z.id === currentZone.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 75 + (1 - zoomLevel) * 30 }}
        style={{ width: '100%', height: '100%' }}
      >
        <PanoramaScene
          zone={currentZone}
          temple={temple}
          onZoneChange={onZoneChange}
          onRitualInteract={onRitualInteract}
          onMeditationStart={onMeditationStart}
          timeOfDay={timeOfDay}
          enableGyroscope={enableGyroscope}
        />
      </Canvas>

      {/* Overlay UI */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display text-gold-gradient">{temple.name}</h2>
                  <p className="text-sm text-white/70">{currentZone.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Zone navigation */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              {zoneIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onZoneChange(temple.zones[zoneIndex - 1].id)}
                  className="text-white bg-black/40 hover:bg-black/60 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              {zoneIndex < temple.zones.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onZoneChange(temple.zones[zoneIndex + 1].id)}
                  className="text-white bg-black/40 hover:bg-black/60 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-auto">
              <div className="flex items-center justify-center gap-4">
                {/* Gyroscope toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGyroscopeToggle}
                  className={`text-white rounded-full ${enableGyroscope ? 'bg-primary/60' : 'bg-black/40'} hover:bg-black/60`}
                  title="Toggle gyroscope"
                >
                  <Smartphone className="w-5 h-5" />
                </Button>

                {/* Zoom controls */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
                  className="text-white bg-black/40 hover:bg-black/60 rounded-full"
                  title="Zoom in"
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
                  className="text-white bg-black/40 hover:bg-black/60 rounded-full"
                  title="Zoom out"
                >
                  <ZoomOut className="w-5 h-5" />
                </Button>

                {/* Reset view */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoomLevel(1)}
                  className="text-white bg-black/40 hover:bg-black/60 rounded-full"
                  title="Reset view"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>

                {/* 3D mode indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full">
                  <Move3d className="w-4 h-4 text-primary" />
                  <span className="text-xs text-white">360°</span>
                </div>
              </div>

              {/* Zone indicator */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {temple.zones.map((zone, i) => (
                  <button
                    key={zone.id}
                    onClick={() => onZoneChange(zone.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      zone.id === currentZone.id 
                        ? 'bg-primary w-6' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    title={zone.name}
                  />
                ))}
              </div>
            </div>

            {/* Instructions overlay */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/60 rounded-full text-white/80 text-sm">
                <Eye className="w-4 h-4" />
                <span>Drag to look around • Tap hotspots to interact</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle controls visibility */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute bottom-4 right-4 z-10 p-2 bg-black/40 rounded-full text-white/70 hover:text-white"
      >
        {showControls ? 'Hide UI' : 'Show UI'}
      </button>
    </motion.div>
  );
};

export default PanoramaViewer;
