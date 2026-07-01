# Catalogue & Discovery — Admin Web Integration Plan

## Objective

Integrate admin configuration UI for the Catalogue & Discovery feature into `alakowe-admin-web`. This covers CRUD management for **Tags**, **Collections**, **Categories** (with slug support), and **Landing Page sections**.

The backend API is implemented in `alakowe-books-api`. This plan documents every file change, new file, endpoint mapping, and UI pattern required.

---

## API Reference (from `swagger.json`)

### Tags — `AdminTag`

| Action | Method | Endpoint | Request Body | Response |
|--------|--------|----------|--------------|----------|
| Create | POST | `/api/v1/AdminTag/create` | `AddTagRequestDto` | `TagResponse` |
| Update | POST | `/api/v1/AdminTag/update` | `UpdateTagRequestDto` | `TagResponse` |
| Delete | DELETE | `/api/v1/AdminTag/delete/{id}` | — | `boolean` |
| List all | GET | `/api/v1/AdminTag/all` | — | `TagResponse[]` |
| By category | GET | `/api/v1/AdminTag/by-category/{categoryId}` | — | `TagResponse[]` |

**`AddTagRequestDto`**
```
name: string
slug?: string
categoryId?: number
```

**`UpdateTagRequestDto`**
```
id: number
name: string
slug?: string
categoryId?: number
```

**`TagResponse`**
```
id: number
name: string
slug: string
categoryId?: number
categoryName?: string
```

---

### Collections — `AdminCollection`

| Action | Method | Endpoint | Request Body | Response |
|--------|--------|----------|--------------|----------|
| Create | POST | `/api/v1/AdminCollection/create` | `AddCollectionRequestDto` | `CollectionResponse` |
| Update | POST | `/api/v1/AdminCollection/update` | `UpdateCollectionRequestDto` | `CollectionResponse` |
| Delete | DELETE | `/api/v1/AdminCollection/delete/{id}` | — | `boolean` |
| List all | GET | `/api/v1/AdminCollection/all` | — | `CollectionResponse[]` |
| Assign listings | POST | `/api/v1/AdminCollection/assign-listings` | `AssignListingsToCollectionDto` | `boolean` |
| Remove listings | POST | `/api/v1/AdminCollection/remove-listings` | `RemoveListingsFromCollectionDto` | `boolean` |
| Update priority | POST | `/api/v1/AdminCollection/update-priority` | `UpdateCollectionPriorityDto` | `boolean` |

**`AddCollectionRequestDto`**
```
name: string
slug?: string
description?: string
```

**`UpdateCollectionRequestDto`**
```
id: number
name: string
slug?: string
description?: string
```

**`CollectionResponse`**
```
id: number
name: string
slug: string
description?: string
isActive: boolean
```

**`AssignListingsToCollectionDto`**
```
collectionId: number
listings?: AssignListingDto[]   // { listingId: number, priority?: number }
```

**`RemoveListingsFromCollectionDto`**
```
collectionId: number
listingIds?: number[]
```

**`UpdateCollectionPriorityDto`**
```
collectionId: number
listingId: number
priority: number
```

---

### Landing Page — `AdminLandingPage`

| Action | Method | Endpoint | Request Body | Response |
|--------|--------|----------|--------------|----------|
| Create section | POST | `/api/v1/AdminLandingPage/create` | `AddLandingPageSectionRequestDto` | `LandingPageSectionResponse` |
| Update section | POST | `/api/v1/AdminLandingPage/update` | `UpdateLandingPageSectionRequestDto` | `LandingPageSectionResponse` |
| Delete section | DELETE | `/api/v1/AdminLandingPage/delete/{id}` | — | `boolean` |

**`AddLandingPageSectionRequestDto`**
```
displayOrder: number
sectionType: "Category" | "Collection" | "Tag"
referenceId: number
titleOverride?: string
```

**`UpdateLandingPageSectionRequestDto`**
```
id: number
displayOrder: number
titleOverride?: string
```

**`LandingPageSectionResponse`**
```
id: number
title: string
sectionType: string
filterParam: any
listings: ListingResponse[]
```

**`LandingPageSectionType` enum**
```
Category | Collection | Tag
```

---

### Categories — `AdminCategory` (existing, with slug update)

