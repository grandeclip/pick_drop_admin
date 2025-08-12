"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { Brand } from "../services/productService";
import type { Category } from "../services/productCategoryService";
import type { SortField, SortDirection } from "../services/productService";

interface ProductFiltersProps {
  // 검색 및 필터 상태
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categoryFilter: "all" | "with" | "without";
  setCategoryFilter: (filter: "all" | "with" | "without") => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  
  // 데이터
  brands: Brand[];
  categories: Category[];
}

export default function ProductFilters({
  searchQuery,
  setSearchQuery,
  selectedBrand,
  setSelectedBrand,
  selectedCategory,
  setSelectedCategory,
  categoryFilter,
  setCategoryFilter,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  brands,
  categories,
}: ProductFiltersProps) {
  const handleCategoryFilterChange = (newFilter: "all" | "with" | "without") => {
    setCategoryFilter(newFilter);
    // 카테고리 필터가 "카테고리 있음"이 아닌 경우 특정 카테고리 선택 초기화
    if (newFilter !== "with") {
      setSelectedCategory("all");
    }
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-") as [SortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 검색 영역 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="상품명, 설명, 브랜드로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 필터 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 브랜드 필터 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                브랜드
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">모든 브랜드</option>
                {brands.map((brand) => (
                  <option key={brand.brand_id} value={brand.brand_id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 카테고리 유무 필터 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                카테고리 필터
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilterChange(e.target.value as "all" | "with" | "without")}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">전체 상품</option>
                <option value="with">카테고리 있음</option>
                <option value="without">카테고리 없음</option>
              </select>
            </div>

            {/* 특정 카테고리 선택 (조건부 렌더링) */}
            {categoryFilter === "with" ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  카테고리 선택
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">모든 카테고리</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div /> // 빈 공간 유지를 위한 placeholder
            )}

            {/* 정렬 옵션 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                정렬
              </label>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="created_at-desc">등록일순 (최신)</option>
                <option value="created_at-asc">등록일순 (오래된)</option>
                <option value="name-asc">상품명순 (가나다)</option>
                <option value="name-desc">상품명순 (역순)</option>
                <option value="brand-asc">브랜드명순 (가나다)</option>
                <option value="brand-desc">브랜드명순 (역순)</option>
              </select>
            </div>
          </div>

          {/* 필터 상태 표시 */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">적용된 필터:</span>
            {selectedBrand !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                브랜드: {brands.find(b => b.brand_id === selectedBrand)?.name}
                <button
                  onClick={() => setSelectedBrand("all")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                {categoryFilter === "with" ? "카테고리 있음" : "카테고리 없음"}
                <button
                  onClick={() => handleCategoryFilterChange("all")}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory !== "all" && categoryFilter === "with" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
                카테고리: {categories.find(c => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                검색: {searchQuery}
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}