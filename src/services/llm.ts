import { UserReport } from "../data/mock";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function generateActionPlan(report: UserReport): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    await delay(900);
    return buildFallbackPlan(report);
  }

  try {
    return await callGroq(apiKey, report);
  } catch (error) {
    console.warn("LLM API hatası, fallback plan kullanılıyor:", error);
    return buildFallbackPlan(report);
  }
}

async function callGroq(apiKey: string, report: UserReport): Promise<string[]> {
  const evidence = report.tweets
    .filter((tweet) => tweet.flags.length > 0)
    .slice(0, 4)
    .map((tweet) => `- "${tweet.text}"`)
    .join("\n");

  const signals = report.signals.map((signal) => `${signal.label}: %${Math.round(signal.score)}`).join(", ");
  const targets = report.targetGroups
    .slice(0, 3)
    .map((target) => `${target.group}: ${target.riskyMentions} riskli bahis, dehumanize dil %${target.dehumanizationScore}`)
    .join("; ");

  const prompt = `Sen bir kriz iletişimi uzmanısın. Bir STK veya moderasyon ekibi için aksiyon planı hazırlıyorsun.

ANALİZ EDİLEN HESAP: @${report.username}
RİSK SEVİYESİ: ${report.level} (Skor: %${Math.round(report.riskScore)})
RİSK SİNYALLERİ: ${signals}
NEGATİF DUYGU ORANI: %${Math.round(report.sentiment.negative)}
HEDEF ALINAN KİTLELER: ${targets || "Belirgin hedef kitle yok"}
BİLDİRİM ÖNERİSİ: ${report.reportRecipients.join(", ") || "Rutin izleme"}

MODEL ÖZETİ: ${report.summary}

KANIT TWEET'LER:
${evidence || "(Yüksek skorlu tweet bulunamadı)"}

GÖREV: Bu duruma özel, somut ve uygulanabilir 3 maddelik aksiyon planı yaz.

KURALLAR:
- Her madde tek cümle, en fazla 25 kelime
- Türkçe yaz
- Damgalamadan kaçın, destek odaklı dil kullan
- Otomatik yaptırım önerme; insan incelemesine vurgu yap
- Numara veya tire kullanma, sadece düz cümleler
- Her cümleyi yeni satıra yaz`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API hata: ${response.status}`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  const items = text
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.replace(/^[\d]+[\.)]\s*/, ""))
    .map((line) => line.replace(/^[-•*]\s*/, ""))
    .filter((line) => line.length > 10);

  if (items.length === 0) {
    throw new Error("LLM boş yanıt döndü");
  }

  return items.slice(0, 3);
}

function buildFallbackPlan(report: UserReport): string[] {
  if (report.level === "Yüksek") {
    return [
      "İlgili profil insan incelemesine öncelikli olarak aktarılmalı; otomatik karar verilmeden bağlam kontrol edilmelidir.",
      "Kritik tweetlerdeki umutsuzluk, izolasyon, tehdit veya dezenformasyon sinyalleri ayrı kanıt listesi olarak kayıt altına alınmalıdır.",
      "Kullanıcıya zarar vermeyen, damgalamayan ve destek kaynaklarına yönlendiren sakin bir iletişim akışı hazırlanmalıdır.",
    ];
  }

  if (report.level === "Orta") {
    return [
      "Profil kısa vadeli izleme listesine alınmalı ve risk skorundaki değişim 24 saatlik periyotlarla takip edilmelidir.",
      "Tekil sert ifadeler yerine tekrar eden örüntülere odaklanılmalı; yanlış pozitif ihtimali not edilmelidir.",
      "Gerekirse kullanıcıya düşük yoğunluklu destek, açıklama veya güvenilir kaynak yönlendirmesi yapılmalıdır.",
    ];
  }

  return [
    "Acil müdahale önerilmez; profil rutin izleme kapsamında tutulabilir.",
    "Modelin düşük risk kararını açıklamak için temiz iletişim örnekleri ve düşük sinyal oranı rapora eklenmelidir.",
    "Gelecekte ani negatiflik artışı olursa yeniden analiz tetiklenmelidir.",
  ];
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
