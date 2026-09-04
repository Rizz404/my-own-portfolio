import { RouterView, type RouteRecordRaw } from "vue-router";
import HomeView from "@/views/user/HomeView.vue";
import { SUPPORTED_LOCALES } from "@/i18n";

// * Semua route publik dibungkus 1 parent dinamis `/:locale(en|id)` biar bahasa kebawa di
// URL-nya (mis. /en/about, /id/projects) - lihat router/index.ts buat redirect path yang
// belum ada prefix locale-nya + sinkronisasi ke i18nStore. `component: RouterView` di
// parent cuma passthrough (gak nambah shell baru), UserLayout tetep yang nentuin shell
// (lihat App.vue). meta.layout tetep ditulis eksplisit di tiap child (bukan cuma di
// parent) biar konsisten sama filosofi "gak ada default tersembunyi" di bawah + TS
// RouteMeta gak nge-infer inheritance dari parent secara statis.
//
// * meta.titleKey nunjuk ke key i18n yang udah ada (nav label / heading view-nya sendiri)
// biar gak perlu nambah terjemahan baru cuma buat document.title (lihat App.vue). Route
// detail (Blog/Project/Use) titleKey-nya cuma fallback pas masih loading - begitu kontennya
// kefetch, view-nya sendiri nimpa pakai judul aslinya (lihat useDocumentTitle di sana).
export const userRoutes: RouteRecordRaw[] = [
  {
    path: `/:locale(${SUPPORTED_LOCALES.join("|")})`,
    component: RouterView,
    meta: { layout: "user" },
    children: [
      {
        path: "",
        name: "Home",
        component: HomeView,
        meta: { layout: "user", titleKey: "components.user.UserHeader.nav.home" },
      },
      {
        path: "about",
        name: "About",
        component: () => import("@/views/user/AboutView.vue"),
        meta: { layout: "user", titleKey: "components.user.UserHeader.nav.about" },
      },
      // {
      //   path: "blogs",
      //   name: "Blogs",
      //   component: () => import("@/views/user/BlogView.vue"),
      //   meta: { layout: "user", titleKey: "views.user.BlogView.title" },
      // },
      {
        path: "blogs/:id",
        name: "Blog",
        component: () => import("@/views/user/BlogDetailView.vue"),
        meta: { layout: "user", titleKey: "views.user.BlogView.title" },
      },
      {
        path: "projects",
        name: "Projects",
        component: () => import("@/views/user/ProjectView.vue"),
        meta: { layout: "user", titleKey: "components.user.UserHeader.nav.projects" },
      },
      {
        path: "projects/:id",
        name: "Project",
        component: () => import("@/views/user/ProjectDetailView.vue"),
        meta: { layout: "user", titleKey: "views.user.ProjectView.title" },
      },
      {
        path: "uses",
        name: "Uses",
        component: () => import("@/views/user/UseView.vue"),
        meta: { layout: "user", titleKey: "components.user.UserHeader.nav.uses" },
      },
      {
        path: "uses/:id",
        name: "Use",
        component: () => import("@/views/user/UseDetailView.vue"),
        meta: { layout: "user", titleKey: "views.user.UseView.title" },
      },
      {
        path: "colophon",
        name: "Colophon",
        component: () => import("@/views/user/ColophonView.vue"),
        meta: { layout: "user", titleKey: "views.user.ColophonView.hero.title" },
      },
      {
        path: "contact",
        name: "Contact",
        component: () => import("@/views/user/ContactView.vue"),
        meta: { layout: "user", titleKey: "views.user.ContactView.hero.title" },
      },
      // * Catch-all buat path yang udah punya prefix locale valid tapi sisanya gak
      // cocok satupun (mis. /en/asdasd) - beda sama catch-all top-level di router/index.ts
      // yang nangkep path TANPA prefix locale sama sekali lalu redirect nambahin prefix-nya.
      {
        path: ":pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/shared/NotFoundView.vue"),
        meta: { layout: "user", titleKey: "views.shared.NotFoundView.title" },
      },
    ],
  },
];

export default userRoutes;
