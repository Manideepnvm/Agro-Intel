const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-white text-lg">Loading...</p>
    </div>
  </div>
);

export default LoadingState; 