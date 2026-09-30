import { z } from "zod";

const responseSchema = z.object({
  base_resp: z.object({ status_code: z.number().int() }),
  data: z.object({ image_urls: z.array(z.url({ protocol: /^https$/ })).optional() }).nullish(),
  metadata: z.object({ failed_count: z.union([z.number(), z.string()]).optional() }).optional(),
});

const errorMessages: Record<number, string> = {
  1000: "Provider error. Try again later",
  1001: "Request timed out. Try again later",
  1002: "Rate limit reached. Try again later",
  1004: "Authentication failed. Check MINIMAX_API_KEY and MINIMAX_API_HOST",
  1008: "Insufficient MiniMax API balance. Check your account balance",
  1024: "Provider internal error. Try again later",
  1026: "Prompt blocked by content filtering. Try a different prompt",
  1027: "Generated image blocked by content filtering. Try a different prompt",
  2013: "Invalid image generation parameters",
  2049: "Invalid API key. Check MINIMAX_API_KEY and MINIMAX_API_HOST, then restart Nuxt",
};

export function parseMiniMaxImageResponse(body: unknown, status: number): string {
  // Workflow callbacks may provide JSON either as an object or as a response string.
  let payload = body;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      throw new Error(`MiniMax returned invalid JSON (HTTP ${status})`);
    }
  }

  // Parse the status before image data: provider failures can also return HTTP 200.
  const providerStatus = responseSchema.shape.base_resp.safeParse(
    payload && typeof payload === "object" && "base_resp" in payload
      ? payload.base_resp
      : undefined,
  );
  if (providerStatus.success && providerStatus.data.status_code !== 0) {
    const code = providerStatus.data.status_code;
    throw new Error(`MiniMax error ${code}: ${errorMessages[code] ?? "Image generation failed"}`);
  }
  if (status < 200 || status >= 300) throw new Error(`MiniMax generation failed (HTTP ${status})`);

  const result = responseSchema.safeParse(payload);
  if (!result.success) throw new Error("MiniMax returned an invalid image response");
  const imageUrl = result.data.data?.image_urls?.[0];
  if (!imageUrl) {
    if (Number(result.data.metadata?.failed_count) > 0)
      throw new Error("MiniMax blocked the generated image. Try a different prompt");
    throw new Error("MiniMax returned no image URLs");
  }
  return imageUrl;
}
