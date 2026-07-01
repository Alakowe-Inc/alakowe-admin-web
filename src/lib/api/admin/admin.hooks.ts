import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { withMock } from "../use-mock"
import {
  adminLoginApi,
  adminInitiatePasswordResetApi,
  adminCompletePasswordResetApi,
  adminChangePasswordApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getCategoryByIdApi,
  getAllCategoriesApi,
  approveListingApi,
  declineListingApi,
  getAdminListingsByFilterApi,
  getAdminListingByIdApi,
  createStateApi,
  updateStateApi,
  deleteStateApi,
  getStateByIdApi,
  getAllStatesApi,
  createAreaApi,
  updateAreaApi,
  deleteAreaApi,
  getAreaByIdApi,
  getAreasByStateApi,
  type AdminListingFilterParams,
  createDeliveryFeeConfigApi,
  updateDeliveryFeeConfigApi,
  deleteDeliveryFeeConfigApi,
  getDeliveryFeeConfigByIdApi,
  getAllDeliveryFeeConfigsApi,
  createPlatformFeeConfigApi,
  updatePlatformFeeConfigApi,
  deletePlatformFeeConfigApi,
  getPlatformFeeConfigByIdApi,
  getAllPlatformFeeConfigsApi,
  getActivePlatformFeeConfigApi,
  createTagApi,
  updateTagApi,
  deleteTagApi,
  getAllTagsApi,
  getTagsByCategoryApi,
  createCollectionApi,
  updateCollectionApi,
  deleteCollectionApi,
  getAllCollectionsApi,
  assignListingsToCollectionApi,
  removeListingsFromCollectionApi,
  updateCollectionPriorityApi,
  createLandingPageSectionApi,
  updateLandingPageSectionApi,
  deleteLandingPageSectionApi,
  getLandingPageApi,
} from "./admin.api"
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
  AddStateRequestDto,
  UpdateStateRequestDto,
  StateResponse,
  AddAreaRequestDto,
  UpdateAreaRequestDto,
  AreaResponse,
  CreateDeliveryFeeConfigurationRequestDto,
  UpdateDeliveryFeeConfigurationRequestDto,
  DeliveryFeeConfigurationResponse,
  CreatePlatformFeeConfigRequestDto,
  UpdatePlatformFeeConfigRequestDto,
  PlatformFeeConfigResponse,
  AddTagRequestDto,
  UpdateTagRequestDto,
  TagResponse,
  AddCollectionRequestDto,
  UpdateCollectionRequestDto,
  CollectionResponse,
  AssignListingsToCollectionDto,
  RemoveListingsFromCollectionDto,
  UpdateCollectionPriorityDto,
  AddLandingPageSectionRequestDto,
  UpdateLandingPageSectionRequestDto,
  LandingPageSectionResponse,
} from "../types"

type LoginBody = LoginRequestDto
type EmailOnlyBody = EmailOnlyRequest
type CompletePasswordResetBody = CompletePasswordResetRequestDto
type ChangePasswordBody = ChangePasswordRequestDto
type AddCategoryBody = AddCategoryRequestDto
type UpdateCategoryBody = UpdateCategoryRequestDto

const mockLoginResponse: LoginResponse = {
  userId: "1",
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  phoneNumber: "1234567890",
  roleId: 1,
  roleName: "Admin",
  isActive: true,
  token: "mock-admin-token",
  tokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
}

const mockCategory: CategoryResponse = { id: 1, name: "Mock Category" }

const mockListing: ListingResponse = {
  id: 1,
  title: "Mock Listing",
  isbn: "123-4567890123",
  description: "A mock listing",
  price: 250000,
  quantity: 1,
  bookCondition: "Good",
  author: "Mock Author",
  categoryId: 1,
  isPublished: false,
  isSoldOut: false,
  status: "PendingApproval",
  categoryName: "Fiction",
  createdBy: "seller@example.com",
  seller: "John Doe",
  dateCreated: new Date().toISOString(),
  cartItemCount: 0,
  wishlistItemCount: 0,
  coverImageFileName: "https://placehold.co/400x600?text=Mock+Book",
  imageFileNames: [
    "https://placehold.co/400x600?text=Mock+Book",
    "https://placehold.co/400x600?text=Image+2",
    "https://placehold.co/400x600?text=Image+3",
  ],
}

const mockPagedResult: ListingResponsePagedResult = {
  result: [mockListing],
  pageNumber: 1,
  pageSize: 20,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: (credentials: LoginBody) =>
      withMock(mockLoginResponse, () => adminLoginApi(credentials)),
  })
}

export function useAdminInitiatePasswordReset() {
  return useMutation({
    mutationFn: (body: EmailOnlyBody) =>
      withMock(true, () => adminInitiatePasswordResetApi(body)),
  })
}

