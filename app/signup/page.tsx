"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignupForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>();

  const password = watch("password");

  const onSubmit = async (data: SignupForm) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          displayName: data.displayName || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error || "Signup failed.");
        return;
      }

      // Auto sign in
      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInRes?.error) {
        setServerError("Account created but sign in failed. Please log in manually.");
        router.push("/login");
        return;
      }

      window.location.href = "/onboarding";
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAFA",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "48px 40px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #F3F4F6",
          animation: "fadeUp 0.4s ease forwards",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 28, fontWeight: 900, color: "#DC2626" }}>漢字</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Start mastering kanji for free
          </p>
        </div>

        {serverError && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 14,
              color: "#B91C1C",
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Display Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Display Name <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Taro Yamada"
              {...register("displayName")}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                fontSize: 15,
                outline: "none",
                background: "#FAFAFA",
                color: "#111827",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#DC2626")}
              onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
              })}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: errors.email ? "1px solid #DC2626" : "1px solid #E5E7EB",
                fontSize: 15,
                outline: "none",
                background: "#FAFAFA",
                color: "#111827",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#DC2626")}
              onBlur={e => (e.target.style.borderColor = errors.email ? "#DC2626" : "#E5E7EB")}
            />
            {errors.email && (
              <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0" }}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters required" },
              })}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: errors.password ? "1px solid #DC2626" : "1px solid #E5E7EB",
                fontSize: 15,
                outline: "none",
                background: "#FAFAFA",
                color: "#111827",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#DC2626")}
              onBlur={e => (e.target.style.borderColor = errors.password ? "#DC2626" : "#E5E7EB")}
            />
            {errors.password && (
              <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0" }}>{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: v => v === password || "Passwords do not match",
              })}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: errors.confirmPassword ? "1px solid #DC2626" : "1px solid #E5E7EB",
                fontSize: 15,
                outline: "none",
                background: "#FAFAFA",
                color: "#111827",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#DC2626")}
              onBlur={e => (e.target.style.borderColor = errors.confirmPassword ? "#DC2626" : "#E5E7EB")}
            />
            {errors.confirmPassword && (
              <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0" }}>{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#F87171" : "#DC2626",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "13px",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                  }}
                  className="spinner"
                />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 14, color: "#6B7280" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#DC2626", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
