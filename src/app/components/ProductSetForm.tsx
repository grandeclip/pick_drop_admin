interface ProductSetFormProps {
  productSetData: {
    productId: string;
    name: string;
    originalPrice: string;
    discountedPrice: string;
    platform: string;
    link: string;
    shippingCost: string;
  };
  setProductSetData: React.Dispatch<
    React.SetStateAction<{
      productId: string;
      name: string;
      originalPrice: string;
      discountedPrice: string;
      platform: string;
      link: string;
      shippingCost: string;
    }>
  >;
  handleProductSetSubmit: (e: React.FormEvent) => void;
}

const PLATFORM_OPTIONS = [
  "musinsa",
  "oliveyoung",
  "ably",
  "kurly",
  "zigzag",
  "hwahae",
  "manyo",
  "fwee",
  "peripera",
  "coupang",
  "clubclio",
  "romand",
  "amoremall",
  "snature",
  "roundlab",
  "ahc",
  "hera",
  "banila",
  "torriden",
  "medihealshop",
  "wellage",
  "illiyoon",
  "vdl",
  "dasique",
  "naming",
  "unove",
  "dalba",
];

export default function ProductSetForm({
  productSetData,
  setProductSetData,
  handleProductSetSubmit,
}: ProductSetFormProps) {
  const resetForm = () => {
    setProductSetData({
      productId: "",
      name: "",
      originalPrice: "",
      discountedPrice: "",
      platform: "",
      shippingCost: "",
      link: "",
    });
  };
  return (
    <div>
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center">
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">상품세트 등록</h2>
          <p className="text-slate-600">상품을 다양한 플랫폼에 등록해보세요</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          handleProductSetSubmit(e);
          resetForm();
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-700 font-semibold flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                <span>상품 아이디</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700"
              value={productSetData.productId}
              onChange={(e) =>
                setProductSetData((prev) => ({
                  ...prev,
                  productId: e.target.value,
                }))
              }
              placeholder="상품 아이디를 입력하세요"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-700 font-semibold flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
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
                <span>상품세트 이름</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700"
              value={productSetData.name}
              onChange={(e) =>
                setProductSetData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="상품세트 이름을 입력하세요"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-700 font-semibold flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span>정가 가격</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700"
              value={productSetData.originalPrice}
              onChange={(e) =>
                setProductSetData((prev) => ({
                  ...prev,
                  originalPrice: e.target.value,
                }))
              }
              placeholder="정가 가격을 입력하세요"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-700 font-semibold flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
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
                <span>할인된 가격</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700"
              value={productSetData.discountedPrice}
              onChange={(e) =>
                setProductSetData((prev) => ({
                  ...prev,
                  discountedPrice: e.target.value,
                }))
              }
              placeholder="할인된 가격을 입력하세요"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-700 font-semibold flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                  />
                </svg>
                <span>플랫폼 선택</span>
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((platform) => {
                const isSelected = productSetData.platform === platform;
                return (
                  <button
                    key={platform}
                    type="button"
                    className={
                      "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 " +
                      (isSelected
                        ? "bg-indigo-500 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100")
                    }
                    onClick={() =>
                      setProductSetData((prev) => ({
                        ...prev,
                        platform: platform,
                      }))
                    }
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-700 font-semibold flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>배송비</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700"
              value={productSetData.shippingCost}
              onChange={(e) =>
                setProductSetData((prev) => ({
                  ...prev,
                  shippingCost: e.target.value,
                }))
              }
              placeholder="배송비를 입력하세요"
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-slate-700 font-semibold flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span>링크 (하나씩만 입력해주세요)</span>
            </span>
          </label>

          <input
            type="url"
            className="input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700"
            value={productSetData.link}
            onChange={(e) =>
              setProductSetData((prev) => ({
                ...prev,
                link: e.target.value,
              }))
            }
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="form-control mt-8">
          <button
            type="submit"
            className="btn bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none hover:from-blue-600 hover:to-indigo-700 rounded-2xl h-14 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 p-4"
          >
            상품세트 등록하기
          </button>
        </div>
      </form>
    </div>
  );
}
