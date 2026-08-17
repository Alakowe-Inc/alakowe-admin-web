import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { withMock } from "../use-mock"
import { payouts as seedPayouts, disputes as seedDisputes } from "../../mock-data"
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
  getAdminCustomersByFilterApi,
  getAdminCustomerByIdApi,
  verifyCustomerApi,
  flagCustomerApi,
  warnCustomerApi,
  suspendCustomerApi,
  banCustomerApi,
  reactivateCustomerApi,
  type CustomerFilterParams,
  updatePayoutRequestStatusApi,
  getAdminPayoutRequestByIdApi,
  getAdminPayoutRequestsApi,
  getAdminDisputesApi,
  getAdminDisputeApi,
  updateAdminDisputeStatusApi,
  type AdminDisputeFilterParams,
  type AdminDisputeUpdateRequest,
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
  AdminCustomerResponse,
  AdminCustomerDetailResponse,
  AdminCustomerPagedResult,
  CustomerModerationRecordResponse,
  FlagCustomerRequest,
  WarnCustomerRequest,
  SuspendCustomerRequest,
  PayoutRequestResponse,
  PayoutRequestResponsePagedResult,
  AdminDisputeResponse,
  AdminDisputeStatus,
  AdminDisputeDecision,
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
  conditionDetail: "Very good condition, clean pages",
  format: "Paperback",
  price: 250000,
  buyerPrice: 287500,
  quantity: 1,
  bookCondition: "Good",
  author: "Mock Author",
  categoryId: 1,
  isPublished: false,
  isSoldOut: false,
  status: "PendingApproval",
  categoryName: "Fiction",
  tags: [{ id: 1, name: "Best Seller", slug: "best-seller", categoryId: 1, categoryName: null }],
  createdBy: "seller@example.com",
  seller: "John Doe",
  dateCreated: new Date().toISOString(),
  cartItemCount: 0,
  wishlistItemCount: 0,
  location: "Lekki, Lagos",
  storeName: "Mock Seller's Store",
  fulfillmentOption: "Courier",
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