| Action | Method | Endpoint | Request Body | Response |
|--------|--------|----------|--------------|----------|
| Create | POST | `/api/v1/AdminCategory/create` | `AddCategoryRequestDto` | `CategoryResponse` |
| Update | POST | `/api/v1/AdminCategory/update` | `UpdateCategoryRequestDto` | `CategoryResponse` |
| Delete | DELETE | `/api/v1/AdminCategory/delete/{id}` | — | `boolean` |
| Get by ID | GET | `/api/v1/AdminCategory/{id}` | — | `CategoryResponse` |
| List all | GET | `/api/v1/AdminCategory/all` | — | `CategoryResponse[]` |

**`AddCategoryRequestDto`**
```
name: string
slug?: string
```

**`UpdateCategoryRequestDto`**
```
id: number
name: string
slug?: string
```

**`CategoryResponse`**
```
id: number
name: string
slug: string
```

---

## File Change Summary

### Modified Files

| File | Change |
|------|--------|
| `src/lib/api/types.ts` | Add Tag, Collection, Landing Page DTOs; update Category types |
| `src/lib/api/admin/admin.api.ts` | Add 15 new API functions |
| `src/lib/api/admin/admin.hooks.ts` | Add 15 new React Query hooks |
| `src/App.tsx` | Add 4 new routes under `/admin/catalogue/*` |
| `src/admin/components/Sidebar.tsx` | Add top-level "Catalogue" nav group |
| `src/admin/components/AdminLayout.tsx` | Add 4 page title entries |

### New Files

| File | Description |
|------|-------------|
| `src/admin/pages/CatalogueCategories.tsx` | Standalone Category CRUD page |
| `src/admin/pages/CatalogueTags.tsx` | Tag CRUD page with category scoping |
| `src/admin/pages/CatalogueCollections.tsx` | Collection CRUD + listing assignment |
| `src/admin/pages/CatalogueLandingPage.tsx` | Landing page section order management |

---

## Phase 1: Type Definitions & API Layer

### Step 1.1 — `src/lib/api/types.ts`

Add the following interfaces at the end of the file:

```typescript
/* ───────── Catalogue & Discovery: Tags ───────── */

export interface AddTagRequestDto {
  name?: string | null
  slug?: string | null
  categoryId?: number | null
}

export interface UpdateTagRequestDto {
  id?: number
  name?: string | null
  slug?: string | null
  categoryId?: number | null
}

export interface TagResponse {
  id?: number
  name?: string | null
  slug?: string | null
  categoryId?: number | null
  categoryName?: string | null
}

/* ───────── Catalogue & Discovery: Collections ───────── */

export interface AddCollectionRequestDto {
  name?: string | null
  slug?: string | null
  description?: string | null
}

export interface UpdateCollectionRequestDto {
  id?: number
  name?: string | null
  slug?: string | null
  description?: string | null
}

export interface CollectionResponse {
  id?: number
  name?: string | null
  slug?: string | null
  description?: string | null
  isActive?: boolean
}

export interface AssignListingDto {
  listingId?: number
  priority?: number | null
}

export interface AssignListingsToCollectionDto {
  collectionId?: number
  listings?: AssignListingDto[] | null
}

export interface RemoveListingsFromCollectionDto {
  collectionId?: number
  listingIds?: number[] | null
}

export interface UpdateCollectionPriorityDto {
  collectionId?: number
  listingId?: number
  priority?: number
}

/* ───────── Catalogue & Discovery: Landing Page ───────── */

export type LandingPageSectionType = "Category" | "Collection" | "Tag"

export interface AddLandingPageSectionRequestDto {
  displayOrder?: number
  sectionType?: LandingPageSectionType
  referenceId?: number
  titleOverride?: string | null
}

export interface UpdateLandingPageSectionRequestDto {
  id?: number
  displayOrder?: number
  titleOverride?: string | null
}

export interface LandingPageSectionResponse {
  id?: number
  title?: string | null
  sectionType?: string | null
  filterParam?: any
  listings?: ListingResponse[] | null
}
```

Update existing `AddCategoryRequestDto` and `UpdateCategoryRequestDto` to add `slug`:

```typescript
export interface AddCategoryRequestDto {
  name?: string | null
  slug?: string | null       // ← ADD
}

export interface UpdateCategoryRequestDto {
  name?: string | null
  slug?: string | null       // ← ADD
  id?: number
}

export interface CategoryResponse {
  id?: number
  name?: string | null
  slug?: string | null       // ← ADD
}
```

---

### Step 1.2 — `src/lib/api/admin/admin.api.ts`

