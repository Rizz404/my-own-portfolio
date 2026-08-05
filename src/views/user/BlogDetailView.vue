<script setup lang="ts">
import { useRoute } from "vue-router";
import { useBlogQuery } from "@/composables/queries/useBlogs";
import AppError from "@/components/AppError.vue";
import IconCalendar from "~icons/lucide/calendar";
import IconEye from "~icons/lucide/eye";
import IconArrowLeft from "~icons/lucide/arrow-left";
import IconPaperclip from "~icons/lucide/paperclip";
import { formatDate } from "@/utils/dateUtil";
import { fadeUp } from "@/composables/useMotionPresets";

const route = useRoute();
const blogId = route.params.id as string;

const { data: response, isLoading, isError, error } = useBlogQuery(blogId);
</script>

<template>
  <div class="max-w-3xl mx-auto mt-8 mb-20 md:mt-12">
    <RouterLink
      to="/blogs"
      class="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors text-content/60 hover:text-primary"
    >
      <IconArrowLeft class="w-4 h-4" /> Back to all articles
    </RouterLink>

    <div v-if="isLoading" v-motion="fadeUp()" class="space-y-6">
      <div class="w-32 h-4 rounded bg-surface/50 animate-pulse"></div>
      <div class="w-3/4 h-12 rounded bg-surface/50 animate-pulse"></div>
      <div class="w-full h-64 rounded-xl bg-surface/50 animate-pulse"></div>
      <div class="space-y-4">
        <div class="w-full h-4 rounded bg-surface/50 animate-pulse" v-for="i in 5" :key="i"></div>
      </div>
    </div>

    <AppError v-else-if="isError" title="Article not found" :message="error?.message" />

    <article v-else-if="response?.data" v-motion="fadeUp()">
      <header class="mb-10 text-center md:text-left">
        <div
          class="flex items-center justify-center gap-4 mb-4 text-sm font-medium md:justify-start text-content/60"
        >
          <span class="flex items-center gap-1.5"
            ><IconCalendar class="w-4 h-4" /> {{ formatDate(response.data.createdAt) }}</span
          >
          <span class="flex items-center gap-1.5"
            ><IconEye class="w-4 h-4" /> {{ response.data.viewsCount }} views</span
          >
        </div>

        <h1 class="mb-6 text-3xl font-extrabold leading-tight md:text-5xl text-content">
          {{ response.data.title }}
        </h1>
      </header>

      <img
        v-if="response.data.featuredImage"
        :src="response.data.featuredImage"
        :alt="response.data.title"
        class="object-cover w-full mb-12 shadow-md aspect-video rounded-2xl"
      />

      <div class="wysiwyg-content text-content/90" v-html="response.data.content"></div>

      <div
        v-if="response.data.blogAttachments && response.data.blogAttachments.length > 0"
        class="pt-8 mt-16 border-t border-border/50"
      >
        <h3 class="mb-4 text-lg font-bold text-content">Attachments</h3>
        <ul class="flex flex-col gap-3">
          <li v-for="file in response.data.blogAttachments" :key="file.id">
            <a
              :href="file.fileUrl"
              target="_blank"
              class="inline-flex items-center gap-2 p-3 text-sm font-medium transition-colors border rounded-lg border-border/50 bg-surface/30 hover:border-primary/50 hover:bg-surface text-content hover:text-primary"
            >
              <IconPaperclip class="w-4 h-4" />
              {{ file.fileName }}
              <span class="pl-2 ml-2 text-xs uppercase border-l text-content/50 border-border/50">{{
                file.fileType
              }}</span>
            </a>
          </li>
        </ul>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* Styling khusus untuk WYSIWYG Content agar Tailwind biar gak reset wyswyg
*/
.wysiwyg-content :deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  font-size: 1.125rem;
}
.wysiwyg-content :deep(h1),
.wysiwyg-content :deep(h2),
.wysiwyg-content :deep(h3) {
  color: var(--color-content);
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}
.wysiwyg-content :deep(h2) {
  font-size: 1.875rem;
}
.wysiwyg-content :deep(h3) {
  font-size: 1.5rem;
}
.wysiwyg-content :deep(ul),
.wysiwyg-content :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}
.wysiwyg-content :deep(ul) {
  list-style-type: disc;
}
.wysiwyg-content :deep(ol) {
  list-style-type: decimal;
}
.wysiwyg-content :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}
.wysiwyg-content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.wysiwyg-content :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  font-style: italic;
  color: color-mix(in srgb, var(--color-content) 70%, transparent);
  margin-bottom: 1.5rem;
}
.wysiwyg-content :deep(pre),
.wysiwyg-content :deep(code) {
  background-color: var(--color-surface-raised);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.875em;
}
.wysiwyg-content :deep(pre) {
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}
.wysiwyg-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}
.wysiwyg-content :deep(img) {
  border-radius: 0.75rem;
  margin: 2rem 0;
  max-width: 100%;
  height: auto;
}
</style>
