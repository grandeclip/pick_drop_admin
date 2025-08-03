interface SidebarProps {
  activeTab: "product" | "productSet" | "mdpick" | "brand";
  setActiveTab: (tab: "product" | "productSet" | "mdpick" | "brand") => void;
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

          <button
            className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${
              activeTab === "mdpick"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                : "text-slate-700 hover:bg-indigo-50 hover:scale-105"
            }`}
            onClick={() => setActiveTab("mdpick")}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeTab === "mdpick" ? "bg-white/20" : "bg-indigo-100"
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  activeTab === "mdpick" ? "text-white" : "text-indigo-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <span className="font-semibold">MD Pick 설정</span>
          </button>

          <button
            className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${
              activeTab === "brand"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                : "text-slate-700 hover:bg-indigo-50 hover:scale-105"
            }`}
            onClick={() => setActiveTab("brand")}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeTab === "brand" ? "bg-white/20" : "bg-indigo-100"
              }`}
            >
              <svg
                className={`w-5 h-5 ${
                  activeTab === "brand" ? "text-white" : "text-indigo-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <span className="font-semibold">브랜드 등록</span>
          </button>
        </div>
      </div>
    </div>
  );
}
