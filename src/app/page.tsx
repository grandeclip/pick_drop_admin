"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"product" | "productSet">(
    "product"
  );

  // 상품 등록 상태
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    imageFile: null as File | null,
    imageName: "",
  });

  // 상품세트 등록 상태
  const [productSetData, setProductSetData] = useState({
    productId: "",
    name: "",
    originalPrice: "",
    discountedPrice: "",
    platform: "",
    link: "",
    shippingCost: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("상품 데이터:", productData);
    // TODO: 상품 등록 로직 구현
  };

  const handleProductSetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("상품세트 데이터:", productSetData);
    // TODO: 상품세트 등록 로직 구현
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductData((prev) => ({
        ...prev,
        imageFile: file,
        imageName: file.name,
      }));
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽 사이드바 - 탭 메뉴 */}
          <div className="w-full lg:w-80">
            <div className="bg-base-100 rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-6">PickDrop Admin</h1>

              <div className="flex flex-col gap-2">
                <button
                  className={`btn btn-block justify-start ${
                    activeTab === "product" ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => setActiveTab("product")}
                >
                  상품 등록
                </button>
                <button
                  className={`btn btn-block justify-start ${
                    activeTab === "productSet" ? "btn-primary" : "btn-ghost"
                  }`}
                  onClick={() => setActiveTab("productSet")}
                >
                  상품세트 등록
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽 콘텐츠 영역 */}
          <div className="flex-1">
            <div className="bg-base-100 rounded-lg shadow-md p-6">
              {activeTab === "product" ? (
                <div>
                  <h2 className="text-xl font-semibold mb-6">상품 등록</h2>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">상품 이름</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
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
                        <span className="label-text">상품 설명</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        value={productData.description}
                        onChange={(e) =>
                          setProductData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="상품 설명을 입력하세요"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">상품 이미지</span>
                      </label>
                      <input
                        type="file"
                        className="file-input file-input-bordered w-full"
                        accept="image/*"
                        onChange={handleImageUpload}
                        required
                      />
                      {productData.imageName && (
                        <div className="mt-2 text-sm text-gray-600">
                          선택된 파일: {productData.imageName}
                        </div>
                      )}
                    </div>

                    <div className="form-control mt-6">
                      <button type="submit" className="btn btn-primary">
                        상품 등록하기
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold mb-6">상품세트 등록</h2>
                  <form onSubmit={handleProductSetSubmit} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">상품 아이디</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
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
                        <span className="label-text">상품세트 이름</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
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
                        <span className="label-text">정가 가격</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
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
                        <span className="label-text">할인된 가격</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
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
                        <span className="label-text">플랫폼 이름</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={productSetData.platform}
                        onChange={(e) =>
                          setProductSetData((prev) => ({
                            ...prev,
                            platform: e.target.value,
                          }))
                        }
                        placeholder="플랫폼 이름을 입력하세요"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">링크</span>
                      </label>
                      <input
                        type="url"
                        className="input input-bordered w-full"
                        value={productSetData.link}
                        onChange={(e) =>
                          setProductSetData((prev) => ({
                            ...prev,
                            link: e.target.value,
                          }))
                        }
                        placeholder="링크를 입력하세요"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">배송비</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
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

                    <div className="form-control mt-6">
                      <button type="submit" className="btn btn-primary">
                        상품세트 등록하기
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
