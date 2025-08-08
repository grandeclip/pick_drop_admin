import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, Image, FileText, Check, Loader2 } from "lucide-react";

interface Brand {
  brand_id: string;
  name: string;
}

interface ProductFormProps {
  productData: {
    name: string;
    description: string;
    imageFile: File | null;
    imageName: string;
    brand_id: string;
  };
  setProductData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      imageFile: File | null;
      imageName: string;
      brand_id: string;
    }>
  >;
  handleProductSubmit: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProductForm({
  productData,
  setProductData,
  handleProductSubmit,
  handleImageUpload,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 브랜드 관련 상태
  const [brandSearchValue, setBrandSearchValue] = useState("");
  const [brandSearchResults, setBrandSearchResults] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSearchingBrands, setIsSearchingBrands] = useState(false);
  const [brandError, setBrandError] = useState("");

  // 브랜드 검색 함수
  const handleBrandSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setBrandSearchResults([]);
      return;
    }

    setIsSearchingBrands(true);
    setBrandError("");

    try {
      const { data: brands, error } = await supabase
        .from("brands")
        .select("brand_id, name")
        .ilike("name", `*${searchTerm}*`)
        .order("name");

      if (error) {
        console.error("브랜드 검색 에러:", error);
        setBrandError("브랜드 검색 중 오류가 발생했습니다.");
        setBrandSearchResults([]);
        return;
      }

      setBrandSearchResults(brands || []);
    } catch (error) {
      console.error("브랜드 검색 중 오류:", error);
      setBrandError("브랜드 검색 중 오류가 발생했습니다.");
      setBrandSearchResults([]);
    } finally {
      setIsSearchingBrands(false);
    }
  };

  // 브랜드 선택 함수
  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandSearchValue(brand.name);
    setBrandSearchResults([]);
    setBrandError("");

    // productData의 brand_id 업데이트
    setProductData((prev) => ({
      ...prev,
      brand_id: brand.brand_id,
    }));
  };

  const resetForm = () => {
    setProductData({
      name: "",
      description: "",
      imageFile: null,
      imageName: "",
      brand_id: "",
    });

    // 브랜드 관련 상태 초기화
    setBrandSearchValue("");
    setBrandSearchResults([]);
    setSelectedBrand(null);
    setBrandError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // ← 파일 선택 비우기
    }
  };

  // 브랜드 검증 및 폼 제출
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBrand) {
      setBrandError("브랜드를 선택해주세요.");
      return;
    }

    // 브랜드가 선택되었으면 원래 제출 함수 호출
    handleProductSubmit(e);
    resetForm();
  };

  return (
    <div>
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">상품 등록</CardTitle>
              <CardDescription>새로운 상품을 시스템에 등록해보세요</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="product-name" className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>상품 이름</span>
            </Label>
            <Input
              id="product-name"
              type="text"
              value={productData.name}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  name: e.target.value.normalize("NFC"),
                }))
              }
              placeholder="상품 이름을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-search">브랜드</Label>
            <Input
              id="brand-search"
              type="text"
              className={brandError ? "border-destructive" : ""}
              value={brandSearchValue}
              onChange={(e) => {
                const value = e.target.value.normalize("NFC");
                setBrandSearchValue(value);
                handleBrandSearch(value);
                setBrandError("");
              }}
              placeholder="브랜드명을 검색하세요"
              required
            />

            {/* 선택된 브랜드 표시 */}
            {selectedBrand && (
              <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      선택된 브랜드: {selectedBrand.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBrand(null);
                      setBrandSearchValue("");
                      setProductData((prev) => ({ ...prev, brand_id: "" }));
                    }}
                    className="text-emerald-500 hover:text-emerald-700 h-auto p-0"
                  >
                    선택 해제
                  </Button>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {brandError && (
              <div className="mt-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-destructive text-sm">{brandError}</p>
              </div>
            )}

            {/* 브랜드 목록 */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  브랜드 목록{" "}
                  {brandSearchResults.length > 0 &&
                    `(${brandSearchResults.length}개)`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSearchingBrands ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">검색 중입니다...</p>
                  </div>
                ) : brandSearchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm mb-2">
                      {brandSearchValue
                        ? "검색 결과가 없습니다"
                        : "브랜드명을 검색해주세요"}
                    </p>
                    {brandSearchValue && (
                      <p className="text-muted-foreground/70 text-xs">
                        다른 브랜드명으로 검색해보세요
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {brandSearchResults.map((brand) => (
                      <div
                        key={brand.brand_id}
                        onClick={() => handleBrandSelect(brand)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent ${
                          selectedBrand?.brand_id === brand.brand_id
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {brand.name}
                          </span>
                          {selectedBrand?.brand_id === brand.brand_id && (
                            <span className="text-primary text-sm">
                              선택됨
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>상품 이미지</span>
            </Label>
            <div className="relative">
              <Input
                id="product-image"
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                required
                className="cursor-pointer"
              />
              {productData.imageName && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      선택된 파일: {productData.imageName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>상품 설명</span>
          </Label>
          <Textarea
            id="product-description"
            value={productData.description}
            onChange={(e) =>
              setProductData((prev) => ({
                ...prev,
                description: e.target.value.normalize("NFC"),
              }))
            }
            placeholder="상품에 대한 자세한 설명을 입력하세요..."
            rows={5}
            required
            className="min-h-[128px]"
          />
        </div>

        <div className="mt-8">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            상품 등록하기
          </Button>
        </div>
      </form>
        </CardContent>
      </Card>
    </div>
  );
}
