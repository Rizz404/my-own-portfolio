import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/assets/main.css";

import App from "./App.vue";
import router from "./router";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { MotionPlugin } from "@vueuse/motion";
import i18n from "@/i18n";
import { useI18nStore } from "@/stores/i18nStores";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(MotionPlugin);
app.use(i18n);

// * Inisialisasi store i18n di sini biar locale langsung ke-sync sebelum first paint,
// tidak nunggu komponen pertama yang manggil useI18nStore()
useI18nStore();

app.mount("#app");
