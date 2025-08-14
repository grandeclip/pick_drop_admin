"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

interface Product {
  product_id: string;
  name: string;
}

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
  // 상품 검색 관련 상태
  const [productSearchValue, setProductSearchValue] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<Product[]>(
    []
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [productError, setProductError] = useState("");

  // 상품 검색 함수
  const handleProductSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProductSearchResults([]);
      return;
    }

    setIsSearchingProducts(true);
    setProductError("");

    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("product_id, name")
        .ilike("name", `*${searchTerm}*`)
        .order("name");

      if (error) {
        console.error("상품 검색 에러:", error);
        setProductError("상품 검색 중 오류가 발생했습니다.");
        setProductSearchResults([]);
        return;
      }

      setProductSearchResults(products || []);
    } catch (error) {
      console.error("상품 검색 중 오류:", error);
      setProductError("상품 검색 중 오류가 발생했습니다.");
      setProductSearchResults([]);
    } finally {
      setIsSearchingProducts(false);
    }
  };

  // 상품 선택 함수
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductSearchValue(product.name);
    setProductSearchResults([]);
    setProductError("");

    // productSetData의 productId 업데이트
    setProductSetData((prev) => ({
      ...prev,
      productId: product.product_id,
    }));
  };

  // 상품 검증 및 폼 제출
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      setProductError("상품을 선택해주세요.");
      return;
    }

    // 상품이 선택되었으면 원래 제출 함수 호출
    handleProductSetSubmit(e);
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
          <h2 className="text-2xl font-bold text-slate-800">기획 세트 등록</h2>
          <p className="text-slate-600">상품을 다양한 플랫폼에 등록해보세요</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
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
                <span>상품 검색</span>
              </span>
            </label>
            <input
              type="text"
              className={`input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700 ${
                productError ? "border-red-300" : ""
              }`}
              value={productSearchValue}
              onChange={(e) => {
                const value = e.target.value.normalize("NFC");
                setProductSearchValue(value);
                handleProductSearch(value);
                setProductError("");
              }}
              placeholder="상품명을 검색하세요"
              required
            />

            {/* 선택된 상품 표시 */}
            {selectedProduct && (
              <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <span className="text-sm font-medium">
                      선택된 상품: {selectedProduct.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductSearchValue("");
                      setProductSetData((prev) => ({ ...prev, productId: "" }));
                    }}
                    className="text-emerald-500 hover:text-emerald-700 text-sm"
                  >
                    선택 해제
                  </button>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {productError && (
              <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-700 text-sm">{productError}</p>
              </div>
            )}

            {/* 상품 목록 */}
            <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <h4 className="text-sm font-semibold text-slate-800">
                  상품 목록{" "}
                  {productSearchResults.length > 0 &&
                    `(${productSearchResults.length}개)`}
                </h4>
              </div>
              <div className="p-4">
                {isSearchingProducts ? (
                  <div className="text-center py-8">
                    <div className="loading loading-spinner loading-md text-indigo-600 mb-4"></div>
                    <p className="text-slate-500">검색 중입니다...</p>
                  </div>
                ) : productSearchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm mb-2">
                      {productSearchValue
                        ? "검색 결과가 없습니다"
                        : "상품명을 검색해주세요"}
                    </p>
                    {productSearchValue && (
                      <p className="text-slate-400 text-xs">
                        다른 상품명으로 검색해보세요
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {productSearchResults.map((product) => (
                      <div
                        key={product.product_id}
                        onClick={() => handleProductSelect(product)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                          selectedProduct?.product_id === product.product_id
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-slate-800">
                              {product.name}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">
                              ID: {product.product_id}
                            </p>
                          </div>
                          {selectedProduct?.product_id ===
                            product.product_id && (
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
            기획 세트 등록하기
          </button>
        </div>
      </form>
    </div>
  );
}
