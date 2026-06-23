"use client";
import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authApi } from "@/services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login({ email, password });
      
      // Django SimpleJWT returns 'access' and 'refresh'
      if (res.access) {
        localStorage.setItem("lumiere_token", res.access);
        if (res.refresh) {
           localStorage.setItem("lumiere_refresh", res.refresh);
        }
        if (res.user) {
          localStorage.setItem("lumiere_user", JSON.stringify(res.user));
        }
        window.location.href = "/account";
      } else {
        setError("Invalid response from authorization server.");
      }
    } catch {
      setError("Invalid email or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-xl font-semibold text-black">Sign in</h1>
      <p className="mt-1 text-sm text-gray-400">Enter your credentials to continue.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-black underline">Register</Link>
      </p>
    </div>
  );
}
