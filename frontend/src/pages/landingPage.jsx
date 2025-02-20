import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";

const AnimatedSpheres = () => {
  const count = 100;
  const positions = Array.from({ length: count }, () => ({
    position: [
      Math.random() * 40 - 20,
      Math.random() * 40 - 20,
      Math.random() * 40 - 20
    ],
    scale: Math.random() * 0.5 + 0.2
  }));

  return (
    <>
      {positions.map((props, i) => (
        <Sphere key={i} position={props.position} scale={props.scale}>
          <meshStandardMaterial
            color={new THREE.Color(0.1, 0.8, 0.3).lerp(
              new THREE.Color(0.1, 0.5, 1.0),
              Math.random()
            )}
            roughness={0.4}
            metalness={0.8}
          />
        </Sphere>
      ))}
      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
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
      {/* 3D Animated Background */}
      <div className="absolute inset-0 bg-black">
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <AnimatedSpheres />
        </Canvas>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

      {/* Animated Content */}
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
          className="text-2xl text-gray-200 mt-4"
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
