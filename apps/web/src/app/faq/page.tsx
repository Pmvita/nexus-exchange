import Link from "next/link";

const FAQS = [
  {
    q: "What is Nexus Exchange?",
    a: "Nexus Exchange is a full-stack spot crypto exchange with a native matching engine, live order books, real-time WebSocket price feeds, and secure account management."
  },
  {
    q: "Which assets can I trade?",
    a: "You can trade BTC, ETH, SOL, XRP, ADA and other USDT-quoted spot markets. Use the Assets page to view the full list."
  },
  {
    q: "Do you offer real-time charts?",
    a: "Yes. The trading page streams live candlestick data and ticker updates over WebSocket for every active market."
  },
  {
    q: "How do I place an order?",
    a: "Select a market, choose Buy or Sell, pick Limit or Market order type, enter price and quantity, then submit. Open orders appear in the Open Orders panel."
  },
  {
    q: "Is my account secure?",
    a: "Accounts use JWT-based authentication. API keys are available for programmatic access. Never share your credentials."
  },
  {
    q: "Can I deposit and withdraw funds?",
    a: "Yes. Use the Deposit page to credit your account and the Withdraw page to request withdrawals (demo environment)."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
      <div className="px-4 py-12 md:py-20 mx-auto max-w-3xl">
        <div className="mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1a1a1e] border border-[#222226] text-xs text-nexus-accent font-mono mb-4">
            Help Center
          </span>
          <h1 className="text-3xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-nexus-muted mt-2">Everything you need to know about trading on Nexus Exchange.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <div key={i} className="bg-[#111114] border border-[#222226] rounded overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-4 text-left text-sm font-medium text-white hover:bg-[#1a1a1e] transition"
                aria-expanded="false"
              >
                <span>{item.q}</span>
                <span className="text-nexus-muted">▾</span>
              </button>
              <div className="px-4 pb-4 text-sm text-nexus-muted leading-relaxed border-t border-[#222226]">
                {item.a}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[#222226]">
          <h2 className="text-xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-nexus-muted mb-6">Contact support or visit our documentation.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="bg-[#1a1a1e] border border-[#222226] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#222226] transition">
              Terms & Conditions
            </Link>
            <Link href="/trade" className="bg-nexus-accent text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00bf8c] transition">
              Start Trading
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
