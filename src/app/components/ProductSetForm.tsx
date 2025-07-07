interface ProductSetFormProps {
  productSetData: {
    productId: string;
    link: string;
  };
  setProductSetData: React.Dispatch<
    React.SetStateAction<{
      productId: string;
      link: string;
    }>
  >;
  handleProductSetSubmit: (e: React.FormEvent) => void;
}

export default function ProductSetForm({
  productSetData,
  setProductSetData,
  handleProductSetSubmit,
}: ProductSetFormProps) {
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
        }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-6">
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
              <span className="label-text text-slate-700 font-semibold flex items-center space-x-2 mb-4">
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
                <span>링크 (여러개 링크는 쉼표(,) 로 구분해주세요)</span>
              </span>
            </label>

            <textarea
              className="textarea textarea-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl text-slate-700 min-h-[200px] p-2"
              value={productSetData.link}
              onChange={(e) =>
                setProductSetData((prev) => ({
                  ...prev,
                  link: e.target.value,
                }))
              }
              placeholder={`https://example.com\nhttps://example2.com`}
              required
            />
          </div>
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
