import { useState } from "react";
import { UserReport } from "../../data/mock";

interface InputScreenProps {
  error: string;
  reports: UserReport[];
  onAnalyze: (username: string) => void;
  onPickDemo: (report: UserReport) => void;
}

function InputScreen({ error, reports, onAnalyze, onPickDemo }: InputScreenProps) {
  const [username, setUsername] = useState("");
  const [overviewReport, ...userReports] = reports;

  return (
    <main className="shell input-shell">
      <section className="hero">
        <div className="product-kicker">
          <span>
            <KickerLogo />
            SafeSpace Radar
          </span>
          <b>Hibrit AI</b>
        </div>
        <h1>Sosyal medya risk sinyallerini erken görünür kılar.</h1>
        <p>
          Paylaşım geçmişindeki umutsuzluk, tehdit, toksiklik ve davranış örüntülerini analiz ederek
          moderatörlere ve STK ekiplerine karar desteği sağlar.
        </p>
        <div className="architecture-note">
          <strong>Hibrit mimari:</strong> hızlı risk motoru sinyalleri filtreler, LLM ise kriz yönetimi
          için aksiyon planı üretir.
        </div>
        <div className="feature-strip" aria-label="Ürün yetenekleri">
          <span>Risk sınıflandırma</span>
          <span>Kanıt tweetleri</span>
          <span>LLM aksiyon planı</span>
        </div>
        <div className="hero-metrics" aria-label="Dataset özeti">
          <article>
            <strong>10K</strong>
            <span>tweet</span>
          </article>
          <article>
            <strong>20</strong>
            <span>profil</span>
          </article>
          <article>
            <strong>3</strong>
            <span>zaman penceresi</span>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Admin girişi</p>
            <h2>Analiz başlat</h2>
          </div>
          <span className="status-pill">Demo modu</span>
        </div>
        <label htmlFor="username">Kullanıcı adı</label>
        <div className="search-row">
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="derya"
          />
          <button onClick={() => onAnalyze(username)}>Analiz et</button>
        </div>
        {error && <p className="error">{error}</p>}

        <p className="section-label">Kolektif izleme</p>
        {overviewReport && (
          <button className="demo-card overview-card" onClick={() => onPickDemo(overviewReport)}>
            <span>@{overviewReport.username}</span>
            <strong>{overviewReport.displayName}</strong>
            <em className={`level-badge ${overviewReport.level.toLowerCase()}`}>{overviewReport.level} risk</em>
          </button>
        )}

        <p className="section-label">Kullanıcı bazlı profiller</p>
        <div className="demo-grid">
          {userReports.map((report) => (
            <button key={report.username} className="demo-card" onClick={() => onPickDemo(report)}>
              <span>@{report.username}</span>
              <strong>{report.displayName}</strong>
              <em className={`level-badge ${report.level.toLowerCase()}`}>{report.level} risk</em>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function KickerLogo() {
  return (
    <svg className="kicker-logo" width="18" height="18" viewBox="0 0 32 32" role="img" aria-label="SafeSpace logo">
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

export default InputScreen;
