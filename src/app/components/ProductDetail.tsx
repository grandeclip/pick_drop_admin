"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Edit3,
  Save,
  Trash2,
  Package,
  Calendar,
  User,
  Building,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { STATIC_URL } from "../lib/constants";

interface Product {
  product_id: string;
  name: string;
  description: string;
  image_url?: string;
  brand_id: string;
  created_at: string;
  updated_at: string;
  brands?: {
    name: string;
  };
}

interface Brand {
  brand_id: string;
  name: string;
}

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

export default function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProduct();
    loadBrands();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      
      // 상품 데이터와 브랜드 데이터를 병렬로 조회
      const [productResult, brandsResult] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("product_id", productId)
          .single(),
        supabase
          .from("brands")
          .select("brand_id, name")
      ]);

      if (productResult.error) {
        throw productResult.error;
      }

      if (brandsResult.error) {
        throw brandsResult.error;
      }

      // 브랜드 정보를 매핑
      const brandMap = new Map(
        brandsResult.data?.map(brand => [brand.brand_id, brand]) || []
      );

      const productWithBrand = {
        ...productResult.data,
        brands: productResult.data.brand_id ? 
          brandMap.get(productResult.data.brand_id) : null
      };

      setProduct(productWithBrand);
      setFormData({
        name: productWithBrand.name,
        description: productWithBrand.description,
        brand_id: productWithBrand.brand_id || "",
      });
    } catch (error) {
      console.error("상품 로딩 에러:", error);
      toast({
        title: "오류",
        description: "상품을 불러오는 중 오류가 발생했습니다.",
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
        .order("name");

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error("브랜드 로딩 에러:", error);
    }
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description,
          brand_id: formData.brand_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "상품이 성공적으로 수정되었습니다.",
      });

      setIsEditing(false);
      loadProduct(); // 데이터 새로고침
    } catch (error) {
      console.error("상품 수정 에러:", error);
      toast({
        title: "오류",
        description: "상품 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("product_id", productId);

      if (error) throw error;

      toast({
        title: "성공",
        description: "상품이 성공적으로 삭제되었습니다.",
      });

      onBack(); // 목록으로 돌아가기
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(product?.product_id || "");
      setIsCopied(true);
      toast({
        title: "복사 완료",
        description: "상품 ID가 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "오류",
        description: "클립보드 복사에 실패했습니다.",
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
              <p className="text-sm text-muted-foreground">ID: {product.product_id}</p>
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
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "저장 중..." : "저장"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                수정
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 상품 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle>상품 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {product.image_url ? (
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

        {/* 상품 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>
                상품의 기본 정보를 확인하고 수정할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">상품명</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">{product.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">브랜드</Label>
                {isEditing ? (
                  <select
                    value={formData.brand_id}
                    onChange={(e) =>
                      setFormData({ ...formData, brand_id: e.target.value })
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
                ) : (
                  <Badge variant="outline" className="w-fit">
                    <Building className="w-3 h-3 mr-1" />
                    {product.brands?.name || "브랜드 없음"}
                  </Badge>
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
                <span>{formatDate(product.updated_at)}</span>
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
    </div>
  );
}