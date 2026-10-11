import { resolveActiveEngine } from "./engine-resolver.js";
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
  const engine = await resolveActiveEngine(rootDir, customProvider, customModel);

  if (engine.provider === "gemini") {
    return callGemini(content, engine.apiKey!, engine.model);
  } else if (engine.provider === "openai") {
    return callOpenAI(content, engine.apiKey!, engine.model);
  } else if (engine.provider === "groq" || engine.provider === "nvidia") {
    return callOpenAICompatible(engine.endpoint!, content, engine.apiKey!, engine.model, engine.provider);
  } else if (engine.provider === "ollama") {
    return callOllama(content, engine.model, engine.endpoint);
  } else if (engine.provider === "lmstudio") {
    return callLmStudio(content, engine.model, engine.endpoint);
  } else {
    throw new Error(`Unsupported extraction provider: ${(engine as any).provider}`);
  }
}

function cleanAndParseJson(raw: string): any {
  let cleaned = raw.trim();
  // Strip Markdown JSON codeblocks
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Extract JSON payload between outer braces if model included conversational preamble
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
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

  const parsed = cleanAndParseJson(rawJson);
  return ExtractionDeltaSchema.parse(parsed);
}

async function callOpenAICompatible(
  url: string,
  content: string,
  apiKey: string,
  modelName: string,
  providerName: string = "OpenAI"
): Promise<ExtractionDelta> {
  const executeCall = async (withFormat: boolean) => {
    const body: any = {
      model: modelName,
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content },
      ],
    };
    if (withFormat) {
      body.response_format = { type: "json_object" };
    }
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  };

  // Attempt with JSON response_format
  let response = await executeCall(true);

  // If endpoint/model does not support response_format (e.g. certain NVIDIA NIM or Groq setups)
  if (!response.ok && response.status === 400) {
    const retry = await executeCall(false);
    if (retry.ok) {
      response = retry;
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${providerName} API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawJson = data.choices?.[0]?.message?.content;
  if (!rawJson) throw new Error(`Empty response from ${providerName} API`);

  const parsed = cleanAndParseJson(rawJson);
  return ExtractionDeltaSchema.parse(parsed);
}

async function callOpenAI(content: string, apiKey: string, modelName: string): Promise<ExtractionDelta> {
  return callOpenAICompatible("https://api.openai.com/v1/chat/completions", content, apiKey, modelName, "OpenAI");
}

async function callOllama(content: string, modelName: string, endpoint: string = "http://127.0.0.1:11434"): Promise<ExtractionDelta> {
  const url = `${endpoint}/api/generate`;
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

  const parsed = cleanAndParseJson(rawJson);
  return ExtractionDeltaSchema.parse(parsed);
}

async function callLmStudio(content: string, modelName: string, endpoint: string = "http://127.0.0.1:1234"): Promise<ExtractionDelta> {
  const url = `${endpoint}/v1/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    throw new Error(`LM Studio API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawJson = data.choices?.[0]?.message?.content;
  if (!rawJson) throw new Error("Empty response from LM Studio API");

  const parsed = cleanAndParseJson(rawJson);
  return ExtractionDeltaSchema.parse(parsed);
}
