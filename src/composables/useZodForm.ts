import { reactive, ref } from "vue";
import type { ZodError, ZodType } from "zod";

type FieldErrors<T> = Partial<Record<keyof T, string>>;

// * Composable tipis buat nyambungin zod schema ke reactive state form di Vue,
// tanpa nambah dependency form library terpisah (vee-validate, dsb). Cocok
// dipake bareng schema-schema di src/schemas/, yang mirror tipe *Request
// di src/types/.
//
// `TValues` dipisah dari `Schema` (bukan pake `z.infer<Schema>` langsung)
// biar tetep kebaca sebagai object type walau schema-nya `ZodEffects`
// (hasil `.refine()`, mis. registerRequestSchema).
//
// Pemakaian:
//   const { values, errors, handleSubmit } = useZodForm(loginRequestSchema, {
//     email: "",
//     password: "",
//   });
//
//   <form @submit="handleSubmit((data) => loginMutation.mutate(data))">
export function useZodForm<TValues extends Record<string, unknown>>(
  schema: ZodType<TValues>,
  initialValues: TValues,
) {
  const values = reactive(cloneValues(initialValues)) as TValues;
  const errors = ref<FieldErrors<TValues>>({});
  const isSubmitting = ref(false);

  const clearErrors = () => {
    errors.value = {};
  };

  // * Validasi seluruh form. Balikin data ter-parse (udah dinormalisasi sama
  // zod) kalau valid, atau null kalau enggak - errors.value ke-update di kedua kasus.
  const validate = (): TValues | null => {
    const result = schema.safeParse(values);

    if (!result.success) {
      errors.value = toFieldErrors<TValues>(result.error);
      return null;
    }

    clearErrors();
    return result.data;
  };

  // * Validasi satu field aja (buat @blur), tanpa nimpa error field lain yang
  // udah ke-set sebelumnya.
  const validateField = (field: keyof TValues) => {
    const result = schema.safeParse(values);
    const issue = !result.success ? result.error.issues.find((issue) => issue.path[0] === field) : undefined;

    if (issue) {
      errors.value = { ...errors.value, [field]: issue.message };
    } else if (field in errors.value) {
      const nextErrors = { ...errors.value };
      delete nextErrors[field];
      errors.value = nextErrors;
    }
  };

  // * Wrapper submit: preventDefault, validasi, dan cuma manggil `onValid`
  // kalau valid. `isSubmitting` otomatis di-toggle selama `onValid` jalan
  // (misalnya lagi nunggu mutation dari @tanstack/vue-query).
  const handleSubmit = (onValid: (data: TValues) => unknown | Promise<unknown>) => {
    return async (event?: Event) => {
      event?.preventDefault();

      const data = validate();
      if (!data) return;

      isSubmitting.value = true;
      try {
        await onValid(data);
      } finally {
        isSubmitting.value = false;
      }
    };
  };

  const reset = (newValues: TValues = initialValues) => {
    Object.assign(values, cloneValues(newValues));
    clearErrors();
  };

  return { values, errors, isSubmitting, validate, validateField, handleSubmit, reset, clearErrors };
}

function toFieldErrors<T>(error: ZodError): FieldErrors<T> {
  const fieldErrors: FieldErrors<T> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === undefined || key in fieldErrors) continue;
    fieldErrors[key as keyof T] = issue.message;
  }

  return fieldErrors;
}

// * structuredClone gak bisa dipake buat File, jadi fallback ke shallow copy
// biar File instance di initialValues (mis. attachments) gak ke-strip.
function cloneValues<T>(values: T): T {
  try {
    return structuredClone(values);
  } catch {
    return Array.isArray(values) ? ([...values] as T) : ({ ...values } as T);
  }
}
