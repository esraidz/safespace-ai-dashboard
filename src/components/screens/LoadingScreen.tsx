interface LoadingScreenProps {
  username: string;
  onCancel: () => void;
}

function LoadingScreen({ username, onCancel }: LoadingScreenProps) {
  return (
    <main className="shell loading-shell">
      <section className="loading-card">
        <div className="loader" />
        <p className="eyebrow">@{username}</p>
        <h1>Paylaşım örüntüleri analiz ediliyor</h1>
        <p>Risk sinyalleri, duygu dağılımı ve davranış yoğunluğu karşılaştırılıyor.</p>
        <div className="loading-steps">
          <span>Tweet geçmişi taranıyor</span>
          <span>ML modeli riskleri filtreliyor</span>
          <span>LLM aksiyon bağlamı hazırlanıyor</span>
        </div>
        <button className="secondary" onClick={onCancel}>
          İptal et
        </button>
      </section>
    </main>
  );
}

export default LoadingScreen;
