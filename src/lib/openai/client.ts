import OpenAI from "openai"

let _client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _client
}

export const MODEL = "gpt-4o-mini"
export const REASONING_MODEL = "gpt-4o"

export interface AIRequestOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options: AIRequestOptions = {}
): Promise<string> {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: options.model || MODEL,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens || 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  })

  return response.choices[0]?.message?.content || ""
}

export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  options: AIRequestOptions = {}
): Promise<T> {
  const openai = getOpenAI()

  const response = await openai.chat.completions.create({
    model: options.model || MODEL,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens || 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  })

  const text = response.choices[0]?.message?.content || "{}"
  return JSON.parse(text) as T
}
