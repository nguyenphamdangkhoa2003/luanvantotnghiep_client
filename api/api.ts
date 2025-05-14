import axios from 'axios'
import Cookies from 'js-cookie'

const options = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
}

const API = axios.create(options)
const APIRefresh = axios.create(options)

let isRefreshing = false
let refreshSubscribers: any[] = []

const subscribeTokenRefresh = (cb: any) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb())
  refreshSubscribers = []
}


// Interceptor for APIRefresh with error handling
APIRefresh.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const { data, status } = response || {}
    if (
      (status === 401 || status === 400) &&
      data?.message === "Cookie 'access_token' không tồn tại"
    ) {
      if (!isRefreshing) {
        isRefreshing = true

        try {
          await APIRefresh.post('/auth/refresh-token')
          onRefreshed()
          isRefreshing = false
          return API(config)
        } catch (refreshError: any) {
          console.error('Lỗi khi làm mới token:', refreshError)
          isRefreshing = false
          onRefreshed()
          if (refreshError.response?.status === 401) {
            Cookies.remove('refresh')
          }
          return Promise.reject(refreshError)
        }
      }
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(API(config))
        })
      })
    }

    return Promise.reject(data || error)
  }
)

export default API
export { APIRefresh }
