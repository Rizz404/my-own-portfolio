import type { RouteRecordRaw } from "vue-router";
import HomeView from "@/views/user/HomeView.vue";

// * Route publik, dibungkus UserLayout (lihat App.vue). meta.layout dituliskan eksplisit
// di semua route (bukan cuma admin/blank) biar gak ada "default tersembunyi" - kalau ada
// route baru yang lupa dikasih meta.layout, router/index.ts bakal nge-warn di dev.
export const userRoutes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: HomeView, meta: { layout: "user" } },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/user/AboutView.vue"),
    meta: { layout: "user" },
  },
  {
    path: "/blogs",
    name: "Blogs",
    component: () => import("@/views/user/BlogView.vue"),
    meta: { layout: "user" },
  },
  {
    path: "/blogs/:id",
    name: "Blog",
    component: () => import("@/views/user/BlogDetailView.vue"),
    meta: { layout: "user" },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("@/views/user/ProjectView.vue"),
    meta: { layout: "user" },
  },
  {
    path: "/projects/:id",
    name: "Project",
    component: () => import("@/views/user/ProjectDetailView.vue"),
    meta: { layout: "user" },
  },
  {
    path: "/uses",
    name: "Uses",
    component: () => import("@/views/user/UseView.vue"),
    meta: { layout: "user" },
  },
  {
    path: "/uses/:id",
    name: "Use",
    component: () => import("@/views/user/UseDetailView.vue"),
    meta: { layout: "user" },
  },
];

export default userRoutes;
