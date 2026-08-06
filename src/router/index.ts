import { createRouter, createWebHistory } from "vue-router";
import { authStores } from "@/stores/authStores";
import { userRoutes } from "@/router/routes/user";
import { adminRoutes } from "@/router/routes/admin";

// * "layout" nentuin komponen shell yang dipakein App.vue (lihat App.vue):
declare module "vue-router" {
  interface RouteMeta {
    layout: "user" | "admin" | "blank";
    requiresAuth?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: "smooth" };
  },
  routes: [...userRoutes, ...adminRoutes],
});

// * Guard-nya sengaja panggil authStores() di dalam callback (bukan di top-level modul),
// karena Pinia baru aktif setelah app.use(createPinia()) jalan di main.ts - modul router
// ini sendiri diimport (dan dieksekusi) sebelum itu.
router.beforeEach((to) => {
  // * Ini jaring pengaman buat kasus route yang typo lupa nulis `meta` sama sekali
  if (import.meta.env.DEV && !to.meta.layout) {
    console.warn(
      `[router] Route "${String(to.name)}" (${to.path}) is missing meta.layout - falling back to UserLayout.`,
    );
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
