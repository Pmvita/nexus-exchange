import Link from "next/link";

const FEATURES = [
  {
    title: "Real-time matching engine",
    desc: "Low-latency order matching with live order books and trade streams over WebSocket."
  },
  {
    title: "Spot trading",
    desc: "Place limit and market orders across BTC, ETH, SOL, XRP, ADA and more."
  },
  {
    title: "Live charts",
    desc: "Streaming candlestick data and real-time price tickers for every market."
  },
  {
    title: "Secure accounts",
    desc: "JWT-based authentication, API keys, and encrypted credential handling."
  }
];

const MARKETS = [
  { symbol: "BTCUSDT", price: "67,240.50", change: "+2.45%" },
  { symbol: "ETHUSDT", price: "3,450.20", change: "-1.12%" },
  { symbol: "SOLUSDT", price: "142.80", change: "+5.33%" },
  { symbol: "XRPUSDT", price: "0.62", change: "-0.45%" },
  { symbol: "ADAUSDT", price: "0.89", change: "+0.78%" }
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <section className="relative overflow-hidden bg-[#0a0a0c] border-b border-[#222226]">
        <div className="relative px-4 py-12 md:py-20 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-[#1a1a1e] border border-[#222226] text-xs text-nexus-accent font-mono mb-4">
              Spot Trading • Matching Engine • Real-time WS
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
              Trade crypto with<br />
              <span className="text-nexus-accent">institutional-grade speed</span>
            </h1>
            <p className="text-nexus-muted text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              A full-stack crypto exchange with a native matching engine, live order books, real-time
              price feeds, and secure account management. Built for spot trading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/trade"
                className="bg-nexus-accent text-black font-bold px-6 py-3 rounded-lg text-base hover:bg-[#00bf8c] transition"
              >
                Start Trading
              </Link>
              <Link
                href="/login"
                className="bg-[#1a1a1e] border border-[#222226] text-white font-bold px-6 py-3 rounded-lg text-base hover:bg-[#222226] transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-16 border-t border-[#222226] pt-12">
            <h2 className="text-sm font-bold text-nexus-muted tracking-wider uppercase mb-8">Live Markets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {MARKETS.map((m) => (
                <div key={m.symbol} className="bg-[#111114] border border-[#222226] rounded p-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono font-bold text-sm">{m.symbol}</span>
                    <span className={`text-xs ${m.change.startsWith("+") ? "text-nexus-up" : "text-nexus-down"}`}>
                      {m.change}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-lg">{m.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24 mx-auto max-w-7xl">
        <h2 className="text-2xl font-bold text-white mb-12">Built for traders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#111114] border border-[#222226] rounded p-6">
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-nexus-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#111114] border-b border-[#222226] px-4 py-16 mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Ready to start trading?</h2>
          <p className="text-nexus-muted mb-8 max-w-md mx-auto">
            Create an account, deposit funds, and begin trading spot markets in seconds.
          </p>
          <Link
            href="/trade"
            className="bg-nexus-accent text-black font-bold px-6 py-3 rounded-lg text-base hover:bg-[#00bf8c] transition"
          >
            Open Exchange
          </Link>
        </div>
      </section>
    </div>
  );
}
