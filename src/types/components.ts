import type { AlertVariant } from "@/utils/alertVariants";

export interface AppButtonProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  class?: string;
}

// * Props bareng yang dipake di semua field form (AppInput, AppTextarea, dst)
// biar konsisten: label + error + hint di atas/bawah field, id opsional buat
// override kalau butuh nyambung ke elemen lain (mis. aria-describedby manual).
interface AppFormFieldProps {
  id?: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  class?: string;
}

export interface AppInputProps extends AppFormFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  placeholder?: string;
  autocomplete?: string;
}

export interface AppPasswordInputProps extends Omit<AppFormFieldProps, "id"> {
  id?: string;
  placeholder?: string;
  autocomplete?: string;
  // * Aria-label tombol toggle. Dikasih default bahasa Inggris biar aman
  // dipake tanpa i18n, tapi sebaiknya di-pass dari `useT()` view pemanggil.
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export interface AppTextareaProps extends AppFormFieldProps {
  placeholder?: string;
  rows?: number;
}

export interface AppSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface AppSelectProps extends AppFormFieldProps {
  options: AppSelectOption[];
  placeholder?: string;
}

export interface AppCheckboxProps {
  id?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  class?: string;
}

export interface AppAlertProps {
  variant?: AlertVariant;
  title?: string;
  class?: string;
}

export interface AppToastContainerProps {
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}