Add imports for the new types, then add these functions:

```typescript
/* ───────── Admin Tags ───────── */

export async function createTagApi(body: AddTagRequestDto): Promise<TagResponse> {
  const { data } = await client.post("/api/v1/AdminTag/create", body)
  return data as TagResponse
}

export async function updateTagApi(body: UpdateTagRequestDto): Promise<TagResponse> {
  const { data } = await client.post("/api/v1/AdminTag/update", body)
  return data as TagResponse
}

export async function deleteTagApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminTag/delete/${id}`)
  return data as boolean
}

export async function getAllTagsApi(): Promise<TagResponse[]> {
  const { data } = await client.get("/api/v1/AdminTag/all")
  return data as TagResponse[]
}

export async function getTagsByCategoryApi(categoryId: number): Promise<TagResponse[]> {
  const { data } = await client.get(`/api/v1/AdminTag/by-category/${categoryId}`)
  return data as TagResponse[]
}

/* ───────── Admin Collections ───────── */

export async function createCollectionApi(body: AddCollectionRequestDto): Promise<CollectionResponse> {
  const { data } = await client.post("/api/v1/AdminCollection/create", body)
  return data as CollectionResponse
}

export async function updateCollectionApi(body: UpdateCollectionRequestDto): Promise<CollectionResponse> {
  const { data } = await client.post("/api/v1/AdminCollection/update", body)
  return data as CollectionResponse
}

export async function deleteCollectionApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminCollection/delete/${id}`)
  return data as boolean
}

export async function getAllCollectionsApi(): Promise<CollectionResponse[]> {
  const { data } = await client.get("/api/v1/AdminCollection/all")
  return data as CollectionResponse[]
}

export async function assignListingsToCollectionApi(body: AssignListingsToCollectionDto): Promise<boolean> {
  const { data } = await client.post("/api/v1/AdminCollection/assign-listings", body)
  return data as boolean
}

export async function removeListingsFromCollectionApi(body: RemoveListingsFromCollectionDto): Promise<boolean> {
  const { data } = await client.post("/api/v1/AdminCollection/remove-listings", body)
  return data as boolean
}

export async function updateCollectionPriorityApi(body: UpdateCollectionPriorityDto): Promise<boolean> {
  const { data } = await client.post("/api/v1/AdminCollection/update-priority", body)
  return data as boolean
}

/* ───────── Admin Landing Page ───────── */

export async function createLandingPageSectionApi(body: AddLandingPageSectionRequestDto): Promise<LandingPageSectionResponse> {
  const { data } = await client.post("/api/v1/AdminLandingPage/create", body)
  return data as LandingPageSectionResponse
}

export async function updateLandingPageSectionApi(body: UpdateLandingPageSectionRequestDto): Promise<LandingPageSectionResponse> {
  const { data } = await client.post("/api/v1/AdminLandingPage/update", body)
  return data as LandingPageSectionResponse
}

export async function deleteLandingPageSectionApi(id: number): Promise<boolean> {
  const { data } = await client.delete(`/api/v1/AdminLandingPage/delete/${id}`)
  return data as boolean
}
```

Also update the `createCategoryApi` and `updateCategoryApi` functions to accept the updated DTOs with `slug`.

---

### Step 1.3 — `src/lib/api/admin/admin.hooks.ts`

Add imports for the new API functions and types, then add:

```typescript
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
```

---

## Phase 2: Page Components

### Step 2.1 — `src/admin/pages/CatalogueCategories.tsx`

**Pattern**: Clone `Locations.tsx` StatesTab (simple name-only CRUD with card grid).

**Form fields**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | text input | yes | Max 100 chars |
| `slug` | text input | no | Auto-generated from name on first type; user can override |

**Page layout**:
- Header with "Add Category" button
- Grid of cards (`sm:grid-cols-2 lg:grid-cols-3`)
- Each card: category name, slug badge, edit/delete buttons
- Create/Edit Dialog with both fields
- Delete AlertDialog confirmation

**Hooks used**: `useAllCategories`, `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`

**Slug auto-generation**: On `name` change, if `slug` field is untouched, auto-generate via `name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")`.

---

### Step 2.2 — `src/admin/pages/CatalogueTags.tsx`

**Pattern**: Same as Categories but with an additional `categoryId` dropdown.

**Form fields**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | text input | yes | Max 100 chars |
| `slug` | text input | no | Auto-generated from name |
| `categoryId` | select dropdown | no | Loads all categories via `useAllCategories()` |

