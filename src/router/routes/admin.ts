import type { RouteRecordRaw } from "vue-router";

// * Route admin. "AdminLogin" pakai layout "blank" (gak ada shell, lihat App.vue),
// * meta.titleKey nunjuk ke key i18n yang udah ada (lihat catatan yang sama di routes/user.ts)
export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/views/admin/LoginView.vue"),
    meta: { layout: "blank", titleKey: "views.admin.LoginView.title" },
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: () => import("@/views/admin/DashboardView.vue"),
    meta: {
      layout: "admin",
      requiresAuth: true,
      titleKey: "components.admin.AdminSidebar.nav.dashboard",
    },
  },
  {
    path: "/admin/projects",
    name: "AdminProjects",
    component: () => import("@/views/admin/ProjectListView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.ProjectListView.title" },
  },
  {
    path: "/admin/projects/new",
    name: "AdminProjectCreate",
    component: () => import("@/views/admin/ProjectFormView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.ProjectFormView.createTitle" },
  },
  {
    path: "/admin/projects/:id/edit",
    name: "AdminProjectEdit",
    component: () => import("@/views/admin/ProjectFormView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.ProjectFormView.editTitle" },
  },
  // {
  //   path: "/admin/blogs",
  //   name: "AdminBlogs",
  //   component: () => import("@/views/admin/BlogListView.vue"),
  //   meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.BlogListView.title" },
  // },
  // {
  //   path: "/admin/blogs/new",
  //   name: "AdminBlogCreate",
  //   component: () => import("@/views/admin/BlogFormView.vue"),
  //   meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.BlogFormView.createTitle" },
  // },
  // {
  //   path: "/admin/blogs/:id/edit",
  //   name: "AdminBlogEdit",
  //   component: () => import("@/views/admin/BlogFormView.vue"),
  //   meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.BlogFormView.editTitle" },
  // },
  {
    path: "/admin/experiences",
    name: "AdminExperiences",
    component: () => import("@/views/admin/ExperienceListView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.ExperienceListView.title" },
  },
  {
    path: "/admin/experiences/new",
    name: "AdminExperienceCreate",
    component: () => import("@/views/admin/ExperienceFormView.vue"),
    meta: {
      layout: "admin",
      requiresAuth: true,
      titleKey: "views.admin.ExperienceFormView.createTitle",
    },
  },
  {
    path: "/admin/experiences/:id/edit",
    name: "AdminExperienceEdit",
    component: () => import("@/views/admin/ExperienceFormView.vue"),
    meta: {
      layout: "admin",
      requiresAuth: true,
      titleKey: "views.admin.ExperienceFormView.editTitle",
    },
  },
  {
    path: "/admin/skills",
    name: "AdminSkills",
    component: () => import("@/views/admin/SkillListView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.SkillListView.title" },
  },
  {
    path: "/admin/skills/new",
    name: "AdminSkillCreate",
    component: () => import("@/views/admin/SkillFormView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.SkillFormView.createTitle" },
  },
  {
    path: "/admin/skills/:id/edit",
    name: "AdminSkillEdit",
    component: () => import("@/views/admin/SkillFormView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.SkillFormView.editTitle" },
  },
  {
    path: "/admin/uses",
    name: "AdminUses",
    component: () => import("@/views/admin/UseListView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.UseListView.title" },
  },
  {
    path: "/admin/uses/new",
    name: "AdminUseCreate",
    component: () => import("@/views/admin/UseFormView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.UseFormView.createTitle" },
  },
  {
    path: "/admin/uses/:id/edit",
    name: "AdminUseEdit",
    component: () => import("@/views/admin/UseFormView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.UseFormView.editTitle" },
  },
  {
    path: "/admin/users",
    name: "AdminUsers",
    component: () => import("@/views/admin/UserListView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.UserListView.title" },
  },
  {
    path: "/admin/users/new",
    name: "AdminUserCreate",
    component: () => import("@/views/admin/UserFormView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.UserFormView.createTitle" },
  },
  {
    path: "/admin/users/:id/edit",
    name: "AdminUserEdit",
    component: () => import("@/views/admin/UserFormView.vue"),
    meta: { layout: "admin", requiresAuth: true, titleKey: "views.admin.UserFormView.editTitle" },
  },
  // * Catch-all khusus /admin/** biar 404-nya tetep tampil di dalam AdminLayout
  // (sidebar + header admin), bukan ketangkep sama catch-all publik di routes/user.ts.
  // Sengaja gak dikasih requiresAuth - nunjukin halaman 404 gak perlu login dulu.
  {
    path: "/admin/:pathMatch(.*)*",
    name: "AdminNotFound",
    component: () => import("@/views/shared/NotFoundView.vue"),
    meta: { layout: "admin", titleKey: "views.shared.NotFoundView.title" },
  },
];

export default adminRoutes;
