import { useState } from "react";

interface LoginScreenProps {
  onLogin: () => void;
}

function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("admin@safespace.ai");
  const [password, setPassword] = useState("demo");

  const submitLogin = () => {
    if (email.trim() && password.trim()) {
      onLogin();
    }
  };

  return (
    <main className="login-shell">
      <section className="login-hero">
        <div className="brand-lockup">
          <span className="brand-mark">
            <LoginLogo />
          </span>
          <div>
            <strong>SafeSpace Radar</strong>
            <small>Risk intelligence dashboard</small>
          </div>
        </div>
        <h1>Kriz sinyallerini tek panelde yakalayın.</h1>
        <p>
          Sosyal medya risklerini kanıt odaklı analiz eder, üretken yapay zeka ile aksiyon planına
          dönüştürür.
        </p>
        <div className="login-stats">
          <article>
            <span>6</span>
            <p>demo senaryo</p>
          </article>
          <article>
            <span>3</span>
            <p>risk seviyesi</p>
          </article>
          <article>
            <span>LLM</span>
            <p>aksiyon planı</p>
          </article>
        </div>
      </section>

      <section className="login-panel">
        <p className="eyebrow">Admin paneli</p>
        <h2>Giriş yap</h2>
        <p className="login-muted">Demo erişimi için bilgiler hazır dolduruldu.</p>

        <label htmlFor="email">E-posta</label>
        <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />

        <label htmlFor="password">Şifre</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button className="login-button" onClick={submitLogin}>
          Admin paneline gir
        </button>

        <div className="login-note">
          Bu prototipte giriş demo amaçlıdır; gerçek dağıtımda kurum kimliği ve yetkilendirme eklenir.
        </div>
      </section>
    </main>
  );
}

function LoginLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" role="img" aria-label="SafeSpace logo">
      <path
        d="M3.5 16S8.2 7.5 16 7.5 28.5 16 28.5 16 23.8 24.5 16 24.5 3.5 16 3.5 16Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      <path d="M16 2.8v4M16 25.2v4M2.8 16h4M25.2 16h4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default LoginScreen;
