import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

// * Locale terkini disimpan di sini (bukan import store Pinia langsung) biar axiosClient
// tetap jadi modul HTTP polos yang gak depend ke layer presentation/state management.
// Yang push nilainya ke sini adalah i18nStores.ts lewat setAcceptLanguage().
let currentAcceptLanguage: string | undefined;

export function setAcceptLanguage(locale: string) {
  currentAcceptLanguage = locale;
}

// * Spring @RequestParam List<String> butuh "sortBy=a&sortBy=b", bukan "sortBy[]=a&sortBy[]=b" (default axios)
function paramsSerializer(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  paramsSerializer,
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (currentAcceptLanguage) {
      config.headers["Accept-Language"] = currentAcceptLanguage;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// * Sama kayak currentAcceptLanguage di atas: axiosClient gak boleh import authStores/router
// langsung (bakal jadi circular & nyampur layer HTTP sama state management), jadi 401 handler-nya
// didaftarkan dari luar (lihat main.ts) lewat setUnauthorizedHandler().
let unauthorizedHandler: (() => void) | undefined;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

// * Sama alasannya kayak unauthorizedHandler - logic refresh (yang butuh authStore & authService)
// didaftarkan dari luar lewat setRefreshHandler() (diwire di main.ts). Handler-nya harus balikin
// accessToken baru kalau berhasil, atau null kalau refreshToken-nya gak ada/udah invalid/expired.
type RefreshHandler = () => Promise<string | null>;
let refreshHandler: RefreshHandler | undefined;

export function setRefreshHandler(handler: RefreshHandler) {
  refreshHandler = handler;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { _isRetry?: boolean };

// * Banyak request bisa 401 bareng (mis. beberapa query jalan paralel pas accessToken expired) -
// semuanya numpang ke satu proses refresh yang sama biar gak nembak /auth/refresh berkali-kali.
let ongoingRefresh: Promise<string | null> | null = null;

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // * Jangan coba refresh buat request /auth/refresh itu sendiri (hindari infinite loop
    // waktu refreshToken-nya juga udah invalid) atau request yang udah pernah di-retry sekali.
    if (!originalRequest || originalRequest._isRetry || originalRequest.url?.includes("/auth/refresh")) {
      unauthorizedHandler?.();
      return Promise.reject(error);
    }

    if (!refreshHandler) {
      unauthorizedHandler?.();
      return Promise.reject(error);
    }

    originalRequest._isRetry = true;

    if (!ongoingRefresh) {
      ongoingRefresh = refreshHandler().finally(() => {
        ongoingRefresh = null;
      });
    }

    const newToken = await ongoingRefresh;

    // * refreshToken-nya gak ada/udah expired (1 bulan) - otomatis logout lewat unauthorizedHandler
    if (!newToken) {
      unauthorizedHandler?.();
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return axiosClient(originalRequest);
  },
);

export default axiosClient;
