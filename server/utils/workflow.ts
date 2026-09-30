import { Client } from "@upstash/workflow";
import { env } from "~~/env";

export function getWorkflowConfig() {
  const {
    QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY,
    DEEPSEEK_API_KEY,
    UPSTASH_WORKFLOW_URL,
  } = env;

  if (
    !QSTASH_TOKEN ||
    !QSTASH_CURRENT_SIGNING_KEY ||
    !QSTASH_NEXT_SIGNING_KEY ||
    !DEEPSEEK_API_KEY ||
    !UPSTASH_WORKFLOW_URL
  ) {
    throw new Error(
      "AI generation is not configured. Set the DeepSeek and QStash environment variables.",
    );
  }

  return {
    QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY,
    DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: env.DEEPSEEK_MODEL,
    UPSTASH_WORKFLOW_URL,
    QSTASH_URL: env.QSTASH_URL,
  };
}

export function getWorkflowClient() {
  const config = getWorkflowConfig();
  return new Client({ token: config.QSTASH_TOKEN, baseUrl: config.QSTASH_URL });
}

export function generationLabel(userId: string, videoId: string) {
  return `video-ai.${userId}.${videoId}`;
}