export function useAdminCompletePasswordReset() {
  return useMutation({
    mutationFn: (body: CompletePasswordResetBody) =>
      withMock(true, () => adminCompletePasswordResetApi(body)),
  })
}

export function useAdminChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordBody) =>
      withMock(true, () => adminChangePasswordApi(body)),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddCategoryBody) =>
      withMock(mockCategory, () => createCategoryApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateCategoryBody) =>
      withMock(mockCategory, () => updateCategoryApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => deleteCategoryApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
    },
  })
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ["admin-categories", id],
    queryFn: () => withMock(mockCategory, () => getCategoryByIdApi(id)),
    enabled: !!id,
  })
}

export function useAllCategories() {
  return useQuery({
    queryKey: ["admin-categories", "all"],
    queryFn: () => withMock([mockCategory], () => getAllCategoriesApi()),
  })
}

export function useAdminListings(params?: AdminListingFilterParams) {
  return useQuery({
    queryKey: ["admin-listings", params],
    queryFn: () => withMock(mockPagedResult, () => getAdminListingsByFilterApi(params)),
  })
}

export function useAdminListing(id: number) {
  return useQuery({
    queryKey: ["admin-listings", id],
    queryFn: () => withMock(mockListing, () => getAdminListingByIdApi(id)),
    enabled: !!id,
  })
}

export function useApproveListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => approveListingApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] })
    },
  })
}

export function useDeclineListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => declineListingApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] })
    },
  })
}

const mockState: StateResponse = { id: 1, name: "Mock State" }

const mockArea: AreaResponse = { id: 1, stateId: 1, name: "Mock Area" }

export function useAllStates() {
  return useQuery({
    queryKey: ["admin-states", "all"],
    queryFn: () => withMock([mockState], () => getAllStatesApi()),
  })
}

export function useStateById(id: number) {
  return useQuery({
    queryKey: ["admin-states", id],
    queryFn: () => withMock(mockState, () => getStateByIdApi(id)),
    enabled: !!id,
  })
}

export function useCreateState() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddStateRequestDto) =>
      withMock(mockState, () => createStateApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-states"] })
    },
  })
}

export function useUpdateState() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateStateRequestDto) =>
      withMock(mockState, () => updateStateApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-states"] })
    },
  })
}

export function useDeleteState() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => deleteStateApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-states"] })
    },
  })
}

export function useAreasByState(stateId: number) {
  return useQuery({
    queryKey: ["admin-areas", "by-state", stateId],
    queryFn: () => withMock([mockArea], () => getAreasByStateApi(stateId)),
    enabled: !!stateId,
  })
}

export function useAreaById(id: number) {
  return useQuery({
    queryKey: ["admin-areas", id],
    queryFn: () => withMock(mockArea, () => getAreaByIdApi(id)),
    enabled: !!id,
  })
}

export function useCreateArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddAreaRequestDto) =>
      withMock(mockArea, () => createAreaApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] })
    },
  })
}

export function useUpdateArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateAreaRequestDto) =>
      withMock(mockArea, () => updateAreaApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] })
    },
  })
}

export function useDeleteArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => deleteAreaApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-areas"] })
    },
  })
}

/* ───────── Admin Delivery Fee Configurations ───────── */

const mockDeliveryFeeConfig: DeliveryFeeConfigurationResponse = {
  id: 1,
  originStateId: 1,
  originAreaId: 1,
  destinationStateId: 2,
  destinationAreaId: 2,
  minWeightGrams: 0,
  maxWeightGrams: 5000,
  fee: 1500,
  cap: 3000,
  priority: 1,
}

export function useAllDeliveryFeeConfigs() {
  return useQuery({
    queryKey: ["admin-delivery-fee-configs", "all"],
    queryFn: () => withMock([mockDeliveryFeeConfig], () => getAllDeliveryFeeConfigsApi()),
  })
}

export function useDeliveryFeeConfigById(id: number) {
  return useQuery({
    queryKey: ["admin-delivery-fee-configs", id],
    queryFn: () => withMock(mockDeliveryFeeConfig, () => getDeliveryFeeConfigByIdApi(id)),
    enabled: !!id,
  })
}

export function useCreateDeliveryFeeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateDeliveryFeeConfigurationRequestDto) =>
      withMock(mockDeliveryFeeConfig, () => createDeliveryFeeConfigApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-fee-configs"] })
    },
  })
}

export function useUpdateDeliveryFeeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateDeliveryFeeConfigurationRequestDto) =>
      withMock(mockDeliveryFeeConfig, () => updateDeliveryFeeConfigApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-fee-configs"] })
    },
  })
}

export function useDeleteDeliveryFeeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => deleteDeliveryFeeConfigApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-fee-configs"] })
    },
  })
}

/* ───────── Admin Platform Fee Configurations ───────── */

const mockPlatformFeeConfig: PlatformFeeConfigResponse = {
  id: 1,
  markupPercent: 15,
  markupCap: 5000,
  commissionPercent: 10,
  commissionCap: 2000,
  isActive: true,
  effectiveFrom: new Date().toISOString(),
  effectiveTo: null,
  dateCreated: new Date().toISOString(),
}

export function useActivePlatformFeeConfig() {
  return useQuery({
    queryKey: ["admin-platform-fee-configs", "active"],
    queryFn: () => withMock(mockPlatformFeeConfig, () => getActivePlatformFeeConfigApi()),
  })
}

export function useAllPlatformFeeConfigs() {
  return useQuery({
    queryKey: ["admin-platform-fee-configs", "all"],
    queryFn: () => withMock([mockPlatformFeeConfig], () => getAllPlatformFeeConfigsApi()),
  })
}

export function usePlatformFeeConfigById(id: number) {
  return useQuery({
    queryKey: ["admin-platform-fee-configs", id],
    queryFn: () => withMock(mockPlatformFeeConfig, () => getPlatformFeeConfigByIdApi(id)),
    enabled: !!id,
  })
}

export function useCreatePlatformFeeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePlatformFeeConfigRequestDto) =>
      withMock(mockPlatformFeeConfig, () => createPlatformFeeConfigApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform-fee-configs"] })
    },
  })
}

export function useUpdatePlatformFeeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdatePlatformFeeConfigRequestDto) =>
      withMock(mockPlatformFeeConfig, () => updatePlatformFeeConfigApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform-fee-configs"] })
    },
  })
}

export function useDeletePlatformFeeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => deletePlatformFeeConfigApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-platform-fee-configs"] })
    },
  })
}

/* ───────── Admin Tags ───────── */

const mockTag: TagResponse = { id: 1, name: "Mock Tag", slug: "mock-tag", categoryId: null, categoryName: null }

export function useAllTags() {
  return useQuery({
    queryKey: ["admin-tags", "all"],
    queryFn: () => withMock([mockTag], () => getAllTagsApi()),
  })
}

export function useTagsByCategory(categoryId: number) {
  return useQuery({
    queryKey: ["admin-tags", "by-category", categoryId],
    queryFn: () => withMock([mockTag], () => getTagsByCategoryApi(categoryId)),
    enabled: !!categoryId,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddTagRequestDto) =>
      withMock(mockTag, () => createTagApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateTagRequestDto) =>
      withMock(mockTag, () => updateTagApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => deleteTagApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] })
    },
  })
}

/* ───────── Admin Collections ───────── */

const mockCollection: CollectionResponse = {
  id: 1, name: "Mock Collection", slug: "mock-collection",
  description: "A mock collection", isActive: true,
}

export function useAllCollections() {
  return useQuery({
    queryKey: ["admin-collections", "all"],
    queryFn: () => withMock([mockCollection], () => getAllCollectionsApi()),
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddCollectionRequestDto) =>
      withMock(mockCollection, () => createCollectionApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateCollectionRequestDto) =>
      withMock(mockCollection, () => updateCollectionApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => deleteCollectionApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] })
    },
  })
}

export function useAssignListingsToCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AssignListingsToCollectionDto) =>
      withMock(true, () => assignListingsToCollectionApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] })
    },
  })
}

export function useRemoveListingsFromCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RemoveListingsFromCollectionDto) =>
      withMock(true, () => removeListingsFromCollectionApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] })
    },
  })
}

export function useUpdateCollectionPriority() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateCollectionPriorityDto) =>
      withMock(true, () => updateCollectionPriorityApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] })
    },
  })
}

/* ───────── Admin Landing Page ───────── */

const mockLandingPageSection: LandingPageSectionResponse = {
  id: 1, title: "Mock Section", sectionType: "category",
  filterParam: { category: "fiction" }, listings: [],
}

export function useLandingPage() {
  return useQuery({
    queryKey: ["admin-landing-page"],
    queryFn: () => withMock({ sections: [] }, () => getLandingPageApi()),
  })
}

export function useCreateLandingPageSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddLandingPageSectionRequestDto) =>
      withMock(mockLandingPageSection, () => createLandingPageSectionApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-landing-page"] })
    },
  })
}

export function useUpdateLandingPageSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateLandingPageSectionRequestDto) =>
      withMock(mockLandingPageSection, () => updateLandingPageSectionApi(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-landing-page"] })
    },
  })
}

export function useDeleteLandingPageSection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      withMock(true, () => deleteLandingPageSectionApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-landing-page"] })
    },
  })
}
