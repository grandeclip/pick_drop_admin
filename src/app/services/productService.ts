import { supabase } from "../lib/supabase";
import { fetchCategoryHierarchy } from "./productCategoryService";

export interface ProductSet {
  product_set_id: string;
  product_name: string;
  normalized_product_name: string;
  link_url: string;
  created_at: string;
  thumbnail?: string;
  label?: string;
  platforms?: {
    name: string;
  } | { name: string }[];
}

export interface Product {
  id: string;
  product_id?: string;
  name: string;
  description: string;
  image_url?: string;
  brand_id: string;
  category_id?: string;
  created_at: string;
  updated_at?: string;
  brands?: {
    name: string;
  };
  categories?: {
    name: string;
  };
  categoryHierarchy?: {
    id: string;
    name: string;
    parent_id?: string;
    level: number;
    path: Array<{
      id: string;
      name: string;
      parent_id?: string;
      level?: number;
    }>;
  };
  product_sets?: ProductSet[];
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

export type SortField = "created_at" | "name" | "brand";
export type SortDirection = "asc" | "desc";

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
  sortField = "created_at",
  sortDirection = "desc",
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
    const orderField = sortField === "brand" ? "created_at" : sortField;
    const ascending = sortField === "brand" ? false : sortDirection === "asc";

