import { ReactElement, useState } from "react";
import { UserReport } from "../../data/mock";
import { generateActionPlan } from "../../services/llm";

interface ResultsScreenProps {
  report: UserReport;
  onBack: () => void;
}

function ResultsScreen({ report, onBack }: ResultsScreenProps) {
  const color = report.level === "Yüksek" ? "danger" : report.level === "Orta" ? "warn" : "safe";
  const [llmLoading, setLlmLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState<string[]>([]);
  const [periodIndex, setPeriodIndex] = useState(2);
  const activePeriod = report.periodInsights[periodIndex] ?? report.periodInsights[0];
  const hotWords = [...new Set(report.tweets.flatMap((tweet) => tweet.flags))].slice(0, 10);

  const handleGenerateActionPlan = async () => {
    setLlmLoading(true);
    generateActionPlan(report).then((plan) => {
      setActionPlan(plan);
      setLlmLoading(false);
    });
  };

  return (
    <>
      <nav className="shadcn-navbar">
        <div className="nav-inner">
          <div className="nav-brand">
            <EyeLogo />
            <strong>SafeSpace</strong>
            <span className="nav-badge destructive">{report.tweets.filter((tweet) => tweet.flags.length > 0).length} alarm</span>
          </div>
          <div className="nav-search">
            <input value={`@${report.username}`} readOnly aria-label="Aktif kullanıcı" />
            <button onClick={onBack}>Yeni tarama</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">S</span>
          <div>
            <strong>SafeSpace</strong>
            <small>Risk Operations</small>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Dashboard bölümleri">
          <a className="active" href="#risk">Risk özeti</a>
          <a href="#targets">Hedef kitleler</a>
          <a href="#findings">Bulgular</a>
          <a href="#evidence">Kanıtlar</a>
        </nav>
        <div className="sidebar-status">
          <span>LLM durumu</span>
          <strong>{import.meta.env.VITE_GROQ_API_KEY ? "Canlı API" : "Fallback"}</strong>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar" id="risk">
          <div>
            <p className="eyebrow">SafeSpace Radar</p>
            <h1>@{report.username}</h1>
            <p>{report.displayName}</p>
          </div>
          <div className="topbar-actions">
            <button className="secondary" onClick={() => window.print()}>
              Bulguları PDF'e aktar
            </button>
            <button className="secondary" onClick={onBack}>
              Yeni analiz
            </button>
          </div>
        </header>

      <section className="summary-grid">
        <article className={`score-card ${color}`}>
          <span className="card-label">Risk skoru</span>
          <strong>%{Math.round(report.riskScore)}</strong>
          <p className={`level-text ${color}`}>{report.level} risk</p>
        </article>
        <article className="card wide">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Risk motoru çıktısı</p>
              <h2>Model özeti</h2>
            </div>
            <span className={`level-badge ${report.level.toLowerCase()}`}>{report.level}</span>
          </div>
          <p>{report.summary}</p>
          <strong>{report.action}</strong>
          <div className="ethics-note">
            Bu sistem tanı koymaz ve otomatik karar vermez; yalnızca insan incelemesine karar desteği sağlar.
          </div>
        </article>
      </section>

      <section className="metric-row" aria-label="Analiz metrikleri">
        <article>
          <span>İncelenen tweet</span>
          <strong>{report.tweets.length}</strong>
        </article>
        <article>
          <span>Kanıt tweet</span>
          <strong>{report.tweets.filter((tweet) => tweet.flags.length > 0).length}</strong>
        </article>
        <article>
          <span>Negatif duygu</span>
          <strong>%{Math.round(report.sentiment.negative)}</strong>
        </article>
        <article>
          <span>LLM durumu</span>
          <strong>{import.meta.env.VITE_GROQ_API_KEY ? "Canlı API" : "Fallback"}</strong>
        </article>
      </section>

      <section className="shadcn-content-grid">
        <article className="card tweet-feed-panel" id="evidence">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Tweet feed</p>
              <h2>İşaretlenen paylaşımlar</h2>
            </div>
            <span className="nav-badge">Canlı tarama</span>
          </div>
          <div className="tweet-list compact">
            {report.tweets.map((tweet) => (
              <article className={`tweet-feed-card ${tweet.flags.length > 0 ? "flagged" : "clean"}`} key={tweet.id}>
                <div className="tweet-meta">
                  <span>{tweet.time}</span>
                  <span className={`nav-badge ${tweet.flags.length > 0 ? "destructive" : "teal"}`}>
                    {tweet.flags[0] ?? "Temiz"}
                  </span>
                </div>
                <p>{highlight(tweet.text, tweet.flags)}</p>
              </article>
            ))}
          </div>
        </article>

        <aside className="card analysis-panel">
          <p className="eyebrow">Analiz paneli</p>
          <h2>Risk yoğunluğu</h2>
          <Gauge score={report.riskScore} level={report.level} />
          <div className="panel-progress">
            {report.signals.slice(0, 4).map((signal) => (
              <div className="progress-row" key={signal.label}>
                <span>{signal.label}</span>
                <div className="progress-track">
                  <div style={{ width: `${signal.score}%` }} />
                </div>
                <b>%{Math.round(signal.score)}</b>
              </div>
            ))}
          </div>
          <div className="badge-grid">
            {["Hakaret", "Küfür", "Nefret Söylemi", "Aşağılama"].map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
          <div className="keyword-cloud">
            {(hotWords.length > 0 ? hotWords : ["Belirgin tetikleyici yok"]).map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
        </aside>
      </section>

      <section className="content-grid">
        <article className="card">
          <h2>Risk sinyalleri</h2>
          {report.signals.map((signal) => (
            <div className="bar-row" key={signal.label}>
              <span>{signal.label}</span>
              <div className="bar-track">
                <div style={{ width: `${signal.score}%` }} />
              </div>
              <b>%{Math.round(signal.score)}</b>
            </div>
          ))}
        </article>

        <article className="card">
          <h2>Duygu dağılımı</h2>
          <Donut sentiment={report.sentiment} />
        </article>

        <article className="card">
          <h2>14 günlük aktivite</h2>
          <MiniChart activity={report.activity} />
        </article>
      </section>

      <section className="insight-grid" id="targets">
        <article className="card target-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Toplumsal hedefleme radarı</p>
              <h2>Öne çıkan hedef kitleler</h2>
            </div>
            <span className="status-pill">Gruplandırılmış analiz</span>
          </div>
          <div className="target-list">
            {report.targetGroups.slice(0, 4).map((target) => (
              <article key={target.group} className="target-row">
                <div>
                  <strong>{target.group}</strong>
                  <span>{target.notify}</span>
                </div>
                <div className="target-metrics">
                  <b>{target.mentions}</b>
                  <small>bahis</small>
                </div>
                <div className="target-metrics danger-text">
                  <b>%{target.dehumanizationScore}</b>
                  <small>dehumanize dil</small>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="card findings-card" id="findings">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Bulgular</p>
              <h2>Zaman penceresi özeti</h2>
            </div>
            <div className="segmented">
              {report.periodInsights.map((period, index) => (
                <button
                  key={period.label}
                  className={index === periodIndex ? "active" : ""}
                  onClick={() => setPeriodIndex(index)}
                >
                  {period.label.replace("Son ", "")}
                </button>
              ))}
            </div>
          </div>
          <div className="findings-body">
            <div
              className="risk-ring"
              style={{
                background: `conic-gradient(#ef4444 0 ${activePeriod.dehumanizationScore}%, #e2e8f0 ${activePeriod.dehumanizationScore}% 100%)`,
              }}
            >
              <span>%{activePeriod.dehumanizationScore}</span>
            </div>
            <div>
              <strong>{activePeriod.topTarget}</strong>
              <p>{activePeriod.summary}</p>
              <div className="mini-metrics">
                <span>{activePeriod.total} paylaşım</span>
                <span>{activePeriod.risky} riskli sinyal</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="card recipient-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Bildirim önerisi</p>
            <h2>Bulgular kimlerle paylaşılmalı?</h2>
          </div>
          <span className="status-pill">STK / kamu / platform</span>
        </div>
        <div className="recipient-list">
          {report.reportRecipients.map((recipient) => (
            <span key={recipient}>{recipient}</span>
          ))}
        </div>
      </section>

      <section className="card llm-card">
        <div>
          <p className="eyebrow">Üretken YZ katmanı</p>
          <h2>LLM ile acil aksiyon planı</h2>
          <p>
            Risk motorunun bulduğu skorlar LLM'e özetlenir; sistem STK veya moderasyon ekibi
            için uygulanabilir kriz yönetimi önerileri üretir.
          </p>
        </div>
        <button onClick={handleGenerateActionPlan} disabled={llmLoading}>
          {llmLoading ? "LLM raporu hazırlanıyor..." : "LLM ile Aksiyon Planı Üret"}
        </button>
        {llmLoading && <div className="pulse-box">Üretken YZ risk bağlamını yorumluyor...</div>}
        {actionPlan.length > 0 && (
          <div className="action-plan">
            {actionPlan.map((item, index) => (
              <article key={item}>
                <strong>{index + 1}. adım</strong>
                <p>{item}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card report-page">
        <div className="card-heading">
          <div>
            <p className="eyebrow">PDF rapor taslağı</p>
            <h2>Son dönem sosyal medya bulguları</h2>
          </div>
          <span className="status-pill">Export hazır</span>
        </div>
        <div className="report-cover">
          <div>
            <strong>SafeSpace Radar Bulgular Raporu</strong>
            <p>
              @{report.username} hesabı için {activePeriod.label.toLocaleLowerCase("tr-TR")} odağında
              risk, hedef kitle ve bildirim önerisi özeti.
            </p>
          </div>
          <div className="report-score">%{Math.round(report.riskScore)}</div>
        </div>
        <div className="report-columns">
          <article>
            <span>Öne çıkan hedef</span>
            <strong>{activePeriod.topTarget}</strong>
          </article>
          <article>
            <span>Dehumanize dil</span>
            <strong>%{activePeriod.dehumanizationScore}</strong>
          </article>
          <article>
            <span>Önerilen bildirim</span>
            <strong>{report.reportRecipients.slice(0, 2).join(", ") || "Rutin izleme"}</strong>
          </article>
        </div>
      </section>

      </section>
    </main>
    </>
  );
}

function EyeLogo() {
  return (
    <svg className="eye-logo" width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="SafeSpace logo">
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

function Gauge({ score, level }: { score: number; level: string }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const className = level === "Yüksek" ? "destructive" : level === "Orta" ? "warning" : "safe";

  return (
    <div className={`gauge ${className}`}>
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={radius} className="gauge-bg" />
        <circle
          cx="66"
          cy="66"
          r={radius}
          className="gauge-value"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div>
        <strong>%{Math.round(score)}</strong>
        <span>{level}</span>
      </div>
    </div>
  );
}

function highlight(text: string, flags: string[]) {
  if (flags.length === 0) return text;

  let parts: (string | ReactElement)[] = [text];
  flags.forEach((flag) => {
    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return part;
      return part.split(flag).flatMap((piece, index, array) =>
        index < array.length - 1
          ? [
              piece,
              <mark key={`${flag}-${index}`} title="Model bu ifadeyi risk sinyali olarak işaretledi.">
                {flag}
              </mark>,
            ]
          : [piece],
      );
    });
  });

  return parts;
}

function Donut({ sentiment }: { sentiment: UserReport["sentiment"] }) {
  const total = sentiment.negative + sentiment.neutral + sentiment.positive;
  const negative = Math.round((sentiment.negative / total) * 100);
  const neutral = Math.round((sentiment.neutral / total) * 100);
  const positive = Math.max(0, 100 - negative - neutral);

  return (
    <div className="donut-wrap">
      <div
        className="donut"
        style={{
          background: `conic-gradient(#ef4444 0 ${negative}%, #94a3b8 ${negative}% ${
            negative + neutral
          }%, #22c55e ${negative + neutral}% 100%)`,
        }}
      >
        <span>%{negative}</span>
      </div>
      <div className="legend">
        <span>
          <i className="red" /> Negatif %{negative}
        </span>
        <span>
          <i className="gray" /> Nötr %{neutral}
        </span>
        <span>
          <i className="green" /> Pozitif %{positive}
        </span>
      </div>
    </div>
  );
}

function MiniChart({ activity }: { activity: UserReport["activity"] }) {
  const max = Math.max(...activity.map((item) => item.total), 1);
  return (
    <div className="mini-chart">
      {activity.map((item) => (
        <div className="day" key={item.day}>
          <span className="total" style={{ height: `${(item.total / max) * 100}%` }} />
          <span className="risky" style={{ height: `${(item.risky / max) * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

export default ResultsScreen;