**Page layout**:
- Header with "Add Tag" button
- Grid of cards
- Each card: tag name, slug badge, parent category badge (if any), edit/delete
- Create/Edit Dialog with all three fields
- Delete AlertDialog confirmation

**Hooks used**: `useAllTags`, `useCreateTag`, `useUpdateTag`, `useDeleteTag`, `useAllCategories`

**Category dropdown**: Show "Global (all categories)" as the empty option, then list each category by name.

---

### Step 2.3 — `src/admin/pages/CatalogueCollections.tsx`

**Pattern**: Two-level UI — list view + expanded detail view.

**Main view — Collection list**:
- Header with "Add Collection" button
- Grid of cards (`sm:grid-cols-2 lg:grid-cols-3`)
- Each card: name, slug, description snippet, active badge, edit/delete buttons
- Click card → expand to detail view

**Create/Edit Dialog fields**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | text input | yes | Max 150 chars |
| `slug` | text input | no | Auto-generated from name |
| `description` | textarea | no | Max 500 chars |

**Expanded detail view** (below the card or as a panel):
- Collection header (name, slug, description)
- "Assigned Listings" table: listing title, priority, remove button
- "Assign Listings" button → opens assignment dialog
- Priority editing: inline up/down arrow buttons per row

**Assignment Dialog**:
- Search/filter input for listings
- Checkbox list of available listings
- Priority input per selected listing
- "Assign" button calls `useAssignListingsToCollection`

**Remove flow**:
- Select listings via checkbox in the detail table
- "Remove Selected" button calls `useRemoveListingsFromCollection`

**Priority update**:
- Up/Down arrow buttons per listing row
- Calls `useUpdateCollectionPriority` with incremented/decremented priority value

**Hooks used**: `useAllCollections`, `useCreateCollection`, `useUpdateCollection`, `useDeleteCollection`, `useAssignListingsToCollection`, `useRemoveListingsFromCollection`, `useUpdateCollectionPriority`

---

### Step 2.4 — `src/admin/pages/CatalogueLandingPage.tsx`

**Pattern**: Ordered list with up/down reordering controls.

**Page layout**:
- Header with "Add Section" button
- Ordered list of section cards (numbered by `displayOrder`)
- Each card shows:
  - Display order number
  - Section type badge (Category = blue, Collection = green, Tag = purple)
  - Title (titleOverride or entity name)
  - Up/Down arrow buttons to reorder
  - Edit (titleOverride + displayOrder) and Delete buttons

**Create Section Dialog fields**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `sectionType` | select dropdown | yes | Options: Category, Collection, Tag |
| `referenceId` | select dropdown | yes | Dynamic — loads based on sectionType |
| `displayOrder` | number input | yes | Where to insert in the order |
| `titleOverride` | text input | no | Custom display title |

**Reference ID dropdown logic**:
- When `sectionType = "Category"` → load all categories via `useAllCategories()`
- When `sectionType = "Collection"` → load all collections via `useAllCollections()`
- When `sectionType = "Tag"` → load all tags via `useAllTags()`

**Reordering**:
- Up button: swap `displayOrder` with the section above (calls `useUpdateLandingPageSection` for both swapped sections)
- Down button: swap `displayOrder` with the section below
- No drag-and-drop dependency needed

**Edit Section Dialog**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `displayOrder` | number input | yes | Updated order position |
| `titleOverride` | text input | no | Updated custom title |

**Delete**: AlertDialog confirmation, calls `useDeleteLandingPageSection`

**Hooks used**: `useCreateLandingPageSection`, `useUpdateLandingPageSection`, `useDeleteLandingPageSection`, `useAllCategories`, `useAllCollections`, `useAllTags`

**Note**: There is no "list all sections" endpoint in the API. The admin landing page sections would need to be fetched from the public `GET /api/v1/LandingPage/landing-page` endpoint. This returns the full `LandingPageResponse` with sections. The admin page should:
1. Fetch from `/api/v1/LandingPage/landing-page` (add a `getLandingPageApi()` function + `useLandingPage()` hook)
2. Display sections from the response
3. After create/update/delete, invalidate the `["admin-landing-page"]` query key

Add to `admin.api.ts`:
```typescript
export async function getLandingPageApi(): Promise<any> {
  const { data } = await client.get("/api/v1/LandingPage/landing-page")
  return data
}
```

