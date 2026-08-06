import type { RouteRecordRaw } from "vue-router";

// * Route admin. "AdminLogin" pakai layout "blank" (gak ada shell, lihat App.vue),
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/views/admin/LoginView.vue"),
    meta: { layout: "blank" },
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: () => import("@/views/admin/DashboardView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/projects",
    name: "AdminProjects",
    component: () => import("@/views/admin/ProjectsView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/projects/new",
    name: "AdminProjectCreate",
    component: () => import("@/views/admin/ProjectFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/projects/:id/edit",
    name: "AdminProjectEdit",
    component: () => import("@/views/admin/ProjectFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
];

export default adminRoutes;
