import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Package, Archive, Star, Tag, ChevronRight, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: "product" | "productSet" | "mdpick" | "brand" | "productManage";
  setActiveTab: (
    tab: "product" | "productSet" | "mdpick" | "brand" | "productManage"
  ) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = [
    {
      id: "productManage" as const,
      label: "상품 관리",
      description: "등록된 상품을 조회하고 관리",
      icon: List,
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50",
      iconBg: "bg-slate-500",
    },
    {
      id: "product" as const,
      label: "상품 등록",
      description: "새로운 상품을 시스템에 추가",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-500",
    },
    {
      id: "productSet" as const,
      label: "상품세트 등록",
      description: "여러 상품을 묶어서 세트로 구성",
      icon: Archive,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-500",
    },
    {
      id: "mdpick" as const,
      label: "MD Pick 설정",
      description: "추천 상품을 선별하여 설정",
      icon: Star,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-500",
    },
    {
      id: "brand" as const,
      label: "브랜드 등록",
      description: "새로운 브랜드 정보를 추가",
      icon: Tag,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-500",
    },
  ];

  return (
    <div className="lg:col-span-1">
      <Card className="overflow-hidden sticky top-32">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">관리 메뉴</h3>
              <p className="text-xs text-muted-foreground">시스템 관리 도구</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 p-4 pt-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <div
                key={tab.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 hover:border-border hover:bg-accent/50"
                )}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-auto p-0 justify-start rounded-xl",
                    "hover:bg-transparent"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="flex items-center w-full p-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                          isActive
                            ? `bg-gradient-to-br ${tab.color} shadow-sm`
                            : "bg-muted group-hover:bg-muted/80"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5 transition-colors duration-200",
                            isActive
                              ? "text-white"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span
                            className={cn(
                              "font-medium text-sm transition-colors duration-200",
                              isActive ? "text-primary" : "text-foreground"
                            )}
                          >
                            {tab.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tab.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-all duration-200",
                        isActive
                          ? "text-primary translate-x-0.5"
                          : "text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5"
                      )}
                    />
                  </div>
                </Button>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-r-full" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
