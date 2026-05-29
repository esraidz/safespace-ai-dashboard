import rawData from "./output_10k_20users.json";

export type RiskLevel = "Düşük" | "Orta" | "Yüksek";

interface RawTweet {
  userid: string;
  timestamp: string;
  text: string;
}

export interface TweetEvidence {
  id: string;
  time: string;
  text: string;
  flags: string[];
}

export interface UserReport {
  username: string;
  displayName: string;
  riskScore: number;
  level: RiskLevel;
  summary: string;
  action: string;
  signals: { label: string; score: number }[];
  sentiment: { negative: number; neutral: number; positive: number };
  tweets: TweetEvidence[];
  activity: { day: string; total: number; risky: number }[];
  targetGroups: TargetGroupReport[];
  periodInsights: PeriodInsight[];
  reportRecipients: string[];
}

export interface TargetGroupReport {
  group: string;
  mentions: number;
  riskyMentions: number;
  dehumanizationScore: number;
  notify: string;
}

export interface PeriodInsight {
  label: string;
  days: number;
  total: number;
  risky: number;
  topTarget: string;
  dehumanizationScore: number;
  summary: string;
}

const tweets = rawData as RawTweet[];

const signalRules = [
  {
    label: "Toksik dil",
    weight: 12,
    keywords: ["aptal", "salak", "rezalet", "pis", "amk", "lan", "siktir", "nefret", "tiksindik"],
  },
  {
    label: "Nefret / hedefleme",
    weight: 18,
    keywords: ["vatan haini", "hain", "tohumu", "gavur", "piç", "pezevenk", "defol", "geber"],
  },
  {
    label: "Dezenformasyon / panik",
    weight: 15,
    keywords: ["herkes paylaşsın", "saklanıyor", "kaynak sormayın", "içeriden bilgi", "yasaklandı", "kapıları açarız"],
  },
  {
    label: "Tehdit / agresyon",
    weight: 16,
    keywords: ["hesabını sor", "yanına kalmayacak", "döven", "öldür", "vur", "baskı kur"],
  },
  {
    label: "Kriz dili",
    weight: 10,
    keywords: ["kriz", "boykot", "istifa", "perişan", "yeter", "zarar", "tehlike", "taciz"],
  },
];

const positiveWords = ["güzel", "iyi", "destek", "fayda", "teşekkür", "başar", "yardım", "haklı", "umut"];
const negativeWords = ["kötü", "nefret", "rezalet", "yeter", "perişan", "taciz", "öldür", "pis", "hain", "zarar"];
const userAliases = [
  "derya",
  "mert",
  "aylin",
  "kaan",
  "selin",
  "emir",
  "zeynep",
  "deniz",
  "burak",
  "ece",
  "arda",
  "naz",
  "kerem",
  "melis",
  "tolga",
  "ceren",
  "onur",
  "irem",
  "hakan",
  "yasemin",
];

const targetGroupRules = [
  {
    group: "Suriyeli / Arap toplulukları",
    notify: "Göç ve uyum alanında çalışan STK'lar + ilgili kamu birimleri",
    keywords: ["suriyeli", "suriye", "arap", "mülteci", "göçmen"],
  },
  {
    group: "Türk vatandaşları",
    notify: "Kamu iletişimi ekipleri + toplumsal uyum birimleri",
    keywords: ["türk", "türkiye", "vatandaş", "halk"],
  },
  {
    group: "Etnik / dini azınlıklar",
    notify: "İnsan hakları STK'ları + nefret söylemi izleme birimleri",
    keywords: ["ermeni", "yunan", "yahudi", "hristiyan", "gavur", "alman", "ingiliz"],
  },
  {
    group: "Kadınlar ve çocuklar",
    notify: "Kadın hakları ve çocuk koruma STK'ları",
    keywords: ["kadın", "bayan", "çocuk", "gelin", "anne"],
  },
];

const dehumanizingWords = [
  "piç",
  "pezevenk",
  "tohumu",
  "pis",
  "gavur",
  "hain",
  "vatan haini",
  "geber",
  "defol",
  "tiksindik",
];

function groupedByUser() {
  const groups = new Map<string, RawTweet[]>();
  tweets.forEach((tweet) => {
    const current = groups.get(tweet.userid) ?? [];
    current.push(tweet);
    groups.set(tweet.userid, current);
  });

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "tr"));
}

