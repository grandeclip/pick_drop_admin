"use client";

import React, { useState, useEffect } from "react";
import { getLocalStorage, setLocalStorage } from "../lib/localStorage";
import {
  fetchProducts,
  fetchBrands,
  deleteProduct,
  type Product,
  type Brand,
  type SortField,
  type SortDirection,
} from "../services/productService";
import {
  fetchCategories,
  bulkUpdateProductCategory,
  type Category,
} from "../services/productCategoryService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { STATIC_URL } from "../lib/constants";
import ProductDetail from "./ProductDetail";
import ProductFilters from "./ProductFilters";
import Pagination from "./Pagination";

interface ProductManagementProps {
  onNavigateToCategory?: () => void;
}

export default function ProductManagement({ onNavigateToCategory }: ProductManagementProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "with" | "without"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    getLocalStorage("productManagement_itemsPerPage", 20)
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 행 선택 관련 상태
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const { toast } = useToast();

  // 데이터 로딩
  useEffect(() => {
    loadProducts();
    loadBrands();
    loadCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 서버 쿼리가 필요한 필터나 정렬 변경 시 데이터 다시 로드
  useEffect(() => {
    if (products.length > 0) {
      loadProducts(1); // 필터 변경시 첫 페이지로 이동
    }
  }, [sortField, sortDirection, selectedBrand, categoryFilter, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // 검색 및 클라이언트 정렬
  useEffect(() => {
    let filtered = [...products];

    // 검색어 필터링 (클라이언트에서만 처리)
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.brands?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 클라이언트 사이드 정렬 (name, brand일 경우)
    if (sortField === "name") {
      filtered.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (sortDirection === "asc") {
          return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        } else {
          return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
        }
      });
    } else if (sortField === "brand") {
      filtered.sort((a, b) => {
        const brandA = (a.brands?.name || "").toLowerCase();
        const brandB = (b.brands?.name || "").toLowerCase();
        if (sortDirection === "asc") {
          return brandA < brandB ? -1 : brandA > brandB ? 1 : 0;
        } else {
          return brandA > brandB ? -1 : brandA < brandB ? 1 : 0;
        }
      });
    }
    // created_at 정렬과 브랜드/카테고리 필터링은 서버에서 이미 처리됨

    setFilteredProducts(filtered);
  }, [
    products,
    searchQuery,
    sortField,
    sortDirection,
  ]);

  const loadProducts = async (page = 1, perPage = itemsPerPage) => {
    setIsLoading(true);
    const response = await fetchProducts({
      page,
      perPage,
      sortField,
      sortDirection,
      brandId: selectedBrand,
      categoryFilter,
      categoryId: selectedCategory,
    });

    if (response.error) {
      toast({
        title: "오류",
        description: response.error,
        variant: "destructive",
      });
    } else {
      setProducts(response.products);
      setTotalCount(response.totalCount);
      setCurrentPage(page);
    }

    setIsLoading(false);
  };

  const loadBrands = async () => {
    const data = await fetchBrands();
    setBrands(data);
  };

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const handleViewDetail = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedProductId(null);
    // 목록 새로고침
    loadProducts(currentPage);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("정말로 이 상품을 삭제하시겠습니까?")) return;

    const result = await deleteProduct(productId);

    if (result.success) {
      toast({
        title: "성공",
        description: "상품이 성공적으로 삭제되었습니다.",
      });
      loadProducts(currentPage);
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 표시 개수 변경 처리
  const handleItemsPerPageChange = (newPerPage: number) => {
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
    // 로컬스토리지에 저장
    setLocalStorage("productManagement_itemsPerPage", newPerPage);
    loadProducts(1, newPerPage);
  };

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 정렬 아이콘 표시
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const copyToClipboard = async (productId: string) => {
    try {
      await navigator.clipboard.writeText(productId);
      setCopiedId(productId);
      toast({
        title: "복사 완료",
        description: "상품 ID가 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "오류",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 행 선택 관련 함수들
  const handleRowSelect = (productId: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(productId);
    } else {
      newSelectedRows.delete(productId);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredProducts.map((p) => p.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleBulkUpdateCategory = async () => {
    if (selectedRows.size === 0 || !selectedCategoryId) return;

    setIsBulkUpdating(true);
    const result = await bulkUpdateProductCategory(
      Array.from(selectedRows),
      selectedCategoryId
    );

    if (result.success) {
      toast({
        title: "성공",
        description: `${selectedRows.size}개 상품의 카테고리가 업데이트되었습니다.`,
      });
      setIsBulkUpdateDialogOpen(false);
      setSelectedRows(new Set());
      setSelectedCategoryId("");
      loadProducts(currentPage);
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsBulkUpdating(false);
  };

  // 상세 페이지 렌더링
  if (currentView === "detail" && selectedProductId) {
    return (
      <ProductDetail 
        productId={selectedProductId} 
        onBack={handleBackToList}
        onNavigateToCategory={onNavigateToCategory}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">상품 관리</CardTitle>
              <CardDescription>
                등록된 상품을 조회하고 관리합니다
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 검색 및 필터 */}
      <ProductFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        brands={brands}
        categories={categories}
        onNavigateToCategory={onNavigateToCategory}
      />

      {/* 일괄 작업 도구 모음 */}
      {selectedRows.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-blue-900">
                  {selectedRows.size}개 상품 선택됨
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRows(new Set())}
                >
                  선택 해제
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsBulkUpdateDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  카테고리 설정
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 페이지네이션 */}
      <Pagination
        className="mb-0"
        currentPage={currentPage}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
        onPageChange={loadProducts}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* 상품 테이블 */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                상품이 없습니다
              </p>
              <p className="text-sm text-muted-foreground">
                검색 조건을 변경하거나 새 상품을 등록해보세요
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.size === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort("name")}
                    >
                      상품명
                      <span className="ml-1">{getSortIcon("name")}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort("brand")}
                    >
                      브랜드
                      <span className="ml-1">{getSortIcon("brand")}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort("created_at")}
                    >
                      등록일
                      <span className="ml-1">{getSortIcon("created_at")}</span>
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(product.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(product.id, e.target.checked);
                        }}
                        className="w-4 h-4"
                      />
                    </TableCell>
                    <TableCell
                      className="font-medium cursor-pointer"
                      onClick={(e) => {
                        // 버튼이나 체크박스 클릭이 아닌 경우에만 상세 페이지로 이동
                        const target = e.target as HTMLElement;
                        if (
                          !target.closest("button") &&
                          !target.closest("input")
                        ) {
                          handleViewDetail(product.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${STATIC_URL}${product.image_url}`}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <span>{product.name}</span>
                          {product.product_sets &&
                            product.product_sets.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                상품세트 {product.product_sets.length}개
                              </div>
                            )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          !target.closest("button") &&
                          !target.closest("input")
                        ) {
                          handleViewDetail(product.id);
                        }
                      }}
                    >
                      <Badge variant="outline">
                        {product.brands?.name || "브랜드 없음"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground cursor-pointer"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          !target.closest("button") &&
                          !target.closest("input")
                        ) {
                          handleViewDetail(product.id);
                        }
                      }}
                    >
                      {formatDate(product.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(product.id);
                          }}
                          title="ID 복사"
                        >
                          {copiedId === product.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(product.id);
                          }}
                          className="text-destructive hover:text-destructive"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 페이지네이션 */}
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={loadProducts}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="border-t"
          />
        </CardContent>
      </Card>

      {/* 일괄 카테고리 업데이트 다이얼로그 */}
      <Dialog
        open={isBulkUpdateDialogOpen}
        onOpenChange={setIsBulkUpdateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일괄 카테고리 설정</DialogTitle>
            <DialogDescription>
              선택된 {selectedRows.size}개 상품의 카테고리를 일괄 설정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-select">카테고리 선택</Label>
              <select
                id="category-select"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option
                    key={`product-category-${category.id}`}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkUpdateDialogOpen(false);
                setSelectedCategoryId("");
              }}
              disabled={isBulkUpdating}
            >
              취소
            </Button>
            <Button
              onClick={handleBulkUpdateCategory}
              disabled={!selectedCategoryId || isBulkUpdating}
            >
              {isBulkUpdating ? "설정 중..." : "카테고리 설정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
