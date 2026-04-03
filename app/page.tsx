"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const LEVEL_META = {
  N5: { totalKanji: 103, description: "Beginner", color: "#22C55E" },
  N4: { totalKanji: 128, description: "Elementary", color: "#3B82F6" },
  N3: { totalKanji: 124, description: "Intermediate", color: "#F59E0B" },
  N2: { totalKanji: 103, description: "Upper Int.", color: "#F97316" },
  N1: { totalKanji: 129, description: "Advanced", color: "#DC2626" },
};

const KANJI_SAMPLES = ["日", "月", "山", "川", "木", "火", "水", "土", "金", "人", "大", "小", "中", "上", "下", "本", "国", "語", "学", "年"];

function ThreeBackground() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.offsetWidth;
    const height = canvasRef.current.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    canvasRef.current.appendChild(renderer.domElement);

    // Create floating kanji sprites
    const particles: THREE.Mesh[] = [];
    const kanjiChars = ["日", "月", "山", "水", "火", "木", "金", "土", "人", "大", "小", "中", "語", "学", "本", "国"];

    kanjiChars.forEach((char, i) => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, 128, 128);

      const alpha = 0.06 + Math.random() * 0.08;
      ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`;
      ctx.font = "bold 80px 'Noto Sans JP', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
      const geometry = new THREE.PlaneGeometry(4, 4);
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      );
      mesh.rotation.z = (Math.random() - 0.5) * 0.3;
      (mesh as any).velocity = {
        y: 0.008 + Math.random() * 0.01,
        x: (Math.random() - 0.5) * 0.003,
        rotZ: (Math.random() - 0.5) * 0.001,
      };

      scene.add(mesh);
      particles.push(mesh);
    });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      particles.forEach(p => {
        p.position.y += (p as any).velocity.y;
        p.position.x += (p as any).velocity.x;
        p.rotation.z += (p as any).velocity.rotZ;
        if (p.position.y > 25) p.position.y = -25;
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.offsetWidth;
      const h = canvasRef.current.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (canvasRef.current && renderer.domElement.parentNode === canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated" || status === "loading") {
    return <div style={{ minHeight: "100vh", background: "#FAFAFA" }} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA" }}>
      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "linear-gradient(135deg, #FAFAFA 0%, #FFF5F5 50%, #FAFAFA 100%)",
        }}
      >
        <ThreeBackground />

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "0 24px",
            maxWidth: 720,
            animation: "fadeUp 0.8s ease forwards",
          }}
        >
          {/* Big kanji decoration */}
          <div
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 120,
              fontWeight: 900,
              color: "#DC2626",
              opacity: 0.08,
              position: "absolute",
              top: -60,
              left: "50%",
              transform: "translateX(-50%)",
              userSelect: "none",
              pointerEvents: "none",
              lineHeight: 1,
            }}
          >
            漢字
          </div>

          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#FEE2E2",
              color: "#DC2626",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626", display: "inline-block" }} />
            JLPT N5 → N1 · All 587 Kanji
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 58px)",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              margin: "0 0 20px",
            }}
          >
            Master Kanji.{" "}
            <span style={{ color: "#DC2626" }}>One Set</span>
            {" "}at a Time.
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#6B7280",
              lineHeight: 1.7,
              margin: "0 0 40px",
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Learn all JLPT kanji with spaced repetition. Track your progress, create custom decks, and level up from N5 to N1 efficiently.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/signup"
              style={{
                background: "#DC2626",
                color: "#fff",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 700,
                padding: "14px 32px",
                borderRadius: 12,
                boxShadow: "0 4px 14px rgba(220,38,38,0.35)",
                transition: "all 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#B91C1C";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#DC2626";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get Started Free →
            </Link>
            <Link
              href="/assessment"
              style={{
                background: "#fff",
                color: "#111827",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
                padding: "14px 32px",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                display: "inline-block",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#DC2626";
                e.currentTarget.style.color = "#DC2626";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.color = "#111827";
              }}
            >
              Take Assessment
            </Link>
          </div>

          {/* Sample kanji row */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
            {KANJI_SAMPLES.slice(0, 10).map(k => (
              <div
                key={k}
                style={{
                  width: 44,
                  height: 44,
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#111827",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                {k}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 14px", letterSpacing: "-0.5px" }}>
              Everything you need to master kanji
            </h2>
            <p style={{ fontSize: 17, color: "#6B7280", maxWidth: 500, margin: "0 auto" }}>
              A science-backed approach combining spaced repetition with structured JLPT curriculum.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              {
                icon: "🧠",
                title: "Spaced Repetition (SM-2)",
                desc: "Our SM-2 algorithm schedules reviews at the optimal moment — just before you forget. Maximize retention with minimal study time.",
                accent: "#DC2626",
              },
              {
                icon: "📊",
                title: "Level Assessment",
                desc: "Take a 15-question quiz to find your JLPT level. Skip kanji you already know and start exactly where you need to.",
                accent: "#3B82F6",
              },
              {
                icon: "📚",
                title: "Custom Decks",
                desc: "Create personalized decks for any topic — JLPT prep, vocabulary themes, or characters from your textbook.",
                accent: "#22C55E",
              },
            ].map(f => (
              <div
                key={f.title}
                style={{
                  background: "#FAFAFA",
                  border: "1px solid #F3F4F6",
                  borderRadius: 16,
                  padding: "32px 28px",
                  transition: "all 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.background = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "#FAFAFA";
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `${f.accent}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 10px" }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
              Complete JLPT coverage
            </h2>
            <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>
              From beginner N5 all the way to advanced N1
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {(Object.entries(LEVEL_META) as [string, typeof LEVEL_META.N5][]).map(([level, meta]) => (
              <Link
                key={level}
                href="/signup"
                style={{
                  textDecoration: "none",
                  background: "#fff",
                  border: `2px solid ${meta.color}30`,
                  borderRadius: 16,
                  padding: "24px 28px",
                  minWidth: 150,
                  textAlign: "center",
                  transition: "all 0.2s",
                  display: "block",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = meta.color;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 20px ${meta.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${meta.color}30`;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: meta.color,
                    marginBottom: 4,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {level}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>{meta.description}</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {meta.totalKanji.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>kanji</div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <span style={{ fontSize: 15, color: "#6B7280" }}>
              Total:{" "}
              <strong style={{ color: "#111827" }}>
                {Object.values(LEVEL_META).reduce((s, m) => s + m.totalKanji, 0).toLocaleString()}
              </strong>{" "}
              kanji across all levels
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            How it works
          </h2>
          <p style={{ fontSize: 16, color: "#6B7280", margin: "0 0 56px" }}>
            Three simple steps to fluency
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {[
              { step: "01", title: "Find your level", desc: "Take a quick assessment or choose your JLPT target level to get started." },
              { step: "02", title: "Study in sets", desc: "Learn 20 kanji per set with flashcards. Flip to reveal readings and meanings." },
              { step: "03", title: "Review & retain", desc: "The SM-2 algorithm schedules reviews at the perfect time to build lasting memory." },
            ].map(s => (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#FEE2E2",
                    color: "#DC2626",
                    fontSize: 15,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  {s.step}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        style={{
          padding: "80px 24px",
          background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.5px" }}>
          Start learning today
        </h2>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", margin: "0 0 32px" }}>
          Free to use. No credit card required.
        </p>
        <Link
          href="/signup"
          style={{
            background: "#fff",
            color: "#DC2626",
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 700,
            padding: "14px 36px",
            borderRadius: 12,
            display: "inline-block",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          }}
        >
          Create Free Account →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "#111827", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 20, fontWeight: 900, color: "#DC2626" }}>漢字</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>KanjiLearn</span>
        </div>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
          © 2026 KanjiLearn · Master JLPT N5–N1 kanji with spaced repetition
        </p>
      </footer>
    </div>
  );
}
