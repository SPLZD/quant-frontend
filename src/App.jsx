import { useState, useEffect, useCallback, useRef } from "react";

/* ── 백엔드 URL 설정 ────────────────────────────────────────
   Railway 배포 후 여기에 URL을 붙여넣으세요.
   예: const API_BASE = "https://quant-screener.up.railway.app";
────────────────────────────────────────────────────────── */
const API_BASE = "https://quant-backen-production-fa56.up.railway.app";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Noto+Sans+KR:wght@300;400;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060810;
    --surface: #0d1117;
    --surface2: #161b22;
    --surface3: #1c2333;
    --border: #21262d;
    --border2: #30363d;
    --accent: #58a6ff;
    --accent2: #ff7b72;
    --green: #3fb950;
    --yellow: #d29922;
    --red: #f85149;
    --text: #c9d1d9;
    --muted: #484f58;
    --muted2: #6e7681;
    --mono: 'IBM Plex Mono', monospace;
    --sans: 'Noto Sans KR', sans-serif;
  }

  html, body { background: var(--bg); color: var(--text); font-family: var(--sans); font-size: 14px; }

  .app {
    min-height: 100vh;
    background: var(--bg);
  }

  /* ── Header ── */
  .hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 99;
  }

  .hdr-logo {
    font-family: var(--mono); font-size: 15px; font-weight: 700;
    color: var(--accent); letter-spacing: 2px;
  }

  .hdr-meta {
    display: flex; align-items: center; gap: 12px;
    font-family: var(--mono); font-size: 11px; color: var(--muted2);
  }

  .live-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    background: rgba(63,185,80,0.1); border: 1px solid rgba(63,185,80,0.25);
    color: var(--green); font-size: 11px;
  }

  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: blink 1.4s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

  .cache-pill {
    padding: 3px 10px; border-radius: 20px;
    background: rgba(210,153,34,0.1); border: 1px solid rgba(210,153,34,0.25);
    color: var(--yellow); font-size: 11px; font-family: var(--mono);
  }

  /* ── Tabs ── */
  .tabs {
    display: flex; gap: 0;
    border-bottom: 1px solid var(--border);
    padding: 0 20px;
    background: var(--surface);
  }

  .tab {
    padding: 12px 28px; cursor: pointer;
    font-weight: 700; font-size: 13px;
    color: var(--muted2); background: transparent;
    border: none; border-bottom: 2px solid transparent;
    transition: all .15s; letter-spacing: .5px;
  }

  .tab:hover { color: var(--text); }
  .tab.on { color: var(--accent); border-bottom-color: var(--accent); }

  /* ── Layout ── */
  .body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }

  /* ── Panel ── */
  .panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; overflow: hidden;
  }

  .panel-hd {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }

  .panel-title {
    font-family: var(--mono); font-size: 11px; font-weight: 700;
    color: var(--muted2); letter-spacing: 1.5px; text-transform: uppercase;
  }

  .panel-body { padding: 14px; }

  /* ── Weight Sliders ── */
  .slider-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .slider-lbl { font-size: 12px; font-weight: 700; width: 80px; flex-shrink: 0; }
  .slider {
    flex: 1; -webkit-appearance: none; height: 3px;
    border-radius: 2px; background: var(--border2); outline: none; cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 13px; height: 13px;
    border-radius: 50%; cursor: pointer;
    box-shadow: 0 0 0 2px var(--bg);
  }
  .slider-val { font-family: var(--mono); font-size: 12px; width: 34px; text-align: right; flex-shrink: 0; }

  .wt-sum { font-family: var(--mono); font-size: 11px; text-align: right; margin-top: 6px; }

  .apply-btn {
    margin-top: 10px; width: 100%;
    padding: 9px; border-radius: 6px;
    background: rgba(88,166,255,0.12); border: 1px solid rgba(88,166,255,0.3);
    color: var(--accent); font-family: var(--mono); font-size: 12px;
    cursor: pointer; transition: all .2s; letter-spacing: 1px;
  }
  .apply-btn:hover:not(:disabled) { background: rgba(88,166,255,0.22); }
  .apply-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ── Summary Cards ── */
  .cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }

  .card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; padding: 12px 14px;
  }

  .card-lbl { font-family: var(--mono); font-size: 10px; color: var(--muted2); letter-spacing: 1px; text-transform: uppercase; }
  .card-val { font-family: var(--mono); font-size: 20px; font-weight: 700; margin-top: 4px; line-height: 1; }
  .card-sub { font-size: 10px; color: var(--muted2); margin-top: 4px; }

  /* ── Sector Flow ── */
  .sector-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }

  .sector-row {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 6px; padding: 9px 10px;
    display: flex; align-items: center; gap: 8px;
    animation: fadeUp .3s ease both;
  }

  @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

  .s-rank { font-family: var(--mono); font-size: 10px; color: var(--muted); width: 18px; }
  .s-info { flex: 1; min-width: 0; }
  .s-name { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .s-etf { font-family: var(--mono); font-size: 10px; color: var(--muted2); }
  .s-bar-wrap { width: 44px; height: 3px; background: var(--border2); border-radius: 2px; margin-top: 4px; overflow: hidden; }
  .s-bar { height: 100%; border-radius: 2px; transition: width .6s ease; }
  .s-score { font-family: var(--mono); font-size: 12px; font-weight: 700; width: 32px; text-align: right; }
  .s-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  /* ── Table ── */
  .tbl-wrap { overflow-x: auto; }

  table { width: 100%; border-collapse: collapse; }

  th {
    font-family: var(--mono); font-size: 10px; color: var(--muted2);
    text-transform: uppercase; letter-spacing: 1px;
    padding: 8px 10px; text-align: left;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  td {
    padding: 9px 10px; font-size: 12px;
    border-bottom: 1px solid rgba(33,38,45,.7);
    vertical-align: middle;
  }

  tr:hover td { background: rgba(88,166,255,.03); }
  tr:last-child td { border-bottom: none; }

  .rk { font-family: var(--mono); font-size: 11px; color: var(--muted2); }

  .tkr {
    font-family: var(--mono); font-size: 12px; font-weight: 700;
    color: var(--accent); background: rgba(88,166,255,.08);
    padding: 2px 7px; border-radius: 4px; white-space: nowrap;
  }

  .co-name { font-size: 10px; color: var(--muted2); margin-top: 2px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .bar-cell { display: flex; align-items: center; gap: 6px; }
  .bar-wrap { width: 44px; height: 3px; background: var(--border2); border-radius: 2px; overflow: hidden; }
  .bar { height: 100%; border-radius: 2px; }
  .bar-num { font-family: var(--mono); font-size: 12px; font-weight: 700; }

  .tag { font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 700; white-space: nowrap; }

  .up { color: var(--green); font-family: var(--mono); font-size: 12px; }
  .dn { color: var(--red); font-family: var(--mono); font-size: 12px; }

  /* ── States ── */
  .loading {
    text-align: center; padding: 48px 0;
    font-family: var(--mono); font-size: 12px; color: var(--muted2);
  }

  .spinner {
    width: 20px; height: 20px; border: 2px solid var(--border2);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin .8s linear infinite; margin: 0 auto 12px;
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  .err {
    background: rgba(248,81,73,.07); border: 1px solid rgba(248,81,73,.25);
    border-radius: 6px; padding: 12px 14px;
    font-family: var(--mono); font-size: 12px; color: var(--red);
  }

  .empty { text-align: center; padding: 40px; font-family: var(--mono); font-size: 12px; color: var(--muted2); }

  .refresh-btn {
    background: transparent; border: 1px solid var(--border2);
    color: var(--muted2); padding: 5px 12px; border-radius: 5px;
    font-family: var(--mono); font-size: 11px; cursor: pointer;
    transition: all .15s; letter-spacing: .5px;
  }
  .refresh-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .refresh-btn:disabled { opacity: .3; cursor: not-allowed; }
`;

// ── helpers ───────────────────────────────────────────────
const sc = (v) => v >= 65 ? "#3fb950" : v >= 45 ? "#d29922" : "#f85149";
const tc = (v) => v >= 60 ? "#3fb950" : v >= 40 ? "#d29922" : "#f85149";

const SECTOR_COLORS = {
  Technology: { bg: "rgba(88,166,255,.12)", color: "#58a6ff" },
  Energy: { bg: "rgba(255,123,114,.12)", color: "#ff7b72" },
  Healthcare: { bg: "rgba(63,185,80,.12)", color: "#3fb950" },
  "Financial Services": { bg: "rgba(210,153,34,.12)", color: "#d29922" },
  Financials: { bg: "rgba(210,153,34,.12)", color: "#d29922" },
  "Basic Materials": { bg: "rgba(180,130,255,.12)", color: "#b482ff" },
  Industrials: { bg: "rgba(255,165,0,.12)", color: "#ffa500" },
  "Communication Services": { bg: "rgba(88,166,255,.12)", color: "#58a6ff" },
  "Consumer Cyclical": { bg: "rgba(63,185,80,.12)", color: "#3fb950" },
};

function sectorStyle(s) {
  for (const [k, v] of Object.entries(SECTOR_COLORS)) {
    if ((s || "").includes(k)) return v;
  }
  return { bg: "rgba(110,118,129,.12)", color: "#6e7681" };
}

// ── WeightPanel ────────────────────────────────────────────
function WeightPanel({ weights, onChange, onApply, loading }) {
  const total = weights.momentum + weights.fundamental + weights.sector;
  const valid = total === 100;

  const ITEMS = [
    { key: "momentum", label: "모멘텀", color: "#58a6ff" },
    { key: "fundamental", label: "펀더멘털", color: "#d29922" },
    { key: "sector", label: "섹터흐름", color: "#3fb950" },
  ];

  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-title">⚙ 가중치 조절</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: valid ? "var(--green)" : "var(--red)" }}>
          합계 {total}%
        </span>
      </div>
      <div className="panel-body">
        {ITEMS.map(({ key, label, color }) => (
          <div key={key} className="slider-row">
            <span className="slider-lbl" style={{ color }}>{label}</span>
            <input
              type="range" min={0} max={100} step={5}
              value={weights[key]}
              className="slider"
              style={{ "--thumb-color": color, accentColor: color }}
              onChange={e => onChange(key, +e.target.value)}
            />
            <span className="slider-val" style={{ color }}>{weights[key]}%</span>
          </div>
        ))}
        <button
          className="apply-btn"
          disabled={!valid || loading}
          onClick={onApply}
        >
          {loading ? "계산 중..." : "✦ 가중치 적용 후 재계산"}
        </button>
      </div>
    </div>
  );
}

// ── SummaryCards ───────────────────────────────────────────
function SummaryCards({ data }) {
  if (!data) return null;
  const top = data.top20?.[0];
  const topSector = data.sectors?.[0];
  const avg = data.top20?.length
    ? (data.top20.reduce((s, x) => s + x.total, 0) / data.top20.length).toFixed(1)
    : "–";

  return (
    <div className="cards">
      <div className="card">
        <div className="card-lbl">1위 종목</div>
        <div className="card-val" style={{ color: "var(--accent)", fontSize: 17 }}>{top?.ticker || "–"}</div>
        <div className="card-sub" style={{ fontSize: 11 }}>{top?.company || ""}</div>
      </div>
      <div className="card">
        <div className="card-lbl">평균 점수</div>
        <div className="card-val" style={{ color: sc(+avg) }}>{avg}</div>
        <div className="card-sub">Top {data.top20?.length} 평균</div>
      </div>
      <div className="card">
        <div className="card-lbl">강세 섹터</div>
        <div className="card-val" style={{ color: "var(--green)", fontSize: 14, marginTop: 6 }}>
          {topSector?.name?.split(" ")[0] || "–"}
        </div>
        <div className="card-sub">{topSector?.etf} · {topSector?.score}</div>
      </div>
    </div>
  );
}

// ── SectorFlow ─────────────────────────────────────────────
function SectorFlow({ sectors }) {
  if (!sectors?.length) return null;
  const max = Math.max(...sectors.map(s => s.score));
  return (
    <div className="panel">
      <div className="panel-hd"><span className="panel-title">📊 섹터 자금 흐름</span></div>
      <div className="panel-body">
        <div className="sector-grid">
          {sectors.map((s, i) => (
            <div key={s.etf} className="sector-row" style={{ animationDelay: `${i * 0.04}s` }}>
              <span className="s-rank">#{i + 1}</span>
              <div className="s-info">
                <div className="s-name">{s.name}</div>
                <div className="s-etf">{s.etf}</div>
                <div className="s-bar-wrap">
                  <div className="s-bar" style={{ width: `${max > 0 ? (s.score / max) * 100 : 0}%`, background: tc(s.score) }} />
                </div>
              </div>
              <span className="s-score" style={{ color: tc(s.score) }}>{s.score}</span>
              <div className="s-dot" style={{ background: tc(s.score), boxShadow: `0 0 5px ${tc(s.score)}` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Top20 Table ────────────────────────────────────────────
function Top20Table({ stocks }) {
  return (
    <div className="panel">
      <div className="panel-hd">
        <span className="panel-title">🏆 Top {stocks.length} 종목</span>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>티커</th><th>종합</th><th>모멘텀</th>
              <th>펀더멘털</th><th>P/E</th><th>ROE</th><th>섹터</th><th>1M</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, i) => {
              const ss = sectorStyle(s.sector);
              return (
                <tr key={s.ticker} style={{ animation: `fadeUp .3s ${i * 0.025}s both` }}>
                  <td><span className="rk">{s.rank}</span></td>
                  <td>
                    <span className="tkr">{s.ticker}</span>
                    <div className="co-name">{s.company}</div>
                  </td>
                  <td>
                    <div className="bar-cell">
                      <div className="bar-wrap"><div className="bar" style={{ width: `${s.total}%`, background: sc(s.total) }} /></div>
                      <span className="bar-num" style={{ color: sc(s.total) }}>{s.total}</span>
                    </div>
                  </td>
                  <td><span className="bar-num" style={{ color: sc(s.momentum), fontFamily: "var(--mono)", fontSize: 12 }}>{s.momentum}</span></td>
                  <td><span className="bar-num" style={{ color: sc(s.fundamental), fontFamily: "var(--mono)", fontSize: 12 }}>{s.fundamental}</span></td>
                  <td><span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{s.pe ?? "–"}</span></td>
                  <td><span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--green)" }}>{s.roe}</span></td>
                  <td>
                    <span className="tag" style={{ background: ss.bg, color: ss.color }}>
                      {(s.sector || "").split(" ")[0]}
                    </span>
                  </td>
                  <td>
                    <span className={s.change1m?.startsWith("+") ? "up" : "dn"}>{s.change1m}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  const [market, setMarket] = useState("US");
  const [weights, setWeights] = useState({ momentum: 60, fundamental: 25, sector: 15 });
  const [data, setData] = useState({ US: null, KR: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [updated, setUpdated] = useState(null);
  const fetched = useRef({ US: false, KR: false });

  const fetchData = useCallback(async (mkt, wt) => {
    setLoading(true);
    setError(null);
    try {
      const { momentum, fundamental, sector } = wt;
      const url = `${API_BASE}/api/screen?market=${mkt}&w_momentum=${momentum}&w_fundamental=${fundamental}&w_sector=${sector}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const json = await res.json();
      setData(prev => ({ ...prev, [mkt]: json }));
      setFromCache(json.from_cache || false);
      setUpdated(json.updated);
      fetched.current[mkt] = true;
    } catch (e) {
      setError(e.message || "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetched.current[market]) fetchData(market, weights);
  }, [market]);

  const handleApply = () => fetchData(market, weights);
  const handleRefresh = () => fetchData(market, weights);

  const cur = data[market];
  const total = weights.momentum + weights.fundamental + weights.sector;

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">

        {/* Header */}
        <div className="hdr">
          <div className="hdr-logo">QUANT·SCREEN</div>
          <div className="hdr-meta">
            {updated && <span>{updated}</span>}
            {fromCache && <span className="cache-pill">⚡ CACHED</span>}
            {!loading && <div className="live-pill"><div className="live-dot" />LIVE</div>}
            <button className="refresh-btn" disabled={loading} onClick={handleRefresh}>
              {loading ? "로딩..." : "↻"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[["US", "🇺🇸 미국 (S&P500/NASDAQ)"]].map(([k, lbl]) => (
            <button key={k} className={`tab ${market === k ? "on" : ""}`} onClick={() => setMarket(k)}>{lbl}</button>
          ))}
        </div>

        <div className="body">

          {/* API URL 미설정 경고 */}
          {API_BASE.includes("YOUR_RAILWAY") && (
            <div style={{
              background: "rgba(210,153,34,.08)", border: "1px solid rgba(210,153,34,.3)",
              borderRadius: 6, padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--yellow)"
            }}>
              ⚠ backend/main.py를 Railway에 배포 후, 이 파일 상단의 <strong>API_BASE</strong>를 배포 URL로 변경하세요.
            </div>
          )}

          {/* Weights */}
          <WeightPanel
            weights={weights}
            onChange={(k, v) => setWeights(p => ({ ...p, [k]: v }))}
            onApply={handleApply}
            loading={loading}
          />

          {/* Error */}
          {error && <div className="err">⚠ {error}<br /><small style={{opacity:.7}}>API 서버가 실행 중인지 확인하세요 → {API_BASE}</small></div>}

          {/* Loading */}
          {loading && (
            <div className="loading">
              <div className="spinner" />
              yfinance에서 실시간 데이터 수집 중...<br />
              <small style={{ opacity: .6 }}>종목 40개 × 1년치 데이터 (약 15~30초)</small>
            </div>
          )}

          {/* Data */}
          {!loading && cur && (
            <>
              <SummaryCards data={cur} />
              <SectorFlow sectors={cur.sectors} />
              {cur.top20?.length > 0
                ? <Top20Table stocks={cur.top20} />
                : <div className="empty">종목 데이터가 없습니다</div>
              }
            </>
          )}

          {!loading && !cur && !error && (
            <div className="empty">새로고침을 눌러 데이터를 불러오세요</div>
          )}

        </div>
      </div>
    </>
  );
}
