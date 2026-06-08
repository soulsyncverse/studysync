import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { signInGoogle } from "./firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// ============ THEME CONFIG ============
const T = {
  dark: {
    bg: "#080A0f",
    card: "rgba(255,255,255,0.05)",
    input: "rgba(255,255,255,0.07)",
    border: "rgba(255,255,255,0.09)",
    text: "#f0f0f0",
    sub: "#666",
    muted: "#2a2a3a",
    nav: "rgba(8,8,15,0.96)",
    pill: "rgba(255,255,255,0.07)",
    a1: "#FF6B6B",
    a2: "#6EE7F7",
    a3: "#B8FF6B",
    a4: "#FFB86B",
    a5: "#C16BFF",
    sh: "0 8px 32px rgba(0,0,0,0.5)",
    nb: "rgba(255,255,255,0.99)",
  },
  light: {
    bg: "#f5f5f7",
    card: "#ffffff",
    input: "#ffffff",
    border: "rgba(0,0,0,0.08)",
    text: "#111",
    sub: "#888",
    muted: "#ddd",
    nav: "rgba(245,245,247,0.96)",
    pill: "rgba(0,0,0,0.05)",
    a1: "#FF4757",
    a2: "#00B8D4",
    a3: "#36B37E",
    a4: "#FF8C00",
    a5: "#8E44AD",
    sh: "0 4px 20px rgba(0,0,0,0.08)",
    nb: "rgba(255,255,255,0.99)",
  },
};

// ============ CUSTOM HOOKS ============

/**
 * @hook useTheme - Manages theme state
 */
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ss_theme");
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const theme = useMemo(() => (isDark ? T.dark : T.light), [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      localStorage.setItem("ss_theme", JSON.stringify(!prev));
      return !prev;
    });
  }, []);

  return { theme, isDark, toggleTheme };
};

