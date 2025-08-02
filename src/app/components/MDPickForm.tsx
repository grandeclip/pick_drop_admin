"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

interface SearchResult {
  product_id: string;
  product_name: string;
  product_set_id: string;
  product_set_name: string;
  md_pick: boolean;
  link_url: string;
  platform_name: string;
  original_price: number;
  discount_price: number | null;
  shipping_fee: number;
}

interface ProductSetWithPlatform {
  product_set_id: string;
  product_id: string;
  product_name: string;
  md_pick: boolean;
  link_url: string;
  platforms: {
    name: string;
  } | null;
}

export default function MDPickForm() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsSearching(true);

    try {
      const searchTerm = searchValue.trim();

      // 1. products 테이블에서 검색 (product_id 또는 name으로)
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("product_id, name")
        .or(`product_id.eq.${searchTerm},name.ilike.*${searchTerm}*`);

      if (productsError) {
        console.error("Products 검색 에러:", productsError);
        setSearchResults([]);
        return;
      }

      if (!products || products.length === 0) {
        setSearchResults([]);
        return;
      }

      // 2. 찾은 product_id들로 product_sets와 platforms 조인해서 가져오기
      const productIds = products.map((p) => p.product_id);

      const { data: productSets, error: productSetsError } = (await supabase
        .from("product_sets")
        .select(
          `
          product_set_id,
          product_id,
          product_name,
          md_pick,
          link_url,
          platforms:platform_id (
            name
          )
        `
        )
        .in("product_id", productIds)
        .order("product_name")) as {
        data: ProductSetWithPlatform[] | null;
        error: PostgrestError | null;
      };

      if (productSetsError) {
        console.error("Product sets 검색 에러:", productSetsError);
        setSearchResults([]);
        return;
      }

      if (!productSets || productSets.length === 0) {
        setSearchResults([]);
        return;
      }

      // 3. 각 product_set의 최신 가격 정보 가져오기
      const productSetIds = productSets.map((ps) => ps.product_set_id);

      const { data: priceHistories, error: priceError } = await supabase
        .from("product_price_histories")
        .select(
          "product_set_id, original_price, discount_price, shipping_fee, recorded_at"
        )
        .in("product_set_id", productSetIds)
        .order("recorded_at", { ascending: false });

      if (priceError) {
        console.error("Price histories 검색 에러:", priceError);
      }

      // 4. 각 product_set에 대한 최신 가격 정보 매핑
      const latestPrices = new Map();
      if (priceHistories) {
        priceHistories.forEach((price) => {
          if (!latestPrices.has(price.product_set_id)) {
            latestPrices.set(price.product_set_id, price);
          }
        });
      }

      // 5. 결과 조합
      const results: SearchResult[] = productSets.map((ps) => {
        const product = products.find((p) => p.product_id === ps.product_id);
        const latestPrice = latestPrices.get(ps.product_set_id);

        return {
          product_id: ps.product_id,
          product_name: product?.name || "",
          product_set_id: ps.product_set_id,
          product_set_name: ps.product_name || "",
          md_pick: ps.md_pick,
          link_url: ps.link_url || "",
          platform_name: ps.platforms?.name || "",
          original_price: latestPrice?.original_price || 0,
          discount_price: latestPrice?.discount_price || null,
          shipping_fee: latestPrice?.shipping_fee || 0,
        };
      });

      // 6. products.name 기준으로 정렬
      results.sort((a, b) => {
        if (a.product_name !== b.product_name) {
          return a.product_name.localeCompare(b.product_name);
        }
        return a.product_set_name.localeCompare(b.product_set_name);
      });

      setSearchResults(results);
    } catch (error) {
      console.error("검색 중 오류:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleMdPick = async (productSetId: string, currentMdPick: boolean) => {
    // 업데이트 중인 아이템 표시
    setUpdatingItems((prev) => new Set(prev).add(productSetId));

    try {
      const { error } = await supabase
        .from("product_sets")
        .update({ md_pick: !currentMdPick })
        .eq("product_set_id", productSetId);

      if (error) {
        console.error("MD Pick 업데이트 오류:", error);
        alert("MD Pick 설정 변경에 실패했습니다.");
        return;
      }

      // 결과 리스트 업데이트
      setSearchResults((prev) =>
        prev.map((item) =>
          item.product_set_id === productSetId
            ? { ...item, md_pick: !currentMdPick }
            : item
        )
      );

      // 성공 피드백 (선택적)
      // alert(`MD Pick이 ${!currentMdPick ? '설정' : '해제'}되었습니다.`);
    } catch (error) {
      console.error("MD Pick 토글 중 오류:", error);
      alert("MD Pick 설정 변경 중 오류가 발생했습니다.");
    } finally {
      // 업데이트 중인 아이템에서 제거
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productSetId);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return "-";
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">MD Pick 설정</h2>
        <p className="text-slate-600">
          상품 ID 또는 상품명으로 검색하여 MD Pick을 설정하거나 해제할 수
          있습니다.
        </p>
      </div>

      {/* 검색 섹션 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            상품 검색
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="상품 ID 또는 상품명을 입력하세요"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchValue.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSearching ? "검색 중..." : "검색"}
            </button>
          </div>
        </div>
      </div>

      {/* 검색 결과 섹션 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            검색 결과{" "}
            {searchResults.length > 0 && `(${searchResults.length}개)`}
          </h3>
        </div>

        <div className="p-6">
          {isSearching ? (
            <div className="text-center py-8">
              <div className="loading loading-spinner loading-md text-indigo-600 mb-4"></div>
              <p className="text-slate-500">검색 중입니다...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg mb-2">
                검색 결과가 없습니다
              </p>
              <p className="text-slate-400 text-sm">
                상품 ID 또는 상품명으로 검색해보세요
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((item) => (
                <div
                  key={item.product_set_id}
                  className={`p-4 border rounded-xl transition-all duration-200 ${
                    item.md_pick
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-1">
                        {item.product_name}
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        {item.product_set_name} ({item.platform_name})
                      </p>
                      <p className="text-xs text-slate-400">
                        상품 ID: {item.product_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          item.md_pick
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.md_pick ? "⭐ MD Pick" : "일반"}
                      </span>
                      <button
                        onClick={() =>
                          toggleMdPick(item.product_set_id, item.md_pick)
                        }
                        disabled={updatingItems.has(item.product_set_id)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                          updatingItems.has(item.product_set_id)
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : item.md_pick
                            ? "border-red-300 text-red-600 hover:bg-red-50"
                            : "border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                        }`}
                      >
                        {updatingItems.has(item.product_set_id)
                          ? "변경 중..."
                          : item.md_pick
                          ? "해제"
                          : "설정"}
                      </button>
                    </div>
                  </div>

                  {/* 가격 정보 */}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-slate-500">정가: </span>
                      <span className="font-medium">
                        {formatPrice(item.original_price)}
                      </span>
                    </div>
                    {item.discount_price && (
                      <div>
                        <span className="text-slate-500">할인가: </span>
                        <span className="font-medium text-red-600">
                          {formatPrice(item.discount_price)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">배송비: </span>
                      <span className="font-medium">
                        {formatPrice(item.shipping_fee)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
