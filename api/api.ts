import axios from "axios";

const options = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
};

const API = axios.create(options);
const APIRefresh = axios.create(options);

let isRefreshing = false;
let refreshSubscribers: any[] = [];

const subscribeTokenRefresh = (cb: any) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

// Interceptor cho APIRefresh với xử lý lỗi
APIRefresh.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const { data, status } = response || {};

    // Kiểm tra lỗi 401 và thông điệp liên quan đến token
    if (
      status === 401 &&
      data?.message &&
      [
        "Người dùng chưa được xác thực",
        "Token không hợp lệ",
        "Refresh token không được cung cấp",
      ].includes(data.message)
    ) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Lấy refresh token từ cookie hoặc local storage (tùy cách bạn lưu)
          const refreshToken = localStorage.getItem("refreshToken") || "";

          if (!refreshToken) {
            throw new Error("Không tìm thấy refresh token");
          }

          // Gọi endpoint refresh-token với refreshToken trong body
          await APIRefresh.post("/auth/refresh-token", { refreshToken });

          // Thông báo refresh hoàn tất
          onRefreshed();
          isRefreshing = false;

          // Thử lại request ban đầu
          return API(config);
        } catch (refreshError) {
          console.error("Lỗi khi làm mới token:", refreshError);
          isRefreshing = false;
          onRefreshed();

          // Chuyển hướng đến trang login nếu refresh thất bại
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      }

      // Xếp hàng request để thử lại sau khi refresh
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(API(config));
        });
      });
    }

    return Promise.reject(data || error);
  },
);

export default API;
export { APIRefresh };