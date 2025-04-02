export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No image URL provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Isolated product photo of a clothing item with a clean white or transparent background. Centered, studio lighting, high clarity.',
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      }),
    });

    const result = await openaiRes.json();

    if (result?.data?.[0]?.url) {
      return new Response(JSON.stringify({ url: result.data[0].url }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.error('OpenAI error:', result);
      return new Response(JSON.stringify({ error: 'OpenAI generation failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('Server crash:', err);
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
