export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
      <div className="px-4 py-12 md:py-20 mx-auto max-w-3xl">
        <span className="inline-block px-3 py-1 rounded-full bg-[#1a1a1e] border border-[#222226] text-xs text-nexus-accent font-mono mb-4">
          Legal
        </span>
        <h1 className="text-3xl font-bold text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-nexus-muted mb-8">Last updated: October 30, 2026</p>

        <div className="bg-[#111114] border border-[#222226] rounded-lg p-8 text-sm text-nexus-muted leading-relaxed space-y-6">
          <p>
            Welcome to Nexus Exchange. These Terms &amp; Conditions govern your use of our platform and
            services. By accessing or using Nexus Exchange, you agree to be bound by these terms.
          </p>
          <p>
            <strong className="text-white">1. Eligibility</strong> You must be at least 18 years old to
            create an account and use our services.
          </p>
          <p>
            <strong className="text-white">2. Accounts</strong> You are responsible for maintaining the
            confidentiality of your account credentials and for all activity under your account.
          </p>
          <p>
            <strong className="text-white">3. Trading</strong> Spot trading involves substantial risk of
            loss. You are solely responsible for your trading decisions and any resulting losses.
          </p>
          <p>
            <strong className="text-white">4. Deposits &amp; Withdrawals</strong> Deposits and withdrawals
            are subject to platform limits and verification. Processing times may vary by asset.
          </p>
          <p>
            <strong className="text-white">5. API Access</strong> API keys are provided for programmatic
            access. Rate limits apply and abuse may result in key revocation.
          </p>
          <p>
            <strong className="text-white">6. Termination</strong> We may suspend or terminate accounts
            that violate these terms or engage in fraudulent or manipulative activity.
          </p>
          <p>
            <strong className="text-white">7. Disclaimer</strong> Nexus Exchange is a demonstration
            platform. It does not constitute financial advice, and cryptocurrency trading carries risk.
          </p>
          <p>
            <strong className="text-white">8. Governing Law</strong> These terms are governed by the laws
            of the jurisdiction in which Nexus Exchange operates.
          </p>
        </div>

        <p className="mt-8 text-xs text-[#66666e]">
          © 2026 Nexus Exchange. All rights reserved. Demo environment.
        </p>
      </div>
    </div>
  );
}
