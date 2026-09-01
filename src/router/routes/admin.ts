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
    component: () => import("@/views/admin/ProjectListView.vue"),
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
  {
    path: "/admin/blogs",
    name: "AdminBlogs",
    component: () => import("@/views/admin/BlogListView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/blogs/new",
    name: "AdminBlogCreate",
    component: () => import("@/views/admin/BlogFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/blogs/:id/edit",
    name: "AdminBlogEdit",
    component: () => import("@/views/admin/BlogFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/experiences",
    name: "AdminExperiences",
    component: () => import("@/views/admin/ExperienceListView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/experiences/new",
    name: "AdminExperienceCreate",
    component: () => import("@/views/admin/ExperienceFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/experiences/:id/edit",
    name: "AdminExperienceEdit",
    component: () => import("@/views/admin/ExperienceFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/skills",
    name: "AdminSkills",
    component: () => import("@/views/admin/SkillListView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/skills/new",
    name: "AdminSkillCreate",
    component: () => import("@/views/admin/SkillFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/skills/:id/edit",
    name: "AdminSkillEdit",
    component: () => import("@/views/admin/SkillFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/uses",
    name: "AdminUses",
    component: () => import("@/views/admin/UseListView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/uses/new",
    name: "AdminUseCreate",
    component: () => import("@/views/admin/UseFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/uses/:id/edit",
    name: "AdminUseEdit",
    component: () => import("@/views/admin/UseFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/users",
    name: "AdminUsers",
    component: () => import("@/views/admin/UserListView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/users/new",
    name: "AdminUserCreate",
    component: () => import("@/views/admin/UserFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  {
    path: "/admin/users/:id/edit",
    name: "AdminUserEdit",
    component: () => import("@/views/admin/UserFormView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },
  // * Catch-all khusus /admin/** biar 404-nya tetep tampil di dalam AdminLayout
  // (sidebar + header admin), bukan ketangkep sama catch-all publik di routes/user.ts.
  // Sengaja gak dikasih requiresAuth - nunjukin halaman 404 gak perlu login dulu.
  {
    path: "/admin/:pathMatch(.*)*",
    name: "AdminNotFound",
    component: () => import("@/views/shared/NotFoundView.vue"),
    meta: { layout: "admin" },
  },
];

export default adminRoutes;
