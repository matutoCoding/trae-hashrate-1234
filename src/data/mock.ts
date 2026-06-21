import { AlbumCategory, MediaFile, SaveStats, TransferRecord, ScanRecord } from '../types'
import { generateId } from '../utils/format'

const now = Date.now()
const day = 24 * 60 * 60 * 1000

function createMediaFile(
  id: string,
  name: string,
  size: number,
  type: 'image' | 'video',
  createTime: number,
  imageId: number,
  hash?: string,
  duration?: number,
  familyTag?: MediaFile['familyTag']
): MediaFile {
  return {
    id,
    name,
    size,
    type,
    hash: hash || 'hash_' + id,
    createTime,
    thumbnail: `https://picsum.photos/id/${imageId}/200/200`,
    duration,
    status: 'normal',
    familyTag: familyTag || 'unknown'
  }
}

export const mockAlbumCategories: AlbumCategory[] = [
  {
    id: 'baby',
    name: '宝宝成长',
    icon: '👶',
    color: '#ff7a45',
    bgColor: '#fff2e8',
    totalCount: 5,
    duplicateCount: 3,
    totalSize: 68157440,
    duplicateSize: 59768832,
    files: [
      createMediaFile('baby-local-1', 'IMG_20240115_01.jpg', 3145728, 'image', now - 30 * day, 64, 'hash-baby-1', undefined, 'baby'),
      createMediaFile('baby-local-2', 'IMG_20240120_02.jpg', 2621440, 'image', now - 25 * day, 91, undefined, undefined, 'baby'),
      createMediaFile('baby-local-3', 'VID_20240201_01.mp4', 52428800, 'video', now - 20 * day, 177, 'hash-baby-2', 125, 'baby'),
      createMediaFile('baby-local-4', 'IMG_20240210_03.jpg', 4194304, 'image', now - 15 * day, 338, 'hash-baby-3', undefined, 'baby'),
      createMediaFile('baby-local-5', 'IMG_20240215_04.jpg', 3670016, 'image', now - 10 * day, 1027, undefined, undefined, 'baby'),
    ],
    cloudFiles: [
      createMediaFile('baby-cloud-1', '宝宝百天照.jpg', 3145728, 'image', now - 35 * day, 64, 'hash-baby-1', undefined, 'baby'),
      createMediaFile('baby-cloud-2', '宝宝第一次笑.mp4', 52428800, 'video', now - 22 * day, 177, 'hash-baby-2', 125, 'baby'),
      createMediaFile('baby-cloud-3', '宝宝学走路.jpg', 4194304, 'image', now - 18 * day, 338, 'hash-baby-3', undefined, 'baby'),
    ]
  },
  {
    id: 'travel',
    name: '旅游合影',
    icon: '✈️',
    color: '#1890ff',
    bgColor: '#e6f7ff',
    totalCount: 4,
    duplicateCount: 2,
    totalSize: 118489088,
    duplicateSize: 110100480,
    files: [
      createMediaFile('travel-local-1', 'IMG_三亚_001.jpg', 5242880, 'image', now - 60 * day, 1015, 'hash-travel-1', undefined, 'travel'),
      createMediaFile('travel-local-2', 'IMG_三亚_002.jpg', 4718592, 'image', now - 59 * day, 1018, undefined, undefined, 'travel'),
      createMediaFile('travel-local-3', 'VID_海边_01.mp4', 104857600, 'video', now - 58 * day, 1036, 'hash-travel-2', 240, 'travel'),
      createMediaFile('travel-local-4', 'IMG_西湖_001.jpg', 3670016, 'image', now - 90 * day, 1039, undefined, undefined, 'travel'),
    ],
    cloudFiles: [
      createMediaFile('travel-cloud-1', '三亚之旅-海边.jpg', 5242880, 'image', now - 62 * day, 1015, 'hash-travel-1', undefined, 'travel'),
      createMediaFile('travel-cloud-2', '三亚vlog.mp4', 104857600, 'video', now - 60 * day, 1036, 'hash-travel-2', 240, 'travel'),
    ]
  },
  {
    id: 'elderly',
    name: '老人照片',
    icon: '👴',
    color: '#52c41a',
    bgColor: '#f6ffed',
    totalCount: 3,
    duplicateCount: 2,
    totalSize: 83886080,
    duplicateSize: 77594624,
    files: [
      createMediaFile('elderly-local-1', 'IMG_爷爷生日_01.jpg', 4194304, 'image', now - 120 * day, 787, 'hash-elderly-1', undefined, 'elderly'),
      createMediaFile('elderly-local-2', 'IMG_全家福_01.jpg', 6291456, 'image', now - 150 * day, 1082, undefined, undefined, 'elderly'),
      createMediaFile('elderly-local-3', 'VID_奶奶寿宴.mp4', 73400320, 'video', now - 180 * day, 3, 'hash-elderly-2', 180, 'elderly'),
    ],
    cloudFiles: [
      createMediaFile('elderly-cloud-1', '爷爷八十大寿.jpg', 4194304, 'image', now - 125 * day, 787, 'hash-elderly-1', undefined, 'elderly'),
      createMediaFile('elderly-cloud-2', '奶奶寿宴视频.mp4', 73400320, 'video', now - 185 * day, 3, 'hash-elderly-2', 180, 'elderly'),
    ]
  },
  {
    id: 'certificate',
    name: '证件资料',
    icon: '📄',
    color: '#722ed1',
    bgColor: '#f9f0ff',
    totalCount: 3,
    duplicateCount: 1,
    totalSize: 4718592,
    duplicateSize: 1048576,
    files: [
      createMediaFile('cert-local-1', '身份证_正面.jpg', 1048576, 'image', now - 200 * day, 1, 'hash-cert-1', undefined, 'certificate'),
      createMediaFile('cert-local-2', '户口本_首页.jpg', 1572864, 'image', now - 210 * day, 2, undefined, undefined, 'certificate'),
      createMediaFile('cert-local-3', '结婚证_01.jpg', 2097152, 'image', now - 300 * day, 6, undefined, undefined, 'certificate'),
    ],
    cloudFiles: [
      createMediaFile('cert-cloud-1', '爸爸身份证.jpg', 1048576, 'image', now - 205 * day, 1, 'hash-cert-1', undefined, 'certificate'),
    ]
  },
  {
    id: 'daily',
    name: '日常记录',
    icon: '📷',
    color: '#faad14',
    bgColor: '#fffbe6',
    totalCount: 4,
    duplicateCount: 2,
    totalSize: 48758784,
    duplicateSize: 45088768,
    files: [
      createMediaFile('daily-local-1', 'IMG_早餐_01.jpg', 2097152, 'image', now - 5 * day, 292, undefined, undefined, 'daily'),
      createMediaFile('daily-local-2', 'IMG_宠物_01.jpg', 3145728, 'image', now - 3 * day, 237, 'hash-daily-1', undefined, 'daily'),
      createMediaFile('daily-local-3', 'VID_猫咪玩耍.mp4', 41943040, 'video', now - 2 * day, 659, 'hash-daily-2', 65, 'daily'),
      createMediaFile('daily-local-4', 'IMG_花朵_01.jpg', 1572864, 'image', now - 1 * day, 1080, undefined, undefined, 'daily'),
    ],
    cloudFiles: [
      createMediaFile('daily-cloud-1', '家里的猫.jpg', 3145728, 'image', now - 7 * day, 237, 'hash-daily-1', undefined, 'daily'),
      createMediaFile('daily-cloud-2', '猫咪玩耍视频.mp4', 41943040, 'video', now - 4 * day, 659, 'hash-daily-2', 65, 'daily'),
    ]
  },
]

