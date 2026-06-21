export interface MediaFile {
  id: string
  name: string
  size: number
  type: 'image' | 'video'
  hash: string
  createTime: number
  thumbnail: string
  duration?: number
  status?: 'normal' | 'transferred' | 'deleted'
  targetAlbum?: string
}

export interface AlbumCategory {
  id: string
  name: string
  icon: string
  color: string
  bgColor: string
  totalCount: number
  duplicateCount: number
  totalSize: number
  duplicateSize: number
  files: MediaFile[]
  cloudFiles: MediaFile[]
}

export interface ScanResult {
  totalFiles: number
  totalSize: number
  duplicateFiles: number
  duplicateSize: number
  categories: AlbumCategory[]
  scanTime: number
}

export interface TransferRecord {
  id: string
  fileName: string
  fileSize: number
  savedSize: number
  targetAlbum: string
  transferTime: number
  type: 'image' | 'video'
}

export interface SaveStats {
  totalSavedSize: number
  totalTransferCount: number
  todaySavedSize: number
  todayTransferCount: number
  records: TransferRecord[]
}

export type ScanStatus = 'idle' | 'scanning' | 'completed'
