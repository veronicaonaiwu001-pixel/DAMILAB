import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  prompt: string;
  code?: string;
  error?: string;
  mode?: 'explain' | 'fix' | 'generate-prompt';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, code, error, mode = 'explain' }: RequestBody = await req.json();

    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!apiKey || !baseUrl) {
      throw new Error('OnSpace AI not configured');
    }

    let systemPrompt = '';
    let userMessage = '';

    switch (mode) {
      case 'explain':
        systemPrompt = 'You are an expert code explainer. Provide clear, line-by-line explanations of code for developers at all skill levels. Use markdown formatting for better readability.';
        userMessage = `Explain this code in detail:\n\n\`\`\`\n${code}\n\`\`\`\n\nAdditional context: ${prompt || 'None'}`;
        break;

      case 'fix':
        systemPrompt = 'You are an expert debugger. Analyze the code and error, identify the root cause, and provide a corrected version with explanations.';
        userMessage = `Fix this code:\n\n\`\`\`\n${code}\n\`\`\`\n\nError message:\n${error}\n\nAdditional context: ${prompt || 'None'}`;
        break;

      case 'generate-prompt':
        systemPrompt = 'You are an expert prompt engineer. Generate highly effective, specific, and well-structured prompts for AI models based on user requirements.';
        userMessage = `Generate an optimized AI prompt for: ${prompt}`;
        break;

      default:
        userMessage = prompt;
    }

    console.log(`AI Request Mode: ${mode}`);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OnSpace AI Error:', errorText);
      throw new Error(`OnSpace AI request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || 'No response generated';

    return new Response(
      JSON.stringify({ result, success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-tools function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
