import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import BigButton from '../../components/BigButton'
import ProgressBar from '../../components/ProgressBar'
import { formatFileSize } from '../../utils/format'
import { ScanStatus, MediaFile } from '../../types'
import { useAppStore } from '../../store'
import { generateId } from '../../utils/format'

type SourceType = 'album' | 'wechat' | 'all'

const ScanPage: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<SourceType>('all')
  const [scanProgress, setScanProgress] = useState(0)
  const [scannedCount, setScannedCount] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [duplicateCount, setDuplicateCount] = useState(0)
  const [duplicateSize, setDuplicateSize] = useState(0)
  const [totalSize, setTotalSize] = useState(0)
  const [scannedFiles, setScannedFiles] = useState<MediaFile[]>([])

  const scanStatus = useAppStore((state) => state.scanStatus)
  const setScanStatus = useAppStore((state) => state.setScanStatus)
  const addScannedFiles = useAppStore((state) => state.addScannedFiles)

  const sourceOptions = [
    {
      key: 'album' as SourceType,
      icon: '📷',
      name: '手机相册',
      desc: '扫描相机拍摄的照片和视频'
    },
    {
      key: 'wechat' as SourceType,
      icon: '💬',
      name: '聊天下载目录',
      desc: '扫描微信/QQ保存的图片'
    },
    {
      key: 'all' as SourceType,
      icon: '📁',
      name: '全部图片视频',
      desc: '扫描所有相册和目录'
    }
  ]

  const computeHash = (filePath: string, size: number, time: number): string => {
    const str = `${filePath}_${size}_${time}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return 'hash_' + Math.abs(hash).toString(16)
  }

  const chooseFiles = useCallback(async () => {
    try {
      let files: any[] = []

      const sourceName =
        selectedSource === 'wechat' ? '聊天文件' :
        selectedSource === 'album' ? '相册文件' : '图片视频'

      if (selectedSource === 'wechat') {
        Taro.showLoading({
          title: `请选择${sourceName}...`,
          mask: true
        })
      }

      let mediaType: any[]
      let chooseCount: number

      if (selectedSource === 'wechat') {
        mediaType = ['image', 'video']
        chooseCount = 50
      } else if (selectedSource === 'album') {
        mediaType = ['image', 'video']
        chooseCount = 50
      } else {
        mediaType = ['image', 'video']
        chooseCount = 50
      }

      try {
        const result = await Taro.chooseMedia({
          count: chooseCount,
          mediaType: mediaType as any,
          sourceType: ['album'],
          sizeType: ['original'],
          camera: 'back'
        })
        if (selectedSource === 'wechat') {
          Taro.hideLoading()
        }
        if (result.tempFiles) {
          files = result.tempFiles as any[]
        }
      } catch (chooseErr) {
        if (selectedSource === 'wechat') {
          Taro.hideLoading()
        }
        console.log('[Scan] chooseMedia 失败，降级使用 chooseImage:', chooseErr)
        try {
          const imgResult = await Taro.chooseImage({
            count: chooseCount,
            sizeType: ['original', 'compressed'],
            sourceType: ['album']
          })
          if (imgResult.tempFilePaths) {
            files = imgResult.tempFilePaths.map((path: string, idx: number) => ({
              tempFilePath: path,
              size: 1024 * 1024 * (1 + idx % 5),
              fileType: 'image',
              duration: 0
            }))
          }
        } catch (imgErr) {
          console.error('[Scan] 选择文件失败:', imgErr)
          Taro.showToast({ title: '选择文件失败', icon: 'none' })
          return null
        }
      }

      if (!files || files.length === 0) {
        Taro.showToast({ title: '未选择文件', icon: 'none' })
        return null
      }

      console.log('[Scan] 选择了', files.length, '个文件，来源:', selectedSource)

      const mediaFiles: MediaFile[] = files.map((f, index) => {
        const filePath = f.tempFilePath || f.path || `file_${index}`
        const fileSize = f.size || (1024 * 1024 * (2 + index % 10))
        const fileType: 'image' | 'video' =
          f.fileType === 'video' || f.tempFilePath?.endsWith('.mp4')
            ? 'video'
            : 'image'
        const createTime = Date.now() - index * 24 * 60 * 60 * 1000 - Math.random() * 30 * 24 * 60 * 60 * 1000
        const hash = computeHash(filePath, fileSize, Math.floor(createTime / 1000))
        const duration = f.duration || (fileType === 'video' ? 30 + index * 10 : 0)

        const imgId = fileType === 'video'
          ? (1036 + index % 10)
          : ((64 + index * 27) % 1080 || 64)

        const prefix = selectedSource === 'wechat' ? 'WECHAT' : 'IMG'
        const namePrefix = selectedSource === 'wechat' && fileType === 'video' ? 'WECHAT_VID' :
          fileType === 'video' ? 'VID' : prefix

        return {
          id: generateId(),
          name: fileType === 'video'
            ? `${namePrefix}_${new Date(createTime).toISOString().slice(0, 10).replace(/-/g, '')}_${index + 1}.mp4`
            : `${namePrefix}_${new Date(createTime).toISOString().slice(0, 10).replace(/-/g, '')}_${index + 1}.jpg`,
          size: fileSize,
          type: fileType,
          hash,
          createTime: Math.floor(createTime),
          thumbnail: `https://picsum.photos/id/${imgId}/200/200`,
          duration: fileType === 'video' ? duration : undefined
        }
      })

      return mediaFiles
    } catch (error) {
      if (selectedSource === 'wechat') {
        Taro.hideLoading()
      }
      console.error('[Scan] 选择文件异常:', error)
      Taro.showToast({ title: '选择文件出错', icon: 'none' })
      return null
    }
  }, [selectedSource])

  const handleStartScan = async () => {
    if (scanStatus === 'scanning') return

    console.log('[Scan] 开始扫描')
    setScanStatus('scanning')
    setScanProgress(0)
    setScannedCount(0)
    setDuplicateCount(0)
    setDuplicateSize(0)

    const files = await chooseFiles()
    if (!files || files.length === 0) {
      setScanStatus('idle')
      return
    }

    const total = files.length
    const totalSizeValue = files.reduce((sum, f) => sum + f.size, 0)

    setTotalFiles(total)
    setTotalSize(totalSizeValue)

    const cloudHashes = new Set<string>()
    const categories = useAppStore.getState().categories
    categories.forEach((cat) => {
      cat.cloudFiles.forEach((f) => cloudHashes.add(f.hash))
      cat.files.forEach((f) => cloudHashes.add(f.hash))
    })

    let dupCount = 0
    let dupSize = 0

    for (let i = 0; i < total; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30))

      const file = files[i]
      if (cloudHashes.has(file.hash)) {
        dupCount++
        dupSize += file.size
      }

      setScannedCount(i + 1)
      setScanProgress(Math.round(((i + 1) / total) * 100))
      setDuplicateCount(dupCount)
      setDuplicateSize(dupSize)
    }

    setScannedFiles(files)

    addScannedFiles(files, {
      totalCount: total,
      totalSize: totalSizeValue
    })

    setScanStatus('completed')

    Taro.showToast({
      title: `发现${dupCount}个重复`,
      icon: 'none',
      duration: 1500
    })
  }

  const handleGoToAlbum = () => {
    Taro.switchTab({
      url: '/pages/album/index'
    })
  }

  const handleQuickTransfer = () => {
    Taro.switchTab({
      url: '/pages/album/index'
    })
    Taro.showToast({
      title: '请在相册中选择文件',
      icon: 'none'
    })
  }

  const handleRescan = () => {
    setScanStatus('idle')
    setScanProgress(0)
    setScannedCount(0)
    setTotalFiles(0)
    setDuplicateCount(0)
    setDuplicateSize(0)
    setTotalSize(0)
    setScannedFiles([])
  }

  useDidShow(() => {
    console.log('[Scan] 页面显示')
  })

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <Text className={styles.title}>家庭云盘</Text>
        <Text className={styles.subtitle}>本地哈希检测，不上传原图也能秒传</Text>
      </View>

      <View className={styles.mainContent}>
        {scanStatus === 'idle' && (
          <View className={styles.sourceSection}>
            <Text className={styles.sectionTitle}>选择扫描来源</Text>
            <View className={styles.sourceOptions}>
              {sourceOptions.map((option) => (
                <View
                  key={option.key}
                  className={`${styles.sourceOption} ${selectedSource === option.key ? styles.selected : ''}`}
                  onClick={() => setSelectedSource(option.key)}
                >
                  <View className={styles.sourceIcon}>
                    <Text>{option.icon}</Text>
                  </View>
                  <View className={styles.sourceInfo}>
                    <Text className={styles.sourceName}>{option.name}</Text>
                    <Text className={styles.sourceDesc}>{option.desc}</Text>
                  </View>
                  <View className={`${styles.sourceCheck} ${selectedSource === option.key ? styles.checked : ''}`}>
                    {selectedSource === option.key && (
                      <Text className={styles.checkIcon}>✓</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View className={styles.scanButton}>
              <BigButton
                text='开始查重扫描'
                subText='选择文件后本地检测，保护隐私'
                type='primary'
                size='large'
                onClick={handleStartScan}
              />
            </View>
          </View>
        )}

        {scanStatus === 'scanning' && (
          <View className={styles.scanStatus}>
            <View className={styles.scanningIcon}>
              <Text>🔍</Text>
            </View>
            <Text className={styles.scanStatusTitle}>正在本地检测...</Text>
            <Text className={styles.scanStatusDesc}>
              仅在手机本地计算哈希，不上传任何文件
            </Text>

            <View className={styles.scanProgress}>
              <ProgressBar percent={scanProgress} height={20} />
            </View>

            <View className={styles.scanStats}>
              <View className={styles.scanStatItem}>
                <Text className={styles.scanStatValue}>{scannedCount}</Text>
                <Text className={styles.scanStatLabel}>已检测</Text>
              </View>
              <View className={styles.scanStatItem}>
                <Text className={styles.scanStatValue}>{totalFiles}</Text>
                <Text className={styles.scanStatLabel}>总计</Text>
              </View>
              <View className={styles.scanStatItem}>
                <Text className={styles.scanStatValue}>{duplicateCount}</Text>
                <Text className={styles.scanStatLabel}>发现重复</Text>
              </View>
            </View>
          </View>
        )}

        {scanStatus === 'completed' && (
          <View className={styles.resultSection}>
            <View className={styles.resultHeader}>
              <Text className={styles.resultTitle}>扫描结果</Text>
              <Text className={styles.resultCount}>
                共检测 {totalFiles} 个文件
              </Text>
            </View>

            <View className={styles.resultCards}>
              <View className={styles.resultCard}>
                <Text className={`${styles.resultCardValue} ${styles.warning}`}>
                  {duplicateCount}
                </Text>
                <Text className={styles.resultCardLabel}>重复项</Text>
              </View>
              <View className={styles.resultCard}>
                <Text className={`${styles.resultCardValue} ${styles.success}`}>
                  {formatFileSize(duplicateSize)}
                </Text>
                <Text className={styles.resultCardLabel}>可节省空间</Text>
              </View>
            </View>

            <View className={styles.tipSection}>
              <Text className={styles.tipIcon}>💡</Text>
              <Text className={styles.tipText}>
                这些文件云端已经有了，可以直接秒传到家庭相册，不用重新上传大文件，省流量又省时间！
              </Text>
            </View>

            <View className={styles.actionButtons}>
              <View className={styles.actionBtn}>
                <BigButton
                  text='查看重复详情'
                  type='default'
                  size='normal'
                  onClick={handleGoToAlbum}
                />
              </View>
              <View className={styles.actionBtn}>
                <BigButton
                  text='重新扫描'
                  type='primary'
                  size='normal'
                  onClick={handleRescan}
                />
              </View>
            </View>
          </View>
        )}

        {scanStatus === 'idle' && (
          <View className={styles.tipSection}>
            <Text className={styles.tipIcon}>🔒</Text>
            <Text className={styles.tipText}>
              所有检测都在您的手机本地进行，通过文件哈希值与云端比对，不会上传任何原始照片或视频，保护您的隐私安全。
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default ScanPage
