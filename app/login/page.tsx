"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/utils/api";
import { setCookie, getCookie } from "@/utils/cookies";

function LoginForm({ redirectTo }: { redirectTo: string }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = getCookie("token") || localStorage.getItem("token");
        if (token) {
            router.replace(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
        }
    }, [router, redirectTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Basic client-side validation
        if (!email || !email.trim()) {
            setError("Please enter your email address");
            setLoading(false);
            return;
        }
        if (!password || !password.trim()) {
            setError("Please enter your password");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ 
                    email: email.trim().toLowerCase(), 
                    password: password 
                }),
            });

            if (!res.ok) {
                let errorMessage = `Login failed: ${res.status} ${res.statusText}`;
                try {
                    const data = await res.json();                    // Handle different error response formats
                    if (typeof data === 'string') {
                        errorMessage = data;
                    } else if (data.detail) {
                        // FastAPI validation errors can be arrays or strings
                        if (Array.isArray(data.detail)) {
                            // Parse Pydantic validation errors
                            errorMessage = data.detail
                                .map((err: unknown) => {
                                    const typed = err as { loc?: Array<string | number>; msg?: string; message?: string };
                                    const field = Array.isArray(typed.loc) ? typed.loc.slice(1).join(".") : "field";
                                    const msg = typed.msg || typed.message || "Invalid value";
                                    return `${field}: ${msg}`;
                                })
                                .join(", ");
                        } else {
                            errorMessage = String(data.detail);
                        }
                    } else if (data.error) {
                        errorMessage = String(data.error);
                    } else if (data.message) {
                        errorMessage = String(data.message);
                    } else {
                        errorMessage = JSON.stringify(data);
                    }
                } catch {
                    // If JSON parsing fails, try to get text
                    try {
                        const text = await res.text();
                        if (text) errorMessage = text;
                    } catch {
                        // Keep the default error message
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();

            // Store token in both localStorage (for API calls) and cookies (for middleware)
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setCookie("token", data.token, 7); // 7 days

            // Use replace to avoid back button issues; respect redirect (e.g. /auth/shopify?shop=...)
            const target = redirectTo.startsWith("/") ? redirectTo : "/dashboard";
            router.replace(target);
        } catch (err: unknown) {
            console.error("Login error:", err);
            const baseMessage = err instanceof Error ? err.message : "Login failed";
            let errorMessage = baseMessage;
            
            // Handle object errors
            if (typeof errorMessage === 'object') {
                try {
                    errorMessage = JSON.stringify(errorMessage);
                } catch {
                    errorMessage = "An error occurred. Please try again.";
                }
            }
            
            // Provide helpful error messages
            if (errorMessage.includes("fetch") || errorMessage.includes("Network") || errorMessage.includes("Failed to fetch")) {
                errorMessage = "Cannot connect to server. Please check your internet connection and try again.";
            } else if (errorMessage.includes("127.0.0.1") || errorMessage.includes("localhost")) {
                errorMessage = "API URL not configured. Please contact support.";
            } else if (errorMessage.includes("Invalid credentials") || errorMessage.includes("401")) {
                errorMessage = "Invalid email or password. Please try again.";
            } else if (errorMessage.includes("400") || errorMessage.includes("Bad Request")) {
                if (errorMessage.includes("email") || errorMessage.includes("Email")) {
                    errorMessage = "Please enter a valid email address.";
                } else {
                    errorMessage = "Invalid request. Please check your input and try again.";
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Sign in with email.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-lg border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-lg border-0 py-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="mt-1 text-right">
                                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                                Remember me
                            </label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all font-bold uppercase tracking-wider"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
</div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-slate-600">Loading…</div>
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams?.get("redirect") || "/dashboard";
    return <LoginForm redirectTo={redirectTo} />;
}
