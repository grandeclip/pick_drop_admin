"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

interface BrandFormProps {
  onSuccess?: () => void;
}

export default function BrandForm({ onSuccess }: BrandFormProps) {
  const [brandName, setBrandName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      setMessage("브랜드명을 입력해주세요.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const { data, error } = await supabase
        .from("brands")
        .insert({
          name: brandName.trim(),
        })
        .select("brand_id, name")
        .single();

      if (error) {
        console.error("브랜드 등록 에러:", error);

        // 중복 에러 처리
        if (error.code === "23505") {
          setMessage("이미 존재하는 브랜드명입니다.");
        } else {
          setMessage("브랜드 등록 중 오류가 발생했습니다.");
        }
        setMessageType("error");
        return;
      }

      setMessage(`브랜드 '${data.name}'이(가) 성공적으로 등록되었습니다.`);
      setMessageType("success");
      setBrandName("");

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("브랜드 등록 중 오류:", error);
      setMessage("브랜드 등록 중 오류가 발생했습니다.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">브랜드 등록</h2>
            <p className="text-slate-600">
              새로운 브랜드를 시스템에 등록해보세요
            </p>
          </div>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`p-4 rounded-2xl border ${
            messageType === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={clearMessage}
              className="text-xs hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 브랜드 등록 폼 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-slate-700 font-semibold">
                브랜드명
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full bg-white/50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-2xl h-14 text-slate-700"
              value={brandName}
              onChange={(e) => {
                setBrandName(e.target.value.normalize("NFC"));
                clearMessage();
              }}
              placeholder="브랜드명을 입력하세요"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-control">
            <button
              type="submit"
              disabled={isSubmitting || !brandName.trim()}
              className="btn bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none hover:from-purple-600 hover:to-indigo-700 rounded-2xl h-14 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:bg-slate-300 disabled:transform-none disabled:shadow-none"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="loading loading-spinner loading-sm"></div>
                  <span>등록 중...</span>
                </span>
              ) : (
                "브랜드 등록하기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
