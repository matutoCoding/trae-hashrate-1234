import { AlbumCategory, MediaFile, SaveStats, TransferRecord } from '../types'
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
  duration?: number
): MediaFile {
  return {
    id,
    name,
    size,
    type,
    hash: 'hash_' + id,
    createTime,
    thumbnail: `https://picsum.photos/id/${imageId}/200/200`,
    duration
  }
}

export const mockAlbumCategories: AlbumCategory[] = [
  {
    id: 'baby',
    name: '宝宝成长',
    icon: '👶',
    color: '#ff7a45',
    bgColor: '#fff2e8',
    totalCount: 128,
    duplicateCount: 45,
    totalSize: 524288000,
    duplicateSize: 183500800,
    files: [
      createMediaFile('b1', 'IMG_20240115_01.jpg', 3145728, 'image', now - 30 * day, 64),
      createMediaFile('b2', 'IMG_20240120_02.jpg', 2621440, 'image', now - 25 * day, 91),
      createMediaFile('b3', 'VID_20240201_01.mp4', 52428800, 'video', now - 20 * day, 177, 125),
      createMediaFile('b4', 'IMG_20240210_03.jpg', 4194304, 'image', now - 15 * day, 338),
      createMediaFile('b5', 'IMG_20240215_04.jpg', 3670016, 'image', now - 10 * day, 1027),
    ],
    cloudFiles: [
      createMediaFile('bc1', '宝宝百天照.jpg', 3145728, 'image', now - 35 * day, 64),
      createMediaFile('bc2', '宝宝第一次笑.mp4', 52428800, 'video', now - 22 * day, 177, 125),
      createMediaFile('bc3', '宝宝学走路.jpg', 4194304, 'image', now - 18 * day, 338),
    ]
  },
  {
    id: 'travel',
    name: '旅游合影',
    icon: '✈️',
    color: '#1890ff',
    bgColor: '#e6f7ff',
    totalCount: 86,
    duplicateCount: 32,
    totalSize: 734003200,
    duplicateSize: 272629760,
    files: [
      createMediaFile('t1', 'IMG_三亚_001.jpg', 5242880, 'image', now - 60 * day, 1015),
      createMediaFile('t2', 'IMG_三亚_002.jpg', 4718592, 'image', now - 59 * day, 1018),
      createMediaFile('t3', 'VID_海边_01.mp4', 104857600, 'video', now - 58 * day, 1036, 240),
      createMediaFile('t4', 'IMG_西湖_001.jpg', 3670016, 'image', now - 90 * day, 1039),
    ],
    cloudFiles: [
      createMediaFile('tc1', '三亚之旅-海边.jpg', 5242880, 'image', now - 62 * day, 1015),
      createMediaFile('tc2', '三亚vlog.mp4', 104857600, 'video', now - 60 * day, 1036, 240),
    ]
  },
  {
    id: 'elderly',
    name: '老人照片',
    icon: '👴',
    color: '#52c41a',
    bgColor: '#f6ffed',
    totalCount: 54,
    duplicateCount: 18,
    totalSize: 157286400,
    duplicateSize: 52428800,
    files: [
      createMediaFile('e1', 'IMG_爷爷生日_01.jpg', 4194304, 'image', now - 120 * day, 787),
      createMediaFile('e2', 'IMG_全家福_01.jpg', 6291456, 'image', now - 150 * day, 1082),
      createMediaFile('e3', 'VID_奶奶寿宴.mp4', 73400320, 'video', now - 180 * day, 3, 180),
    ],
    cloudFiles: [
      createMediaFile('ec1', '爷爷八十大寿.jpg', 4194304, 'image', now - 125 * day, 787),
      createMediaFile('ec2', '奶奶寿宴视频.mp4', 73400320, 'video', now - 185 * day, 3, 180),
    ]
  },
  {
    id: 'certificate',
    name: '证件资料',
    icon: '📄',
    color: '#722ed1',
    bgColor: '#f9f0ff',
    totalCount: 23,
    duplicateCount: 8,
    totalSize: 31457280,
    duplicateSize: 10485760,
    files: [
      createMediaFile('c1', '身份证_正面.jpg', 1048576, 'image', now - 200 * day, 1),
      createMediaFile('c2', '户口本_首页.jpg', 1572864, 'image', now - 210 * day, 2),
      createMediaFile('c3', '结婚证_01.jpg', 2097152, 'image', now - 300 * day, 6),
    ],
    cloudFiles: [
      createMediaFile('cc1', '爸爸身份证.jpg', 1048576, 'image', now - 205 * day, 1),
    ]
  },
  {
    id: 'daily',
    name: '日常记录',
    icon: '📷',
    color: '#faad14',
    bgColor: '#fffbe6',
    totalCount: 256,
    duplicateCount: 89,
    totalSize: 838860800,
    duplicateSize: 293601280,
    files: [
      createMediaFile('d1', 'IMG_早餐_01.jpg', 2097152, 'image', now - 5 * day, 292),
      createMediaFile('d2', 'IMG_宠物_01.jpg', 3145728, 'image', now - 3 * day, 237),
      createMediaFile('d3', 'VID_猫咪玩耍.mp4', 41943040, 'video', now - 2 * day, 659, 65),
      createMediaFile('d4', 'IMG_花朵_01.jpg', 1572864, 'image', now - 1 * day, 1080),
    ],
    cloudFiles: [
      createMediaFile('dc1', '家里的猫.jpg', 3145728, 'image', now - 7 * day, 237),
      createMediaFile('dc2', '猫咪玩耍视频.mp4', 41943040, 'video', now - 4 * day, 659, 65),
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
  {
    id: generateId(),
    fileName: '爷爷八十大寿.jpg',
    fileSize: 4194304,
    savedSize: 4194304,
    targetAlbum: '老人照片',
    transferTime: now - 2 * day,
    type: 'image'
  },
  {
    id: generateId(),
    fileName: '三亚vlog.mp4',
    fileSize: 104857600,
    savedSize: 104857600,
    targetAlbum: '旅游合影',
    transferTime: now - 3 * day,
    type: 'video'
  },
]

export const mockSaveStats: SaveStats = {
  totalSavedSize: 824180736,
  totalTransferCount: 156,
  todaySavedSize: 8388608,
  todayTransferCount: 12,
  records: mockTransferRecords
}
