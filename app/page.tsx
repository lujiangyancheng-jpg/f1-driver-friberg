"use client";

import { useEffect, useMemo, useState } from "react";

type Driver = {
  id: string;
  name: string;
  country: string;
  flag: string;
  team: string;
  number: number | null;
  role: "一号车手" | "二号车手" | "替补";
  titles: number;
  wins: number;
  podiums: number;
  debut: number | null;
  color: string;
};

type Difficulty = "race" | "qualifying" | "rookie";
type Phase = "home" | "setup" | "game";
type FeedbackKind = "correct" | "close" | "wrong";

type Guess = {
  driver: Driver;
  feedback: Record<keyof Pick<Driver, "team" | "country" | "number" | "role" | "wins" | "titles" | "podiums" | "debut">, FeedbackKind>;
};

const DRIVERS: Driver[] = [
  // 现役：2026 赛季官方车手名单；“一号/二号”是题库定位，方便形成猜测维度，不代表官方等级。
  { id: "russell", name: "George Russell", country: "英国", flag: "🇬🇧", team: "Mercedes", number: 63, role: "一号车手", titles: 0, wins: 7, podiums: 29, debut: 2019, color: "#00d2be" },
  { id: "antonelli", name: "Kimi Antonelli", country: "意大利", flag: "🇮🇹", team: "Mercedes", number: 12, role: "二号车手", titles: 0, wins: 6, podiums: 12, debut: 2025, color: "#00d2be" },
  { id: "leclerc", name: "Charles Leclerc", country: "摩纳哥", flag: "🇲🇨", team: "Ferrari", number: 16, role: "一号车手", titles: 0, wins: 8, podiums: 49, debut: 2018, color: "#e80020" },
  { id: "hamilton", name: "Lewis Hamilton", country: "英国", flag: "🇬🇧", team: "Ferrari", number: 44, role: "二号车手", titles: 7, wins: 105, podiums: 202, debut: 2007, color: "#e80020" },
  { id: "norris", name: "Lando Norris", country: "英国", flag: "🇬🇧", team: "McLaren", number: 1, role: "一号车手", titles: 1, wins: 12, podiums: 47, debut: 2019, color: "#ff8700" },
  { id: "piastri", name: "Oscar Piastri", country: "澳大利亚", flag: "🇦🇺", team: "McLaren", number: 81, role: "二号车手", titles: 0, wins: 9, podiums: 25, debut: 2023, color: "#ff8700" },
  { id: "verstappen", name: "Max Verstappen", country: "荷兰", flag: "🇳🇱", team: "Red Bull Racing", number: 3, role: "一号车手", titles: 4, wins: 71, podiums: 127, debut: 2015, color: "#3671c6" },
  { id: "hadjar", name: "Isack Hadjar", country: "法国", flag: "🇫🇷", team: "Red Bull Racing", number: 6, role: "二号车手", titles: 0, wins: 0, podiums: 2, debut: 2025, color: "#3671c6" },
  { id: "lawson", name: "Liam Lawson", country: "新西兰", flag: "🇳🇿", team: "Racing Bulls", number: 30, role: "一号车手", titles: 0, wins: 0, podiums: 0, debut: 2023, color: "#6692ff" },
  { id: "lindblad", name: "Arvid Lindblad", country: "瑞典", flag: "🇸🇪", team: "Racing Bulls", number: 41, role: "二号车手", titles: 0, wins: 0, podiums: 0, debut: 2026, color: "#6692ff" },
  { id: "gasly", name: "Pierre Gasly", country: "法国", flag: "🇫🇷", team: "Alpine", number: 10, role: "一号车手", titles: 0, wins: 1, podiums: 4, debut: 2017, color: "#ff87bc" },
  { id: "colapinto", name: "Franco Colapinto", country: "阿根廷", flag: "🇦🇷", team: "Alpine", number: 43, role: "二号车手", titles: 0, wins: 0, podiums: 0, debut: 2024, color: "#ff87bc" },
  { id: "ocon", name: "Esteban Ocon", country: "法国", flag: "🇫🇷", team: "Haas", number: 31, role: "一号车手", titles: 0, wins: 1, podiums: 4, debut: 2016, color: "#b6babd" },
  { id: "bearman", name: "Oliver Bearman", country: "英国", flag: "🇬🇧", team: "Haas", number: 87, role: "二号车手", titles: 0, wins: 0, podiums: 1, debut: 2024, color: "#b6babd" },
  { id: "hulkenberg", name: "Nico Hulkenberg", country: "德国", flag: "🇩🇪", team: "Audi", number: 27, role: "一号车手", titles: 0, wins: 0, podiums: 1, debut: 2010, color: "#d0d0d0" },
  { id: "bortoleto", name: "Gabriel Bortoleto", country: "巴西", flag: "🇧🇷", team: "Audi", number: 5, role: "二号车手", titles: 0, wins: 0, podiums: 0, debut: 2025, color: "#d0d0d0" },
  { id: "sainz", name: "Carlos Sainz", country: "西班牙", flag: "🇪🇸", team: "Williams", number: 55, role: "一号车手", titles: 0, wins: 4, podiums: 29, debut: 2015, color: "#64c4ff" },
  { id: "albon", name: "Alexander Albon", country: "泰国", flag: "🇹🇭", team: "Williams", number: 23, role: "二号车手", titles: 0, wins: 0, podiums: 2, debut: 2019, color: "#64c4ff" },
  { id: "alonso", name: "Fernando Alonso", country: "西班牙", flag: "🇪🇸", team: "Aston Martin", number: 14, role: "一号车手", titles: 2, wins: 32, podiums: 106, debut: 2001, color: "#229971" },
  { id: "stroll", name: "Lance Stroll", country: "加拿大", flag: "🇨🇦", team: "Aston Martin", number: 18, role: "二号车手", titles: 0, wins: 0, podiums: 3, debut: 2017, color: "#229971" },
  { id: "perez", name: "Sergio Pérez", country: "墨西哥", flag: "🇲🇽", team: "Cadillac", number: 11, role: "一号车手", titles: 0, wins: 6, podiums: 39, debut: 2011, color: "#9b9b9b" },
  { id: "bottas", name: "Valtteri Bottas", country: "芬兰", flag: "🇫🇮", team: "Cadillac", number: 77, role: "二号车手", titles: 0, wins: 10, podiums: 67, debut: 2013, color: "#9b9b9b" },
  // 替补：2026 赛季官方替补名单；没有正式 F1 号码或大奖赛首秀的显示为“—”。
  { id: "fornaroli", name: "Leonardo Fornaroli", country: "意大利", flag: "🇮🇹", team: "McLaren", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#ff8700" },
  { id: "oward", name: "Pato O'Ward", country: "墨西哥", flag: "🇲🇽", team: "McLaren", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#ff8700" },
  { id: "vesti", name: "Frederik Vesti", country: "丹麦", flag: "🇩🇰", team: "Mercedes", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#00d2be" },
  { id: "tsunoda", name: "Yuki Tsunoda", country: "日本", flag: "🇯🇵", team: "Red Bull Racing", number: 22, role: "替补", titles: 0, wins: 0, podiums: 1, debut: 2021, color: "#3671c6" },
  { id: "giovinazzi", name: "Antonio Giovinazzi", country: "意大利", flag: "🇮🇹", team: "Ferrari", number: 99, role: "替补", titles: 0, wins: 0, podiums: 0, debut: 2017, color: "#e80020" },
  { id: "browning", name: "Luke Browning", country: "英国", flag: "🇬🇧", team: "Williams", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#64c4ff" },
  { id: "iwasa", name: "Ayumu Iwasa", country: "日本", flag: "🇯🇵", team: "Racing Bulls", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#6692ff" },
  { id: "crawford", name: "Jak Crawford", country: "美国", flag: "🇺🇸", team: "Aston Martin", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#229971" },
  { id: "vandoorne", name: "Stoffel Vandoorne", country: "比利时", flag: "🇧🇪", team: "Aston Martin", number: 2, role: "替补", titles: 0, wins: 0, podiums: 0, debut: 2017, color: "#229971" },
  { id: "doohan", name: "Jack Doohan", country: "澳大利亚", flag: "🇦🇺", team: "Haas", number: 7, role: "替补", titles: 0, wins: 0, podiums: 0, debut: 2024, color: "#b6babd" },
  { id: "hirakawa", name: "Ryo Hirakawa", country: "日本", flag: "🇯🇵", team: "Haas", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#b6babd" },
  { id: "aron", name: "Paul Aron", country: "爱沙尼亚", flag: "🇪🇪", team: "Alpine", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#ff87bc" },
  { id: "maini", name: "Kush Maini", country: "印度", flag: "🇮🇳", team: "Alpine", number: null, role: "替补", titles: 0, wins: 0, podiums: 0, debut: null, color: "#ff87bc" },
  { id: "zhou", name: "Zhou Guanyu", country: "中国", flag: "🇨🇳", team: "Cadillac", number: 24, role: "替补", titles: 0, wins: 0, podiums: 0, debut: 2022, color: "#9b9b9b" },
  // 退役：补入跨年代冠军与高知名度车手，车队字段统一显示为“已退役”。
  { id: "vettel", name: "Sebastian Vettel", country: "德国", flag: "🇩🇪", team: "已退役", number: 5, role: "一号车手", titles: 4, wins: 53, podiums: 122, debut: 2007, color: "#3671c6" },
  { id: "raikkonen", name: "Kimi Räikkönen", country: "芬兰", flag: "🇫🇮", team: "已退役", number: 7, role: "一号车手", titles: 1, wins: 21, podiums: 103, debut: 2001, color: "#e80020" },
  { id: "rosberg", name: "Nico Rosberg", country: "德国", flag: "🇩🇪", team: "已退役", number: 6, role: "一号车手", titles: 1, wins: 23, podiums: 57, debut: 2006, color: "#00d2be" },
  { id: "button", name: "Jenson Button", country: "英国", flag: "🇬🇧", team: "已退役", number: 22, role: "一号车手", titles: 1, wins: 15, podiums: 50, debut: 2000, color: "#ff8700" },
  { id: "ricciardo", name: "Daniel Ricciardo", country: "澳大利亚", flag: "🇦🇺", team: "已退役", number: 3, role: "一号车手", titles: 0, wins: 8, podiums: 32, debut: 2011, color: "#ff8700" },
  { id: "massa", name: "Felipe Massa", country: "巴西", flag: "🇧🇷", team: "已退役", number: 19, role: "二号车手", titles: 0, wins: 11, podiums: 41, debut: 2002, color: "#e80020" },
  { id: "webber", name: "Mark Webber", country: "澳大利亚", flag: "🇦🇺", team: "已退役", number: 6, role: "二号车手", titles: 0, wins: 9, podiums: 42, debut: 2002, color: "#3671c6" },
  { id: "schumacher", name: "Michael Schumacher", country: "德国", flag: "🇩🇪", team: "已退役", number: 1, role: "一号车手", titles: 7, wins: 91, podiums: 155, debut: 1991, color: "#e80020" },
  { id: "senna", name: "Ayrton Senna", country: "巴西", flag: "🇧🇷", team: "已退役", number: 12, role: "一号车手", titles: 3, wins: 41, podiums: 80, debut: 1984, color: "#e5c11a" },
  { id: "prost", name: "Alain Prost", country: "法国", flag: "🇫🇷", team: "已退役", number: 2, role: "一号车手", titles: 4, wins: 51, podiums: 106, debut: 1980, color: "#e5c11a" },
  { id: "stewart", name: "Jackie Stewart", country: "英国", flag: "🇬🇧", team: "已退役", number: 6, role: "一号车手", titles: 3, wins: 27, podiums: 43, debut: 1965, color: "#e5c11a" },
  { id: "hakkinen", name: "Mika Häkkinen", country: "芬兰", flag: "🇫🇮", team: "已退役", number: 8, role: "一号车手", titles: 2, wins: 20, podiums: 51, debut: 1991, color: "#ff8700" },
  { id: "barrichello", name: "Rubens Barrichello", country: "巴西", flag: "🇧🇷", team: "已退役", number: 11, role: "二号车手", titles: 0, wins: 11, podiums: 68, debut: 1993, color: "#e80020" },
];

const MODES: Array<{ id: Difficulty; label: string; kicker: string; copy: string; tries: number }> = [
  { id: "race", label: "RACE DAY", kicker: "正赛模式", copy: "完整信息面板 · 8 次机会", tries: 8 },
  { id: "qualifying", label: "QUALIFYING", kicker: "排位模式", copy: "更小车手池 · 6 次机会", tries: 6 },
  { id: "rookie", label: "ROOKIE", kicker: "新手模式", copy: "提示更多 · 10 次机会", tries: 10 },
];

const FIELD_LABELS = ["车队/退役", "国家", "车号", "定位", "分站冠军", "年度冠军", "领奖台", "首秀"] as const;
const FIELD_KEYS = ["team", "country", "number", "role", "wins", "titles", "podiums", "debut"] as const;
type GuessField = (typeof FIELD_KEYS)[number];

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s·.\-_'’]/g, "");
}

function formatField(driver: Driver, field: GuessField) {
  if (field === "team") return driver.team;
  if (field === "role") return driver.role;
  if (field === "number") return driver.number == null ? "—" : `#${driver.number}`;
  if (field === "titles") return `${driver.titles}`;
  if (field === "wins") return `${driver.wins}`;
  if (field === "podiums") return `${driver.podiums}`;
  if (field === "debut") return driver.debut == null ? "—" : `${driver.debut}`;
  return `${driver.flag} ${driver.country}`;
}

function getFeedback(guess: Driver, target: Driver, field: GuessField): FeedbackKind {
  if (guess[field] === target[field]) return "correct";
  if (field === "number" || field === "titles" || field === "wins" || field === "podiums" || field === "debut") {
    if (guess[field] == null || target[field] == null) return "wrong";
    const difference = Math.abs(Number(guess[field]) - Number(target[field]));
    const threshold = field === "podiums" ? 18 : field === "wins" ? 12 : field === "debut" ? 4 : field === "number" ? 10 : 1;
    if (difference <= threshold) return "close";
  }
  return "wrong";
}

function ResultCell({ guess, target, field }: { guess: Driver; target: Driver; field: GuessField }) {
  const kind = getFeedback(guess, target, field);
  const numeric = ["number", "titles", "wins", "podiums", "debut"].includes(field);
  const value = formatField(guess, field);
  let arrow = "";
  if (numeric && kind !== "correct" && guess[field] != null && target[field] != null) {
    arrow = Number(guess[field]) < Number(target[field]) ? "↑" : "↓";
  }
  return (
    <div className={`result-cell result-${kind}`} title={kind === "correct" ? "完全匹配" : kind === "close" ? "接近目标" : "不匹配"}>
      <span>{value}</span>
      {arrow ? <b className="direction-arrow">{arrow}</b> : null}
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("home");
  const [difficulty, setDifficulty] = useState<Difficulty>("race");
  const [target, setTarget] = useState<Driver | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [query, setQuery] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ played: 0, wins: 0, streak: 0, best: 0 });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("f1-friberg-stats");
      if (saved) setStats(JSON.parse(saved));
    } catch {
      // Local-only stats are optional; a blocked storage API should not block the game.
    }
  }, []);

  const mode = MODES.find((item) => item.id === difficulty) ?? MODES[0];
  const suggestions = useMemo(() => {
    const value = normalize(query);
    if (!value) return DRIVERS.slice(0, 6);
    return DRIVERS.filter((driver) => normalize(`${driver.name}${driver.country}${driver.team}${driver.role}${driver.number ?? ""}`).includes(value)).slice(0, 6);
  }, [query]);
  const finished = Boolean(target && (guesses.some((guess) => guess.driver.id === target.id) || guesses.length >= mode.tries || revealed));
  const won = Boolean(target && guesses.some((guess) => guess.driver.id === target.id));

  function startGame() {
    const pool = difficulty === "qualifying" ? DRIVERS.filter((driver) => driver.titles > 0 || driver.wins > 20) : difficulty === "rookie" ? DRIVERS : DRIVERS;
    setTarget(pool[Math.floor(Math.random() * pool.length)]);
    setGuesses([]);
    setQuery("");
    setRevealed(false);
    setPhase("game");
  }

  function goHome() {
    setPhase("home");
    setTarget(null);
    setGuesses([]);
    setQuery("");
    setRevealed(false);
  }

  function submitGuess(driver = suggestions[0]) {
    if (!target || finished || !driver || guesses.some((guess) => guess.driver.id === driver.id)) return;
    const feedback = FIELD_KEYS.reduce((result, field) => ({ ...result, [field]: getFeedback(driver, target, field) }), {} as Guess["feedback"]);
    const next = [...guesses, { driver, feedback }];
    setGuesses(next);
    setQuery("");
    const isComplete = driver.id === target.id || next.length >= mode.tries;
    if (isComplete) {
      const wonRound = driver.id === target.id;
      const nextStats = {
        played: stats.played + 1,
        wins: stats.wins + (wonRound ? 1 : 0),
        streak: wonRound ? stats.streak + 1 : 0,
        best: Math.max(stats.best, wonRound ? stats.streak + 1 : stats.best),
      };
      setStats(nextStats);
      try { window.localStorage.setItem("f1-friberg-stats", JSON.stringify(nextStats)); } catch { /* local-only stats are optional */ }
    }
  }

  function restartSameMode() {
    startGame();
  }

  return (
    <div className="site-shell">
      <div className="scanlines" aria-hidden="true" />
      <header className="topbar">
        <button className="wordmark" onClick={goHome} aria-label="返回首页">
          <span className="wordmark-mark">F1</span>
          <span><b>弗一把</b><small>F1 DRIVER EDITION</small></span>
        </button>
        <div className="topbar-meta">
          <span className="live-dot" /> <span>LIVE GAME</span>
          <button className="icon-button" onClick={() => setShowRules(true)} aria-label="查看游戏规则">?</button>
        </div>
      </header>

      {phase === "home" ? (
        <main className="home-view">
          <section className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-line" /> WHO&apos;S THE DRIVER?</div>
              <h1>猜出这位<br /><em>F1 车手</em></h1>
              <p className="hero-subtitle">用你的赛车知识，锁定隐藏在数据背后的那位车手。每次猜测都会让你更接近发车位。</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => setPhase("setup")}><span>开始挑战</span><b>→</b></button>
                <button className="text-button" onClick={() => setShowRules(true)}>怎么玩 <span>↗</span></button>
              </div>
              <div className="micro-copy"><span className="status-pip" /> 无需登录 · 进度保存在本机</div>
            </div>
            <div className="hero-art" aria-label="F1赛车主题装饰图形">
              <div className="art-number">01</div>
              <div className="art-label">F1 / 2026<br /><span>THE GRID IS YOURS</span></div>
              <div className="track-track" />
              <div className="track-red" />
              <div className="car-silhouette"><span className="car-wing front" /><span className="car-body" /><span className="car-wing back" /><span className="wheel wheel-a" /><span className="wheel wheel-b" /><span className="wheel wheel-c" /><span className="wheel wheel-d" /></div>
              <div className="hero-corner top-left">APEX<br />YOUR CALL</div>
              <div className="hero-corner bottom-right">00:00:00<br /><span>NO CHEATS</span></div>
            </div>
          </section>

          <section className="home-lower">
            <div className="stats-strip">
              <div><span>已完成</span><strong>{stats.played.toString().padStart(2, "0")}</strong></div>
              <div><span>胜率</span><strong>{stats.played ? `${Math.round((stats.wins / stats.played) * 100)}%` : "--"}</strong></div>
              <div><span>当前连胜</span><strong>{stats.streak.toString().padStart(2, "0")}</strong></div>
              <div><span>最佳连胜</span><strong>{stats.best.toString().padStart(2, "0")}</strong></div>
            </div>
            <div className="feature-row">
              <button className="feature-card" onClick={() => setPhase("setup")}>
                <span className="feature-index">01</span><span><b>每日车手</b><small>每天一位隐藏车手，挑战你的记忆</small></span><i>↗</i>
              </button>
              <button className="feature-card" onClick={() => setShowRoster(true)}>
                <span className="feature-index">02</span><span><b>车手资料库</b><small>现役 2026 + 退役冠军跨年代收录</small></span><i>↗</i>
              </button>
              <div className="feature-note"><span className="checkmark">✓</span><span><b>绿色 = 完全匹配</b><small>黄色接近 · 箭头指向目标数值</small></span></div>
            </div>
          </section>
        </main>
      ) : phase === "setup" ? (
        <main className="setup-view">
          <div className="section-heading"><div className="eyebrow"><span className="eyebrow-line" /> SELECT YOUR GRID</div><h2>选择比赛模式</h2><p>每个模式都有不同的车手池和机会次数。准备好了吗？</p></div>
          <div className="mode-list">
            {MODES.map((item, index) => (
              <button key={item.id} className={`mode-card ${difficulty === item.id ? "selected" : ""}`} onClick={() => setDifficulty(item.id)}>
                <span className="mode-radio">{difficulty === item.id ? "●" : "○"}</span><span className="mode-order">0{index + 1}</span><span className="mode-main"><b>{item.label}</b><small>{item.kicker} · {item.copy}</small></span><span className="mode-laps">{item.tries}<small> TURNS</small></span><span className="mode-arrow">→</span>
              </button>
            ))}
          </div>
          <div className="setup-footer"><button className="back-button" onClick={goHome}>← 返回首页</button><button className="primary-button" onClick={startGame}><span>驶入赛道</span><b>→</b></button></div>
          <div className="setup-aside"><span className="big-quote">“</span><p>每一条数据都是一条赛车线。<br />不要只看速度，读懂节奏。</p><span className="quote-credit">— RACE ENGINEER / F1 DRIVER EDITION</span></div>
        </main>
      ) : (
        <main className="game-view">
          <div className="game-heading"><div><button className="back-button" onClick={goHome}>← 主菜单</button><div className="eyebrow"><span className="eyebrow-line" /> {mode.label} / DRIVER GUESS</div><h2>锁定目标车手</h2></div><div className="attempt-counter"><span>尝试次数</span><strong>{guesses.length.toString().padStart(2, "0")} <small>/ {mode.tries}</small></strong></div></div>
          <div className="game-layout">
            <section className="guess-panel">
              <div className="input-label"><span>ENTER DRIVER</span><small>输入昵称、国家或车号</small></div>
              <div className={`guess-input-wrap ${finished ? "disabled" : ""}`}>
                <span className="search-icon">⌕</span>
                <input value={query} disabled={finished} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitGuess(); }} placeholder="例如：Lewis / 44 / 英国 / 已退役" aria-label="输入车手昵称" />
                <button className="submit-key" onClick={() => submitGuess()} disabled={finished || !query.trim()}>↵</button>
              </div>
              {!finished && query ? <div className="suggestions" role="listbox">{suggestions.length ? suggestions.map((driver) => <button key={driver.id} onClick={() => submitGuess(driver)} role="option"><span className="suggestion-flag">{driver.flag}</span><span>{driver.name}</span><small>{formatField(driver, "number")} · {driver.team}</small></button>) : <div className="no-results">没有找到匹配车手</div>}</div> : null}
              <div className="helper-line"><span className="status-pip" /> 绿色正确 · 黄色接近 · 箭头指示目标数值方向</div>
              {guesses.length ? <div className="guess-table-wrap"><div className="guess-table-head"><span>你的猜测</span>{FIELD_LABELS.map((label) => <span key={label}>{label}</span>)}</div>{guesses.map((guess, index) => <div className="guess-row" key={`${guess.driver.id}-${index}`}><div className="driver-cell"><span className="driver-dot" style={{ background: guess.driver.color }} /><b>{guess.driver.name}</b><small>{guess.driver.flag} {guess.driver.country}</small></div>{FIELD_KEYS.map((field) => <ResultCell key={field} guess={guess.driver} target={target!} field={field} />)}</div>)}</div> : <div className="empty-grid"><span className="empty-grid-mark">⌁</span><b>GRID IS EMPTY</b><small>你的第一圈还没有开始</small></div>}
            </section>
            <aside className="race-sidebar"><div className="sidebar-card target-card"><span className="sidebar-kicker">TARGET // CLASSIFIED</span><div className="target-number">?</div><p>这位车手的身份<br />暂时保密</p><div className="target-lines"><span /><span /><span /></div></div><div className="sidebar-card rules-card"><span className="sidebar-kicker">RACE NOTES</span><ul><li>每位车手会显示 8 项数据</li><li>绿色 = 完全匹配</li><li>黄色 = 数值接近</li><li>箭头 = 目标更高或更低</li></ul><button className="small-text-button" onClick={() => setShowRules(true)}>完整规则 ↗</button></div><button className="reveal-button" onClick={() => setRevealed(true)} disabled={finished}>查看答案</button></aside>
          </div>
          {finished ? <div className={`finish-banner ${won ? "finish-win" : "finish-loss"}`}><div><span className="finish-kicker">{won ? "CHECKERED FLAG" : "RACE OVER"}</span><b>{won ? "漂亮，这一圈你拿下了。" : `答案是 ${target?.name}`}</b><small>{won ? `用了 ${guesses.length} 次猜测，反应很快。` : "再跑一圈，你会更接近正确答案。"}</small></div><div className="finish-actions"><button className="back-button" onClick={() => setPhase("setup")}>换个模式</button><button className="primary-button" onClick={restartSameMode}><span>再来一局</span><b>↻</b></button></div></div> : null}
        </main>
      )}

      <footer className="footer"><span>F1 DRIVER EDITION / MADE FOR THE GRID</span><span>LOCAL SCORE · NO ACCOUNT REQUIRED</span></footer>

      {showRules ? <div className="modal-backdrop" onClick={() => setShowRules(false)}><div className="modal-card" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowRules(false)}>×</button><div className="eyebrow"><span className="eyebrow-line" /> HOW TO PLAY</div><h3>像工程师一样读数据</h3><p>输入一位 F1 车手。每次猜测都会揭示与目标车手之间的关系，直到你锁定正确答案。</p><div className="rule-grid"><div><b className="legend green" />绿色</div><span>完全匹配</span><div><b className="legend yellow" />黄色</div><span>数字接近目标</span><div><b className="legend gray" />灰色</div><span>不是同一项</span><div><b className="legend arrow" />↑ ↓</div><span>目标数值更高 / 更低</span></div><button className="primary-button modal-button" onClick={() => setShowRules(false)}><span>知道了</span><b>→</b></button></div></div> : null}
      {showRoster ? <div className="modal-backdrop" onClick={() => setShowRoster(false)}><div className="modal-card roster-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowRoster(false)}>×</button><div className="eyebrow"><span className="eyebrow-line" /> DRIVER DATABASE / 2026</div><h3>车手资料库</h3><p className="roster-note">2026 赛季现役车手 + 官方替补 + 退役冠军跨年代题库。车手定位用于游戏反馈，不代表官方等级。</p><div className="roster-list">{DRIVERS.map((driver) => <div className="roster-row" key={driver.id}><span className="driver-dot" style={{ background: driver.color }} /><b>{driver.name}</b><span>{driver.flag} {driver.country}</span><span>{driver.team}</span><span>{driver.role}</span><strong>{formatField(driver, "number")}</strong></div>)}</div></div></div> : null}
    </div>
  );
}
