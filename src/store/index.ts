import { create } from 'zustand'
import { AlbumCategory, MediaFile, SaveStats, TransferRecord, ScanStatus, ScanRecord } from '../types'
import { mockAlbumCategories, mockSaveStats } from '../data/mock'
import { generateId } from '../utils/format'

interface AppState {
  scanStatus: ScanStatus
  categories: AlbumCategory[]
  stats: SaveStats
  selectedFileIds: string[]
  currentCategoryId: string | null
  cloudHashPool: Map<string, MediaFile>

  setScanStatus: (status: ScanStatus) => void
  setCategories: (categories: AlbumCategory[]) => void
  setStats: (stats: SaveStats) => void
  setCurrentCategoryId: (id: string | null) => void
  initCloudHashPool: () => void
  getCloudHashMatch: (hash: string) => MediaFile | undefined

  toggleFileSelection: (fileId: string) => void
  selectAllFiles: (fileIds: string[]) => void
  clearSelection: () => void

  addScannedFiles: (files: MediaFile[], source: {
    totalCount: number
    totalSize: number
    source: 'album' | 'wechat' | 'all'
    sourceName: string
  }) => void
  transferFiles: (
    albumId: string,
    fileIds: string[],
    albumName: string
  ) => {
    savedSize: number
    count: number
    fileNames: string[]
  }
  deleteLocalFiles: (
    albumId: string,
    fileIds: string[]
  ) => {
    freedSize: number
    count: number
  }
  addTransferRecord: (record: TransferRecord) => void
  addScanRecord: (record: ScanRecord) => void
  resetAll: () => void
}

function buildCloudHashPool(categories: AlbumCategory[]): Map<string, MediaFile> {
  const pool = new Map<string, MediaFile>()
  categories.forEach((cat) => {
    cat.cloudFiles.forEach((f) => {
      if (!pool.has(f.hash)) {
        pool.set(f.hash, f)
      }
    })
  })
  return pool
}

