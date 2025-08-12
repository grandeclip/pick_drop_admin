"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trash2,
  Package,
  Calendar,
  Building,
  Copy,
  Check,
  Settings,
  Edit,
  X,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { STATIC_URL } from "../lib/constants";
import {
  fetchSingleProduct,
  deleteProduct,
  updateProduct,
  deleteProductSet,
  updateProductSet,
  fetchBrands,
  type Product as ServiceProduct,
  type ProductSet,
  type Brand,
} from "../services/productService";
import {
  fetchCategories,
  type Category,
} from "../services/productCategoryService";

type Product = ServiceProduct;

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onNavigateToCategory?: () => void;
}

export default function ProductDetail({
  productId,
  onBack,
  onNavigateToCategory,
}: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    name: "",
    description: "",
    brand_id: "",
    category_id: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // 기획 세트 수정 관련 상태
  const [isEditProductSetDialogOpen, setIsEditProductSetDialogOpen] =
    useState(false);
  const [selectedProductSet, setSelectedProductSet] =
    useState<ProductSet | null>(null);
  const [editedProductSet, setEditedProductSet] = useState({
    product_name: "",
    normalized_product_name: "",
    link_url: "",
    label: "",
  });
  const [isSavingProductSet, setIsSavingProductSet] = useState(false);
  const [isDeleteProductSetDialogOpen, setIsDeleteProductSetDialogOpen] =
    useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadProduct();
    loadBrands();
    loadCategories();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    setIsLoading(true);
    const productData = await fetchSingleProduct(productId);

    if (productData) {
      setProduct(productData);
      setEditedProduct({
        name: productData.name,
        description: productData.description,
        brand_id: productData.brand_id,
        category_id: productData.category_id || "",
      });
    } else {
      toast({
        title: "오류",
        description: "상품을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
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

  const handleDelete = async () => {
    if (!product) return;

    const result = await deleteProduct(product.id);

    if (result.success) {
      toast({
        title: "성공",
        description: "상품이 성공적으로 삭제되었습니다.",
      });
      setIsDeleteDialogOpen(false);
      onBack();
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(product?.product_id || "");
      setIsCopied(true);
      toast({
        title: "복사 완료",
        description: "상품 ID가 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (_) {
      toast({
        title: "오류",
        description: `클립보드 복사에 실패했습니다. ${_}`,
        variant: "destructive",
      });
    }
  };

  const handleEditMode = () => {
    if (product) {
      setEditedProduct({
        name: product.name,
        description: product.description,
        brand_id: product.brand_id,
        category_id: product.category_id || "",
      });
      setIsEditMode(true);
    }
  };

  const handleSaveProduct = async () => {
    if (!product || !editedProduct.name.trim()) return;

    setIsSaving(true);
    const result = await updateProduct({
      id: product.id,
      name: editedProduct.name.trim(),
      description: editedProduct.description,
      brand_id: editedProduct.brand_id,
      category_id: editedProduct.category_id || undefined,
    });

    if (result.success) {
      toast({
        title: "성공",
        description: "상품 정보가 성공적으로 수정되었습니다.",
      });
      setIsEditMode(false);
      // 상세 데이터 다시 로드
      loadProduct();
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    if (product) {
      setEditedProduct({
        name: product.name,
        description: product.description,
        brand_id: product.brand_id,
        category_id: product.category_id || "",
      });
    }
    setIsEditMode(false);
  };

  // 기획 세트 관련 핸들러
  const handleEditProductSet = (productSet: ProductSet) => {
    setSelectedProductSet(productSet);
    setEditedProductSet({
      product_name: productSet.product_name,
      normalized_product_name: productSet.normalized_product_name,
      link_url: productSet.link_url,
      label: productSet.label || "",
    });
    setIsEditProductSetDialogOpen(true);
  };

  const handleSaveProductSet = async () => {
    if (!selectedProductSet) return;

    setIsSavingProductSet(true);
    const result = await updateProductSet(selectedProductSet.product_set_id, {
      product_name: editedProductSet.product_name,
      normalized_product_name: editedProductSet.normalized_product_name,
      link_url: editedProductSet.link_url,
      label: editedProductSet.label || undefined,
    });

    if (result.success) {
      toast({
        title: "성공",
        description: "기획 세트가 성공적으로 수정되었습니다.",
      });
      setIsEditProductSetDialogOpen(false);
      loadProduct(); // 데이터 새로고침
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsSavingProductSet(false);
  };

  const handleDeleteProductSet = async () => {
    if (!selectedProductSet) return;

    const result = await deleteProductSet(selectedProductSet.product_set_id);

    if (result.success) {
      toast({
        title: "성공",
        description: "기획 세트가 성공적으로 삭제되었습니다.",
      });
      setIsDeleteProductSetDialogOpen(false);
      setSelectedProductSet(null);
      loadProduct(); // 데이터 새로고침
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Package className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Package className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-semibold text-muted-foreground">
          상품을 찾을 수 없습니다
        </h1>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                ID: {product.product_id}
              </p>
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                className="h-6 px-2"
              >
                {isCopied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 상품 이미지 및 메타데이터 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>상품 이미지</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${STATIC_URL}${product.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">이미지 없음</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 메타데이터 */}
          <Card>
            <CardHeader>
              <CardTitle>메타데이터</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">등록일:</span>
                <span>{formatDate(product.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">수정일:</span>
                <span>
                  {formatDate(product.updated_at || product.created_at)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">상품 ID:</span>
                <code className="px-2 py-1 bg-muted rounded text-xs">
                  {product.product_id}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상품 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>상품의 기본 정보입니다</CardDescription>
                </div>
                {isEditMode ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleSaveProduct}
                      disabled={!editedProduct.name.trim() || isSaving}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSaving ? "저장 중..." : "저장"}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleEditMode} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode ? (
                // 편집 모드
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">상품명</Label>
                    <Input
                      id="edit-name"
                      value={editedProduct.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="상품명을 입력하세요"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">설명</Label>
                    <Textarea
                      id="edit-description"
                      value={editedProduct.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="상품 설명을 입력하세요"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-brand">브랜드</Label>
                    <select
                      id="edit-brand"
                      value={editedProduct.brand_id}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          brand_id: e.target.value,
                        }))
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
                    <Label htmlFor="edit-category">카테고리</Label>
                    <select
                      id="edit-category"
                      value={editedProduct.category_id}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          category_id: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">카테고리 선택 없음</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                // 읽기 모드
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">상품명</Label>
                    <p className="text-sm font-medium">{product.name}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">브랜드</Label>
                    <Badge variant="outline" className="w-fit">
                      <Building className="w-3 h-3 mr-1" />
                      {product.brands?.name || "브랜드 없음"}
                    </Badge>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">카테고리</Label>
                  {onNavigateToCategory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onNavigateToCategory}
                      className="h-6 px-2 text-xs"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      카테고리 관리
                    </Button>
                  )}
                </div>
                {product.categoryHierarchy ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {product.categoryHierarchy.path.map((category, index) => (
                        <React.Fragment key={category.id}>
                          {index > 0 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                          <Badge
                            variant={
                              index ===
                              product.categoryHierarchy!.path.length - 1
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            <Package className="w-3 h-3 mr-1" />
                            {category.name}
                          </Badge>
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      총 {product.categoryHierarchy.level + 1}단계 카테고리
                    </div>
                  </div>
                ) : (
                  <Badge variant="secondary" className="w-fit">
                    <Package className="w-3 h-3 mr-1" />
                    {product.categories?.name || "미분류"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Sets */}
          <Card>
            <CardHeader>
              <CardTitle>기획 세트</CardTitle>
              <CardDescription>
                이 상품과 연결된 기획 세트 목록입니다. (총{" "}
                {product.product_sets?.length || 0}개)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.product_sets && product.product_sets.length > 0 ? (
                <div className="space-y-4">
                  {product.product_sets.map((productSet) => (
                    <div
                      key={productSet.product_set_id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start space-x-4">
                        {/* 썸네일 */}
                        <div className="flex-shrink-0">
                          {productSet.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={productSet.thumbnail}
                              alt={productSet.normalized_product_name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* 내용 */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">
                                {productSet.normalized_product_name}
                              </h4>
                              {productSet.label && (
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {productSet.label}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">
                                {Array.isArray(productSet.platforms)
                                  ? productSet.platforms[0]?.name ||
                                    "플랫폼 없음"
                                  : productSet.platforms?.name || "플랫폼 없음"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProductSet(productSet)}
                                title="수정"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProductSet(productSet);
                                  setIsDeleteProductSetDialogOpen(true);
                                }}
                                className="text-destructive hover:text-destructive"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>ID: {productSet.product_set_id}</span>
                            <span>•</span>
                            <span>
                              등록일: {formatDate(productSet.created_at)}
                            </span>
                          </div>

                          {productSet.link_url && (
                            <div className="text-sm">
                              <a
                                href={productSet.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                상품 링크 보기
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  연관된 기획 세트가 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>상품 삭제 확인</span>
            </DialogTitle>
            <DialogDescription>
              <strong>{product.name}</strong> 상품을 삭제하시겠습니까?
              <br />
              삭제된 상품은 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기획 세트 수정 다이얼로그 */}
      <Dialog
        open={isEditProductSetDialogOpen}
        onOpenChange={setIsEditProductSetDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-blue-600" />
              <span>기획 세트 수정</span>
            </DialogTitle>
            <DialogDescription>기획 세트 정보를 수정합니다.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-normalized-name">정규화된 상품명</Label>
              <Input
                id="edit-normalized-name"
                value={editedProductSet.normalized_product_name}
                onChange={(e) =>
                  setEditedProductSet((prev) => ({
                    ...prev,
                    normalized_product_name: e.target.value,
                  }))
                }
                placeholder="정규화된 상품명을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-product-name">상품명(비노출)</Label>
              <Input
                id="edit-product-name"
                value={editedProductSet.product_name}
                onChange={(e) =>
                  setEditedProductSet((prev) => ({
                    ...prev,
                    product_name: e.target.value,
                  }))
                }
                placeholder="상품명을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-link-url">상품 링크</Label>
              <Input
                id="edit-link-url"
                value={editedProductSet.link_url}
                onChange={(e) =>
                  setEditedProductSet((prev) => ({
                    ...prev,
                    link_url: e.target.value,
                  }))
                }
                placeholder="상품 링크 URL을 입력하세요"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-label">라벨</Label>
              <Input
                id="edit-label"
                value={editedProductSet.label}
                onChange={(e) =>
                  setEditedProductSet((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
                placeholder="라벨을 입력하세요 (선택사항)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditProductSetDialogOpen(false);
                setSelectedProductSet(null);
              }}
              disabled={isSavingProductSet}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveProductSet}
              disabled={
                !editedProductSet.product_name.trim() ||
                !editedProductSet.normalized_product_name.trim() ||
                isSavingProductSet
              }
            >
              {isSavingProductSet ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  수정 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기획 세트 삭제 확인 다이얼로그 */}
      <Dialog
        open={isDeleteProductSetDialogOpen}
        onOpenChange={setIsDeleteProductSetDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>기획 세트 삭제 확인</span>
            </DialogTitle>
            <DialogDescription>
              <strong>{selectedProductSet?.normalized_product_name}</strong>{" "}
              기획 세트를 삭제하시겠습니까?
              <br />
              삭제된 기획 세트는 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteProductSetDialogOpen(false);
                setSelectedProductSet(null);
              }}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteProductSet}>
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
