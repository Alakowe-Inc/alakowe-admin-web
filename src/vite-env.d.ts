/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_CLOUDINARY_UPLOAD_FOLDER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
