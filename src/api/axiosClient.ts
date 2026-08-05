import axios from "axios";

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

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosClient;
