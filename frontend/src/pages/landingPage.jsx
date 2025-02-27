import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

const FloatingShape = ({ position }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial 
        color="#4ade80"
        transparent
        opacity={0.6}
        wireframe
      />
    </mesh>
  );
};

const CircularPattern = ({ position, radius }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }
    return pts;
  }, [radius]);

  return (
    <group position={position}>
      <line>
        <bufferGeometry attach="geometry" setFromPoints={points} />
        <lineBasicMaterial attach="material" color="#2e5a1c" linewidth={2} />
      </line>
    </group>
  );
};

const WheatStalk = ({ position, rotation }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
    meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5 + position[2]) * 0.1;
  });

  const stalkGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(new THREE.Vector3(
        Math.sin(i * 0.2) * 0.1,
        i * 0.4,
        Math.cos(i * 0.2) * 0.1
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef}>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3(stalkGeometry.attributes.position.array),
          20,
          0.05,
          8,
          false
        ]} />
        <meshStandardMaterial color="#2e5a1c" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
};

const WheatField = () => {
  const floatingShapes = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      position: [
        Math.random() * 30 - 15,
        Math.random() * 5 + 2,
        Math.random() * 30 - 15
      ]
    }));
  }, []);

  const patterns = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      position: [0, -4.9, 0],
      radius: (i + 1) * 4
    }));
  }, []);

  const stalks = useMemo(() => {
    const count = 300;
    const rows = 10;
    const stalksPerRow = count / rows;
    
    return Array.from({ length: count }, (_, i) => {
      const row = Math.floor(i / stalksPerRow);
      const col = i % stalksPerRow;
      const radius = row * 2;
      const angle = (col / stalksPerRow) * Math.PI * 2;
      
      return {
        position: [
          Math.cos(angle) * radius,
          -5,
          Math.sin(angle) * radius
        ],
        rotation: [
          0,
          angle + Math.PI,
          0
        ]
      };
    });
  }, []);

  return (
    <>
      {patterns.map((pattern, i) => (
        <CircularPattern key={`pattern-${i}`} {...pattern} />
      ))}

      {stalks.map((stalk, i) => (
        <WheatStalk key={`stalk-${i}`} position={stalk.position} rotation={stalk.rotation} />
      ))}

      {floatingShapes.map((shape, i) => (
        <FloatingShape key={`shape-${i}`} {...shape} />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#1a0f00"
          roughness={1}
          metalness={0.2}
        />
      </mesh>

      <OrbitControls 
        autoRotate 
        autoRotateSpeed={0.3} 
        enableZoom={false}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 2.1}
      />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
      />
      <pointLight
        position={[0, 10, 0]}
        intensity={0.5}
        color="#4ade80"
      />
      <hemisphereLight
        skyColor="#001a00"
        groundColor="#000000"
        intensity={0.5}
      />
      <fog attach="fog" args={["#001a00", 30, 70]} />
    </>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#001a00]">
        <Canvas
          camera={{ position: [0, 5, 30], fov: 75 }}
          shadows
        >
          <WheatField />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.3 }}
        className="relative z-10 text-center text-white max-w-3xl px-4"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Agro-Intel
        </motion.h1>
        
        <motion.p
          variants={fadeInUp}
          className="text-2xl text-gray-200 mt-4 text-shadow-lg"
        >
          AI-Powered Agriculture & Marketplace
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-12">
          <motion.button
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-green-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