export const mockTransferRecords: TransferRecord[] = [
  {
    id: generateId(),
    fileName: '宝宝百天照.jpg',
    fileSize: 3145728,
    savedSize: 3145728,
    targetAlbum: '宝宝成长',
    transferTime: now - 2 * 60 * 60 * 1000,
    type: 'image'
  },
  {
    id: generateId(),
    fileName: '三亚之旅-海边.jpg',
    fileSize: 5242880,
    savedSize: 5242880,
    targetAlbum: '旅游合影',
    transferTime: now - 5 * 60 * 60 * 1000,
    type: 'image'
  },
  {
    id: generateId(),
    fileName: '宝宝第一次笑.mp4',
    fileSize: 52428800,
    savedSize: 52428800,
    targetAlbum: '宝宝成长',
    transferTime: now - 1 * day,
    type: 'video'
  },
]

export const mockScanRecords: ScanRecord[] = [
  {
    id: generateId(),
    source: 'album',
    sourceName: '手机相册',
    totalCount: 28,
    totalSize: 125829120,
    duplicateCount: 8,
    duplicateSize: 36700160,
    scanTime: now - 2 * day,
    fileIds: [],
    categoryId: 'daily'
  },
  {
    id: generateId(),
    source: 'wechat',
    sourceName: '聊天下载目录',
    totalCount: 15,
    totalSize: 73400320,
    duplicateCount: 5,
    duplicateSize: 20971520,
    scanTime: now - 5 * day,
    fileIds: [],
    categoryId: 'daily'
  }
]

export const mockSaveStats: SaveStats = {
  totalSavedSize: 60817408,
  totalTransferCount: 3,
  todaySavedSize: 8388608,
  todayTransferCount: 2,
  records: mockTransferRecords,
  scanRecords: mockScanRecords
}
