"use client";

import { Building, LogOut, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Header() {
  const { data: session } = useSession();
  const env = process.env.NODE_ENV;
  const isDev = env === "development";
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // 사용자 이메일에서 첫 글자 추출
  const getInitials = (
    email: string | null | undefined,
    name?: string | null
  ) => {
    // 이름이 있다면 이름에서 첫 글자 추출 (한글 이름 우선)
    if (name && name.trim()) {
      const trimmedName = name.trim();
      // 한글 이름인 경우
      if (/[가-힣]/.test(trimmedName)) {
        return trimmedName.charAt(0);
      }
      // 영문 이름인 경우 (공백으로 분리된 경우 첫 번째 단어의 첫 글자)
      const firstName = trimmedName.split(" ")[0];
      return firstName.charAt(0).toUpperCase();
    }

    if (!email) return "U"; // Unknown user

    // 이메일에서 @ 앞부분 추출
    const username = email.split("@")[0];

    // 한글이나 영문 첫 글자 반환
    if (username && username.length > 0) {
      // 한글이 포함된 경우
      if (/[가-힣]/.test(username)) {
        const koreanChar = username.match(/[가-힣]/);
        return koreanChar ? koreanChar[0] : username.charAt(0).toUpperCase();
      }
      return username.charAt(0).toUpperCase();
    }

    return "U";
  };

  const userInitials = getInitials(session?.user?.email, session?.user?.name);
  const userEmail = session?.user?.email || "unknown@pickdrop.com";
  const userName = session?.user?.name || "사용자";

  // 로그아웃 확인 다이얼로그 열기
  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  // 실제 로그아웃 실행
  const confirmLogout = async () => {
    try {
      setIsLogoutDialogOpen(false);
      await signOut({
        callbackUrl: "/signin",
        redirect: true,
      });
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4">
        {/* Logo and Title Section */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              {isDev && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>

            <div>
              <h1 className="flex items-center space-x-2 text-xl font-bold">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PickDrop Admin
                </span>
                {isDev && (
                  <Badge variant="secondary" className="text-xs py-0 px-2 ml-2">
                    DEV
                  </Badge>
                )}
              </h1>
              <p className="text-xs text-muted-foreground">
                상품 및 상품세트 관리 시스템
              </p>
            </div>
          </div>
        </div>

        {/* Status and Actions Section */}
        <div className="flex items-center space-x-3">
          {/* System Status */}
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              <Activity className="w-3 h-3" />
              <span className="font-medium">시스템 아무튼 정상</span>
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={userName || "User"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal bg-gradient-to-r from-indigo-50 to-purple-50 m-2 rounded-lg p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-900">
                    {userName}
                  </p>
                  <p className="text-xs leading-none text-slate-600">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200" />
              <DropdownMenuItem
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700 mx-2 rounded-md my-1"
                onClick={handleLogoutClick}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Development Environment Banner */}
      {isDev && (
        <div className="border-b bg-amber-50 px-4 py-2">
          <div className="container mx-auto max-w-screen-2xl">
            <div className="flex items-center justify-center space-x-2 text-xs text-amber-800">
              <Shield className="w-3 h-3" />
              <span className="font-medium">개발 환경입니다.</span>
            </div>
          </div>
        </div>
      )}

      {/* 로그아웃 확인 다이얼로그 */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LogOut className="w-5 h-5 text-red-600" />
              <span>로그아웃 확인</span>
            </DialogTitle>
            <DialogDescription>
              정말로 로그아웃하시겠습니까? 현재 작업중인 내용이 있다면
              저장해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
