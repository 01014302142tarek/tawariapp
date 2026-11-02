"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AuthCodeErrorContent() {
    const searchParams = useSearchParams();
    const errorDescription = searchParams.get("error_description");

    return (
        <div className="min-h-screen bg-[#060B18] text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0B1528] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-3">فشل التحقق من تسجيل الدخول</h1>
                <p className="text-gray-400 text-sm mb-2">Authentication Verification Failed</p>

                {errorDescription ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 my-4 text-xs text-red-300 break-words font-mono">
                        {errorDescription}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm mb-6">
                        انتهت صلاحية رابط التحقق أو تعذر إكمال المصادقة. يرجى المحاولة مرة أخرى من صفحة تسجيل الدخول.
                    </p>
                )}

                <div className="flex flex-col gap-3 mt-6">
                    <Link
                        href="/ar/login"
                        className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 transition-all text-center"
                    >
                        العودة لتسجيل الدخول
                    </Link>
                    <Link
                        href="/en/login"
                        className="w-full py-2 px-4 rounded-xl text-sm text-gray-400 hover:text-white transition-colors text-center"
                    >
                        Back to English Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#060B18] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        }>
            <AuthCodeErrorContent />
        </Suspense>
    );
}
