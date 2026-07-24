import type User from "@/types/user";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const authStores = defineStore("auth", () => {
  // * Statenya
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token") || null);

  // * Getters
  const isAuthenticated = computed(() => !!token.value);

  // * Actions
  const login = (newToken: string, userData: User) => {
    token.value = newToken;
    user.value = userData;
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
});

export default authStores;
