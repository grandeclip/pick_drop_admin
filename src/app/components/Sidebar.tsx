interface SidebarProps {
  activeTab: "product" | "productSet";
  setActiveTab: (tab: "product" | "productSet") => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sticky top-32">
        <div className="space-y-3">
          <button
            className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${
              activeTab === "product"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                : "text-slate-700 hover:bg-indigo-50 hover:scale-105"
            }`}
            onClick={() => setActiveTab("product")}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeTab === "product" ? "bg-white/20" : "bg-indigo-100"
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  activeTab === "product" ? "text-white" : "text-indigo-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="font-semibold">상품 등록</span>
          </button>

          <button
            className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${
              activeTab === "productSet"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                : "text-slate-700 hover:bg-indigo-50 hover:scale-105"
            }`}
            onClick={() => setActiveTab("productSet")}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeTab === "productSet" ? "bg-white/20" : "bg-indigo-100"
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  activeTab === "productSet" ? "text-white" : "text-indigo-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="font-semibold">상품세트 등록</span>
          </button>
        </div>
      </div>
    </div>
  );
}
