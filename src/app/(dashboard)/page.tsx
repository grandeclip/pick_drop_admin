"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProductForm from "../components/ProductForm";
import ProductSetForm from "../components/ProductSetForm";
import { supabase } from "../lib/supabase";

// async function insertProductSet(productSetData: {
//   productId: string;
//   name: string;
//   originalPrice: string;
//   discountedPrice: string;
//   shippingCost: string;
//   platform: string;
//   link: string;
// }) {
//   const {
//     productId,
//     name,
//     originalPrice,
//     discountedPrice,
//     shippingCost,
//     platform,
//     link,
//   } = productSetData;

//   const { data: platformData, error: platformError } = await supabase
//     .from("platforms")
//     .select("platform_id")
//     .eq("name", platform)
//     .single();

//   if (platformError || !platformData) {
//     console.error(`❌ 플랫폼 '${platform}' 찾기 실패`, platformError);
//     return { success: false, error: "플랫폼을 찾을 수 없습니다." };
//   }

//   const platformId = platformData.platform_id;

//   const { data: insertedProductSet, error: insertError } = await supabase
//     .from("product_sets")
//     .insert({
//       product_id: productId,
//       platform_id: platformId,
//       product_name: name,
//       link_url: link,
//       shipping_fee: parseInt(shippingCost, 10) || 0,
//       md_pick: false,
//     })
//     .select("product_set_id")
//     .single();

//   if (insertError || !insertedProductSet) {
//     console.error("❌ product_sets insert 실패:", insertError);
//     return { success: false, error: insertError?.message };
//   }

//   const productSetId = insertedProductSet.product_set_id;

//   const { data: priceHistoryData, error: priceHistoryError } = await supabase
//     .from("product_price_histories")
//     .insert({
//       product_set_id: productSetId,
//       original_price: parseInt(originalPrice, 10) || 0,
//       discount_price: parseInt(discountedPrice, 10) || null,
//       shipping_fee: parseInt(shippingCost, 10) || 0,
//       price_metadata: {},
//     });

//   console.log("priceHistoryData: ", priceHistoryData);

//   if (priceHistoryError) {
//     console.error("❌ price history insert 실패:", priceHistoryError);
//     return { success: false, error: priceHistoryError.message };
//   }

//   return {
//     success: true,
//     productSetId,
//     priceHistoryInserted: true,
//   };
// }

function parseLinks(rawInput: string): string[] {
  return rawInput
    .split(",")
    .map((link) => link.replace(/"/g, ""))
    .map((link) => link.trim())
    .filter((link) => link.length > 0);
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"product" | "productSet">(
    "product"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    link: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: productData.name,
          description: productData.description,
        })
        .select("product_id")
        .single();

      if (error) {
        console.log("error: ", error);
        return;
      }

      console.log(data?.product_id);

      if (!productData.imageFile) {
        console.log("이미지 파일이 없습니다");
        return;
      }
      const file = productData.imageFile;
      const productId = data?.product_id;
      const fileName = `${productId}.png`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("products")
        .upload(fileName, file);
      if (!data) {
        console.log("error: ", storageError);
      } else {
        console.log("data: ", storageData);
      }

      const { data: updateProductData, error: updateProductError } =
        await supabase
          .from("products")
          .update({
            image_url: `products/${fileName}`,
          })
          .eq("product_id", productId);
      if (updateProductError) {
        console.log("error: ", updateProductError);
      } else {
        console.log("data: ", updateProductData);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setIsSubmitting(false);
      setProductData((prev) => ({
        ...prev,
        name: "",
        description: "",
        imageFile: null,
        imageName: "",
      }));
    }
  };

  const handleProductSetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("상품세트 데이터:", productSetData);

    try {
      const links = parseLinks(productSetData.link);
      console.log("links: ", links);

      const { error: productError } = await supabase
        .from("products")
        .select("product_id")
        .eq("product_id", productSetData.productId)
        .single();

      if (productError) {
        console.log("error: ", productError);
        return;
      }

      for (const link of links) {
        const { error: productSetError } = await supabase
          .from("product_sets")
          .insert({
            product_id: productSetData.productId,
            link_url: link,
          });

        if (productSetError) {
          console.log("product_sets insert error: ", productSetError);
          continue;
        }
      }

      await fetch("/api/trigger", {
        method: "POST",
        body: JSON.stringify({ productId: productSetData.productId }),
      });
    } catch (error) {
      console.log("Error submitting product set:", error);
    } finally {
      setIsSubmitting(false);
      setProductSetData(() => ({
        productId: "",
        link: "",
      }));
    }

    // try {
    //   const result = await insertProductSet(productSetData);

    //   if (result.success) {
    //     alert("상품세트가 성공적으로 등록되었습니다.");
    //   } else {
    //     alert(`등록 실패: ${result.error}`);
    //   }
    // } catch (error) {
    //   console.error("Error submitting product set:", error);
    // } finally {
    //   setIsSubmitting(false);
    // }
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