Add to `admin.hooks.ts`:
```typescript
export function useLandingPage() {
  return useQuery({
    queryKey: ["admin-landing-page"],
    queryFn: () => withMock({ sections: [] }, () => getLandingPageApi()),
  })
}
```

---

## Phase 3: Routing & Navigation

### Step 3.1 — `src/App.tsx`

Add imports for the 4 new page components, then add routes inside the `<Routes>` block:

```tsx
import CatalogueCategories from "@/admin/pages/CatalogueCategories";
import CatalogueTags from "@/admin/pages/CatalogueTags";
import CatalogueCollections from "@/admin/pages/CatalogueCollections";
import CatalogueLandingPage from "@/admin/pages/CatalogueLandingPage";

// Inside <Routes>:
<Route path="/admin/catalogue/categories" element={adminWrap(<CatalogueCategories />)} />
<Route path="/admin/catalogue/tags" element={adminWrap(<CatalogueTags />)} />
<Route path="/admin/catalogue/collections" element={adminWrap(<CatalogueCollections />)} />
<Route path="/admin/catalogue/landing-page" element={adminWrap(<CatalogueLandingPage />)} />
<Route path="/admin/catalogue" element={<Navigate to="/admin/catalogue/categories" replace />} />
```

---

### Step 3.2 — `src/admin/components/Sidebar.tsx`

Add imports for `Tag`, `LayoutList` from `lucide-react`.

Add a top-level "Catalogue" nav group after the existing items. The sidebar `items` array does not support groups natively, so add the items as a visual section using a comment separator and a label:

```tsx
import { Tag, LayoutList, Layers, LayoutDashboard } from "lucide-react"

// In the items array, add after the Configuration group:

// ─── Catalogue & Discovery ───
{ label: "Categories", to: "/admin/catalogue/categories", icon: Layers },
{ label: "Tags", to: "/admin/catalogue/tags", icon: Tag },
{ label: "Collections", to: "/admin/catalogue/collections", icon: LayoutList },
{ label: "Landing Page", to: "/admin/catalogue/landing-page", icon: LayoutDashboard },
```

Alternatively, render a section divider label "CATALOGUE" above these items by modifying the sidebar render logic to detect the group boundary.

---

### Step 3.3 — `src/admin/components/AdminLayout.tsx`

Add entries to the `TITLES` record:

```tsx
"/admin/catalogue": { title: "Catalogue", subtitle: "Manage categories, tags, collections and landing page." },
"/admin/catalogue/categories": { title: "Categories", subtitle: "Manage book categories and URL slugs." },
"/admin/catalogue/tags": { title: "Tags", subtitle: "Manage book tags and category scoping." },
"/admin/catalogue/collections": { title: "Collections", subtitle: "Curate listing collections and priorities." },
"/admin/catalogue/landing-page": { title: "Landing Page", subtitle: "Configure homepage section layout and ordering." },
```

---

## Dependency: New Lucide Icons

Ensure these icons are available (already in `lucide-react` v0.462.0):
- `Tag` — for Tags nav item
- `LayoutList` — for Collections nav item
- `Layers` — for Categories nav item
- `LayoutDashboard` — reuse for Landing Page
- `ArrowUp`, `ArrowDown` — for priority/ordering controls
- `Search` — already available, for listing search in assignment dialog
- `Check`, `X` — for selection UI

---

## Implementation Order

| Step | What | Files |
|------|------|-------|
| 1 | Add TypeScript types | `types.ts` |
| 2 | Add API functions | `admin.api.ts` |
| 3 | Add React Query hooks | `admin.hooks.ts` |
| 4 | Create Categories page | `CatalogueCategories.tsx` |
| 5 | Create Tags page | `CatalogueTags.tsx` |
| 6 | Create Collections page | `CatalogueCollections.tsx` |
| 7 | Create Landing Page page | `CatalogueLandingPage.tsx` |
| 8 | Add routes | `App.tsx` |
| 9 | Add sidebar nav | `Sidebar.tsx` |
| 10 | Add page titles | `AdminLayout.tsx` |

---

## Verification

After implementation:
1. Run `npx tsc --noEmit` to verify TypeScript compiles without errors
2. Run `npm run lint` (if configured) to check for lint issues
3. Run `npm run build` to verify production build succeeds
4. Manual smoke test: navigate to each new page, create/edit/delete an entity, verify toast notifications and data refresh