export const useAppStore = create<AppState>((set, get) => ({
  scanStatus: 'idle',
  categories: mockAlbumCategories,
  stats: mockSaveStats,
  selectedFileIds: [],
  currentCategoryId: null,
  cloudHashPool: buildCloudHashPool(mockAlbumCategories),

  setScanStatus: (status) => set({ scanStatus: status }),
  setCategories: (categories) => set({ categories, cloudHashPool: buildCloudHashPool(categories) }),
  setStats: (stats) => set({ stats }),
  setCurrentCategoryId: (id) => set({ currentCategoryId: id }),

  initCloudHashPool: () => {
    const categories = get().categories
    set({ cloudHashPool: buildCloudHashPool(categories) })
  },

  getCloudHashMatch: (hash) => {
    return get().cloudHashPool.get(hash)
  },

  toggleFileSelection: (fileId) =>
    set((state) => ({
      selectedFileIds: state.selectedFileIds.includes(fileId)
        ? state.selectedFileIds.filter((id) => id !== fileId)
        : [...state.selectedFileIds, fileId]
    })),

  selectAllFiles: (fileIds) => {
    const state = get()
    const allSelected = fileIds.every((id) => state.selectedFileIds.includes(id))
    if (allSelected) {
      set({
        selectedFileIds: state.selectedFileIds.filter(
          (id) => !fileIds.includes(id)
        )
      })
    } else {
      const newIds = new Set([...state.selectedFileIds, ...fileIds])
      set({ selectedFileIds: Array.from(newIds) })
    }
  },

  clearSelection: () => set({ selectedFileIds: [] }),

  addScannedFiles: (files, summary) => {
    console.log('[Store] 添加扫描文件', files.length, summary)
    
    const categories = get().categories.map((cat) => ({ ...cat, files: [...cat.files] }))
    const cloudHashPool = get().cloudHashPool

    let duplicateCount = 0
    let duplicateSize = 0
    const scanFileIds: string[] = []
    const scanRecordId = generateId()

    const filesWithTag = files.map((file) => {
      let familyTag: MediaFile['familyTag'] = 'daily'
      const cloudMatch = cloudHashPool.get(file.hash)
      if (cloudMatch?.familyTag) {
        familyTag = cloudMatch.familyTag
      } else if (file.name.includes('宝宝') || file.name.includes('baby') || file.name.includes('BABY')) {
        familyTag = 'baby'
      } else if (file.name.includes('爷爷') || file.name.includes('奶奶') || file.name.includes('老人')) {
        familyTag = 'elderly'
      } else if (file.name.includes('旅游') || file.name.includes('三亚') || file.name.includes('西湖') || file.name.includes('海边')) {
        familyTag = 'travel'
      } else if (file.name.includes('身份证') || file.name.includes('户口') || file.name.includes('结婚') || file.name.includes('证件')) {
        familyTag = 'certificate'
      }
      return { ...file, familyTag, scanRecordId }
    })

    filesWithTag.forEach((file) => {
      scanFileIds.push(file.id)
      if (cloudHashPool.has(file.hash)) {
        duplicateCount++
        duplicateSize += file.size
      }
    })

    const dailyCat = categories.find((c) => c.id === 'daily')
    if (dailyCat) {
      dailyCat.totalCount += filesWithTag.length
      dailyCat.totalSize += summary.totalSize
      dailyCat.duplicateCount += duplicateCount
      dailyCat.duplicateSize += duplicateSize
      dailyCat.files = [...dailyCat.files, ...filesWithTag]
    }

    const newPool = new Map(cloudHashPool)
    filesWithTag.forEach((f) => {
      if (!newPool.has(f.hash)) {
        newPool.set(f.hash, f)
      }
    })

    set({ categories, cloudHashPool: newPool })

    get().addScanRecord({
      id: scanRecordId,
      source: summary.source,
      sourceName: summary.sourceName,
      totalCount: filesWithTag.length,
      totalSize: summary.totalSize,
      duplicateCount,
      duplicateSize,
      scanTime: Date.now(),
      fileIds: scanFileIds,
      categoryId: 'daily'
    })
  },

  transferFiles: (albumId, fileIds, albumName) => {
    console.log('[Store] 秒传文件', albumId, fileIds.length, albumName)
    const state = get()
    const categories = state.categories.map((c) => ({ ...c, files: [...c.files] }))
    const category = categories.find((c) => c.id === albumId)
    if (!category) return { savedSize: 0, count: 0, fileNames: [] }

    const selectedFiles = category.files.filter((f) => fileIds.includes(f.id))
    const savedSize = selectedFiles.reduce((sum, f) => sum + f.size, 0)
    const count = selectedFiles.length

    category.files = category.files.map((f) => {
      if (fileIds.includes(f.id)) {
        return { ...f, status: 'transferred' as const, targetAlbum: albumName }
      }
      return f
    })

    const duplicateFiles = category.files.filter(
      (f) => f.status !== 'deleted' && f.status !== 'transferred' && category.cloudFiles.some((c) => c.hash === f.hash)
    )
    category.duplicateCount = duplicateFiles.length
    category.duplicateSize = duplicateFiles.reduce((sum, f) => sum + f.size, 0)

    const newRecords: TransferRecord[] = selectedFiles.map((f) => ({
      id: generateId(),
      fileName: f.name,
      fileSize: f.size,
      savedSize: f.size,
      targetAlbum: albumName,
      transferTime: Date.now(),
      type: f.type
    }))

    const newStats = { ...state.stats }
    newStats.totalSavedSize += savedSize
    newStats.totalTransferCount += count
    newStats.todaySavedSize += savedSize
    newStats.todayTransferCount += count
    newStats.records = [...newRecords, ...newStats.records]

    const remainingSelected = get().selectedFileIds.filter(
      (id) => !fileIds.includes(id)
    )

    const newPool = buildCloudHashPool(categories)

    set({ categories, stats: newStats, selectedFileIds: remainingSelected, cloudHashPool: newPool })

    return { savedSize, count, fileNames: selectedFiles.map((f) => f.name) }
  },

  deleteLocalFiles: (albumId, fileIds) => {
    console.log('[Store] 删除本地文件', albumId, fileIds.length)
    const state = get()
    const categories = state.categories.map((c) => ({ ...c, files: [...c.files] }))
    const category = categories.find((c) => c.id === albumId)

    if (!category) return { freedSize: 0, count: 0 }

    const filesToDelete = category.files.filter((f) => fileIds.includes(f.id))
    const freedSize = filesToDelete.reduce((sum, f) => sum + f.size, 0)
    const count = filesToDelete.length

    category.files = category.files.map((f) => {
      if (fileIds.includes(f.id)) {
        return { ...f, status: 'deleted' as const }
      }
      return f
    })

    category.totalCount = category.files.filter((f) => f.status !== 'deleted').length
    category.totalSize = category.files.filter((f) => f.status !== 'deleted').reduce((sum, f) => sum + f.size, 0)

    const duplicateFiles = category.files.filter(
      (f) => f.status !== 'deleted' && f.status !== 'transferred' && category.cloudFiles.some((c) => c.hash === f.hash)
    )
    category.duplicateCount = duplicateFiles.length
    category.duplicateSize = duplicateFiles.reduce((sum, f) => sum + f.size, 0)

    const remainingSelected = get().selectedFileIds.filter(
      (id) => !fileIds.includes(id)
    )

    const newPool = buildCloudHashPool(categories)

    set({ categories, selectedFileIds: remainingSelected, cloudHashPool: newPool })

    return { freedSize, count }
  },

  addTransferRecord: (record) =>
    set((state) => ({
      stats: {
        ...state.stats,
        records: [record, ...state.stats.records]
      }
    })),

  addScanRecord: (record) =>
    set((state) => ({
      stats: {
        ...state.stats,
        scanRecords: [
          { ...record },
          ...state.stats.scanRecords.slice(0, 19)
        ]
      }
    })),

  resetAll: () =>
    set({
      scanStatus: 'idle',
      selectedFileIds: [],
      currentCategoryId: null
    })
}))
