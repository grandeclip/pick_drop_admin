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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  RotateCcw,
  Server,
  Database,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Folder,
  Package,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchCategories,
  type Category,
} from "../services/productCategoryService";

interface CacheAction {
  id: string;
  type: string;
  categoryId?: string;
  categoryName?: string;
  path?: string;
  timestamp: string;
  status: "success" | "error";
  message: string;
}

export default function CacheManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCacheActionLoading, setIsCacheActionLoading] = useState(false);
  const [cacheHistory, setCacheHistory] = useState<CacheAction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customPath, setCustomPath] = useState<string>("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    description: string;
    categoryId?: string;
    path?: string;
  } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadCacheHistory();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("카테고리 로딩 에러:", error);
      toast({
        title: "오류",
        description: "카테고리 데이터를 로드할 수 없습니다.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const loadCacheHistory = () => {
    const history = localStorage.getItem("cache_action_history");
    if (history) {
      try {
        setCacheHistory(JSON.parse(history).slice(0, 50)); // 최근 50개만
      } catch (error) {
        console.error("캐시 히스토리 로딩 에러:", error);
      }
    }
  };

  const saveCacheHistory = (action: CacheAction) => {
    const updatedHistory = [action, ...cacheHistory].slice(0, 50);
    setCacheHistory(updatedHistory);
    localStorage.setItem(
      "cache_action_history",
      JSON.stringify(updatedHistory)
    );
  };

  const executeCacheAction = async (
    type: string,
    categoryId?: string,
    path?: string
  ) => {
    setIsCacheActionLoading(true);

    try {
      const url = new URL("/api/cache", window.location.origin);
      url.searchParams.set("type", type);
      if (categoryId) url.searchParams.set("categoryId", categoryId);
      if (path) url.searchParams.set("path", path);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        const categoryName = categoryId
          ? categories.find((cat) => cat.id === categoryId)?.name
          : undefined;

        const action: CacheAction = {
          id: Date.now().toString(),
          type,
          categoryId,
          categoryName,
          path,
          timestamp: new Date().toISOString(),
          status: "success",
          message: result.message,
        };

        saveCacheHistory(action);

        toast({
          title: "성공",
          description: result.message,
        });
      } else {
        throw new Error(result.error || "캐시 무효화 실패");
      }
    } catch (error) {
      const action: CacheAction = {
        id: Date.now().toString(),
        type,
        categoryId,
        path,
        timestamp: new Date().toISOString(),
        status: "error",
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      };

      saveCacheHistory(action);

      toast({
        title: "오류",
        description: action.message,
        variant: "destructive",
      });
    }

    setIsCacheActionLoading(false);
    setIsConfirmDialogOpen(false);
    setPendingAction(null);
  };

  const handleCacheAction = (
    type: string,
    description: string,
    categoryId?: string,
    path?: string
  ) => {
    setPendingAction({ type, description, categoryId, path });
    setIsConfirmDialogOpen(true);
  };

  const confirmCacheAction = () => {
    if (pendingAction) {
      executeCacheAction(
        pendingAction.type,
        pendingAction.categoryId,
        pendingAction.path
      );
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "categories":
        return <Folder className="w-4 h-4" />;
      case "products":
        return <Package className="w-4 h-4" />;
      case "category-products":
        return <Folder className="w-4 h-4" />;
      case "all":
        return <Database className="w-4 h-4" />;
      case "path":
        return <Server className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getActionDescription = (type: string) => {
    switch (type) {
      case "categories":
        return "모든 카테고리 캐시를 무효화합니다";
      case "products":
        return "모든 제품 캐시를 무효화합니다";
      case "category-products":
        return "선택한 카테고리의 제품 캐시만 무효화합니다";
      case "all":
        return "모든 캐시를 무효화합니다 (위험)";
      case "path":
        return "특정 경로의 캐시를 무효화합니다";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">캐시 관리</CardTitle>
              <CardDescription>
                pickdrop.shop의 Next.js 캐시를 무효화하여 데이터를 새로고침할 수
                있습니다
                <br />
                <span className="text-blue-600 text-xs">
                  📡 magpie.pickdrop.shop → pickdrop.shop으로 프록시 요청
                </span>
                <br />
                <span className="text-orange-600 text-sm">
                  ⚠️ 캐시 무효화는 시스템 성능에 영향을 줄 수 있으므로 신중하게
                  사용하세요.
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 캐시 액션 카드들 */}
        <div className="space-y-4">
          {/* 카테고리 캐시 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-blue-600" />
                <span>카테고리 캐시</span>
              </CardTitle>
              <CardDescription>
                카테고리 데이터와 관련된 캐시를 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() =>
                  handleCacheAction("categories", "모든 카테고리 캐시 무효화")
                }
                disabled={isCacheActionLoading}
                className="w-full"
                variant="outline"
              >
                <Folder className="w-4 h-4 mr-2" />
                모든 카테고리 캐시 무효화
              </Button>

              <div className="space-y-2">
                <Label>특정 카테고리 캐시 무효화</Label>
                <div className="flex space-x-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => !cat.parent_id)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() =>
                      handleCacheAction(
                        "category-products",
                        `카테고리 "${
                          categories.find((cat) => cat.id === selectedCategory)
                            ?.name
                        }" 캐시 무효화`,
                        selectedCategory
                      )
                    }
                    disabled={!selectedCategory || isCacheActionLoading}
                    variant="outline"
                  >
                    무효화
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 제품 캐시 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-green-600" />
                <span>제품 캐시</span>
              </CardTitle>
              <CardDescription>
                제품 데이터와 관련된 캐시를 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() =>
                  handleCacheAction("products", "모든 제품 캐시 무효화")
                }
                disabled={isCacheActionLoading}
                className="w-full"
                variant="outline"
              >
                <Package className="w-4 h-4 mr-2" />
                모든 제품 캐시 무효화
              </Button>
            </CardContent>
          </Card>

          {/* 전체 캐시 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-red-600" />
                <span>전체 캐시</span>
              </CardTitle>
              <CardDescription>
                모든 캐시를 한 번에 무효화합니다 (주의 필요)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleCacheAction("all", "모든 캐시 무효화")}
                disabled={isCacheActionLoading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                모든 캐시 무효화
              </Button>

              <div className="space-y-2">
                <Label>특정 경로 캐시 무효화</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="/api/products"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                  />
                  <Button
                    onClick={() =>
                      handleCacheAction(
                        "path",
                        `경로 "${customPath}" 캐시 무효화`,
                        undefined,
                        customPath
                      )
                    }
                    disabled={!customPath || isCacheActionLoading}
                    variant="outline"
                  >
                    무효화
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 캐시 액션 히스토리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span>캐시 액션 히스토리</span>
            </CardTitle>
            <CardDescription>
              최근 캐시 무효화 작업 내역을 확인할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            ) : cacheHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  캐시 액션 히스토리가 없습니다
                </p>
                <p className="text-sm text-muted-foreground">
                  캐시 무효화를 실행하면 여기에 표시됩니다
                </p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>액션</TableHead>
                      <TableHead>시간</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cacheHistory.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {action.status === "success" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              {getActionIcon(action.type)}
                              <span className="font-medium">
                                {action.type === "category-products" &&
                                action.categoryName
                                  ? `${action.categoryName} 카테고리`
                                  : action.type === "categories"
                                  ? "모든 카테고리"
                                  : action.type === "products"
                                  ? "모든 제품"
                                  : action.type === "all"
                                  ? "모든 캐시"
                                  : action.type === "path"
                                  ? `경로: ${action.path}`
                                  : action.type}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {action.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {new Date(action.timestamp).toLocaleString("ko-KR")}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 확인 다이얼로그 */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>캐시 무효화 확인</span>
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.description}을 실행하시겠습니까?
              <br />
              <span className="text-orange-600 text-sm">
                이 작업은 되돌릴 수 없으며 시스템 성능에 영향을 줄 수 있습니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {pendingAction && getActionIcon(pendingAction.type)}
              <span>{getActionDescription(pendingAction?.type || "")}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isCacheActionLoading}
            >
              취소
            </Button>
            <Button
              onClick={confirmCacheAction}
              disabled={isCacheActionLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCacheActionLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              {isCacheActionLoading ? "실행 중..." : "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
