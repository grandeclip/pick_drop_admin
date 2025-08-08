"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getLocalStorage, setLocalStorage } from "../lib/localStorage";
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
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { STATIC_URL } from "../lib/constants";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  brand_id: string;
  created_at: string;
  brands?: {
    name: string;
  };
}

interface Brand {
  brand_id: string;
  name: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => 
    getLocalStorage('productManagement_itemsPerPage', 20)
  );
  const { toast } = useToast();

  // 데이터 로딩
  useEffect(() => {
    loadProducts();
    loadBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 검색 및 필터링
  useEffect(() => {
    let filtered = products;

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
    try {
      setIsLoading(true);
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      // 전체 개수 조회
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      setTotalCount(count || 0);

      // 병렬로 products와 brands 데이터 가져오기
      const [productsResult, brandsResult] = await Promise.all([
        supabase
          .from("products")
          .select(
            "product_id, name, description, image_url, brand_id, created_at, updated_at"
          )
          .order("created_at", { ascending: false })
          .range(from, to),
        supabase.from("brands").select("brand_id, name"),
      ]);

      if (productsResult.error) {
        console.error("Products error:", productsResult.error);
        throw productsResult.error;
      }

      if (brandsResult.error) {
        console.error("Brands error:", brandsResult.error);
        throw brandsResult.error;
      }

      // 브랜드 맵 생성
      const brandsMap = new Map(
        brandsResult.data?.map((brand) => [brand.brand_id, brand]) || []
      );

      // products와 brands 데이터 결합 및 product_id -> id 매핑
      const productsWithBrands =
        productsResult.data?.map((product) => ({
          ...product,
          id: product.product_id, // product_id를 id로 매핑
          brands:
            product.brand_id && brandsMap.get(product.brand_id)
              ? { name: brandsMap.get(product.brand_id)?.name }
              : undefined,
        })) || [];

      setProducts(productsWithBrands);
      setCurrentPage(page);
    } catch (error) {
      console.error("상품 로딩 에러:", error);
      toast({
        title: "오류",
        description: "상품 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .neq("name", "")
        .order("name");

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error("브랜드 로딩 에러:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          brand_id: editingProduct.brand_id,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "상품이 성공적으로 수정되었습니다.",
      });

      setIsEditDialogOpen(false);
      setEditingProduct(null);
      loadProducts(currentPage);
    } catch (error) {
      console.error("상품 수정 에러:", error);
      toast({
        title: "오류",
        description: "상품 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("정말로 이 상품을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "상품이 성공적으로 삭제되었습니다.",
      });

      loadProducts(currentPage);
    } catch (error) {
      console.error("상품 삭제 에러:", error);
      toast({
        title: "오류",
        description: "상품 삭제 중 오류가 발생했습니다.",
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadProducts(currentPage)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between px-6">
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
                      {page}
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
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
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
                  <TableHead>상품명</TableHead>
                  <TableHead>브랜드</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className="text-center">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
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
                    <TableCell className="max-w-xs">
                      <p className="truncate text-muted-foreground">
                        {product.description}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(product.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
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
                          {page}
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
