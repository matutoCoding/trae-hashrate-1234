import { create } from 'zustand'
import { AlbumCategory, MediaFile, SaveStats, TransferRecord, ScanStatus } from '../types'
import { mockAlbumCategories, mockSaveStats } from '../data/mock'
import { generateId } from '../utils/format'

interface AppState {
  scanStatus: ScanStatus
  categories: AlbumCategory[]
  stats: SaveStats
  selectedFileIds: string[]
  currentCategoryId: string | null

  setScanStatus: (status: ScanStatus) => void
  setCategories: (categories: AlbumCategory[]) => void
  setStats: (stats: SaveStats) => void
  setCurrentCategoryId: (id: string | null) => void

  toggleFileSelection: (fileId: string) => void
  selectAllFiles: (fileIds: string[]) => void
  clearSelection: () => void

  addScannedFiles: (files: MediaFile[], source: {
    totalCount: number
    totalSize: number
  }) => void
  transferFiles: (
    albumId: string,
    fileIds: string[],
    albumName: string
  ) => {
    savedSize: number
    count: number
  }
  deleteLocalFiles: (
    albumId: string,
    fileIds: string[]
  ) => {
    freedSize: number
    count: number
  }
  addTransferRecord: (record: TransferRecord) => void
  resetAll: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  scanStatus: 'idle',
  categories: mockAlbumCategories,
  stats: mockSaveStats,
  selectedFileIds: [],
  currentCategoryId: null,

  setScanStatus: (status) => set({ scanStatus: status }),
  setCategories: (categories) => set({ categories }),
  setStats: (stats) => set({ stats }),
  setCurrentCategoryId: (id) => set({ currentCategoryId: id }),

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
    
    const categories = get().categories.map((cat) => ({ ...cat }))
    
    const imageFiles = files.filter((f) => f.type === 'image')
    const videoFiles = files.filter((f) => f.type === 'video')
    
    const cloudHashSet = new Set<string>()
    categories.forEach((cat) => {
      cat.cloudFiles.forEach((f) => cloudHashSet.add(f.hash))
    })

    let duplicateCount = 0
    let duplicateSize = 0
    const newFiles: MediaFile[] = []

    files.forEach((file) => {
      if (cloudHashSet.has(file.hash)) {
        duplicateCount++
        duplicateSize += file.size
        newFiles.push(file)
      } else {
        newFiles.push(file)
      }
    })

    const dailyCat = categories.find((c) => c.id === 'daily')
    if (dailyCat) {
      dailyCat.totalCount += files.length
      dailyCat.totalSize += summary.totalSize
      dailyCat.duplicateCount += duplicateCount
      dailyCat.duplicateSize += duplicateSize
      dailyCat.files = [...dailyCat.files, ...newFiles]
    }

    set({ categories })
  },

  transferFiles: (albumId, fileIds, albumName) => {
    console.log('[Store] 秒传文件', albumId, fileIds.length)
    const state = get()
    const category = state.categories.find((c) => c.id === albumId)
    if (!category) return { savedSize: 0, count: 0 }

    const selectedFiles = category.files.filter((f) => fileIds.includes(f.id))
    const savedSize = selectedFiles.reduce((sum, f) => sum + f.size, 0)
    const count = selectedFiles.length

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

    set({ stats: newStats })

    return { savedSize, count }
  },

  deleteLocalFiles: (albumId, fileIds) => {
    console.log('[Store] 删除本地文件', albumId, fileIds.length)
    const state = get()
    const categories = state.categories.map((c) => ({ ...c }))
    const category = categories.find((c) => c.id === albumId)

    if (!category) return { freedSize: 0, count: 0 }

    const filesToDelete = category.files.filter((f) => fileIds.includes(f.id))
    const freedSize = filesToDelete.reduce((sum, f) => sum + f.size, 0)
    const count = filesToDelete.length

    category.files = category.files.filter((f) => !fileIds.includes(f.id))
    category.totalCount -= count
    category.totalSize -= freedSize
    category.duplicateCount = Math.max(
      0,
      category.duplicateCount - count
    )
    category.duplicateSize = Math.max(
      0,
      category.duplicateSize - freedSize
    )

    const remainingSelected = get().selectedFileIds.filter(
      (id) => !fileIds.includes(id)
    )

    set({ categories, selectedFileIds: remainingSelected })

    return { freedSize, count }
  },

  addTransferRecord: (record) =>
    set((state) => ({
      stats: {
        ...state.stats,
        records: [record, ...state.stats.records]
      }
    })),

  resetAll: () =>
    set({
      scanStatus: 'idle',
      selectedFileIds: [],
      currentCategoryId: null
    })
}))
