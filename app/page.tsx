"use client";
import { useState, useRef, useEffect } from "react";

const MODELS = [
  { id: "claude", name: "Claude", maker: "Anthropic", color: "#D4A853", bg: "#1A1208", accent: "#F5C842" },
  { id: "gemini", name: "Gemini", maker: "Google", color: "#4A90E2", bg: "#080E1A", accent: "#6BAEFF" },
  { id: "gpt", name: "GPT-4o", maker: "OpenAI", color: "#10A37F", bg: "#071A13", accent: "#1FD1A0" },
];

const STORAGE_KEY = "trio_api_keys";
function loadKeys(): Record<string,string> { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } }
function saveKeys(keys: Record<string,string>) { localStorage.setItem(STORAGE_KEY, JSON.stringify(keys)); }

async function callClaude(apiKey: string, prompt: string) {
  const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude", apiKey, prompt }) });
  if (!res.ok) throw new Error(`Claude error ${res.status}`);
  const data = await res.json(); return data.text;
}
async function callGemini(apiKey: string, prompt: string) {
  const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "gemini", apiKey, prompt }) });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json(); return data.text;
}
async function callGPT(apiKey: string, prompt: string) {
  const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt", apiKey, prompt }) });
  if (!res.ok) throw new Error(`GPT error ${res.status}`);
  const data = await res.json(); return data.text;
}

function DotsLoader({ color }: { color: string }) {
  return (
    <span style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
      {[0,1,2].map(i => <span key={i} style={{ width:"5px", height:"5px", borderRadius:"50%", background:color, animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
    </span>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);
  useEffect(() => {
    setDisplayed(""); idx.current = 0;
    if (!text) return;
    const interval = setInterval(() => {
      idx.current += 3;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(interval);
    }, 8);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}</span>;
}

function ResponseCard({ model, response, loading, error }: { model: typeof MODELS[0], response: string|null, loading: boolean, error: string|null }) {
  return (
    <div style={{ background: model.bg, border: `1px solid ${model.color}33`, borderRadius:"16px", padding:"20px", marginBottom:"16px", position:"relative", overflow:"hidden", minHeight:"120px" }}>
      <div style={{ position:"absolute", top:0, left:0, width:"3px", height:"100%", background:`linear-gradient(180deg, ${model.accent}, transparent)`, borderRadius:"16px 0 0 16px" }} />
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: loading ? model.accent : error ? "#ff4444" : model.color, boxShadow: loading ? `0 0 12px ${model.accent}` : "none", animation: loading ? "pulse 1s ease-in-out infinite" : "none" }} />
        <span style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:"15px", fontWeight:"600", color:model.accent }}>{model.name}</span>
        <span style={{ fontSize:"11px", color:model.color+"88", fontFamily:"monospace" }}>{model.maker}</span>
      </div>
      <div style={{ fontSize:"14px", lineHeight:"1.7", color: loading ? model.color+"66" : error ? "#ff6666" : "#E8E0D0", whiteSpace:"pre-wrap" }}>
        {loading ? <span style={{ display:"flex", alignItems:"center", gap:"8px" }}><span style={{ color:model.accent }}>thinking</span><DotsLoader color={model.accent} /></span>
          : error ? `⚠ ${error}`
          : response ? <TypewriterText text={response} />
          : <span style={{ color:model.color+"44", fontStyle:"italic" }}>awaiting your question…</span>}
      </div>
    </div>
  );
}

function KeysModal({ keys, onSave, onClose }: { keys: Record<string,string>, onSave: (k:Record<string,string>)=>void, onClose: ()=>void }) {
  const [draft, setDraft] = useState({ ...keys });
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, display:"flex", alignItems:"flex-end" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:"100%", background:"#0F0F0F", borderRadius:"24px 24px 0 0", padding:"28px 24px 40px", border:"1px solid #2a2a2a" }}>
        <div style={{ width:"40px", height:"4px", background:"#333", borderRadius:"2px", margin:"0 auto 24px" }} />
        <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:"20px", color:"#E8E0D0", marginBottom:"6px" }}>API Keys</h2>
        <p style={{ fontSize:"12px", color:"#666", marginBottom:"24px", fontFamily:"monospace" }}>Stored locally on your device only</p>
        {MODELS.map(m => (
          <div key={m.id} style={{ marginBottom:"16px" }}>
            <label style={{ display:"block", fontSize:"11px", color:m.accent, fontFamily:"monospace", letterSpacing:"0.1em", marginBottom:"6px", textTransform:"uppercase" }}>{m.name} · {m.maker}</label>
            <input type="password" value={draft[m.id]||""} onChange={e => setDraft({...draft,[m.id]:e.target.value})} placeholder={`Enter ${m.name} API key…`}
              style={{ width:"100%", background:m.bg, border:`1px solid ${m.color}44`,
