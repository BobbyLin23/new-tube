import { Client } from "@upstash/workflow";
import { env } from "~~/env";

export function getQStashConfig() {
  const {
    QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY,
    UPSTASH_WORKFLOW_URL,
  } = env;

  if (
    !QSTASH_TOKEN ||
    !QSTASH_CURRENT_SIGNING_KEY ||
    !QSTASH_NEXT_SIGNING_KEY ||
    !UPSTASH_WORKFLOW_URL
  ) {
    throw new Error("AI generation is not configured. Set the QStash environment variables.");
  }

  return {
    QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY,
    UPSTASH_WORKFLOW_URL,
    QSTASH_URL: env.QSTASH_URL,
  };
}

export function getWorkflowConfig() {
  const config = getQStashConfig();
  if (!env.DEEPSEEK_API_KEY) throw new Error("DeepSeek is not configured");
  return { ...config, DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY, DEEPSEEK_MODEL: env.DEEPSEEK_MODEL };
}

export function getThumbnailGenerationConfig() {
  const config = getQStashConfig();
  if (!env.MINIMAX_API_KEY || !env.R2_PUBLIC_URL)
    throw new Error("Set MINIMAX_API_KEY and R2_PUBLIC_URL to generate thumbnails");
  return {
    ...config,
    MINIMAX_API_KEY: env.MINIMAX_API_KEY,
    MINIMAX_API_HOST: env.MINIMAX_API_HOST,
  };
}

export function getWorkflowClient() {
  const config = getQStashConfig();
  return new Client({ token: config.QSTASH_TOKEN, baseUrl: config.QSTASH_URL });
}

export function generationLabel(userId: string, videoId: string) {
  return `video-ai.${userId}.${videoId}`;
}
