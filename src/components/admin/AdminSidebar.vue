<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import IconLayoutDashboard from "~icons/lucide/layout-dashboard";
import IconFileText from "~icons/lucide/file-text";
import IconFolderKanban from "~icons/lucide/folder-kanban";
import IconBriefcase from "~icons/lucide/briefcase";
import IconSparkles from "~icons/lucide/sparkles";
import IconPackage from "~icons/lucide/package";
import IconUsers from "~icons/lucide/users";
import IconLogOut from "~icons/lucide/log-out";
import IconX from "~icons/lucide/x";
import { authStores } from "@/stores/authStores";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/components/admin/AdminSidebar.json
const t = useT("components.admin.AdminSidebar");

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const authStore = authStores();
const router = useRouter();

// * Resource CRUD (Blogs/dst) belum digarap - ditandain "soon" & gak bisa
// diklik dulu daripada bikin link mati. Nambah section baru pas udah ada view-nya
// tinggal hapus `soon: true` dan isi `to`.
const navItems = computed(() => [
  { label: t("nav.dashboard"), icon: IconLayoutDashboard, to: { name: "AdminDashboard" } },
  { label: t("nav.blogs"), icon: IconFileText, to: { name: "AdminBlogs" } },
  { label: t("nav.projects"), icon: IconFolderKanban, to: { name: "AdminProjects" } },
  { label: t("nav.experiences"), icon: IconBriefcase, to: { name: "AdminExperiences" } },
  { label: t("nav.skills"), icon: IconSparkles, soon: true },
  { label: t("nav.uses"), icon: IconPackage, soon: true },
  { label: t("nav.users"), icon: IconUsers, soon: true },
]);

const handleLogout = () => {
  authStore.logout();
  router.push({ name: "AdminLogin" });
};
</script>

<template>
  <!-- Overlay buat nutup sidebar di mobile pas diklik di luar -->
  <div
    v-if="props.isOpen"
    class="fixed inset-0 z-40 bg-black/40 lg:hidden"
    @click="emit('close')"
  ></div>

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
      props.isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex items-center justify-between h-16 px-5 border-b shrink-0 border-border/50">
      <RouterLink :to="{ name: 'AdminDashboard' }" class="flex items-center gap-2.5 group">
        <img
          src="https://i.pinimg.com/736x/05/68/42/0568424eab5583658cf6641c69573b78.jpg"
          alt="Logo"
          class="object-cover w-8 h-8 transition-transform duration-300 ring-2 ring-primary/20 rounded-xs group-hover:scale-105"
        />
        <span class="font-sans font-bold text-content">{{ t("brand") }}</span>
      </RouterLink>
      <button
        @click="emit('close')"
        :aria-label="t('closeSidebar')"
        class="p-1.5 rounded-lg text-content/70 hover:bg-surface-raised hover:text-primary lg:hidden"
      >
        <IconX class="w-5 h-5" />
      </button>
    </div>

    <nav class="flex flex-col flex-1 gap-1 px-3 py-4 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        v-slot="{ isActive, href, navigate }"
        :to="item.to ?? '#'"
        custom
      >
        <a
          :href="item.soon ? undefined : href"
          @click="item.soon ? $event.preventDefault() : navigate($event)"
          :aria-disabled="item.soon"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            item.soon
              ? 'text-content/40 cursor-not-allowed'
              : isActive
                ? 'bg-primary/10 text-primary'
                : 'text-content/70 hover:bg-surface-raised hover:text-primary',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span class="truncate grow">{{ item.label }}</span>
          <span
            v-if="item.soon"
            class="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-secondary text-content/50 shrink-0"
          >
            {{ t("soonBadge") }}
          </span>
        </a>
      </RouterLink>
    </nav>

    <div class="p-3 border-t border-border/50 shrink-0">
      <div v-if="authStore.user" class="flex items-center gap-3 px-2 py-2 mb-1">
        <div
          class="flex items-center justify-center overflow-hidden text-sm font-semibold text-white rounded-full size-9 shrink-0 bg-primary"
        >
          <img
            v-if="authStore.user.profilePict"
            :src="authStore.user.profilePict"
            :alt="authStore.user.nickname"
            class="object-cover w-full h-full"
          />
          <span v-else>{{ authStore.user.nickname.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium truncate text-content">{{ authStore.user.nickname }}</p>
          <p class="text-xs truncate text-content/60">{{ authStore.user.email }}</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg text-danger hover:bg-danger/10"
      >
        <IconLogOut class="w-5 h-5 shrink-0" />
        {{ t("logout") }}
      </button>
    </div>
  </aside>
</template>
