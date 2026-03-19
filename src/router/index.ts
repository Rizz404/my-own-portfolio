import HomeView from "@/views/HomeView.vue";

import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "Home", component: HomeView },
    { path: "/about", name: "About", component: () => import("@/views/AboutView.vue") },
    { path: "/projects", name: "Projects", component: () => import("@/views/ProjectsView.vue") },
    { path: "/uses", name: "Uses", component: () => import("@/views/UsesView.vue") },
  ],
});

export default router;
