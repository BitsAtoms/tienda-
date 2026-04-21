/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrbitControls, Grid, Text, RoundedBox, OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, Suspense, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw } from 'lucide-react';
import { ASSET_TEMPLATES } from '../constants';
import { GRID_SIZE, GRID_UNITS_X, GRID_UNITS_Y, PlacedAsset } from '../types';

interface AssetProps {
  asset: PlacedAsset;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onMove: (id: string, x: number, y: number) => void;
  setControlsEnabled: (enabled: boolean) => void;
}

function ArcadeModel({ w, h, d, color, isSelected }: { w: number, h: number, d: number, color: string, isSelected: boolean }) {
  return (
    <group>
      {/* Main body - Tech Black */}
      <RoundedBox args={[w, h * 0.7, d]} radius={0.03} position={[0, -h * 0.15, 0]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.2} emissive={isSelected ? '#ec4899' : '#0a0a0a'} emissiveIntensity={0.1} />
      </RoundedBox>
      {/* Control panel - Matte grey */}
      <RoundedBox args={[w, 0.1, 0.4]} radius={0.01} position={[0, h * 0.1, d * 0.3]} rotation={[-0.2, 0, 0]}>
        <meshStandardMaterial color="#333" roughness={0.8} />
      </RoundedBox>
      {/* Top marquee - Translucent with glow */}
      <RoundedBox args={[w, 0.3, d]} radius={0.02} position={[0, h * 0.45, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.9} />
      </RoundedBox>
      {/* Integrated Screen */}
      <mesh position={[0, h * 0.2, d * 0.15]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[w * 0.85, h * 0.45]} />
        <meshStandardMaterial color="#000" emissive={color} emissiveIntensity={1.2} />
      </mesh>
      {/* Side LED strips */}
      <mesh position={[w/2 + 0.01, 0, 0]}>
        <boxGeometry args={[0.01, h, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh position={[-w/2 - 0.01, 0, 0]}>
        <boxGeometry args={[0.01, h, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function ScreenModel({ w, h, d, color, isSelected, content }: { w: number, h: number, d: number, color: string, isSelected: boolean, content?: string }) {
  return (
    <group>
      {/* Chassis - Ultra Slim Brushed Metal */}
      <RoundedBox args={[w, h, 0.08]} radius={0.01}>
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.8} />
      </RoundedBox>
      {/* Screen Panel - AMOLED Deep Black */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[w * 0.98, h * 0.98]} />
        <meshStandardMaterial color="#000" emissive="#3b82f6" emissiveIntensity={1.5} />
      </mesh>
      {/* Information Overlay */}
      <Text
        position={[0, 0, 0.05]}
        fontSize={0.14}
        color="white"
        maxWidth={w * 0.9}
        textAlign="center"
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/t6nu2oayl_uDRmGGLvX9SzlAsfAL.ttf"
      >
        {content || 'STOCK: READY\nINTERACT_'}
      </Text>
      {/* Rear Mount/Stand */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[w * 0.4, h * 0.4, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

function ShelfModel({ w, h, d, color, isSelected }: { w: number, h: number, d: number, color: string, isSelected: boolean }) {
  return (
    <group>
      {/* Structural Frame - Brushed Champagne/Silver */}
      <mesh position={[-w / 2 + 0.01, 0, 0]}>
        <boxGeometry args={[0.02, h, d]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[w / 2 - 0.01, 0, 0]}>
        <boxGeometry args={[0.02, h, d]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Shelves with Integrated Lighting */}
      {[...Array(8)].map((_, i) => {
        const shelfY = -h/2 + (i * h/7.5) + 0.15;
        return (
          <group key={i} position={[0, shelfY, 0]}>
            {/* Glass Shelf */}
            <mesh>
              <boxGeometry args={[w - 0.04, 0.02, d]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.4} roughness={0} metalness={0.5} />
            </mesh>
            {/* Undershelf Glo Light */}
            <mesh position={[0, -0.015, d/2 - 0.05]}>
              <boxGeometry args={[w * 0.9, 0.01, 0.01]} />
              <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </mesh>
            
            {/* Sneakers on display */}
            {[-w/3.5, -w/8, w/8, w/3.5].map((boxX, j) => (
              <group key={j} position={[boxX, 0.1, 0]} rotation={[0, -0.4, 0]}>
                {/* Sole - Sculpted look */}
                <RoundedBox args={[0.35, 0.06, 0.16]} radius={0.02}>
                  <meshStandardMaterial color="#fff" roughness={0.4} />
                </RoundedBox>
                {/* Upper - Modern sneaker silhouette */}
                <RoundedBox args={[0.3, 0.12, 0.14]} radius={0.04} position={[0.02, 0.08, 0]}>
                  <meshStandardMaterial 
                    color={isSelected ? '#ec4899' : ['#111', '#fff', '#3b82f6', '#ef4444'][ (i+j) % 4 ]} 
                    roughness={0.2}
                    metalness={0.1}
                  />
                </RoundedBox>
                {/* Toe cap detail */}
                <RoundedBox args={[0.1, 0.05, 0.12]} radius={0.05} position={[-0.12, 0.05, 0]}>
                  <meshStandardMaterial color="#ddd" />
                </RoundedBox>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function PedestalModel({ w, h, d, color, isSelected }: { w: number, h: number, d: number, color: string, isSelected: boolean }) {
  return (
    <group>
      {/* Premium Ceramic Base */}
      <RoundedBox args={[w, h, d]} radius={0.04}>
        <meshStandardMaterial color="#ffffff" roughness={0} metalness={0.5} />
      </RoundedBox>
      {/* Rotating Display Plinth */}
      <mesh position={[0, h/2 + 0.02, 0]}>
        <cylinderGeometry args={[w * 0.4, w * 0.4, 0.05, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Featured Shoe on Pedestal */}
      <group position={[0, h/2 + 0.15, 0]} rotation={[0.2, Math.PI / 4, 0]}>
        <RoundedBox args={[0.4, 0.08, 0.18]} radius={0.02}>
          <meshStandardMaterial color="#fff" />
        </RoundedBox>
        <RoundedBox args={[0.35, 0.15, 0.15]} radius={0.05} position={[0.02, 0.1, 0]}>
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={isSelected ? 1 : 0.2} />
        </RoundedBox>
      </group>

      {/* Accent Spotlight */}
      <mesh position={[0, h/2 + 0.05, 0]}>
        <pointLight intensity={10} color="#fff" distance={1} />
        <boxGeometry args={[w * 0.3, 0.01, d * 0.3]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
      </mesh>
    </group>
  );
}

function Asset({ asset, onSelect, isSelected, onMove, setControlsEnabled }: AssetProps) {
  const template = ASSET_TEMPLATES.find(t => t.id === asset.templateId);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const groupRef = useRef<THREE.Group>(null!);
  
  if (!template) return null;

  const w = template.width * GRID_SIZE;
  const d = template.height * GRID_SIZE;
  const h = template.depth * GRID_SIZE;

  const targetX = asset.x * GRID_SIZE + w / 2;
  const targetZ = asset.y * GRID_SIZE + d / 2;
  const baseY = h / 2;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Smooth transitions for visuals
    const tY = isSelected ? baseY + 0.15 : (hovered ? baseY + 0.1 : baseY);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, tY, 0.15);
    
    const tS = isSelected ? 1.05 : (hovered ? 1.03 : 1);
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, tS, 0.15);
    groupRef.current.scale.set(s, s, s);

    // Draggable Logic
    if (dragging) {
      const planeFloor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      state.raycaster.ray.intersectPlane(planeFloor, intersectionPoint);

      // Snap to grid coordinates
      const gridX = Math.round((intersectionPoint.x - w / 2) / GRID_SIZE);
      const gridZ = Math.round((intersectionPoint.z - d / 2) / GRID_SIZE);

      // Boundary checks
      const validX = Math.max(0, Math.min(gridX, GRID_UNITS_X - template.width));
      const validZ = Math.max(0, Math.min(gridZ, GRID_UNITS_Y - template.height));

      if (validX !== asset.x || validZ !== asset.y) {
        onMove(asset.id, validX, validZ);
      }
    }
  });

  const renderModel = () => {
    const colorOverride = isSelected ? '#ec4899' : template.color;
    
    switch (template.type) {
      case 'arcade':
        return <ArcadeModel w={w} h={h} d={d} color={colorOverride} isSelected={isSelected} />;
      case 'screen':
        return <ScreenModel w={w} h={h} d={d} color={colorOverride} isSelected={isSelected} content={asset.content} />;
      case 'shelf':
        return <ShelfModel w={w} h={h} d={d} color={colorOverride} isSelected={isSelected} />;
      case 'stand':
        return <PedestalModel w={w} h={h} d={d} color={colorOverride} isSelected={isSelected} />;
      default:
        return (
          <RoundedBox args={[w, h, d]} radius={0.05} smoothness={4}>
            <meshStandardMaterial color={colorOverride} />
          </RoundedBox>
        );
    }
  };

  return (
    <group 
      ref={groupRef}
      position={[targetX, baseY, targetZ]} 
      rotation={[0, (asset.rotation * Math.PI) / 180, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        onSelect(asset.id);
        setDragging(true);
        setControlsEnabled(false);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        setDragging(false);
        setControlsEnabled(true);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = dragging ? 'grabbing' : 'grab';
      }}
      onPointerOut={(e) => {
        setHovered(false);
        if (!dragging) document.body.style.cursor = 'default';
      }}
    >
      <Suspense fallback={null}>
        {renderModel()}
      </Suspense>
    </group>
  );
}

interface Store3DProps {
  assets: PlacedAsset[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onMoveAsset: (id: string, x: number, y: number) => void;
}

export default function Store3D({ assets, selectedId, setSelectedId, onMoveAsset }: Store3DProps) {
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [viewAngle, setViewAngle] = useState(0); // 0..3 for 90deg steps
  const controlsRef = useRef<any>(null);
  const floorWidth = GRID_UNITS_X * GRID_SIZE;
  const floorHeight = GRID_UNITS_Y * GRID_SIZE;

  const rotateView = () => {
    setViewAngle((prev) => (prev + 1) % 4);
  };

  return (
    <div className="absolute inset-0 bg-[#070708] rounded-2xl overflow-hidden border border-white/5 shadow-inner">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
      >
        <color attach="background" args={['#0c0d0f']} />
        
        <CameraTransition angleIndex={viewAngle} />

        <OrbitControls 
          ref={controlsRef}
          enabled={controlsEnabled}
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={1}
          maxDistance={300}
          target={[floorWidth / 2, 0, floorHeight / 2]}
          makeDefault
        />
        
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={0.5} />
        <pointLight position={[floorWidth / 2, 6, floorHeight / 2]} intensity={200} color="#ffffff" distance={30} decay={2} />
        
        {/* Neon Accent Lights (Blue & Pink) */}
        <pointLight position={[5, 4, 2]} intensity={60} color="#3b82f6" distance={20} />
        <pointLight position={[floorWidth - 5, 4, floorHeight - 2]} intensity={60} color="#ec4899" distance={20} />
        
        {/* Direct Product Lighting Simulation */}
        <directionalLight position={[20, 20, 10]} intensity={1.2} castShadow />

        <Suspense fallback={null}>
          {/* Floor - Polished Graphite Finish */}
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[floorWidth / 2, -0.01, floorHeight / 2]} receiveShadow>
              <planeGeometry args={[floorWidth + 4, floorHeight + 4]} />
              <meshStandardMaterial 
                color="#1a1c1e" 
                roughness={0.05} 
                metalness={0.8} 
              />
            </mesh>
            {/* Subtle Tech Grid */}
            <Grid
              position={[floorWidth / 2, 0.01, floorHeight / 2]}
              args={[floorWidth, floorHeight]}
              cellSize={GRID_SIZE}
              cellThickness={0.5}
              cellColor="#2a2d32"
              sectionSize={GRID_SIZE * 4}
              sectionThickness={1}
              sectionColor="#3b4046"
              fadeDistance={50}
              fadeStrength={1}
              infiniteGrid={false}
            />
          </group>

          {/* Architectural Shell */}
          <group>
            {/* Back Wall - Feature Panel */}
            <mesh position={[floorWidth / 2, 2, -0.2]}>
              <boxGeometry args={[floorWidth + 2, 4, 0.4]} />
              <meshStandardMaterial color="#f0f2f5" roughness={0.8} />
            </mesh>
            
            {/* Side Walls - Architectural Glass/Metal Mix */}
            {/* Left Wall */}
            <mesh position={[-0.2, 2, floorHeight / 2]}>
              <boxGeometry args={[0.4, 4, floorHeight + 2]} />
              <meshStandardMaterial color="#141618" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Right Wall */}
            <mesh position={[floorWidth + 0.2, 2, floorHeight / 2]}>
              <boxGeometry args={[0.4, 4, floorHeight + 2]} />
              <meshStandardMaterial color="#141618" roughness={0.4} metalness={0.6} />
            </mesh>
            
            {/* Entrance Feature (Open Glass Look) */}
            <mesh position={[floorWidth / 2, 0.1, floorHeight + 0.2]}>
              <boxGeometry args={[floorWidth, 0.2, 0.4]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
            </mesh>
            
            {/* Architectural Perks - Periodic Wall Lights */}
            {[...Array(6)].map((_, i) => (
              <group key={`wall-light-${i}`}>
                {/* Left Wall Light */}
                <mesh position={[0.21, 2.5, (i * (floorHeight / 5))]}>
                  <boxGeometry args={[0.05, 1, 0.1]} />
                  <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} />
                </mesh>
                {/* Right Wall Light */}
                <mesh position={[floorWidth - 0.21, 2.5, (i * (floorHeight / 5))]}>
                  <boxGeometry args={[0.05, 1, 0.1]} />
                  <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} />
                </mesh>
              </group>
            ))}

            {/* Glowing Baseboards */}
            <mesh position={[floorWidth / 2, 0.05, -0.01]}>
              <boxGeometry args={[floorWidth, 0.1, 0.05]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
            </mesh>

            {/* Ceiling Structure - Technical Grid Beams */}
            <group position={[floorWidth / 2, 4, floorHeight / 2]}>
              {[...Array(Math.floor(floorWidth / 4))].map((_, i) => (
                <mesh key={`c-beam-x-${i}`} position={[i * 4 - floorWidth/2, 0, 0]}>
                  <boxGeometry args={[0.05, 0.1, floorHeight]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
              ))}
              {[...Array(Math.floor(floorHeight / 4))].map((_, i) => (
                <mesh key={`c-beam-z-${i}`} position={[0, 0, i * 4 - floorHeight/2]}>
                  <boxGeometry args={[floorWidth, 0.1, 0.05]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
              ))}
            </group>
          </group>
          
          {/* Assets Grid */}
          {assets.map((asset) => (
            <Asset 
              key={asset.id} 
              asset={asset} 
              onSelect={setSelectedId} 
              isSelected={selectedId === asset.id}
              onMove={onMoveAsset}
              setControlsEnabled={setControlsEnabled}
            />
          ))}
        </Suspense>

        <fog attach="fog" args={['#0c0d0f', 30, 80]} />
      </Canvas>
      
      {/* 3D Instructions & Camera Controls Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 text-[10px] text-white/70">
          <p className="font-bold text-white/40 mb-1 tracking-widest">DRAG OBJECTS TO MOVE_</p>
          <p>LMB: FREE ROTATE | RMB: PAN | SCROLL: ZOOM</p>
        </div>
      </div>

      {/* Rotation UI - Sims Style */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-3">
        <button 
          onClick={rotateView}
          className="group flex items-center justify-center w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full transition-all active:scale-95 shadow-2xl"
          title="Rotate View 90°"
        >
          <RotateCcw className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-500" />
        </button>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx} 
              className={`w-1.5 h-1.5 rounded-full transition-colors ${viewAngle === idx ? 'bg-pink-500' : 'bg-white/20'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * CameraTransition manages smooth 90-degree rotations around the center floor point.
 */
function CameraTransition({ angleIndex }: { angleIndex: number }) {
  const floorWidth = GRID_UNITS_X * GRID_SIZE;
  const floorHeight = GRID_UNITS_Y * GRID_SIZE;
  const center = new THREE.Vector3(floorWidth / 2, 0, floorHeight / 2);
  const radius = 35; // Distancia fija para la vista isométrica
  const height = 25; // Altura fija

  useFrame((state) => {
    // Calculate target position based on angleIndex (0, 90, 180, 270 degrees)
    const angle = (angleIndex * Math.PI) / 2 + Math.PI / 4;
    const targetX = center.x + Math.cos(angle) * radius;
    const targetZ = center.z + Math.sin(angle) * radius;
    const targetPos = new THREE.Vector3(targetX, height, targetZ);

    state.camera.position.lerp(targetPos, 0.08);
    state.camera.lookAt(center);
  });

  return <OrthographicCamera makeDefault zoom={38} />;
}
