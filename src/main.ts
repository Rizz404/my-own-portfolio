import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/assets/main.css";

import App from "./App.vue";
import router from "./router";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { MotionPlugin } from "@vueuse/motion";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(MotionPlugin);

app.mount("#app");
