// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["shadcn-nuxt", "@vueuse/nuxt", "@nuxtjs/color-mode", "@nuxt/image", "@clerk/nuxt"],
  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },
  colorMode: {
    classSuffix: "",
  },
});
