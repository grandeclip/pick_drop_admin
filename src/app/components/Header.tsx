export default function Header() {
  const env = process.env.NODE_ENV;
  return (
    <div className="bg-white/70 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {env === "development"
                ? "PickDrop Admin (Dev)"
                : "PickDrop Admin"}
            </h1>
            <p className="text-slate-600 text-sm">
              상품 및 상품세트 관리 시스템
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
