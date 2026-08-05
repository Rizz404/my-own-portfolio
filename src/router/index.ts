import HomeView from "@/views/user/HomeView.vue";

import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: "smooth" };
  },
  routes: [
    { path: "/", name: "Home", component: HomeView },
    { path: "/about", name: "About", component: () => import("@/views/user/AboutView.vue") },
    { path: "/blogs", name: "Blogs", component: () => import("@/views/user/BlogView.vue") },
    {
      path: "/blogs/:id",
      name: "Blog",
      component: () => import("@/views/user/BlogDetailView.vue"),
    },
    {
      path: "/projects",
      name: "Projects",
      component: () => import("@/views/user/ProjectView.vue"),
    },
    {
      path: "/projects/:id",
      name: "Project",
      component: () => import("@/views/user/ProjectDetailView.vue"),
    },
    { path: "/uses", name: "Uses", component: () => import("@/views/user/UseView.vue") },
    {
      path: "/uses/:id",
      name: "Use",
      component: () => import("@/views/user/UseDetailView.vue"),
    },
  ],
});

export default router;
