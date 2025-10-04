import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto", fontFamily: "Inter, Arial, sans-serif" }}>
      {/* Hero */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>BlueChain AI</h1>
          <p style={{ marginTop: 8, color: "#444", maxWidth: 760 }}>
            Empowering Coastal Communities with AI & Blockchain — smart traceability,
            predictive insights, and sustainable growth for the blue economy.
          </p>

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button onClick={() => navigate('/signup')} style={{ padding: "8px 14px" }}>
              Join the pilot
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: "8px 14px" }}>
              Login
            </button>
            <a href="#get-involved" style={{ alignSelf: "center", marginLeft: 8 }}>Learn more</a>
          </div>
        </div>
        <div style={{ textAlign: "right", color: "#888" }}>
          <small>Demo • Built for coastal MSMEs</small>
        </div>
      </header>

      {/* Problem Statement */}
      <section style={{ marginTop: 36 }}>
        <h2>Problem</h2>
        <p>
          Coastal communities face multiple challenges that limit incomes and
          conservation efforts: lack of financing for fishers, high post-harvest
          losses, illegal fishing, and poor conservation funding. For example,
          up to <strong>40% of fish</strong> can spoil before reaching market in some value chains.
        </p>
      </section>

      {/* Solution */}
      <section style={{ marginTop: 28 }}>
        <h2>Our solution — BlueChain AI</h2>
        <p>
          BlueChain AI combines blockchain traceability with machine learning to
          connect MSMEs, buyers, and funders. We provide transparent supply
          chains, AI-powered analytics for credit and risk scoring, and
          tokenized incentives for verified conservation outcomes.
        </p>

        <p><strong>Tech stack highlights:</strong></p>
        <ul>
          <li>Blockchain for traceability and smart contracts</li>
          <li>AI for forecasting, credit scoring, and ecosystem monitoring</li>
        </ul>
      </section>

      {/* Key Features */}
      <section style={{ marginTop: 28 }}>
        <h2>Key features</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <div>✅</div>
            <h4>AI-powered credit scoring</h4>
            <p>Assess repayment probability from operational and environmental data.</p>
          </div>

          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <div>🔗</div>
            <h4>Blockchain-based traceability</h4>
            <p>Immutable records of catch, transfers and transactions.</p>
          </div>

          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <div>⚖️</div>
            <h4>Smart contracts for payments</h4>
            <p>Automated, conditional payments once criteria are verified.</p>
          </div>

          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <div>🌊</div>
            <h4>Real-time ecosystem monitoring</h4>
            <p>Sensors and AI detect changes and support conservation decisions.</p>
          </div>

          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <div>💚</div>
            <h4>Tokenized conservation credits</h4>
            <p>Create tradable credits tied to verified conservation outcomes.</p>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section style={{ marginTop: 28 }}>
        <h2>Impact</h2>
        <ul>
          <li>Coastal MSMEs: better financing, market access and reduced losses</li>
          <li>Tourists & donors: fund verified conservation and track impact</li>
          <li>Governments & NGOs: access transparent, auditable data for policy</li>
        </ul>
      </section>

      {/* How it works */}
      <section style={{ marginTop: 28 }}>
        <h2>How it works</h2>
        <ol>
          <li>MSME registers and logs activity (catch, sales, conservation actions)</li>
          <li>AI analyzes data and forecasts yields & creditworthiness</li>
          <li>Blockchain verifies records and smart contracts release payments</li>
          <li>Buyers or donors track impact via traceable tokens or dashboards</li>
        </ol>
      </section>

      {/* Get involved */}
      <section id="get-involved" style={{ marginTop: 28 }}>
        <h2>Get involved</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate('/signup')}>MSMEs: Sign up to join the network</button>
          <a href="mailto:hello@bluechain.ai" style={{ alignSelf: "center" }}>Investors: Explore partnership opportunities</a>
          <a href="mailto:partners@bluechain.ai" style={{ alignSelf: "center" }}>NGOs: Collaborate on conservation</a>
        </div>
      </section>

      {/* About / Team */}
      <section style={{ marginTop: 28 }}>
        <h2>About us</h2>
        <p>
          BlueChain AI is a locally-rooted initiative supporting coastal communities
          (including partners in Kajiado and coastal Kenya) with practical tech and
          partnerships. Our mission is to increase incomes, reduce waste and make
          conservation fundable and traceable.
        </p>
      </section>

      {/* Contact / Footer */}
      <footer style={{ marginTop: 36, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <h4>Contact</h4>
        <p>
          Email: <a href="mailto:hello@bluechain.ai">hello@bluechain.ai</a> • WhatsApp: +254 700 000 000
        </p>
        <p>
          Follow us on <a href="#">Twitter</a> • <a href="#">LinkedIn</a>
        </p>
        <p style={{ marginTop: 12, color: "#666" }}>© {new Date().getFullYear()} BlueChain AI</p>
      </footer>
    </div>
  );
}
