"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProductForm from "./components/ProductForm";
import ProductSetForm from "./components/ProductSetForm";
import { supabase } from "./lib/supabase";

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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("상품 데이터:", productData);

    //   const result = await supabase.from("products").insert({
    //     name: productData.name,
    //     description: productData.description,
    //     image_url: productData.imageName,
    //   })
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              {activeTab === "product" ? (
                <ProductForm
                  productData={productData}
                  setProductData={setProductData}
                  handleProductSubmit={handleProductSubmit}
                  handleImageUpload={handleImageUpload}
                />
              ) : (
                <ProductSetForm
                  productSetData={productSetData}
                  setProductSetData={setProductSetData}
                  handleProductSetSubmit={handleProductSetSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
