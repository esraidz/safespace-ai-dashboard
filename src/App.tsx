import { useEffect, useState } from "react";
import InputScreen from "./components/screens/InputScreen";
import LoginScreen from "./components/screens/LoginScreen";
import LoadingScreen from "./components/screens/LoadingScreen";
import ResultsScreen from "./components/screens/ResultsScreen";
import { findReport, reports, UserReport } from "./data/mock";

type Screen = "login" | "input" | "loading" | "results";

function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [typedUsername, setTypedUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (screen !== "loading") return;
    const timer = window.setTimeout(() => setScreen("results"), 1200);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const startAnalysis = (username: string) => {
    const cleanUsername = username.trim().replace(/^@/, "");
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) {
      setError("Kullanıcı adı yalnızca harf, sayı ve alt çizgi içerebilir.");
      return;
    }

    setError("");
    setTypedUsername(cleanUsername);
    setSelectedReport(findReport(cleanUsername) ?? reports[0]);
    setScreen("loading");
  };

  if (screen === "loading" && selectedReport) {
    return <LoadingScreen username={typedUsername} onCancel={() => setScreen("input")} />;
  }

  if (screen === "results" && selectedReport) {
    return <ResultsScreen report={selectedReport} onBack={() => setScreen("input")} />;
  }

  if (screen === "login") {
    return <LoginScreen onLogin={() => setScreen("input")} />;
  }

  return (
    <InputScreen
      error={error}
      reports={reports}
      onAnalyze={startAnalysis}
      onPickDemo={(report) => startAnalysis(report.username)}
    />
  );
}

export default App;
