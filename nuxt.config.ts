import "./env";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@clerk/vue"],
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
  devServer: {
    port: 5011,
  },
});
