import axios from "axios"
import { toast } from "react-toastify"

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7175/",
  headers: { "Content-Type": "application/json" },
})

const mutatingMethods = new Set(["post", "put", "patch", "delete"])

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("alakowe_admin_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => {
    const body = response.data
    const isMutating = mutatingMethods.has(response.config.method ?? "")

    if (body.success) {
      if (isMutating && body.message) toast.success(body.message)
      response.data = body.data
      return response
    }

    const msg = body.message ?? "Request failed"
    if (isMutating) toast.error(msg)
    return Promise.reject(new Error(msg))
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      sessionStorage.removeItem("alakowe_admin_token")
      sessionStorage.removeItem("alakowe_admin_user")
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.href = "/admin/login"
      }
      const message = error.response?.data?.message ?? "Session expired. Please log in again."
      return Promise.reject(new Error(message))
    }

    const problem = error.response?.data
    const message = problem?.message ?? problem?.detail ?? problem?.title ?? error.message
    toast.error(message)
    return Promise.reject(new Error(message))
  },
)

export default client