    // 병렬로 products, brands, categories, product_sets 데이터 가져오기
    const [productsResult, brandsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "product_id, name, description, image_url, brand_id, category_id, created_at, updated_at"
        )
        .order(orderField, { ascending })
        .range(from, to),
      supabase.from("brands").select("brand_id, name"),
      supabase.from("product_categories").select("id, name"),
    ]);

    if (productsResult.error) {
      console.error("Products error:", productsResult.error);
      throw productsResult.error;
    }

    if (brandsResult.error) {
      console.error("Brands error:", brandsResult.error);
      throw brandsResult.error;
    }

    if (categoriesResult.error) {
      console.error("Categories error:", categoriesResult.error);
      throw categoriesResult.error;
    }

    // 가져온 상품들의 product_set 데이터도 가져오기
    const productIds = productsResult.data?.map((p) => p.product_id) || [];
    const productSetsResult =
      productIds.length > 0
        ? await supabase
            .from("product_sets")
            .select(
              `
        product_set_id,
        product_id,
        product_name,
        normalized_product_name,
        link_url,
        created_at,
        thumbnail,
        label,
        platforms(name)
      `
            )
            .in("product_id", productIds)
        : { data: [], error: null };

    if (productSetsResult.error) {
      console.error("Product sets error:", productSetsResult.error);
    }

    // 브랜드 맵 생성
    const brandsMap = new Map(
      brandsResult.data?.map((brand) => [brand.brand_id, brand]) || []
    );

    // 카테고리 맵 생성
    const categoriesMap = new Map(
      categoriesResult.data?.map((category) => [category.id, category]) || []
    );

    // product_sets 맵 생성 (product_id 별로 그룹화)
    const productSetsMap = new Map<string, ProductSet[]>();
    if (productSetsResult.data) {
      productSetsResult.data.forEach((ps) => {
        if (!productSetsMap.has(ps.product_id)) {
          productSetsMap.set(ps.product_id, []);
        }
        productSetsMap.get(ps.product_id)?.push({
          product_set_id: ps.product_set_id,
          product_name: ps.product_name,
          normalized_product_name: ps.normalized_product_name,
          link_url: ps.link_url,
          created_at: ps.created_at,
          thumbnail: ps.thumbnail,
          label: ps.label,
          platforms: Array.isArray(ps.platforms) && ps.platforms.length > 0 
            ? ps.platforms[0] 
            : ps.platforms,
        });
      });
    }

    // products, brands, categories, product_sets 데이터 결합 및 product_id -> id 매핑
    const productsWithBrands =
      productsResult.data?.map((product) => ({
        ...product,
        id: product.product_id, // product_id를 id로 매핑
        brands:
          product.brand_id && brandsMap.get(product.brand_id)
            ? { name: brandsMap.get(product.brand_id)?.name }
            : undefined,
        categories:
          product.category_id && categoriesMap.get(product.category_id)
            ? { name: categoriesMap.get(product.category_id)?.name }
            : undefined,
        product_sets: productSetsMap.get(product.product_id) || [],
      })) || [];

    // 브랜드 정렬이 필요한 경우 클라이언트 사이드에서 정렬
    if (sortField === "brand") {
      productsWithBrands.sort((a, b) => {
        const brandA = a.brands?.name || "";
        const brandB = b.brands?.name || "";
        const comparison = brandA.localeCompare(brandB, "ko");
        return sortDirection === "asc" ? comparison : -comparison;
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
 * 단일 상품을 조회합니다.
 */
export async function fetchSingleProduct(productId: string): Promise<Product | null> {
  try {
    // 병렬로 상품, 브랜드, 카테고리, product_sets 데이터 가져오기
    const [productResult, brandsResult, categoriesResult, productSetsResult] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("product_id", productId)
        .single(),
      supabase.from("brands").select("brand_id, name"),
      supabase.from("product_categories").select("id, name"),
      supabase
        .from("product_sets")
        .select(`
          product_set_id,
          product_name,
          normalized_product_name,
          link_url,
          created_at,
          thumbnail,
          label,
          platforms(name)
        `)
        .eq("product_id", productId),
    ]);

    if (productResult.error) {
      console.error("Product error:", productResult.error);
      return null;
    }

    if (brandsResult.error) {
      console.error("Brands error:", brandsResult.error);
    }

    if (categoriesResult.error) {
      console.error("Categories error:", categoriesResult.error);
    }

    if (productSetsResult.error) {
      console.error("Product sets error:", productSetsResult.error);
    }

    // 브랜드 맵 생성
    const brandsMap = new Map(
      brandsResult.data?.map((brand) => [brand.brand_id, brand]) || []
    );

    // 카테고리 맵 생성
    const categoriesMap = new Map(
      categoriesResult.data?.map((category) => [category.id, category]) || []
    );

    // product_sets 데이터 매핑
    const productSets = productSetsResult.data?.map((ps) => ({
      product_set_id: ps.product_set_id,
      product_name: ps.product_name,
      normalized_product_name: ps.normalized_product_name,
      link_url: ps.link_url,
      created_at: ps.created_at,
      thumbnail: ps.thumbnail,
      label: ps.label,
      platforms: Array.isArray(ps.platforms) && ps.platforms.length > 0 
        ? ps.platforms[0] 
        : ps.platforms,
    })) || [];

    // 카테고리 계층 구조 조회
    let categoryHierarchy = undefined;
    if (productResult.data.category_id) {
      categoryHierarchy = await fetchCategoryHierarchy(productResult.data.category_id);
    }

    // 상품 데이터와 브랜드, 카테고리, product_sets 정보 결합
    const productWithBrand: Product = {
      ...productResult.data,
      id: productResult.data.product_id,
      brands: productResult.data.brand_id && brandsMap.get(productResult.data.brand_id)
        ? { name: brandsMap.get(productResult.data.brand_id)?.name }
        : undefined,
      categories: productResult.data.category_id && categoriesMap.get(productResult.data.category_id)
        ? { name: categoriesMap.get(productResult.data.category_id)?.name }
        : undefined,
      categoryHierarchy: categoryHierarchy || undefined,
      product_sets: productSets,
    };

    return productWithBrand;
  } catch (error) {
    console.error("상품 조회 에러:", error);
    return null;
  }
}

/**
 * 상품을 업데이트합니다.
 */
export async function updateProduct(
  product: Partial<Product> & { id: string }
) {
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
      error: "상품 수정 중 오류가 발생했습니다.",
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
      error: "상품 삭제 중 오류가 발생했습니다.",
    };
  }
}

