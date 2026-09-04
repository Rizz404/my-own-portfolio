import { createRouter, createWebHistory } from "vue-router";
import { authStores } from "@/stores/authStores";
import { useI18nStore } from "@/stores/i18nStores";
import type { SupportedLocale } from "@/i18n";
import { userRoutes } from "@/router/routes/user";
import { adminRoutes } from "@/router/routes/admin";

// * "layout" nentuin komponen shell yang dipakein App.vue (lihat App.vue):
declare module "vue-router" {
  interface RouteMeta {
    layout: "user" | "admin" | "blank";
    requiresAuth?: boolean;
    // * i18n key buat document.title (lihat App.vue + useDocumentTitle), mis.
    // "views.admin.ProjectListView.title" -> t() jadi "Projects - Rizqiansyah".
    // Opsional - route tanpa ini jatuh ke "Rizqiansyah" polos.
    titleKey?: string;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: "smooth" };
  },
  routes: [
    ...userRoutes,
    ...adminRoutes,
    // * Jaring pengaman buat SEMUA path publik yang belum punya prefix locale (mis. link
    // lama tanpa /en atau /id, atau orang ngetik manual "/about") - nambahin prefix locale
    // yang lagi kepake (dari localePreference, bisa jatuh ke bahasa browser kalau "system")
    // terus redirect ke situ. Sengaja ditaruh paling akhir: "/admin/**" (static) dan
    // "/:locale(en|id)/**" (custom regex) tetep menang duluan di path-ranking vue-router,
    // catch-all generik ini cuma kesentuh kalau dua itu gak ada yang cocok.
    {
      path: "/:pathMatch(.*)*",
      redirect: (to) => {
        const i18nStore = useI18nStore();
        const suffix = to.path === "/" ? "" : to.path;
        return { path: `/${i18nStore.currentLocale}${suffix}`, query: to.query, hash: to.hash };
      },
    },
  ],
});

// * Guard-nya sengaja panggil authStores()/useI18nStore() di dalam callback (bukan di
// top-level modul), karena Pinia baru aktif setelah app.use(createPinia()) jalan di
// main.ts - modul router ini sendiri diimport (dan dieksekusi) sebelum itu.
router.beforeEach((to) => {
  // * Ini jaring pengaman buat kasus route yang typo lupa nulis `meta` sama sekali
  if (import.meta.env.DEV && !to.meta.layout) {
    console.warn(
      `[router] Route "${String(to.name)}" (${to.path}) is missing meta.layout - falling back to UserLayout.`,
    );
  }

  const i18nStore = useI18nStore();

  // * URL adalah source of truth buat bahasa begitu ada prefix locale-nya (mis. paste
  // link /id/about langsung) - nimpa localePreference (termasuk kalau sebelumnya "system")
  // biar UI & header Accept-Language langsung ikut locale di URL, bukan nunggu di-switch manual.
  const localeParam = to.params.locale;
  if (typeof localeParam === "string" && i18nStore.localePreference !== localeParam) {
    i18nStore.setLocalePreference(localeParam as SupportedLocale);
  }

  const authStore = authStores();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "AdminLogin", query: { redirect: to.fullPath } };
  }

  if (to.name === "AdminLogin" && authStore.isAuthenticated) {
    return { name: "AdminDashboard" };
  }

  return true;
});

export default router;
