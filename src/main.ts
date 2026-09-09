import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/assets/main.css";

import App from "./App.vue";
import router from "./router";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { MotionPlugin } from "@vueuse/motion";
import i18n from "@/i18n";
import { useI18nStore } from "@/stores/i18nStores";
import { authStores } from "@/stores/authStores";
import { setRefreshHandler, setUnauthorizedHandler } from "@/api/axiosClient";
import { refreshAccessToken } from "@/composables/queries/useAuth";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(MotionPlugin);
app.use(i18n);

// * Inisialisasi store i18n di sini biar locale langsung ke-sync sebelum first paint,
// tidak nunggu komponen pertama yang manggil useI18nStore()
useI18nStore();

// * Kalau ada request yang balikin 401 (token expired/invalid), langsung logout & lempar
// ke halaman login admin - tanpa ini, sesi yang tokennya udah expired tetap "nyangkut"
// di halaman admin sampai user pindah halaman sendiri dan kena route guard.
const authStore = authStores();

// * Waktu accessToken (umur 3 hari) expired, request bakal balik 401 - axiosClient minta
// accessToken baru lewat refreshAccessToken() selama refreshToken (umur 1 bulan) masih valid.
setRefreshHandler(refreshAccessToken);

setUnauthorizedHandler(() => {
  if (!authStore.isAuthenticated) return;

  authStore.logout();
  router.push({ name: "AdminLogin", query: { redirect: router.currentRoute.value.fullPath } });
});

app.mount("#app");