function scoreTweet(text: string) {
  const lowered = text.toLocaleLowerCase("tr-TR");
  const flags: string[] = [];
  let score = 0;

  signalRules.forEach((rule) => {
    if (rule.keywords.some((keyword) => lowered.includes(keyword))) {
      flags.push(rule.label);
      score += rule.weight;
    }
  });

  if (/[!?]{2,}|[#]/.test(text)) {
    score += 4;
  }

  return { score, flags };
}

function mentionedTargetGroups(text: string) {
  const lowered = text.toLocaleLowerCase("tr-TR");
  return targetGroupRules.filter((rule) => rule.keywords.some((keyword) => lowered.includes(keyword)));
}

function hasDehumanizingLanguage(text: string) {
  const lowered = text.toLocaleLowerCase("tr-TR");
  return dehumanizingWords.some((word) => lowered.includes(word));
}

function buildSignals(userTweets: RawTweet[]) {
  return signalRules.map((rule) => {
    const hitCount = userTweets.filter((tweet) => {
      const lowered = tweet.text.toLocaleLowerCase("tr-TR");
      return rule.keywords.some((keyword) => lowered.includes(keyword));
    }).length;

    return {
      label: rule.label,
      score: Math.min(100, Math.round((hitCount / Math.max(1, userTweets.length)) * 320 + hitCount * 2)),
    };
  });
}

function buildSentiment(userTweets: RawTweet[]) {
  let negativeHits = 0;
  let positiveHits = 0;

  userTweets.forEach((tweet) => {
    const lowered = tweet.text.toLocaleLowerCase("tr-TR");
    if (negativeWords.some((word) => lowered.includes(word))) negativeHits += 1;
    if (positiveWords.some((word) => lowered.includes(word))) positiveHits += 1;
  });

  const negative = Math.min(82, Math.round((negativeHits / userTweets.length) * 190 + 18));
  const positive = Math.min(38, Math.round((positiveHits / userTweets.length) * 120 + 8));
  const neutral = Math.max(8, 100 - negative - positive);

  return { negative, neutral, positive };
}

function buildActivity(userTweets: RawTweet[]) {
  const monthBuckets = new Map<string, { total: number; risky: number }>();

  userTweets.forEach((tweet) => {
    const date = new Date(tweet.timestamp);
    const key = date.toLocaleDateString("tr-TR", { month: "short" });
    const current = monthBuckets.get(key) ?? { total: 0, risky: 0 };
    current.total += 1;
    if (scoreTweet(tweet.text).score > 0) current.risky += 1;
    monthBuckets.set(key, current);
  });

  return [...monthBuckets.entries()].slice(0, 14).map(([day, value]) => ({
    day,
    total: value.total,
    risky: value.risky,
  }));
}

function buildTargetGroups(userTweets: RawTweet[]): TargetGroupReport[] {
  return targetGroupRules
    .map((rule) => {
      const matchedTweets = userTweets.filter((tweet) => {
        const lowered = tweet.text.toLocaleLowerCase("tr-TR");
        return rule.keywords.some((keyword) => lowered.includes(keyword));
      });
      const riskyMentions = matchedTweets.filter((tweet) => scoreTweet(tweet.text).score > 0).length;
      const dehumanizingMentions = matchedTweets.filter((tweet) => hasDehumanizingLanguage(tweet.text)).length;

      return {
        group: rule.group,
        mentions: matchedTweets.length,
        riskyMentions,
        dehumanizationScore:
          matchedTweets.length === 0 ? 0 : Math.min(100, Math.round((dehumanizingMentions / matchedTweets.length) * 100)),
        notify: rule.notify,
      };
    })
    .filter((target) => target.mentions > 0)
    .sort((a, b) => b.riskyMentions - a.riskyMentions || b.mentions - a.mentions);
}

function buildPeriodInsights(userTweets: RawTweet[], targetGroups: TargetGroupReport[]): PeriodInsight[] {
  const maxDate = new Date(Math.max(...userTweets.map((tweet) => new Date(tweet.timestamp).getTime())));

  return [
    { label: "Son 1 hafta", days: 7 },
    { label: "Son 30 gün", days: 30 },
    { label: "Son 1 yıl", days: 365 },
  ].map((period) => {
    const startTime = maxDate.getTime() - period.days * 24 * 60 * 60 * 1000;
    const periodTweets = userTweets.filter((tweet) => new Date(tweet.timestamp).getTime() >= startTime);
    const risky = periodTweets.filter((tweet) => scoreTweet(tweet.text).score > 0).length;
    const periodTargets = buildTargetGroups(periodTweets);
    const topTarget = periodTargets[0]?.group ?? targetGroups[0]?.group ?? "Belirgin hedef kitle yok";
    const dehumanizationScore = periodTargets[0]?.dehumanizationScore ?? 0;

    return {
      ...period,
      total: periodTweets.length,
      risky,
      topTarget,
      dehumanizationScore,
      summary:
        periodTweets.length === 0
          ? `${period.label} içinde veri bulunmadı.`
          : `${period.label} içinde ${periodTweets.length} paylaşım incelendi; ${risky} paylaşım riskli sinyal içeriyor. Öne çıkan hedef: ${topTarget}.`,
    };
  });
}

function buildEvidence(userTweets: RawTweet[]) {
  return userTweets
    .map((tweet, index) => ({ tweet, index, ...scoreTweet(tweet.text) }))
    .filter((item) => item.flags.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => ({
      id: `${item.tweet.userid}-${item.index}`,
      time: new Date(item.tweet.timestamp).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: item.tweet.text,
      flags: item.flags,
    }));
}

function getLevel(riskScore: number): RiskLevel {
  if (riskScore >= 70) return "Yüksek";
  if (riskScore >= 40) return "Orta";
  return "Düşük";
}

function buildReport(rawUsername: string, userTweets: RawTweet[], index: number, displayNameOverride?: string): UserReport {
  const username =
    rawUsername === "__all__" ? "genel_izleme" : userAliases[index] ?? `kullanici_${String(index + 1).padStart(2, "0")}`;
  const tweetScores = userTweets.map((tweet) => scoreTweet(tweet.text).score);
  const averageRisk = tweetScores.reduce((total, score) => total + score, 0) / Math.max(1, tweetScores.length);
  const riskyTweetRatio = tweetScores.filter((score) => score > 0).length / Math.max(1, userTweets.length);
  const riskScore = Math.min(100, Math.round(averageRisk * 4.2 + riskyTweetRatio * 58));
  const level = getLevel(riskScore);
  const signals = buildSignals(userTweets);
  const topSignal = [...signals].sort((a, b) => b.score - a.score)[0];
  const evidence = buildEvidence(userTweets);
  const targetGroups = buildTargetGroups(userTweets);
  const periodInsights = buildPeriodInsights(userTweets, targetGroups);
  const reportRecipients = [
    ...new Set(
      targetGroups
        .slice(0, 3)
        .flatMap((target) => target.notify.split(" + "))
        .concat(level === "Yüksek" ? ["Platform moderasyon ekibi"] : []),
    ),
  ];

  return {
    username,
    displayName:
      displayNameOverride ?? `${username[0].toLocaleUpperCase("tr-TR")}${username.slice(1)} - Dataset Profili`,
    riskScore,
    level,
    summary:
      evidence.length > 0
        ? `${userTweets.length} paylaşım içinde en belirgin örüntü ${topSignal.label.toLocaleLowerCase("tr-TR")} olarak görünüyor. Risk skoru anonim dataset üzerinden hesaplandı.`
        : `${userTweets.length} paylaşım incelendi; belirgin risk sinyali düşük seviyede kaldı.`,
    action:
      level === "Yüksek"
        ? "İnsan incelemesine öncelikli aktarılmalı; kanıt tweetleri ve bağlam birlikte değerlendirilmelidir."
        : level === "Orta"
          ? "Kısa vadeli izleme önerilir; sinyal artışı olursa moderasyon kuyruğuna alınmalıdır."
          : "Rutin takip yeterli. Otomatik müdahale önerilmez.",
    signals,
    sentiment: buildSentiment(userTweets),
    tweets: evidence.length > 0 ? evidence : buildEvidence(userTweets.slice(0, 25)),
    activity: buildActivity(userTweets),
    targetGroups,
    periodInsights,
    reportRecipients,
  };
}

const userReports = groupedByUser().map(([username, userTweets], index) => buildReport(username, userTweets, index));

export const reports: UserReport[] = [
  buildReport("__all__", tweets, -1, "Tüm Veri - Kolektif Risk Özeti"),
  ...userReports,
];

export const findReport = (username: string) =>
  reports.find((report) => report.username.toLowerCase() === username.toLowerCase());
