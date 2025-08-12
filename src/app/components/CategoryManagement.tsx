"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Trash2,
  Edit,
  Plus,
  Folder,
  Check,
  X,
  Search,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "../services/productCategoryService";

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryParentId, setEditCategoryParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // 카테고리를 계층 구조로 정렬하는 함수
  const buildCategoryHierarchy = (categories: Category[]): Category[] => {
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const result: Category[] = [];
    
    // 최상위 카테고리들을 먼저 찾기
    const rootCategories = categories.filter(cat => !cat.parent_id);
    
    // 재귀적으로 자식 카테고리들을 추가하는 함수
    const addChildren = (parentCategory: Category, level = 0) => {
      result.push({ ...parentCategory, level });
      
      const children = categories.filter(cat => cat.parent_id === parentCategory.id);
      children.sort((a, b) => a.name.localeCompare(b.name));
      
      children.forEach(child => {
        addChildren(child, level + 1);
      });
    };
    
    // 최상위 카테고리들을 이름순으로 정렬
    rootCategories.sort((a, b) => a.name.localeCompare(b.name));
    
    // 각 최상위 카테고리와 그 하위 카테고리들을 순서대로 추가
    rootCategories.forEach(root => {
      addChildren(root);
    });
    
    return result;
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // 검색이 있을 때는 평면적으로, 없을 때는 계층 구조로 표시
    let filtered: Category[];
    
    if (searchQuery) {
      filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filtered = buildCategoryHierarchy(categories);
    }

    setFilteredCategories(filtered);
  }, [categories, searchQuery]);

  const loadCategories = async () => {
    setIsLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setIsLoading(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    const result = await createCategory(newCategoryName.trim());

    if (result.success) {
      toast({
        title: "성공",
        description: "카테고리가 성공적으로 생성되었습니다.",
      });
      setIsCreateDialogOpen(false);
      setNewCategoryName("");
      loadCategories();
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !editCategoryName.trim()) return;

    setIsSubmitting(true);
    const result = await updateCategory(selectedCategory.id, editCategoryName.trim());

    if (result.success) {
      toast({
        title: "성공",
        description: "카테고리가 성공적으로 수정되었습니다.",
      });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setEditCategoryName("");
      loadCategories();
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    const result = await deleteCategory(selectedCategory.id);

    if (result.success) {
      toast({
        title: "성공",
        description: "카테고리가 성공적으로 삭제되었습니다.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } else {
      toast({
        title: "오류",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">카테고리 관리</CardTitle>
                <CardDescription>
                  상품 카테고리를 생성, 수정, 삭제할 수 있습니다
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              새 카테고리
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 검색 */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="카테고리명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 카테고리 테이블 */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                카테고리가 없습니다
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                새로운 카테고리를 추가해보세요
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                첫 카테고리 추가
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>카테고리명</TableHead>
                  <TableHead>상위 카테고리</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-center">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2" style={{ paddingLeft: `${(category.level || 0) * 20}px` }}>
                        {(category.level || 0) > 0 && (
                          <span className="text-muted-foreground text-xs mr-1">
                            {'└ '.repeat(1)}
                          </span>
                        )}
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        <span>{category.name}</span>
                        {(category.level || 0) > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Lv.{category.level})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.parent_id ? (
                        <span className="text-sm">
                          {categories.find(c => c.id === category.parent_id)?.name || '알 수 없음'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">최상위</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <code className="px-2 py-1 bg-muted rounded text-xs">
                        {category.id}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(category)}
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
        </CardContent>
      </Card>

      {/* 카테고리 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-green-600" />
              <span>새 카테고리 추가</span>
            </DialogTitle>
            <DialogDescription>
              새로운 카테고리를 추가합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">카테고리명</Label>
              <Input
                id="category-name"
                placeholder="카테고리명을 입력하세요"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSubmitting) {
                    handleCreateCategory();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-category">상위 카테고리</Label>
              <select
                id="parent-category"
                value={newCategoryParentId}
                onChange={(e) => setNewCategoryParentId(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">상위 카테고리 없음 (최상위)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
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
                setIsCreateDialogOpen(false);
                setNewCategoryName("");
                setNewCategoryParentId("");
              }}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 카테고리 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-blue-600" />
              <span>카테고리 수정</span>
            </DialogTitle>
            <DialogDescription>
              <strong>{selectedCategory?.name}</strong> 카테고리를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">카테고리명</Label>
              <Input
                id="edit-category-name"
                placeholder="카테고리명을 입력하세요"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSubmitting) {
                    handleEditCategory();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent-category">상위 카테고리</Label>
              <select
                id="edit-parent-category"
                value={editCategoryParentId}
                onChange={(e) => setEditCategoryParentId(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">상위 카테고리 없음 (최상위)</option>
                {categories
                  .filter((category) => category.id !== selectedCategory?.id)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
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
                setIsEditDialogOpen(false);
                setSelectedCategory(null);
                setEditCategoryName("");
                setEditCategoryParentId("");
              }}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleEditCategory}
              disabled={!editCategoryName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 카테고리 삭제 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>카테고리 삭제 확인</span>
            </DialogTitle>
            <DialogDescription>
              <strong>{selectedCategory?.name}</strong> 카테고리를 삭제하시겠습니까?
              <br />
              삭제된 카테고리는 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCategory(null);
              }}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}