import { supabase } from "../lib/supabase";

export interface Product {
  id: string;
  product_id?: string;
  name: string;
  description: string;
  image_url?: string;
  brand_id: string;
  created_at: string;
  updated_at?: string;
  brands?: {
    name: string;
  };
}

export interface Brand {
  brand_id: string;
  name: string;
}

export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  error?: string;
}

export type SortField = 'created_at' | 'name' | 'brand';
export type SortDirection = 'asc' | 'desc';

export interface FetchProductsParams {
  page: number;
  perPage: number;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

/**
 * 상품 목록을 가져옵니다.
 */
export async function fetchProducts({ 
  page, 
  perPage, 
  sortField = 'created_at', 
  sortDirection = 'desc' 
}: FetchProductsParams): Promise<ProductsResponse> {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // 전체 개수 조회
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw countError;
    }

    // 정렬 필드 매핑 (brand는 join 후 클라이언트에서 정렬)
    const orderField = sortField === 'brand' ? 'created_at' : sortField;
    const ascending = sortField === 'brand' ? false : sortDirection === 'asc';

    // 병렬로 products와 brands 데이터 가져오기
    const [productsResult, brandsResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "product_id, name, description, image_url, brand_id, created_at, updated_at"
        )
        .order(orderField, { ascending })
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

    // 브랜드 정렬이 필요한 경우 클라이언트 사이드에서 정렬
    if (sortField === 'brand') {
      productsWithBrands.sort((a, b) => {
        const brandA = a.brands?.name || '';
        const brandB = b.brands?.name || '';
        const comparison = brandA.localeCompare(brandB, 'ko');
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return {
      products: productsWithBrands,
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("상품 로딩 에러:", error);
    return {
      products: [],
      totalCount: 0,
      error: "상품 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 모든 브랜드를 가져옵니다.
 */
export async function fetchBrands(): Promise<Brand[]> {
  try {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .neq("name", "")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("브랜드 로딩 에러:", error);
    return [];
  }
}

/**
 * 상품을 업데이트합니다.
 */
export async function updateProduct(product: Partial<Product> & { id: string }) {
  try {
    const { error } = await supabase
      .from("products")
      .update({
        name: product.name,
        description: product.description,
        brand_id: product.brand_id,
      })
      .eq("id", product.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("상품 수정 에러:", error);
    return { 
      success: false, 
      error: "상품 수정 중 오류가 발생했습니다." 
    };
  }
}

/**
 * 상품을 삭제합니다.
 */
export async function deleteProduct(productId: string) {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("상품 삭제 에러:", error);
    return { 
      success: false, 
      error: "상품 삭제 중 오류가 발생했습니다." 
    };
  }
}