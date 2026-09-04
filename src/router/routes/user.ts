import type { RouteRecordRaw } from "vue-router";
import HomeView from "@/views/user/HomeView.vue";

// * Route publik, dibungkus UserLayout (lihat App.vue). meta.layout dituliskan eksplisit
// di semua route (bukan cuma admin/blank) biar gak ada "default tersembunyi" - kalau ada
// route baru yang lupa dikasih meta.layout, router/index.ts bakal nge-warn di dev.
//
// * meta.titleKey nunjuk ke key i18n yang udah ada (nav label / heading view-nya sendiri)
// biar gak perlu nambah terjemahan baru cuma buat document.title (lihat App.vue). Route
// detail (Blog/Project/Use) titleKey-nya cuma fallback pas masih loading - begitu kontennya
// kefetch, view-nya sendiri nimpa pakai judul aslinya (lihat useDocumentTitle di sana).
export const userRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    meta: { layout: "user", titleKey: "components.user.UserHeader.nav.home" },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/user/AboutView.vue"),
    meta: { layout: "user", titleKey: "components.user.UserHeader.nav.about" },
  },
  // {
  //   path: "/blogs",
  //   name: "Blogs",
  //   component: () => import("@/views/user/BlogView.vue"),
  //   meta: { layout: "user", titleKey: "views.user.BlogView.title" },
  // },
  {
    path: "/blogs/:id",
    name: "Blog",
    component: () => import("@/views/user/BlogDetailView.vue"),
    meta: { layout: "user", titleKey: "views.user.BlogView.title" },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("@/views/user/ProjectView.vue"),
    meta: { layout: "user", titleKey: "components.user.UserHeader.nav.projects" },
  },
  {
    path: "/projects/:id",
    name: "Project",
    component: () => import("@/views/user/ProjectDetailView.vue"),
    meta: { layout: "user", titleKey: "views.user.ProjectView.title" },
  },
  {
    path: "/uses",
    name: "Uses",
    component: () => import("@/views/user/UseView.vue"),
    meta: { layout: "user", titleKey: "components.user.UserHeader.nav.uses" },
  },
  {
    path: "/uses/:id",
    name: "Use",
    component: () => import("@/views/user/UseDetailView.vue"),
    meta: { layout: "user", titleKey: "views.user.UseView.title" },
  },
  {
    path: "/colophon",
    name: "Colophon",
    component: () => import("@/views/user/ColophonView.vue"),
    meta: { layout: "user", titleKey: "views.user.ColophonView.hero.title" },
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import("@/views/user/ContactView.vue"),
    meta: { layout: "user", titleKey: "views.user.ContactView.hero.title" },
  },
  // * Catch-all publik - vue-router 4 nge-rank route berdasarkan spesifisitas segmen,
  // jadi "/admin/:pathMatch(.*)*" (lihat routes/admin.ts) tetep menang buat path /admin/**
  // walau catch-all ini terdaftar duluan di array gabungan router/index.ts.
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/shared/NotFoundView.vue"),
    meta: { layout: "user", titleKey: "views.shared.NotFoundView.title" },
  },
];

export default userRoutes;
