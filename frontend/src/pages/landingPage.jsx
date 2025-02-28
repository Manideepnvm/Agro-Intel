import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";

const FlyingBird = ({ position }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRef.current.position.x = position[0] + Math.sin(t * 2) * 5;
    meshRef.current.position.y = position[1] + Math.abs(Math.sin(t)) * 2;
    meshRef.current.position.z = position[2] + Math.cos(t * 2) * 5;
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.1, 0.3, 8]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
};

const DewDrop = ({ position }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = position[1] + Math.sin(t * 3) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="#b0e57c" transparent opacity={0.8} />
    </mesh>
  );
};

const GreenField = () => {
  const flyingBirds = useMemo(() => Array.from({ length: 8 }, () => ({
    position: [Math.random() * 40 - 20, Math.random() * 5 + 2, Math.random() * 40 - 20]
  })), []);

  const dewDrops = useMemo(() => Array.from({ length: 20 }, () => ({
    position: [Math.random() * 40 - 20, -5, Math.random() * 40 - 20]
  })), []);

  return (
    <>
      {flyingBirds.map((bird, i) => <FlyingBird key={`bird-${i}`} position={bird.position} />)}
      {dewDrops.map((drop, i) => <DewDrop key={`drop-${i}`} position={drop.position} />)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a4d2e" roughness={1} />
      </mesh>
      <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade />
      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 2.1} />
      <ambientLight intensity={0.6} color="#b0e57c" />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow color="#b0e57c" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#006400" />
      <fog attach="fog" args={["#1a4d2e", 30, 70]} />
    </>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#1a4d2e]">
        <Canvas camera={{ position: [0, 5, 30], fov: 75 }} shadows>
          <GreenField />
        </Canvas>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center text-white max-w-3xl px-4">
        <motion.h1 className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-black" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
          Agro-Intel
        </motion.h1>
        <motion.p className="text-2xl text-gray-200 mt-4">
          Empowering Agriculture with AI
        </motion.p>
        <motion.button onClick={() => navigate("/login")} className="mt-12 px-8 py-4 bg-gradient-to-r from-green-500 to-black text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-green-500/50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
          Explore Now
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LandingPage;
