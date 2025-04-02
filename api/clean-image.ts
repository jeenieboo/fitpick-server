export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const { imageUrl } = await req.json();

    const response = await fetch("https://api.openai.com/v1/images/edit", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: "Isolated product photo of this clothing item with the background removed. White or transparent background, studio lighting.",
        image: imageUrl,
        n: 1,
        size: "512x512",
        response_format: "url"
      }),
    });

    const result = await response.json();

    if (result?.data?.[0]?.url) {
      return new Response(JSON.stringify({ url: result.data[0].url }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      console.error("OpenAI response error:", result);
      return new Response("OpenAI failed", { status: 500 });
    }

  } catch (err) {
    console.error("API error:", err);
    return new Response("Server error", { status: 500 });
  }
}
