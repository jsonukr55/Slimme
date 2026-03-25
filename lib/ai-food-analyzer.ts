import { NutrientInfo } from '@/types/food';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

interface AIFoodResult {
  name: string;
  servingSize: number;
  servingUnit: string;
  nutrients: NutrientInfo;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

interface AIAnalysisResponse {
  foods: AIFoodResult[];
  totalNutrients: NutrientInfo;
  summary: string;
}

const SYSTEM_PROMPT = `You are a nutrition expert AI. When given a food item, dish name, or recipe, analyze it and return accurate nutritional information.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "foods": [
    {
      "name": "Food name",
      "servingSize": 100,
      "servingUnit": "g",
      "nutrients": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sugar": 0,
        "sodium": 0
      },
      "confidence": "high",
      "notes": "Optional notes"
    }
  ],
  "totalNutrients": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 0
  },
  "summary": "Brief nutritional summary"
}

If the input is a recipe with multiple ingredients, break down each ingredient. If it's a dish name, estimate based on a standard serving. Be accurate with standard nutritional databases. All weights in grams, sodium in mg.`;

export async function analyzeFoodWithAI(query: string): Promise<AIAnalysisResponse> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  console.log('[AI] Using Groq llama-3.1-8b-instant');
  console.log('[AI] Query:', query);

  let response: Response;
  let responseText: string;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze the nutritional content of: ${query}` },
        ],
        max_tokens: 1024,
        temperature: 0.2,
      }),
    });
  } catch (networkErr) {
    console.error('[AI] Network error:', networkErr);
    throw new Error(`Network error: ${networkErr}`);
  }

  responseText = await response.text();
  console.log('[AI] HTTP status:', response.status);
  console.log('[AI] Response body:', responseText);

  if (!response.ok) {
    console.error('[AI] API error:', response.status, responseText);
    throw new Error(`Analysis failed (${response.status}): ${responseText}`);
  }

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch (parseErr) {
    console.error('[AI] JSON parse error:', parseErr, 'Raw:', responseText);
    throw new Error('Failed to parse API response');
  }

  const text = data.choices?.[0]?.message?.content;
  console.log('[AI] Extracted text:', text);

  if (!text) {
    console.error('[AI] No text in response:', JSON.stringify(data));
    throw new Error('No response from Groq');
  }

  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1];

  try {
    return JSON.parse(jsonStr.trim());
  } catch (jsonErr) {
    console.error('[AI] Result JSON parse error:', jsonErr, 'Raw text:', jsonStr);
    throw new Error('Failed to parse nutritional data from AI response');
  }
}
