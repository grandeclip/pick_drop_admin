"use client";

import React, { useState, useEffect } from "react";
import { getLocalStorage, setLocalStorage } from "../lib/localStorage";
import { formatNumber } from "../lib/formatters";
import { 
  fetchProducts, 
  fetchBrands, 
  updateProduct, 
  deleteProduct,
  type Product,
  type Brand,
  type SortField,
  type SortDirection
} from "../services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Edit3,
  Trash2,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { STATIC_URL } from "../lib/constants";
import ProductDetail from "./ProductDetail";

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => 
    getLocalStorage('productManagement_itemsPerPage', 20)
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  // 데이터 로딩
  useEffect(() => {
    loadProducts();
    loadBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 정렬 변경 시 데이터 다시 로드
  useEffect(() => {
    if (products.length > 0) {
      loadProducts(currentPage);
    }
  }, [sortField, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  // 검색 및 필터링 (정렬은 서버에서 처리)
  useEffect(() => {
    let filtered = [...products];

    // 검색어 필터링
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

    // 브랜드 필터링
    if (selectedBrand !== "all") {
      filtered = filtered.filter(
        (product) => product.brand_id === selectedBrand
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedBrand]);

  const loadProducts = async (page = 1, perPage = itemsPerPage) => {
    setIsLoading(true);
    const response = await fetchProducts({ 
      page, 
      perPage,
      sortField,
      sortDirection
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleViewDetail = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProductId(null);
    // 목록 새로고침
    loadProducts(currentPage);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    const result = await updateProduct(editingProduct);
    
    if (result.success) {
      toast({
        title: "성공",
        description: "상품이 성공적으로 수정되었습니다.",
      });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      loadProducts(currentPage);
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }
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
    setLocalStorage('productManagement_itemsPerPage', newPerPage);
    loadProducts(1, newPerPage);
  };

  // 정렬 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 정렬 아이콘 표시
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
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
    } catch (error) {
      toast({
        title: "오류",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 상세 페이지 렌더링
  if (currentView === 'detail' && selectedProductId) {
    return (
      <ProductDetail
        productId={selectedProductId}
        onBack={handleBackToList}
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
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="상품명, 설명, 브랜드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">모든 브랜드</option>
                {brands.map((brand) => (
                  <option key={brand.brand_id} value={brand.brand_id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                  setSortField(field);
                  setSortDirection(direction);
                }}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
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
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              전체 {formatNumber(totalCount)}개 중 {formatNumber((currentPage - 1) * itemsPerPage + 1)}-
              {formatNumber(Math.min(currentPage * itemsPerPage, totalCount))}개 표시
            </div>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-input bg-background rounded-md text-sm"
            >
              <option value={20}>20개씩</option>
              <option value={100}>100개씩</option>
              <option value={500}>500개씩</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadProducts(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.ceil(totalCount / itemsPerPage) },
                (_, i) => i + 1
              )
                .filter((page) => {
                  const totalPages = Math.ceil(totalCount / itemsPerPage);
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  if (page === 2 && currentPage <= 3) return true;
                  if (page === totalPages - 1 && currentPage >= totalPages - 2)
                    return true;
                  return false;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => loadProducts(page)}
                      className="w-10"
                    >
                      {formatNumber(page)}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadProducts(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
            >
              다음
            </Button>
          </div>
        </div>
      )}

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
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort('name')}
                    >
                      상품명
                      <span className="ml-1">{getSortIcon('name')}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort('brand')}
                    >
                      브랜드
                      <span className="ml-1">{getSortIcon('brand')}</span>
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort('created_at')}
                    >
                      등록일
                      <span className="ml-1">{getSortIcon('created_at')}</span>
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={(e) => {
                      // 버튼 클릭이 아닌 경우에만 상세 페이지로 이동
                      const target = e.target as HTMLElement;
                      if (!target.closest('button')) {
                        handleViewDetail(product.id);
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {product.image_url ? (
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
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.brands?.name || "브랜드 없음"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
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
                            handleEdit(product);
                          }}
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
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
          {totalCount > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  전체 {totalCount}개 중 {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalCount)}개 표시
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 border border-input bg-background rounded-md text-sm"
                >
                  <option value={20}>20개씩</option>
                  <option value={100}>100개씩</option>
                  <option value={500}>500개씩</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadProducts(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.ceil(totalCount / itemsPerPage) },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      const totalPages = Math.ceil(totalCount / itemsPerPage);
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      if (page === 2 && currentPage <= 3) return true;
                      if (
                        page === totalPages - 1 &&
                        currentPage >= totalPages - 2
                      )
                        return true;
                      return false;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => loadProducts(page)}
                          className="w-10"
                        >
                          {formatNumber(page)}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadProducts(currentPage + 1)}
                  disabled={
                    currentPage === Math.ceil(totalCount / itemsPerPage)
                  }
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 수정</DialogTitle>
            <DialogDescription>
              상품 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">상품명</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-brand">브랜드</Label>
                <select
                  id="edit-brand"
                  value={editingProduct.brand_id}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      brand_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">브랜드 선택</option>
                  {brands.map((brand) => (
                    <option key={brand.brand_id} value={brand.brand_id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleUpdate}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
