import { supabase } from "../lib/supabase";

export interface Category {
  id: string;
  name: string;
  parent_id?: string;
  level?: number;
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  parent_id?: string;
  level: number;
  path: Category[];
}

/**
 * 모든 카테고리를 가져옵니다.
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("카테고리 로딩 에러:", error);
    return [];
  }
}

/**
 * 특정 카테고리의 계층 구조를 조회합니다.
 */
export async function fetchCategoryHierarchy(categoryId: string): Promise<CategoryHierarchy | null> {
  try {
    // 모든 카테고리 데이터 가져오기
    const { data: categories, error } = await supabase
      .from("product_categories")
      .select("*");

    if (error) throw error;
    if (!categories) return null;

    // 카테고리 맵 생성
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    
    // 시작 카테고리 찾기
    const startCategory = categoryMap.get(categoryId);
    if (!startCategory) return null;

    // 계층 구조 구축 (부모로 올라가며)
    const path: Category[] = [];
    let currentCategory = startCategory;
    let level = 0;

    while (currentCategory) {
      path.unshift({
        id: currentCategory.id,
        name: currentCategory.name,
        parent_id: currentCategory.parent_id,
        level: level
      });
      
      if (!currentCategory.parent_id) break;
      
      currentCategory = categoryMap.get(currentCategory.parent_id);
      level++;
    }

    return {
      id: startCategory.id,
      name: startCategory.name,
      parent_id: startCategory.parent_id,
      level: path.length - 1,
      path: path
    };
  } catch (error) {
    console.error("카테고리 계층 조회 에러:", error);
    return null;
  }
}

/**
 * 새 카테고리를 생성합니다.
 */
export async function createCategory(name: string) {
  try {
    const { data, error } = await supabase
      .from("product_categories")
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("카테고리 생성 에러:", error);
    return {
      success: false,
      error: "카테고리 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 카테고리를 업데이트합니다.
 */
export async function updateCategory(categoryId: string, name: string) {
  try {
    const { error } = await supabase
      .from("product_categories")
      .update({ name })
      .eq("category_id", categoryId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("카테고리 수정 에러:", error);
    return {
      success: false,
      error: "카테고리 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 카테고리를 삭제합니다.
 */
export async function deleteCategory(categoryId: string) {
  try {
    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("category_id", categoryId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("카테고리 삭제 에러:", error);
    return {
      success: false,
      error: "카테고리 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 여러 상품의 카테고리를 일괄 업데이트합니다.
 */
export async function bulkUpdateProductCategory(
  productIds: string[],
  categoryId: string
) {
  try {
    const { error } = await supabase
      .from("products")
      .update({ category_id: categoryId })
      .in("product_id", productIds);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("일괄 카테고리 업데이트 에러:", error);
    return {
      success: false,
      error: "카테고리 업데이트 중 오류가 발생했습니다.",
    };
  }
}
