interface ProductFormProps {
  productData: {
    name: string;
    description: string;
    imageFile: File | null;
    imageName: string;
  };
  setProductData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      imageFile: File | null;
      imageName: string;
    }>
  >;
  handleProductSubmit: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProductForm({
  productData,
  setProductData,
  handleProductSubmit,
  handleImageUpload,
}: ProductFormProps) {
  return (
    <div>
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center">
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">상품 등록</h2>
          <p className="text-slate-600">새로운 상품을 시스템에 등록해보세요</p>
        </div>
      </div>

      <form onSubmit={handleProductSubmit} className="space-y-6">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span>상품 이름</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700"
              value={productData.name}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="상품 이름을 입력하세요"
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>상품 이미지</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="file"
                className="file-input file-input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 rounded-2xl h-14"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
              {productData.imageName && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center space-x-2 text-emerald-700">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      선택된 파일: {productData.imageName}
                    </span>
                  </div>
                </div>
              )}
            </div>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>상품 설명</span>
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl min-h-32 text-slate-700"
            value={productData.description}
            onChange={(e) =>
              setProductData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="상품에 대한 자세한 설명을 입력하세요..."
            rows={5}
            required
          />
        </div>

        <div className="form-control mt-8">
          <button
            type="submit"
            className="btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none hover:from-emerald-600 hover:to-teal-700 rounded-2xl h-14 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 p-4"
          >
            상품 등록하기
          </button>
        </div>
      </form>
    </div>
  );
}
