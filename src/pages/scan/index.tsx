import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import BigButton from '../../components/BigButton'
import ProgressBar from '../../components/ProgressBar'
import { formatFileSize } from '../../utils/format'
import { ScanStatus } from '../../types'

type SourceType = 'album' | 'wechat' | 'all'

const ScanPage: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<SourceType>('all')
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [scanProgress, setScanProgress] = useState(0)
  const [scannedCount, setScannedCount] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [duplicateCount, setDuplicateCount] = useState(0)
  const [duplicateSize, setDuplicateSize] = useState(0)
  const [totalSize, setTotalSize] = useState(0)

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

  const handleStartScan = () => {
    if (scanStatus === 'scanning') return

    setScanStatus('scanning')
    setScanProgress(0)
    setScannedCount(0)
    setDuplicateCount(0)
    setDuplicateSize(0)

    const total = selectedSource === 'all' ? 547 : selectedSource === 'album' ? 328 : 219
    const totalSizeValue = selectedSource === 'all' ? 2281701376 : selectedSource === 'album' ? 1572864000 : 708837376
    const dupCount = Math.floor(total * 0.35)
    const dupSize = Math.floor(totalSizeValue * 0.32)

    setTotalFiles(total)
    setTotalSize(totalSizeValue)

    let current = 0
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 3
      if (current >= total) {
        current = total
        clearInterval(interval)
        setScanStatus('completed')
        setDuplicateCount(dupCount)
        setDuplicateSize(dupSize)
        setScanProgress(100)
        setScannedCount(total)
      } else {
        setScannedCount(current)
        setScanProgress(Math.floor((current / total) * 100))
        setDuplicateCount(Math.floor(current * 0.35))
        setDuplicateSize(Math.floor(totalSizeValue * 0.32 * (current / total)))
      }
    }, 150)
  }

  const handleGoToAlbum = () => {
    Taro.switchTab({
      url: '/pages/album/index'
    })
  }

  const handleQuickTransfer = () => {
    Taro.navigateTo({
      url: '/pages/transfer-confirm/index?category=all'
    })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>家庭云盘</Text>
        <Text className={styles.subtitle}>本地哈希检测，不上传原图也能秒传</Text>
      </View>

      <View className={styles.mainContent}>
        {scanStatus === 'idle' && (
          <View className={styles.sourceSection}>
            <Text className={styles.sectionTitle}>选择扫描来源</Text>
            <View className={styles.sourceOptions}>
              {sourceOptions.map(option => (
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
                subText='本地哈希检测，保护隐私'
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
            <Text className={styles.scanStatusTitle}>正在本地检测...</text>
            <Text className={styles.scanStatusDesc}>仅在手机本地计算哈希，不上传任何文件</Text>

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
              <Text className={styles.resultCount}>共检测 {totalFiles} 个文件</Text>
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
                  text='一键秒传'
                  type='success'
                  size='normal'
                  onClick={handleQuickTransfer}
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
