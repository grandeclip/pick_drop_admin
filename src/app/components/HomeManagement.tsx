"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Home,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Folder,
  History,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchCategories,
  type Category,
} from "../services/productCategoryService";
import { supabase } from "../lib/supabase";

interface HomeCategoryOrder {
  id: string;
  category_id: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  category?: Category;
}

interface HomeCategoryVersion {
  created_at: string;
  categories: HomeCategoryOrder[];
}

export default function HomeManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [homeCategoryOrders, setHomeCategoryOrders] = useState<
    HomeCategoryOrder[]
  >([]);
  const [categoryVersions, setCategoryVersions] = useState<
    HomeCategoryVersion[]
  >([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isEditModeOpen, setIsEditModeOpen] = useState(false);
  const [editingCategories, setEditingCategories] = useState<Category[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    // 카테고리 데이터 로드
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);

    // 홈 카테고리 순서 데이터 로드
    await loadHomeCategoryOrders(categoriesData);

    // 버전 히스토리 로드
    await loadCategoryVersions();

    // 변경사항 초기화
    setHasUnsavedChanges(false);

    setIsLoading(false);
  };

  const loadHomeCategoryOrders = async (categoriesData: Category[]) => {
    try {
      // created_at 기준으로 최신 시점 조회
      const { data: latestData, error: latestError } = await supabase
        .from("home_category_orders")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (latestError) {
        console.log("최신 시점 조회 에러:", latestError);
        setHomeCategoryOrders([]);
        return;
      }

      if (!latestData || latestData.length === 0) {
        setHomeCategoryOrders([]);
        return;
      }

      const latestTimestamp = latestData[0].created_at;

      // 최신 시점의 홈 카테고리 순서 조회
      const { data, error } = await supabase
        .from("home_category_orders")
        .select("*")
        .eq("created_at", latestTimestamp)
        .order("display_order");

      if (error) throw error;

      // 카테고리 정보와 매핑
      const ordersWithCategory = (data || []).map((order) => ({
        ...order,
        category: categoriesData.find((cat) => cat.id === order.category_id),
      }));

      setHomeCategoryOrders(ordersWithCategory);
      setCurrentTimestamp(latestTimestamp);
    } catch (error) {
      console.error("홈 카테고리 순서 로딩 에러:", error);
      // 테이블이 없을 경우 빈 배열로 설정
      setHomeCategoryOrders([]);
    }
  };

  const loadCategoryVersions = async () => {
    try {
      // 모든 데이터를 조회하여 클라이언트에서 그룹화
      const { data, error } = await supabase
        .from("home_category_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // created_at별로 그룹화
      const versionMap = new Map<string, HomeCategoryVersion>();

      (data || []).forEach((order) => {
        const timestampKey = order.created_at;

        if (!versionMap.has(timestampKey)) {
          versionMap.set(timestampKey, {
            created_at: order.created_at,
            categories: [],
          });
        }

        versionMap.get(timestampKey)!.categories.push(order);
      });

      // 카테고리 순서로 정렬
      versionMap.forEach((version) => {
        version.categories.sort((a, b) => a.display_order - b.display_order);
      });

      // 최신 순으로 정렬하여 최근 20개 버전만
      const versionsArray = Array.from(versionMap.values())
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 20);

      setCategoryVersions(versionsArray);
    } catch (error) {
      console.error("카테고리 버전 히스토리 로딩 에러:", error);
      setCategoryVersions([]);
    }
  };

  const startEditMode = () => {
    // is_visible이 true인 홈 카테고리 순서만 가져오기
    const visibleOrders = homeCategoryOrders
      .filter((order) => order.is_visible)
      .sort((a, b) => a.display_order - b.display_order);

    // 해당하는 카테고리 객체들을 순서대로 배열
    const orderedCategories = visibleOrders
      .map((order) => categories.find((cat) => cat.id === order.category_id))
      .filter((cat): cat is Category => cat !== undefined && !cat.parent_id);

    setEditingCategories(orderedCategories);
    setIsEditModeOpen(true);
  };

  const moveEditingCategory = (index: number, direction: "up" | "down") => {
    const newCategories = [...editingCategories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    // 순서 교체
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    setEditingCategories(newCategories);
    setHasUnsavedChanges(true);
  };

  const addCategoryToEdit = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category || editingCategories.some((cat) => cat.id === categoryId))
      return;

    setEditingCategories([...editingCategories, category]);
    setHasUnsavedChanges(true);
  };

  const removeCategoryFromEdit = (categoryId: string) => {
    setEditingCategories(
      editingCategories.filter((cat) => cat.id !== categoryId)
    );
    setHasUnsavedChanges(true);
  };

  const saveEditedCategoryOrder = async () => {
    setIsSaving(true);

    try {
      const currentTime = new Date().toISOString();

      // 모든 1depth 카테고리에 대해 상태 관리
      const topLevelCategories = categories.filter((cat) => !cat.parent_id);
      const insertData = topLevelCategories.map((category) => {
        const isSelected = editingCategories.some(
          (editCat) => editCat.id === category.id
        );
        const displayOrder = isSelected
          ? editingCategories.findIndex(
              (editCat) => editCat.id === category.id
            ) + 1
          : 999; // 선택되지 않은 카테고리는 뒤쪽 순서

        return {
          category_id: category.id,
          display_order: displayOrder,
          is_visible: isSelected, // 선택된 카테고리만 노출
          created_at: currentTime,
        };
      });

      const { error: insertError } = await supabase
        .from("home_category_orders")
        .insert(insertData);

      if (insertError) throw insertError;

      toast({
        title: "성공",
        description: "홈 화면 카테고리 순서가 저장되었습니다.",
      });

      // 현재 시점 업데이트 및 편집 모드 종료
      setCurrentTimestamp(currentTime);
      setHasUnsavedChanges(false);
      setIsEditModeOpen(false);

      // 데이터 다시 로드
      await loadData();
    } catch (error) {
      console.error("저장 에러:", error);
      toast({
        title: "오류",
        description:
          "저장 중 오류가 발생했습니다. 데이터베이스 테이블을 확인해주세요.",
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  const cancelEdit = () => {
    setIsEditModeOpen(false);
    setEditingCategories([]);
    setHasUnsavedChanges(false);
  };

  const rollbackToTimestamp = async (timestamp: string) => {
    setIsSaving(true);

    try {
      // 선택한 시점의 데이터 조회
      const { data: timestampData, error } = await supabase
        .from("home_category_orders")
        .select("*")
        .eq("created_at", timestamp)
        .order("display_order");

      if (error) throw error;

      if (!timestampData || timestampData.length === 0) {
        throw new Error("선택한 시점의 데이터를 찾을 수 없습니다.");
      }

      // 새로운 시점으로 이전 row들을 복사해서 새로운 row들 생성
      const currentTime = new Date().toISOString();

      const insertData = timestampData.map((order) => ({
        category_id: order.category_id,
        display_order: order.display_order,
        is_visible: order.is_visible,
        created_at: currentTime,
      }));

      const { error: insertError } = await supabase
        .from("home_category_orders")
        .insert(insertData);

      if (insertError) throw insertError;

      toast({
        title: "성공",
        description: `이전 시점으로 롤백되었습니다.`,
      });

      // 데이터 다시 로드
      await loadData();
      setIsVersionDialogOpen(false);
    } catch (error) {
      console.error("롤백 에러:", error);
      toast({
        title: "오류",
        description: "롤백 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">홈 화면 관리</CardTitle>
                <CardDescription>
                  홈 화면에 노출될 카테고리의 순서와 표시 여부를 설정할 수
                  있습니다
                  <br />
                  <span className="text-orange-600 text-sm">
                    ⚠️ 노출이라고 표시되더라도 제품이 없으면, 해당 카테고리는 홈
                    스크린에서 노출되지 않습니다.
                  </span>
                </CardDescription>
                {currentTimestamp && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      최종 저장:{" "}
                      <code className="px-1 py-0.5 bg-muted rounded text-xs">
                        {new Date(currentTimestamp).toLocaleString("ko-KR")}
                      </code>
                    </span>
                    {hasUnsavedChanges && (
                      <span className="text-xs text-orange-600 font-medium">
                        • 저장되지 않은 변경사항이 있습니다
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsVersionDialogOpen(true)}
                disabled={isSaving}
              >
                <History className="w-4 h-4 mr-2" />
                히스토리
              </Button>
              <Button
                onClick={startEditMode}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                순서 변경
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 홈 카테고리 순서 테이블 */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : homeCategoryOrders.length === 0 ? (
            <div className="text-center py-16">
              <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                홈 화면에 설정된 카테고리가 없습니다
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                순서 변경 버튼을 눌러 홈 화면 카테고리 순서를 설정해보세요
              </p>
              <Button onClick={startEditMode}>
                <Save className="w-4 h-4 mr-2" />
                순서 변경
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">순서</TableHead>
                  <TableHead>카테고리명</TableHead>
                  <TableHead className="w-24 text-center">노출</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeCategoryOrders.map((order, index) => (
                  <TableRow
                    key={order.category_id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-center">
                      {order.display_order}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {order.category?.name || "알 수 없는 카테고리"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {order.is_visible ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 순서 편집 다이얼로그 */}
      <Dialog open={isEditModeOpen} onOpenChange={setIsEditModeOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Save className="w-5 h-5 text-blue-600" />
              <span>홈 카테고리 순서 편집</span>
            </DialogTitle>
            <DialogDescription>
              1depth 카테고리들의 홈 화면 노출 순서를 설정해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 현재 편집 중인 카테고리 목록 */}
            <div className="space-y-2">
              <Label>선택된 카테고리 순서</Label>
              <div className="border rounded-lg p-4 min-h-[200px]">
                {editingCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    아래에서 카테고리를 추가해주세요
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editingCategories.map((category, index) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded text-xs flex items-center justify-center font-mono">
                            {index + 1}
                          </span>
                          <Folder className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveEditingCategory(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveEditingCategory(index, "down")}
                            disabled={index === editingCategories.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCategoryFromEdit(category.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 추가 가능한 카테고리들 */}
            <div className="space-y-2">
              <Label>추가 가능한 1depth 카테고리</Label>
              <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                {categories
                  .filter(
                    (cat) =>
                      !cat.parent_id &&
                      !editingCategories.some(
                        (editCat) => editCat.id === cat.id
                      )
                  )
                  .map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        <span>{category.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCategoryToEdit(category.id)}
                      >
                        추가
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>
              취소
            </Button>
            <Button
              onClick={saveEditedCategoryOrder}
              disabled={isSaving || editingCategories.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? "저장 중..." : "순서 저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 버전 히스토리 다이얼로그 */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>홈 카테고리 순서 히스토리</span>
            </DialogTitle>
            <DialogDescription>
              이전 시점으로 롤백하거나 변경 히스토리를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {categoryVersions.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  저장된 히스토리가 없습니다
                </p>
                <p className="text-sm text-muted-foreground">
                  첫 번째 순서를 저장해보세요
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryVersions.map((version, index) => (
                  <div
                    key={version.created_at}
                    className={`border rounded-lg p-4 ${
                      version.created_at === currentTimestamp
                        ? "border-blue-500 bg-blue-50"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {new Date(version.created_at).toLocaleString(
                              "ko-KR"
                            )}
                          </span>
                          {version.created_at === currentTimestamp && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              현재
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {version.categories.length}개 카테고리
                        </div>
                      </div>
                      {version.created_at !== currentTimestamp && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            rollbackToTimestamp(version.created_at)
                          }
                          disabled={isSaving}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          롤백
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {version.categories.map((cat, catIndex) => {
                        return (
                          <div
                            key={cat.category_id}
                            className="flex items-center justify-between p-2 bg-background rounded border text-sm"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 bg-muted rounded text-xs flex items-center justify-center font-mono">
                                {cat.display_order}
                              </span>
                              <Folder className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate">
                                {categories.find(
                                  (c) => c.id === cat.category_id
                                )?.name || "알 수 없는 카테고리"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              {cat.is_visible ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVersionDialogOpen(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