/**
 * @hook useAuth - Manages authentication state
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { user, loading, error };
};

/**
 * @hook useLocalStorage - Persists state to localStorage
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item =
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

// ============ HELPER FUNCTIONS ============

function pad(n) {
  return String(n).padStart(2, "0");
}

function dl(date) {
  if (!date) return null;
  return Math.max(0, Math.ceil((new Date(date) - new Date()) / 86400000));
}

function avbg(c) {
  return `hsl(${(c.charCodeAt(0) * 37) % 360},52%,46%)`;
}

const Av = React.memo(({ c, sz = 36 }) => (
  <div
    style={{
      width: sz,
      height: sz,
      borderRadius: "50%",
      background: avbg(c),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      color: "#fff",
      fontSize: sz * 0.38,
      flexShrink: 0,
    }}
  >
    {c}
  </div>
));

// ============ LOGO COMPONENT ============
function Logo({ sz = 32 }) {
  return (
    <svg width={sz} height={sz} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lg)" />
      <path
        d="M26 13 C26 13 14 13 14 18 C14 23 26 20 26 25 C26 30 14 30 14 30"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============ TOASTS COMPONENT ============
const Toasts = React.memo(({ notifs, dismiss, t }) => (
  <div
    style={{
      position: "fixed",
      top: 64,
      right: 10,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      maxWidth: 290,
      pointerEvents: "none",
    }}
  >
    {notifs.map((n) => (
      <div
        key={n.id}
        style={{
          background: t.nb,
          border: `1px solid ${n.col || t.a1}`,
          borderLeft: `3px solid ${n.col || t.a1}`,
          borderRadius: 11,
          padding: "9px 10px",
          boxShadow: "0 8px 26px rgba(0,0,0,0.4)",
          display: "flex",
          gap: 7,
          alignItems: "flex-start",
          pointerEvents: "all",
          animation: "slideIn .3s ease",
        }}
      >
        <div style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: t.text,
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {n.title}
          </div>
          <div
            style={{
              color: t.sub,
              fontSize: 10,
              marginTop: 1,
              lineHeight: 1.4,
            }}
          >
            {n.body}
          </div>
        </div>
        <button
          onClick={() => dismiss(n.id)}
          style={{
            background: "none",
            border: "none",
            color: t.sub,
            cursor: "pointer",
            fontSize: 13,
            padding: "0 1px",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
    ))}
  </div>
));

// ============ LOGIN COMPONENT ============
function Login({ t, onLogin }) {
  const [step, setStep] = useState("main");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);

  const go = async (fn) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    fn();
  };

  const chOtp = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp];
    n[i] = v;
    setOtp(n);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(129,140,248,0.07),transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 18,
              background: "rgba(129,140,248,0.08)",
              border: "1px solid rgba(129,140,248,0.16)",
              boxShadow: "0 0 26px rgba(129,140,248,0.09)",
            }}
          >
            <Logo sz={46} />
          </div>
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: -1,
            background:
              "linear-gradient(135deg,#818cf8,#60a5fa,#34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          StudySync
        </div>
        <div style={{ color: t.sub, fontSize: 12, marginTop: 4 }}>
          Your study companion
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 320,
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: 18,
          padding: 18,
          boxShadow: t.sh,
        }}
      >
        {step === "main" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 13 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>
                Sign in to StudySync
              </div>
              <div style={{ fontSize: 10, color: t.sub, marginTop: 2 }}>
                Join 50,000+ aspirants 🎯
              </div>
            </div>

            <div
              style={{
                background: "rgba(52,211,153,0.07)",
                border: "1px solid rgba(52,211,153,0.22)",
                borderRadius: 10,
                padding: "8px 10px",
                marginBottom: 11,
                display: "flex",
                gap: 7,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 16 }}>🎉</span>
              <div>
                <div
                  style={{
                    color: "#34d399",
                    fontWeight: 800,
                    fontSize: 11,
                  }}
                >
                  7-Day Free Trial
                </div>
                <div
                  style={{
                    color: t.sub,
                    fontSize: 9,
                    marginTop: 1,
                  }}
                >
                  Full premium access – no card needed
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                setLoading(true);
                const { user, error } = await signInGoogle();
                if (user) onLogin(user);
                else {
                  setLoading(false);
                  alert(error || "Login failed");
                }
              }}
              disabled={loading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                background: loading
                  ? "rgba(129,140,248,0.3)"
                  : "linear-gradient(135deg,rgba(129,140,248,0.11),rgba(96,165,250,0.11))",
                border: "1px solid rgba(129,140,248,0.22)",
                borderRadius: 12,
                padding: "11px",
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: 8,
                transition: "all .25s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.3 30.2 0 24 0 14.7 0 6.8 5.5 3 13.5l7.9 6.1C12.8 13.4 17.9 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.9 28.4A14.5 14.5 0 0 1 9.5 24c0-1.5.3-3 .8-4.4L2.4 13.5A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.4-6.2z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.7 2.3-6.1 0-11.2-4-13.1-9.5l-8 6.2C6.7 42.5 14.7 48 24 48z"
                />
              </svg>
              <span
                style={{
                  color: t.text,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {loading ? "Signing in..." : "Continue with Gmail"}
              </span>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: t.border,
                }}
              />
              <div
                style={{
                  color: t.sub,
                  fontSize: 10,
                }}
              >
                OR
              </div>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: t.border,
                }}
              />
            </div>

            <button
              onClick={() => setStep("phone")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                background: t.input,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: "11px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 15 }}>📱</span>
              <span
                style={{
                  color: t.text,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                Continue with Phone
              </span>
            </button>

            <div
              style={{
                color: t.muted,
                fontSize: 9,
                textAlign: "center",
                marginTop: 10,
                lineHeight: 1.6,
              }}
            >
              Free for students · No ads · Made for India 🇮🇳
            </div>
          </>
        )}

        {step === "phone" && (
          <>
            <button
              onClick={() => setStep("main")}
              style={{
                background: "none",
                border: "none",
                color: t.sub,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 10,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              ← Back
            </button>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: t.text,
                marginBottom: 2,
              }}
            >
              Enter your number
            </div>
            <div
              style={{
                fontSize: 10,
                color: t.sub,
                marginBottom: 11,
              }}
            >
              We'll send an OTP – needs Firebase to be set up
            </div>

            <div
              style={{
                display: "flex",
                marginBottom: 8,
                overflow: "hidden",
                borderRadius: 10,
                border: `1px solid ${t.border}`,
              }}
            >
              <div
                style={{
                  background: t.pill,
                  padding: "10px 8px",
                  color: t.sub,
                  fontSize: 11,
                  fontWeight: 700,
                  borderRight: `1px solid ${t.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                🇮🇳 +91
              </div>
              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10-digit number"
                style={{
                  flex: 1,
                  background: t.input,
                  border: "none",
                  padding: "10px 10px",
                  color: t.text,
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                }}
                maxLength={10}
                inputMode="numeric"
              />
            </div>

            <button
              onClick={() => go(() => setStep("otp"))}
              disabled={loading || phone.length < 10}
              style={{
                width: "100%",
                background:
                  phone.length === 10
                    ? "linear-gradient(135deg,#818cf8,#60a5fa)"
                    : t.pill,
                border: "none",
                borderRadius: 11,
                padding: "10px",
                color: phone.length === 10 ? "#fff" : t.sub,
                fontWeight: 800,
                fontSize: 12,
                cursor:
                  phone.length === 10 ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                transition: "all .25s",
              }}
            >
              {loading ? "Sending OTP…" : "Send OTP →"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <button
              onClick={() => setStep("phone")}
              style={{
                background: "none",
                border: "none",
                color: t.sub,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 10,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              ← Back
            </button>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: t.text,
                marginBottom: 2,
              }}
            >
              Enter OTP
            </div>
            <div
              style={{
                fontSize: 10,
                color: t.sub,
                marginBottom: 12,
              }}
            >
              Sent to +91 {phone} ·{" "}
              <span
                style={{ color: "#818cf8", cursor: "pointer" }}
                onClick={() => setStep("phone")}
              >
                Change
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 5,
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  value={v}
                  onChange={(e) => chOtp(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" &&
                      !v &&
                      i > 0
                    )
                      refs.current[i - 1]?.focus();
                  }}
                  maxLength={1}
                  inputMode="numeric"
                  style={{
                    width: 39,
                    height: 46,
                    borderRadius: 10,
                    border: `2px solid ${v ? "#818cf8" : t.border}`,
                    background: t.input,
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: 800,
                    color: t.text,
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "all .2s",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() =>
                go(() =>
                  onLogin({
                    name: phone,
                    phone: phone,
                  })
                )
              }
              disabled={loading || otp.join("").length < 6}
              style={{
                width: "100%",
                background:
                  otp.join("").length === 6
                    ? "linear-gradient(135deg,#818cf8,#60a5fa)"
                    : t.pill,
                border: "none",
                borderRadius: 11,
                padding: "10px",
                color:
                  otp.join("").length === 6 ? "#fff" : t.sub,
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "Verifying…" : "Verify & Sign In 🎯"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============ MAIN APP ============
function App() {
  const { theme: t, isDark, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [notifs, setNotifs] = useState([]);

  const dismissNotif = useCallback((id) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const pushNotif = useCallback((notif) => {
    const id = Date.now();
    setNotifs((prev) => [...prev, { id, ...notif }]);
    setTimeout(() => dismissNotif(id), 3000);
  }, [dismissNotif]);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Logo sz={48} />
          <div style={{ color: t.text, fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login t={t} onLogin={(userData) => console.log(userData)} />;
  }

  // TODO: Build main app dashboard here
  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        padding: 24,
      }}
    >
      <Toasts notifs={notifs} dismiss={dismissNotif} t={t} />
      
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: t.card,
          borderRadius: 18,
          padding: 24,
          border: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Logo sz={40} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>StudySync</div>
              <div style={{ fontSize: 12, color: t.sub }}>
                Welcome back, {user.displayName}! 👋
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              background: t.pill,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: 20,
              fontFamily: "inherit",
            }}
            title="Toggle theme"
          >
            {isDark ? "🌙" : "☀️"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              background: t.input,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: t.sub }}>Exams Created</div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                marginTop: 8,
                color: "#818cf8",
              }}
            >
              0
            </div>
          </div>

          <div
            style={{
              background: t.input,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: t.sub }}>Study Streak</div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                marginTop: 8,
                color: "#34d399",
              }}
            >
              0
            </div>
          </div>

          <div
            style={{
              background: t.input,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: t.sub }}>Total Hours</div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                marginTop: 8,
                color: "#60a5fa",
              }}
            >
              0
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            pushNotif({
              icon: "🚀",
              title: "Dashboard",
              body: "Main features coming soon!",
              col: "#818cf8",
            })
          }
          style={{
            marginTop: 24,
            width: "100%",
            background:
              "linear-gradient(135deg,#818cf8,#60a5fa)",
            border: "none",
            borderRadius: 12,
            padding: "14px",
            color: "#fff",
            fontWeight: 900,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          🚀 Explore Features (Coming Soon)
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: ${t.bg};
          color: ${t.text};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        input, button {
          font-family: inherit;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default App;
