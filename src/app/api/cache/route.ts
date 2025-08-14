import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const path = searchParams.get("path");

    // pickdrop.shop의 magpie cache API로 프록시 요청
    const targetUrl = new URL("https://pickdrop.shop/api/magpie/cache");
    targetUrl.searchParams.set("type", type || "");
    if (categoryId) targetUrl.searchParams.set("categoryId", categoryId);
    if (path) targetUrl.searchParams.set("path", path);

    console.log(`🔄 Proxying cache request to: ${targetUrl.toString()}`);

    const response = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cache invalidation failed:", data);
      return NextResponse.json(
        { error: data.error || "Failed to invalidate cache" },
        { status: response.status }
      );
    }

    console.log("✅ Cache invalidation successful:", data);

    return NextResponse.json({
      success: true,
      message: data.message || `Cache invalidated for type: ${type}`,
      timestamp: data.timestamp || new Date().toISOString(),
      proxied: true,
    });
  } catch (error) {
    console.error("❌ Proxy cache invalidation error:", error);
    return NextResponse.json(
      {
        error: "Failed to proxy cache invalidation request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET 요청으로 프록시 상태 확인
export async function GET() {
  return NextResponse.json({
    message: "Cache invalidation proxy API",
    target: "https://pickdrop.shop/api/magpie/cache",
    usage: {
      "모든 카테고리 캐시 무효화": "POST /api/cache?type=categories",
      "모든 제품 캐시 무효화": "POST /api/cache?type=products",
      "특정 카테고리 캐시 무효화":
        "POST /api/cache?type=category-products&categoryId=1",
      "모든 캐시 무효화": "POST /api/cache?type=all",
      "특정 경로 캐시 무효화": "POST /api/cache?type=path&path=/api/products",
    },
    note: "이 API는 pickdrop.shop/api/magpie/cache로 프록시합니다 (CORS 우회용)",
  });
}
