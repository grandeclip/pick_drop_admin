import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId } = body;

  console.log("productId: ", productId);

  const res = await fetch(
    "https://api.github.com/repos/grandeclip/pick_drop/actions/workflows/crawl.yml/dispatches",
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { productId },
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "GitHub API failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
