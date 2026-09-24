import { getApiKey } from "./auth.js";
import { loadConfig } from "./config.js";
import { ExtractionDeltaSchema, type ExtractionDelta } from "../types/index.js";

const EXTRACTION_SYSTEM_PROMPT = `You are Veeshree's background memory extraction engine.
Analyze the provided conversation transcript, coding log, or Git diff.
Extract structural memory updates strictly conforming to this JSON schema:
{
  "decisions": [
    {
      "title": "Short title of architectural choice",
      "decision": "Concrete implementation decided upon",
      "reason": "Why this choice was made",
      "alternatives_considered": ["Alternative 1", "Alternative 2"],
      "linked_files": ["src/path/to/file.ts"],
      "status": "active"
    }
  ],
  "current_state": {
    "current_feature": "Active feature name or focus",
    "completed_in_session": ["Accomplished milestone 1"],
    "next_immediate_steps": ["Next task to work on"]
  },
  "tasks": [
    { "task_name": "Name of task", "action": "add" | "complete" | "remove" }
  ],
  "constraints": [
    { "rule": "Constraint or security rule established", "type": "hard" | "soft" }
  ],
  "rejected_approaches": [
    { "approach": "Rejected technology or design", "reason": "Why it was discarded" }
  ],
  "discoveries": ["Key behavior or technical finding"]
}

Output ONLY valid raw JSON with no Markdown backticks or commentary.`;

export async function extractMemoryFromContent(
  content: string,
  rootDir: string = process.cwd(),
  customProvider?: string,
  customModel?: string
): Promise<ExtractionDelta> {
  const config = loadConfig(rootDir);
  const provider = customProvider || config.default_extractor?.provider || "gemini";
  const model = customModel || config.default_extractor?.model || "gemini-1.5-flash";

  // Provider dispatch
  if (provider === "gemini") {
    const key = getApiKey("gemini", rootDir);
    if (!key) throw new Error("Gemini API key not found. Set it using 'vee keys set gemini <KEY>' or GEMINI_API_KEY.");
    return callGemini(content, key, model);
  } else if (provider === "openai") {
    const key = getApiKey("openai", rootDir);
    if (!key) throw new Error("OpenAI API key not found. Set it using 'vee keys set openai <KEY>' or OPENAI_API_KEY.");
    return callOpenAI(content, key, model);
  } else if (provider === "ollama") {
    return callOllama(content, model);
  } else {
    throw new Error(`Unsupported extraction provider: ${provider}`);
  }
}

async function callGemini(content: string, apiKey: string, modelName: string): Promise<ExtractionDelta> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${EXTRACTION_SYSTEM_PROMPT}\n\nTRANSCRIPT / DIFF:\n${content}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) throw new Error("Empty response from Gemini API");

  const parsed = JSON.parse(rawJson);
  return ExtractionDeltaSchema.parse(parsed);
}

async function callOpenAI(content: string, apiKey: string, modelName: string): Promise<ExtractionDelta> {
  const url = "https://api.openai.com/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawJson = data.choices?.[0]?.message?.content;
  if (!rawJson) throw new Error("Empty response from OpenAI API");

  const parsed = JSON.parse(rawJson);
  return ExtractionDeltaSchema.parse(parsed);
}

async function callOllama(content: string, modelName: string): Promise<ExtractionDelta> {
  const url = "http://127.0.0.1:11434/api/generate";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName || "llama3",
      prompt: `${EXTRACTION_SYSTEM_PROMPT}\n\nTRANSCRIPT / DIFF:\n${content}`,
      format: "json",
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawJson = data.response;
  if (!rawJson) throw new Error("Empty response from Ollama API");

  const parsed = JSON.parse(rawJson);
  return ExtractionDeltaSchema.parse(parsed);
}
