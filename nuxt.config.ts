import "./env";
import tailwindcss from "@tailwindcss/vite";
import { shadcn } from "@clerk/ui/themes";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("mux-"),
    },
  },
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["jaybird-light-badger.ngrok-free.app"],
    },
  },
  modules: [
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/image",
    "@clerk/nuxt",
    "@pinia/nuxt",
    "@pinia/colada-nuxt",
  ],
  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },
  colorMode: {
    classSuffix: "",
  },
  clerk: {
    appearance: {
      theme: shadcn,
    },
  },
  runtimeConfig: {
    public: {
      // App origin used for share links; overridden by NUXT_PUBLIC_APP_URL.
      // Must include the protocol (e.g. https://example.com).
      appUrl: "",
    },
  },
  devServer: {
    port: 5011,
  },
});
