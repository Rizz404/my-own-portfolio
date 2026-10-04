<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { useFullscreen, useResizeObserver } from "@vueuse/core";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Scan,
  Maximize,
  Minimize,
} from "@lucide/vue";
import { useT } from "@/composables/useT";

const props = defineProps<{ images: string[]; index: number | null; title: string }>();
const emit = defineEmits<{ close: []; navigate: [index: number] }>();
const t = useT("views.user.ProjectDetailView");
const stage = ref<HTMLElement | null>(null);
const fullscreenTarget = computed(() => stage.value?.closest<HTMLElement>(".image-viewer") ?? null);
const {
  isFullscreen,
  isSupported: fullscreenSupported,
  enter: enterFullscreen,
  toggle: toggleFullscreen,
  exit: exitFullscreen,
} = useFullscreen(fullscreenTarget, { autoExit: true });
const fullscreenError = ref(false);
// The teleported dialog must exist before requesting fullscreen. This still runs
// within the user activation from the image click; navigation keeps the same stage.
watch(
  stage,
  async (element) => {
    if (!element || props.index === null) return;
    fullscreenError.value = false;
    if (!fullscreenSupported.value) return;
    try {
      await enterFullscreen();
    } catch {
      fullscreenError.value = true;
    }
  },
  { flush: "post" },
);
const changeFullscreen = async () => {
  fullscreenError.value = false;
  try {
    await toggleFullscreen();
  } catch {
    fullscreenError.value = true;
  }
};
const closeViewer = async () => {
  await exitFullscreen();
  emit("close");
};
const stageSize = ref({ width: 0, height: 0 });
const imageSize = ref({ width: 0, height: 0 });
const zoom = ref(1);
const offset = ref({ x: 0, y: 0 });
const dragging = ref(false);
const direction = ref<"next" | "previous">("next");
const currentImage = computed(() => (props.index === null ? undefined : props.images[props.index]));
const imageStyle = computed(() => ({
  transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${zoom.value})`,
}));

const clampOffset = () => {
  const { width, height } = stageSize.value;
  const image = imageSize.value;
  if (!image.width || !image.height) return;
  const fit = Math.min(width / image.width, height / image.height);
  const maxX = Math.max(0, (image.width * fit * zoom.value - width) / 2);
  const maxY = Math.max(0, (image.height * fit * zoom.value - height) / 2);
  offset.value = {
    x: Math.max(-maxX, Math.min(maxX, offset.value.x)),
    y: Math.max(-maxY, Math.min(maxY, offset.value.y)),
  };
};

useResizeObserver(stage, (entries) => {
  const rect = entries[0]?.contentRect;
  if (!rect) return;
  stageSize.value = { width: rect.width, height: rect.height };
  clampOffset();
});

const resetZoom = () => {
  zoom.value = 1;
  offset.value = { x: 0, y: 0 };
};

// Keep the point under the cursor or pinch center in place while scaling.
const setZoom = (value: number, point?: { x: number; y: number }) => {
  const next = Math.max(1, Math.min(5, value));
  const ratio = next / zoom.value;
  const rect = stage.value?.getBoundingClientRect();
  const anchor =
    point && rect
      ? { x: point.x - rect.left - rect.width / 2, y: point.y - rect.top - rect.height / 2 }
      : { x: 0, y: 0 };
  offset.value = {
    x: anchor.x - (anchor.x - offset.value.x) * ratio,
    y: anchor.y - (anchor.y - offset.value.y) * ratio,
  };
  zoom.value = next;
  clampOffset();
};

const toggleZoom = (point: { x: number; y: number }) => {
  if (zoom.value > 1) resetZoom();
  else setZoom(2, point);
};

const navigate = (step: number) => {
  if (props.index === null || props.images.length < 2) return;
  direction.value = step > 0 ? "next" : "previous";
  emit("navigate", (props.index + step + props.images.length) % props.images.length);
};

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowLeft":
      navigate(-1);
      break;
    case "ArrowRight":
      navigate(1);
      break;
    case "+":
    case "=":
      setZoom(zoom.value + 0.5);
      break;
    case "-":
      setZoom(zoom.value - 0.5);
      break;
    case "0":
      resetZoom();
      break;
    default:
      return;
  }
  event.preventDefault();
};

const handleWheel = (event: WheelEvent) => {
  setZoom(zoom.value * Math.exp(-event.deltaY * 0.002), { x: event.clientX, y: event.clientY });
};

const loadImage = (event: Event) => {
  const image = event.target as HTMLImageElement;
  // An outgoing slide may finish loading after navigation.
  if (image.getAttribute("src") !== currentImage.value) return;
  imageSize.value = { width: image.naturalWidth, height: image.naturalHeight };
  clampOffset();
};

type Point = { x: number; y: number };
const pointers = new Map<number, Point>();
let startPoint: Point | null = null;
let lastPoint: Point | null = null;
let pinch: { distance: number; center: Point } | null = null;
let hadPinch = false;
let lastTap: { time: number; point: Point } | null = null;

const pinchState = () => {
  const [a, b] = [...pointers.values()];
  if (!a || !b) return null;
  return {
    distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
    center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  };
};

let lastPointerType = "mouse";
const handleDoubleClick = (event: MouseEvent) => {
  // Touch double taps are handled on pointerup; ignore the compatibility mouse event.
  if (lastPointerType !== "touch") toggleZoom({ x: event.clientX, y: event.clientY });
};

const pointerDown = (event: PointerEvent) => {
  if (event.button !== 0) return;
  lastPointerType = event.pointerType;
  const point = { x: event.clientX, y: event.clientY };
  pointers.set(event.pointerId, point);
  stage.value?.setPointerCapture(event.pointerId);
  if (pointers.size === 1) {
    startPoint = lastPoint = point;
    hadPinch = false;
  } else {
    hadPinch = true;
    lastTap = null;
    pinch = pinchState();
  }
  dragging.value = zoom.value > 1;
};

const pointerMove = (event: PointerEvent) => {
  if (!pointers.has(event.pointerId)) return;
  const point = { x: event.clientX, y: event.clientY };
  pointers.set(event.pointerId, point);
  if (pointers.size > 1) {
    const next = pinchState();
    if (pinch && next) {
      setZoom((zoom.value * next.distance) / pinch.distance, pinch.center);
      offset.value.x += next.center.x - pinch.center.x;
      offset.value.y += next.center.y - pinch.center.y;
      clampOffset();
    }
    pinch = next;
  } else if (lastPoint && zoom.value > 1) {
    offset.value.x += point.x - lastPoint.x;
    offset.value.y += point.y - lastPoint.y;
    clampOffset();
  }
  lastPoint = point;
};

const pointerUp = (event: PointerEvent) => {
  if (!pointers.has(event.pointerId)) return;
  pointers.delete(event.pointerId);
  if (pointers.size) {
    lastPoint = [...pointers.values()][0] ?? null;
    pinch = null;
    return;
  }
  if (startPoint && !hadPinch) {
    const dx = event.clientX - startPoint.x;
    const dy = event.clientY - startPoint.y;
    if (zoom.value === 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      navigate(dx < 0 ? 1 : -1);
      lastTap = null;
    } else if (event.pointerType === "touch" && Math.hypot(dx, dy) < 10) {
      const point = { x: event.clientX, y: event.clientY };
      if (
        lastTap &&
        Date.now() - lastTap.time < 300 &&
        Math.hypot(point.x - lastTap.point.x, point.y - lastTap.point.y) < 40
      ) {
        toggleZoom(point);
        lastTap = null;
      } else lastTap = { time: Date.now(), point };
    }
  }
  dragging.value = false;
  startPoint = lastPoint = pinch = null;
};

const cancelGesture = () => {
  pointers.clear();
  dragging.value = false;
  startPoint = lastPoint = pinch = null;
  lastTap = null;
};

watch(
  () => [props.index, currentImage.value],
  () => {
    resetZoom();
    cancelGesture();
    imageSize.value = { width: 0, height: 0 };
  },
);
</script>

<template>
  <Dialog :open="index !== null" class="image-viewer" @close="closeViewer" @keydown="handleKeydown">
    <DialogPanel class="viewer-panel">
      <header class="viewer-header">
        <div class="viewer-heading">
          <DialogTitle class="viewer-title">{{ title }}</DialogTitle>
          <p class="viewer-count" aria-live="polite">
            {{ (index ?? 0) + 1 }} / {{ images.length }}
          </p>
        </div>
        <button
          type="button"
          class="viewer-button"
          :aria-label="t('preview.close')"
          @click="closeViewer"
        >
          <X :size="24" />
        </button>
      </header>

      <div class="viewer-content">
        <div
          ref="stage"
          class="viewer-stage"
          :class="{ 'is-zoomed': zoom > 1, 'is-dragging': dragging }"
          @wheel.prevent="handleWheel"
          @dblclick="handleDoubleClick"
          @pointerdown="pointerDown"
          @pointermove="pointerMove"
          @pointerup="pointerUp"
          @pointercancel="cancelGesture"
          @lostpointercapture="pointers.has($event.pointerId) && cancelGesture()"
        >
          <Transition :name="`slide-${direction}`">
            <div v-if="currentImage" :key="currentImage" class="viewer-slide">
              <img
                :src="currentImage"
                :alt="`${title} screenshot ${(index ?? 0) + 1}`"
                :style="imageStyle"
                draggable="false"
                @load="loadImage"
              />
            </div>
          </Transition>
        </div>
        <template v-if="images.length > 1">
          <button
            type="button"
            class="viewer-button viewer-previous"
            :aria-label="t('preview.previous')"
            @click="navigate(-1)"
          >
            <ChevronLeft :size="28" />
          </button>
          <button
            type="button"
            class="viewer-button viewer-next"
            :aria-label="t('preview.next')"
            @click="navigate(1)"
          >
            <ChevronRight :size="28" />
          </button>
        </template>
      </div>

      <footer class="viewer-footer">
        <div class="viewer-toolbar">
          <button
            type="button"
            class="viewer-button"
            :aria-label="t('preview.zoomOut')"
            :disabled="zoom <= 1"
            @click="setZoom(zoom - 0.5)"
          >
            <ZoomOut :size="20" />
          </button>
          <span class="viewer-zoom" aria-live="polite">{{ Math.round(zoom * 100) }}%</span>
          <button
            type="button"
            class="viewer-button"
            :aria-label="t('preview.zoomIn')"
            :disabled="zoom >= 5"
            @click="setZoom(zoom + 0.5)"
          >
            <ZoomIn :size="20" />
          </button>
          <span class="viewer-divider"></span>
          <button
            type="button"
            class="viewer-button"
            :aria-label="t('preview.resetZoom')"
            @click="resetZoom"
          >
            <Scan :size="20" />
          </button>
          <button
            v-if="fullscreenSupported"
            type="button"
            class="viewer-button"
            :aria-label="t(isFullscreen ? 'preview.exitFullscreen' : 'preview.fullscreen')"
            @click="changeFullscreen"
          >
            <Minimize v-if="isFullscreen" :size="20" />
            <Maximize v-else :size="20" />
          </button>
        </div>
        <p class="viewer-hint">
          {{ t(fullscreenError ? "preview.fullscreenError" : "preview.hint") }}
        </p>
      </footer>
    </DialogPanel>
  </Dialog>
</template>

<style scoped>
/* Theme tokens are inherited from <html>, including inside the fullscreen portal. */
:global(.image-viewer) {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--color-background);
  color: var(--color-content);
}
.viewer-panel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.viewer-header {
  position: absolute;
  inset: 0 0 auto;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: max(12px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) 12px
    max(20px, env(safe-area-inset-left));
  background: linear-gradient(
    color-mix(in srgb, var(--color-background) 90%, transparent),
    transparent
  );
}
.viewer-heading {
  min-width: 0;
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  border-radius: 10px;
  padding: 6px 10px;
  backdrop-filter: blur(12px);
}
.viewer-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}
.viewer-count {
  color: color-mix(in srgb, var(--color-content) 70%, transparent);
  font-size: 12px;
  margin-top: 2px;
}
.viewer-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-surface-raised) 90%, transparent);
  color: var(--color-content);
  pointer-events: auto;
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: background 150ms;
}
.viewer-button:hover {
  background: var(--color-surface-raised);
}
.viewer-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.viewer-button:disabled {
  opacity: 0.35;
  cursor: default;
}
.viewer-content {
  position: absolute;
  inset: 0;
}
.viewer-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  cursor: zoom-in;
}
.viewer-stage.is-zoomed {
  cursor: grab;
}
.viewer-stage.is-dragging {
  cursor: grabbing;
}
.viewer-slide {
  position: absolute;
  inset: 0;
}
.viewer-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: center;
  will-change: transform;
}
.viewer-previous,
.viewer-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-surface-raised) 90%, transparent);
}
.viewer-previous {
  left: 16px;
}
.viewer-next {
  right: 16px;
}
.viewer-footer {
  position: absolute;
  bottom: max(16px, env(safe-area-inset-bottom));
  left: 50%;
  z-index: 2;
  width: max-content;
  max-width: calc(100% - 24px);
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 0;
}
.viewer-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--color-content) 15%, transparent);
  backdrop-filter: blur(12px);
  pointer-events: auto;
}
.viewer-zoom {
  min-width: 56px;
  text-align: center;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.viewer-divider {
  height: 24px;
  width: 1px;
  background: var(--color-surface-raised);
  margin: 0 6px;
}
.viewer-hint {
  color: var(--color-content);
  font-size: 11px;
  text-align: center;
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  border-radius: 6px;
  padding: 3px 8px;
}
.slide-next-enter-active,
.slide-next-leave-active,
.slide-previous-enter-active,
.slide-previous-leave-active {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}
.slide-next-enter-from,
.slide-previous-leave-to {
  transform: translateX(12%);
  opacity: 0;
}
.slide-next-leave-to,
.slide-previous-enter-from {
  transform: translateX(-12%);
  opacity: 0;
}
@media (max-width: 640px) {
  .viewer-header {
    padding: max(8px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) 8px
      max(12px, env(safe-area-inset-left));
  }
  .viewer-hint {
    display: none;
  }
  .viewer-previous {
    left: 8px;
  }
  .viewer-next {
    right: 8px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .viewer-slide {
    transition: none;
  }
}
</style>