const mockPayoutRequests: PayoutRequestResponse[] = seedPayouts.map((p, i) => ({
  id: 901 + i,
  requestNumber: p.id,
  orderId: 20480 + i,
  orderNumber: `ORD-${20480 + i}`,
  sellerEmail: `${p.seller.toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
  sellerName: p.seller,
  amount: p.amount,
  status: p.status,
  requestedAt: new Date(Date.now() - i * 86400000).toISOString(),
  bankName: p.bank?.bankName,
  accountName: p.bank?.accountName,
  accountNumber: p.bank?.accountNumber,
  linkedOrders: [20480 + i],
}))

const mockPayoutPagedResult: PayoutRequestResponsePagedResult = {
  result: mockPayoutRequests,
  pageNumber: 1,
  pageSize: 20,
  totalCount: mockPayoutRequests.length,
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
    mutationFn: (args: { id: number; newPrice?: number }) =>
      withMock(true, () => approveListingApi(args.id, args.newPrice)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] })
    },
  })
}

export function useDeclineListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: number; reason?: string }) =>
      withMock(true, () => declineListingApi(args.id, args.reason)),
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

/* ───────── Admin Customer Management ───────── */

const mockModerationRecord: CustomerModerationRecordResponse = {
  reason: "Mock reason",
  durationDays: 7,
  date: new Date().toISOString(),
}

const mockAdminCustomer: AdminCustomerResponse = {
  id: 1,
  name: "Adaeze Okonkwo",
  email: "adaeze.okonkwo@alakowe.app",
  phoneNumber: "08030000000",
  avatar: "AO",
  role: "Seller",
  verified: false,
  status: "Active",
  listingsCount: 2,
  joined: new Date().toISOString(),
  lastActive: new Date().toISOString(),
}

const mockAdminCustomerDetail: AdminCustomerDetailResponse = {
  ...mockAdminCustomer,
  address: "1 Mock Street, Lagos",
  bio: "Reads mostly: Fiction",
  storeName: null,
  storeSlug: null,
  salesCount: 3,
  purchasesCount: 5,
  requestsCount: 1,
  warnings: [mockModerationRecord],
  suspensionHistory: [],
}

const mockCustomerPagedResult: AdminCustomerPagedResult = {
  result: [mockAdminCustomer],
  pageNumber: 1,
  pageSize: 20,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
}

export function useAdminCustomers(params?: CustomerFilterParams) {
  return useQuery({
    queryKey: ["admin-customers", params],
    queryFn: () => withMock(mockCustomerPagedResult, () => getAdminCustomersByFilterApi(params)),
  })
}

export function useAdminCustomer(id: number) {
  return useQuery({
    queryKey: ["admin-customers", id],
    queryFn: () => withMock(mockAdminCustomerDetail, () => getAdminCustomerByIdApi(id)),
    enabled: !!id,
  })
}

export function useVerifyCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => withMock(true, () => verifyCustomerApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
    },
  })
}

export function useFlagCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => withMock(true, () => flagCustomerApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
    },
  })
}

export function useWarnCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: WarnCustomerRequest & { id: number }) =>
      withMock(true, () => warnCustomerApi(body.id, { reason: body.reason })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
    },
  })
}

export function useSuspendCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: SuspendCustomerRequest & { id: number }) =>
      withMock(true, () => suspendCustomerApi(body.id, { reason: body.reason, durationDays: body.durationDays })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
    },
  })
}

export function useBanCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => withMock(true, () => banCustomerApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
    },
  })
}

export function useReactivateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => withMock(true, () => reactivateCustomerApi(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
    },
  })
}

export function useAdminPayoutRequests(status?: string) {
  return useQuery({
    queryKey: ["admin-payout-requests", status ?? "All"],
    queryFn: () => withMock(mockPayoutPagedResult, () => getAdminPayoutRequestsApi(status)),
  })
}

export function useAdminPayoutRequest(id: number) {
  return useQuery({
    queryKey: ["admin-payout-requests", id],
    queryFn: () => withMock(mockPayoutRequests.find((p) => p.id === id) ?? mockPayoutRequests[0], () => getAdminPayoutRequestByIdApi(id)),
    enabled: !!id,
  })
}

export function useUpdatePayoutRequestStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: number; status: string }) =>
      withMock(true, () => updatePayoutRequestStatusApi(args.id, args.status)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payout-requests"] })
    },
  })
}

/* ───────── Admin Order Disputes ───────── */

const mockDisputes: AdminDisputeResponse[] = seedDisputes.map((d, i) => ({
  id: 7000 + i,
  disputeNumber: d.id,
  orderId: 20480 + i,
  orderNumber: d.orderNumber,
  status: d.status,
  reason: d.reason,
  filedBy: d.filedBy,
  sellerName: d.seller,
  amount: d.amount,
  delivery: d.delivery,
  bookTitle: d.book,
  filedAt: d.filedAt,
  dueAt: d.dueAt,
  evidence: d.evidence,
  decision: d.status === "Resolved" ? "RefundBuyer" : d.status === "Rejected" ? "RuleForSeller" : null,
  resolution: d.resolution,
  decidedBy: d.decidedBy,
  decidedAt: d.decidedAt,
  activity: d.activity ?? [],
}))

export function useAdminDisputes(params?: AdminDisputeFilterParams) {
  return useQuery({
    queryKey: ["admin-disputes", params],
    queryFn: () => withMock({ items: mockDisputes, totalCount: mockDisputes.length }, () => getAdminDisputesApi(params)),
  })
}

export function useAdminDispute(orderNumber: string) {
  return useQuery({
    queryKey: ["admin-disputes", orderNumber],
    queryFn: () =>
      withMock(
        mockDisputes.find((d) => d.orderNumber === orderNumber) ?? mockDisputes[0],
        () => getAdminDisputeApi(orderNumber),
      ),
    enabled: !!orderNumber,
  })
}

export function useUpdateAdminDispute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { orderNumber: string; body: AdminDisputeUpdateRequest }) =>
      withMock(
        { ...(mockDisputes.find((d) => d.orderNumber === args.orderNumber) ?? mockDisputes[0]), ...args.body } as AdminDisputeResponse,
        () => updateAdminDisputeStatusApi(args.orderNumber, args.body),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] })
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
  })
}
