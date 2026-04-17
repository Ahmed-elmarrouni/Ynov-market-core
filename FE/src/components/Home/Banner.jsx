
const Banner = ({ appName, token }) => {
  if (token) {
    return null;
  }

  return (
    <div className="relative bg-[#0f172a] overflow-hidden py-16 sm:py-24 border-b border-indigo-900/50 shadow-2xl">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600 rounded-full blur-[120px] opacity-20 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-purple-600 rounded-full blur-[100px] opacity-20 mix-blend-screen pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-sm tracking-tight mb-4">
          {appName.toLowerCase()}
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl sm:text-2xl text-indigo-200 font-light">
          A place to share your knowledge.
        </p>
      </div>
    </div>
  );
};

export default Banner;