import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { model, apiKey, prompt } = body;

  if (!apiKey) {
    return NextResponse.json({ text: `No API key provided for ${model}` }, { status: 200 });
  }

  try {
    if (model === "claude") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ text: `Claude API error: ${JSON.stringify(data)}` });
      return NextResponse.json({ text: data.content?.[0]?.text || "" });
    }

    if (model === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ text: `Gemini API error: ${JSON.stringify(data)}` });
      return NextResponse.json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || "" });
    }

    if (model === "gpt") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1024,
        }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json({ text: `GPT API error: ${JSON.stringify(data)}` });
      return NextResponse.json({ text: data.choices?.[0]?.message?.content || "" });
    }

    return NextResponse.json({ text: `Unknown model: ${model}` });
  } catch (err) {
    return NextResponse.json({ text: `Exception for ${model}: ${err}` });
  }
}
