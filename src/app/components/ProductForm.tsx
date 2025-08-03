import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";

interface Brand {
  brand_id: string;
  name: string;
}

interface ProductFormProps {
  productData: {
    name: string;
    description: string;
    imageFile: File | null;
    imageName: string;
    brand_id: string;
  };
  setProductData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      imageFile: File | null;
      imageName: string;
      brand_id: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 브랜드 관련 상태
  const [brandSearchValue, setBrandSearchValue] = useState("");
  const [brandSearchResults, setBrandSearchResults] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSearchingBrands, setIsSearchingBrands] = useState(false);
  const [brandError, setBrandError] = useState("");

  // 브랜드 검색 함수
  const handleBrandSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setBrandSearchResults([]);
      return;
    }

    setIsSearchingBrands(true);
    setBrandError("");

    try {
      const { data: brands, error } = await supabase
        .from("brands")
        .select("brand_id, name")
        .ilike("name", `*${searchTerm}*`)
        .order("name");

      if (error) {
        console.error("브랜드 검색 에러:", error);
        setBrandError("브랜드 검색 중 오류가 발생했습니다.");
        setBrandSearchResults([]);
        return;
      }

      setBrandSearchResults(brands || []);
    } catch (error) {
      console.error("브랜드 검색 중 오류:", error);
      setBrandError("브랜드 검색 중 오류가 발생했습니다.");
      setBrandSearchResults([]);
    } finally {
      setIsSearchingBrands(false);
    }
  };

  // 브랜드 선택 함수
  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandSearchValue(brand.name);
    setBrandSearchResults([]);
    setBrandError("");

    // productData의 brand_id 업데이트
    setProductData((prev) => ({
      ...prev,
      brand_id: brand.brand_id,
    }));
  };

  const resetForm = () => {
    setProductData({
      name: "",
      description: "",
      imageFile: null,
      imageName: "",
      brand_id: "",
    });

    // 브랜드 관련 상태 초기화
    setBrandSearchValue("");
    setBrandSearchResults([]);
    setSelectedBrand(null);
    setBrandError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // ← 파일 선택 비우기
    }
  };

  // 브랜드 검증 및 폼 제출
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBrand) {
      setBrandError("브랜드를 선택해주세요.");
      return;
    }

    // 브랜드가 선택되었으면 원래 제출 함수 호출
    handleProductSubmit(e);
    resetForm();
  };

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

      <form onSubmit={handleFormSubmit} className="space-y-6">
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
                  name: e.target.value.normalize("NFC"),
                }))
              }
              placeholder="상품 이름을 입력하세요"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-700 font-semibold">
                브랜드
              </span>
            </label>
            <input
              type="text"
              className={`input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700 ${
                brandError ? "border-red-300" : ""
              }`}
              value={brandSearchValue}
              onChange={(e) => {
                const value = e.target.value.normalize("NFC");
                setBrandSearchValue(value);
                handleBrandSearch(value);
                setBrandError("");
              }}
              placeholder="브랜드명을 검색하세요"
              required
            />

            {/* 선택된 브랜드 표시 */}
            {selectedBrand && (
              <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <span className="text-sm font-medium">
                      선택된 브랜드: {selectedBrand.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand(null);
                      setBrandSearchValue("");
                      setProductData((prev) => ({ ...prev, brand_id: "" }));
                    }}
                    className="text-emerald-500 hover:text-emerald-700 text-sm"
                  >
                    선택 해제
                  </button>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {brandError && (
              <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-700 text-sm">{brandError}</p>
              </div>
            )}

            {/* 브랜드 목록 */}
            <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <h4 className="text-sm font-semibold text-slate-800">
                  브랜드 목록{" "}
                  {brandSearchResults.length > 0 &&
                    `(${brandSearchResults.length}개)`}
                </h4>
              </div>
              <div className="p-4">
                {isSearchingBrands ? (
                  <div className="text-center py-8">
                    <div className="loading loading-spinner loading-md text-indigo-600 mb-4"></div>
                    <p className="text-slate-500">검색 중입니다...</p>
                  </div>
                ) : brandSearchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm mb-2">
                      {brandSearchValue
                        ? "검색 결과가 없습니다"
                        : "브랜드명을 검색해주세요"}
                    </p>
                    {brandSearchValue && (
                      <p className="text-slate-400 text-xs">
                        다른 브랜드명으로 검색해보세요
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {brandSearchResults.map((brand) => (
                      <div
                        key={brand.brand_id}
                        onClick={() => handleBrandSelect(brand)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                          selectedBrand?.brand_id === brand.brand_id
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">
                            {brand.name}
                          </span>
                          {selectedBrand?.brand_id === brand.brand_id && (
                            <span className="text-indigo-600 text-sm">
                              선택됨
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
                description: e.target.value.normalize("NFC"),
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
