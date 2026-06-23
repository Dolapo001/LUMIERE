"use client";
import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authApi } from "@/services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.register(form);
      const res = await authApi.login({ email: form.email, password: form.password });
      
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
        window.location.href = "/auth/login"; // Fallback
      }
    } catch {
      setError("Registration failed. Please make sure email/username is unique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-xl font-semibold text-black">Create account</h1>
      <p className="mt-1 text-sm text-gray-400">Start shopping with Lumière.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Username"
          placeholder="johndoe"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-black underline">Sign in</Link>
      </p>
    </div>
  );
}
