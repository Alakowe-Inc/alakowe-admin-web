import client from "../client"
import type {
  LoginRequestDto,
  EmailOnlyRequest,
  CompletePasswordResetRequestDto,
  ChangePasswordRequestDto,
  AddCategoryRequestDto,
  UpdateCategoryRequestDto,
  LoginResponse,
  CategoryResponse,
  ListingResponse,
  ListingResponsePagedResult,
  ListingStatus,
  StateResponse,
  AddStateRequestDto,
  UpdateStateRequestDto,
  AreaResponse,
  UpdateAreaRequestDto,
  AddAreaRequestDto,
} from "../types"

type LoginBody = LoginRequestDto
type EmailOnlyBody = EmailOnlyRequest
type CompletePasswordResetBody = CompletePasswordResetRequestDto
type ChangePasswordBody = ChangePasswordRequestDto
type AddCategoryBody = AddCategoryRequestDto
type UpdateCategoryBody = UpdateCategoryRequestDto

export interface AdminListingFilterParams {
  CategoryId?: number
  Title?: string
  Author?: string
  Status?: ListingStatus
  PageNumber?: number
  PageSize?: number
}

export async function adminLoginApi(body: LoginBody): Promise<LoginResponse> {
  const { data } = await client.post("/api/v1/admin/auth/login", body)
  return data as LoginResponse
}

export async function adminInitiatePasswordResetApi(body: EmailOnlyBody): Promise<boolean> {
  const { data } = await client.post("/api/v1/admin/auth/initiate-password-reset", body)
  return data as boolean
}

export async function adminCompletePasswordResetApi(body: CompletePasswordResetBody): Promise<boolean> {
  const { data } = await client.post("/api/v1/admin/auth/complete-password-reset", body)
  return data as boolean
}

export async function adminChangePasswordApi(body: ChangePasswordBody): Promise<boolean> {
  const { data } = await client.post("/api/v1/admin/auth/change-password", body)
  return data as boolean
}

export async function createCategoryApi(body: AddCategoryBody): Promise<CategoryResponse> {
  const { data } = await client.post("/api/v1/AdminCategory/create", body)
  return data as CategoryResponse
}

export async function updateCategoryApi(body: UpdateCategoryBody): Promise<CategoryResponse> {
  const { data } = await client.post("/api/v1/AdminCategory/update", body)
  return data as CategoryResponse
}

export async function deleteCategoryApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminCategory/delete/${id}`)
  return data as boolean
}

export async function getCategoryByIdApi(id: number): Promise<CategoryResponse> {
  const { data } = await client.get(`/api/v1/AdminCategory/${id}`)
  return data as CategoryResponse
}

export async function getAllCategoriesApi(): Promise<CategoryResponse[]> {
  const { data } = await client.get("/api/v1/AdminCategory/all")
  return data as CategoryResponse[]
}

export async function approveListingApi(id: number): Promise<boolean> {
  const { data } = await client.post(`/api/v1/AdminListing/approve/${id}`)
  return data as boolean
}

export async function declineListingApi(id: number): Promise<boolean> {
  const { data } = await client.post(`/api/v1/AdminListing/decline/${id}`)
  return data as boolean
}

export async function getAdminListingsByFilterApi(
  params?: AdminListingFilterParams,
): Promise<ListingResponsePagedResult> {
  const { data } = await client.get("/api/v1/AdminListing/by-filter", { params })
  return data as ListingResponsePagedResult
}

export async function getAdminListingByIdApi(id: number): Promise<ListingResponse> {
  const { data } = await client.get(`/api/v1/AdminListing/${id}`)
  return data as ListingResponse
}

export async function createStateApi(body: AddStateRequestDto): Promise<StateResponse> {
  const { data } = await client.post("/api/v1/AdminLocation/state/create", body)
  return data as StateResponse
}

export async function updateStateApi(body: UpdateStateRequestDto): Promise<StateResponse> {
  const { data } = await client.post("/api/v1/AdminLocation/state/update", body)
  return data as StateResponse
}

export async function deleteStateApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminLocation/state/delete/${id}`)
  return data as boolean
}

export async function getStateByIdApi(id: number): Promise<StateResponse> {
  const { data } = await client.get(`/api/v1/AdminLocation/state/${id}`)
  return data as StateResponse
}

export async function getAllStatesApi(): Promise<StateResponse[]> {
  const { data } = await client.get("/api/v1/AdminLocation/state/all")
  return data as StateResponse[]
}

export async function createAreaApi(body: AddAreaRequestDto): Promise<AreaResponse> {
  const { data } = await client.post("/api/v1/AdminLocation/area/create", body)
  return data as AreaResponse
}

export async function updateAreaApi(body: UpdateAreaRequestDto): Promise<AreaResponse> {
  const { data } = await client.post("/api/v1/AdminLocation/area/update", body)
  return data as AreaResponse
}

export async function deleteAreaApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminLocation/area/delete/${id}`)
  return data as boolean
}

export async function getAreaByIdApi(id: number): Promise<AreaResponse> {
  const { data } = await client.get(`/api/v1/AdminLocation/area/${id}`)
  return data as AreaResponse
}

export async function getAreasByStateApi(stateId: number): Promise<AreaResponse[]> {
  const { data } = await client.get(`/api/v1/AdminLocation/area/by-state/${stateId}`)
  return data as AreaResponse[]
}

// export type {
//   AddStateRequestDto,
//   UpdateStateRequestDto,
//   StateResponse,
//   AddAreaRequestDto,
//   UpdateAreaRequestDto,
//   AreaResponse,
// } from "../types"

// ─── Feedback ────────────────────────────────────────────────────────────────

export interface FeedbackItem {
  id: string
  name: string | null
  email: string | null
  message: string
  status: "Pending" | "Reviewed" | "Resolved"
  dateCreated: string | null
}

export interface FeedbackPagedResult {
  result: FeedbackItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface GetFeedbackParams {
  pageNumber?: number
  pageSize?: number
  status?: 1 | 2 | 3
}

export async function getFeedbackApi(params?: GetFeedbackParams): Promise<FeedbackPagedResult> {
  const { data } = await client.get("/api/v1/admin/AdminFeedback", { params })
  return data as FeedbackPagedResult
}

export async function updateFeedbackStatusApi(id: string, status: 1 | 2 | 3): Promise<boolean> {
  const { data } = await client.patch(`/api/v1/admin/AdminFeedback/${id}/status`, { status })
  return data as boolean
}

export async function deleteFeedbackApi(id: string): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/admin/AdminFeedback/${id}`)
  return data as boolean
}
