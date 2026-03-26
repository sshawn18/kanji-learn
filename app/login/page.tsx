"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        setServerError("Invalid email or password.");
      } else {
        // Fetch user to check if they have an assessed level
        const userRes = await fetch("/api/user");
        const user = await userRes.json();
        if (!user.assessedLevel) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      }
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
          maxWidth: 420,
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
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Sign in to continue learning
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
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
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
                transition: "border-color 0.15s",
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
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: errors.password ? "1px solid #DC2626" : "1px solid #E5E7EB",
                fontSize: 15,
                outline: "none",
                background: "#FAFAFA",
                color: "#111827",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#DC2626")}
              onBlur={e => (e.target.style.borderColor = errors.password ? "#DC2626" : "#E5E7EB")}
            />
            {errors.password && (
              <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0" }}>{errors.password.message}</p>
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
              transition: "background 0.15s",
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 14, color: "#6B7280" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#DC2626", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
