<script setup lang="ts">
import AppModal from "@/components/shared/AppModal.vue";
import AppButton from "@/components/shared/AppButton.vue";
import { useConfirm } from "@/composables/useConfirm";
import { useT } from "@/composables/useT";

// * Namespace translation buat komponen ini, ikutin path file JSON-nya:
// src/locales/<locale>/views/shared/AppConfirmDialog.json
// (folder "views/shared", bukan "components/shared" - ikutin pola
// AppToastContainer.vue biar konsisten buat komponen global yang cuma
// di-mount sekali di App.vue.)
const t = useT("views.shared.AppConfirmDialog");

// * Cukup di-mount sekali (di App.vue) - state-nya global lewat useConfirm(),
// jadi komponen/view mana pun bisa manggil useConfirm().confirm({...}) dan
// otomatis nongol di sini. Pengganti window.confirm() bawaan browser.
const { state, handleConfirm, handleCancel } = useConfirm();

// * Backdrop/Esc/tombol close AppModal cuma ngirim update:modelValue(false) -
// diperlakukan sama kayak klik "Cancel".
function handleModalUpdate(value: boolean) {
  if (!value) handleCancel();
}
</script>

<template>
  <AppModal
    :model-value="state.open"
    :title="state.title"
    size="sm"
    :close-label="t('closeLabel')"
    @update:model-value="handleModalUpdate"
  >
    <p>{{ state.message }}</p>

    <template #footer>
      <AppButton variant="secondary" size="sm" @click="handleCancel">
        {{ state.cancelLabel ?? t("cancelLabel") }}
      </AppButton>
      <AppButton
        :variant="state.variant === 'danger' ? 'danger' : 'primary'"
        size="sm"
        @click="handleConfirm"
      >
        {{ state.confirmLabel ?? t("confirmLabel") }}
      </AppButton>
    </template>
  </AppModal>
</template>
