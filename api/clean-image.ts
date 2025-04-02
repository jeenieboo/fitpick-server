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

    const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "df8b0d4c14c93f6e0e44a8572ef3f9449a63d6f10d58fa2c4db1ac75c9415b43", // Replicate background-removal model
        input: {
          image: imageUrl
        }
      }),
    });

    const prediction = await replicateRes.json();

    if (prediction?.urls?.get) {
      // The result isn't ready instantly; you need to poll the `get` URL.
      const getRes = await fetch(prediction.urls.get);
      const finalResult = await getRes.json();

      if (finalResult?.output) {
        return new Response(JSON.stringify({ url: finalResult.output }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    console.error('Replicate error:', prediction);
    return new Response(JSON.stringify({ error: 'Background removal failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Server crash:', err);
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
