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
  familyTag?: 'baby' | 'elderly' | 'travel' | 'certificate' | 'daily' | 'unknown'
  scanRecordId?: string
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

export interface ScanRecord {
  id: string
  source: 'album' | 'wechat' | 'all'
  sourceName: string
  totalCount: number
  totalSize: number
  duplicateCount: number
  duplicateSize: number
  scanTime: number
  fileIds: string[]
  categoryId: string
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
  scanRecords: ScanRecord[]
}

export type ScanStatus = 'idle' | 'scanning' | 'completed'

export type FamilyFilter = 'all' | 'baby' | 'elderly' | 'travel' | 'certificate' | 'daily'
export type TimeFilter = 'all' | 'year' | 'month' | 'week'
