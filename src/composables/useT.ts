import { useI18n } from "vue-i18n";

// * Wrapper tipis di atas useI18n() buat namespace-in translation key per view/component,
// biar gak perlu declare namespace + wrapper function manual satu-satu di tiap file.
// Namespace-nya ngikutin path file JSON-nya, mis. "views.user.AboutView" untuk
// src/locales/<locale>/views/user/AboutView.json
//
// Pemakaian: const t = useT("views.user.AboutView");
//            t("hero.greeting") -> translate("views.user.AboutView.hero.greeting")
export function useT(namespace: string) {
  const { t } = useI18n();
  return (key: string, params?: Record<string, unknown>) => t(`${namespace}.${key}`, params ?? {});
}
