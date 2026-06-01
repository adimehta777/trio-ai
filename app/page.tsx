"use client";
import { useState, useRef, useEffect } from "react";

const MODELS = [
  { id: "claude", name: "Claude", maker: "Anthropic", color: "#D4A853", bg: "#1A1208", accent: "#F5C842" },
  { id: "gemini", name: "Gemini", maker: "Google", color: "#4A90E2", bg: "#080E1A", accent: "#6BAEFF" },
  { id: "gpt", name: "GPT-4o", maker: "OpenAI", color: "#10A37F", bg: "#071A13", accent: "#1FD1A0" },
];

const STORAGE_KEY = "trio_api_keys";
function loadKeys(): Record<string,string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveKeys(keys: Record<string,string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

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
              style={{ width:"100%", background:m.bg, border:`1px solid ${m.color}44`, borderRadius:"10px", padding:"12px 14px", color:"#E8E0D0", fontSize:"13px", fontFamily:"monospace", outline:"none", boxSizing:"border-box" }} />
          </div>
        ))}
        <button onClick={() => { saveKeys(draft); onSave(draft); onClose(); }}
          style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg, #D4A853, #F5C842)", border:"none", borderRadius:"12px", color:"#0A0800", fontFamily:"'Playfair Display', Georgia, serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
          Save Keys
        </button>
        <p style={{ fontSize:"11px", color:"#444", textAlign:"center", marginTop:"16px" }}>
          console.anthropic.com · aistudio.google.com · platform.openai.com
        </p>
      </div>
    </div>
  );
}

export default function TrioAI() {
  const [keys, setKeys] = useState<Record<string,string>>({});
  const [showKeys, setShowKeys] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<Record<string,string|null>>({ claude:null, gemini:null, gpt:null });
  const [loading, setLoading] = useState<Record<string,boolean>>({ claude:false, gemini:false, gpt:false });
  const [errors, setErrors] = useState<Record<string,string|null>>({ claude:null, gemini:null, gpt:null });
  const [hasAsked, setHasAsked] = useState(false);
  const [ready, setReady] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setKeys(loadKeys());
    setReady(true);
  }, []);

  const keysSet = MODELS.filter(m => keys[m.id]).length;

  function handleSaveKeys(newKeys: Record<string,string>) {
    saveKeys(newKeys);
    setKeys(newKeys);
  }

  async function handleAsk() {
    if (!prompt.trim()) return;
    const currentKeys = loadKeys();
    setHasAsked(true);
    setResponses({ claude:null, gemini:null, gpt:null });
    setErrors({ claude:null, gemini:null, gpt:null });
    setLoading({ claude:true, gemini:true, gpt:true });
    const runners = [
      { id:"claude", fn: () => callClaude(currentKeys.claude, prompt) },
      { id:"gemini", fn: () => callGemini(currentKeys.gemini, prompt) },
      { id:"gpt",    fn: () => callGPT(currentKeys.gpt, prompt) },
    ];
    runners.forEach(({ id, fn }) => {
      if (!currentKeys[id]) {
        setLoading(l => ({...l,[id]:false}));
        setErrors(e => ({...e,[id]:"No API key — tap ⚙ to add one"}));
        return;
      }
      fn().then(text => { setResponses(r => ({...r,[id]:text})); setLoading(l => ({...l,[id]:false})); })
         .catch(err => { setErrors(e => ({...e,[id]:err.message})); setLoading(l => ({...l,[id]:false})); });
    });
  }

  const anyLoading = Object.values(loading).some(Boolean);

  if (!ready) return <div style={{ background:"#080808", minHeight:"100vh" }} />;

  return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#E8E0D0", maxWidth:"480px", margin:"0 auto", padding:"0 0 80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        textarea:focus, input:focus { outline:none; }
      `}</style>
      <div style={{ padding:"52px 24px 20px", position:"sticky", top:0, background:"#080808", zIndex:10, borderBottom:"1px solid #1a1a1a" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:"28px", fontWeight:"700", color:"#E8E0D0", margin:0 }}>Trio</h1>
            <p style={{ fontSize:"12px", color:"#555", margin:"4px 0 0", fontFamily:"monospace" }}>ASK ONCE · HEAR THREE</p>
          </div>
          <button onClick={() => setShowKeys(true)} style={{ background:"#1A1208", border:"1px solid #D4A85366", borderRadius:"10px", padding:"10px 14px", color:"#D4A853", fontSize:"13px", cursor:"pointer", fontFamily:"monospace" }}>
            ⚙ {keysSet}/3
          </button>
        </div>
        <div style={{ display:"flex", gap:"8px", marginTop:"16px" }}>
          {MODELS.map(m => (
            <div key={m.id} style={{ flex:1, padding:"6px 0", borderRadius:"8px", background: keys[m.id] ? m.bg : "#111", border:`1px solid ${keys[m.id] ? m.color+"44" : "#222"}`, textAlign:"center", fontSize:"11px", color: keys[m.id] ? m.accent : "#444", fontFamily:"monospace" }}>
              {m.name}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"20px 16px 0" }}>
        {!hasAsked && (
          <div style={{ textAlign:"center", padding:"48px 24px", animation:"fadeIn 0.6s ease forwards" }}>
            <div style={{ display:"flex", justifyContent:"center", gap:"12px", marginBottom:"24px" }}>
              {MODELS.map(m => <div key={m.id} style={{ width:"14px", height:"14px", borderRadius:"50%", background:m.color, opacity:0.4 }} />)}
            </div>
            <p style={{ fontFamily:"'Playfair Display', Georgia, serif", fontSize:"18px", color:"#3a3a3a", fontStyle:"italic" }}>One question, three minds.</p>
            <p style={{ fontSize:"13px", color:"#2a2a2a", marginTop:"8px" }}>Add your API keys above, then ask anything.</p>
          </div>
        )}
        {hasAsked && MODELS.map(m => (
          <div key={m.id} style={{ animation:"fadeIn 0.4s ease forwards" }}>
            <ResponseCard model={m} response={responses[m.id]} loading={loading[m.id]} error={errors[m.id]} />
          </div>
        ))}
      </div>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:"480px", background:"#0D0D0D", borderTop:"1px solid #1a1a1a", padding:"12px 16px 28px" }}>
        <div style={{ display:"flex", gap:"10px", alignItems:"flex-end", background:"#141414", border:"1px solid #2a2a2a", borderRadius:"16px", padding:"10px 10px 10px 16px" }}>
          <textarea ref={textareaRef} value={prompt} onChange={e => { setPrompt(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }}
            onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleAsk();} }}
            placeholder="Ask all three at once…" rows={1}
            style={{ flex:1, background:"transparent", border:"none", color:"#E8E0D0", fontSize:"15px", resize:"none", lineHeight:"1.5", maxHeight:"120px" }} />
          <button onClick={handleAsk} disabled={anyLoading||!prompt.trim()}
            style={{ width:"40px", height:"40px", borderRadius:"12px", background: anyLoading||!prompt.trim() ? "#1a1a1a" : "linear-gradient(135deg, #D4A853, #F5C842)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {anyLoading ? <DotsLoader color="#555" /> : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L14 8M9 3L14 8L9 13" stroke={!prompt.trim() ? "#444" : "#0A0800"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {showKeys && <KeysModal keys={keys} onSave={handleSaveKeys} onClose={() => setShowKeys(false)} />}
    </div>
  );
}
