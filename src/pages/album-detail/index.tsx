import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import BigButton from '../../components/BigButton'
import { mockAlbumCategories } from '../../data/mock'
import { AlbumCategory, MediaFile } from '../../types'
import { formatFileSize, formatTime, formatDuration } from '../../utils/format'

const AlbumDetailPage: React.FC = () => {
  const router = useRouter()
  const categoryId = router.params.id || 'baby'
  const [category, setCategory] = useState<AlbumCategory | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  useEffect(() => {
    const found = mockAlbumCategories.find(c => c.id === categoryId)
    if (found) {
      setCategory(found)
      Taro.setNavigationBarTitle({ title: found.name })
    }
  }, [categoryId])

  if (!category) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const duplicateFiles = category.files.slice(0, category.duplicateCount)
  const allFiles = [...duplicateFiles]

  const toggleSelect = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedFiles.length === allFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(allFiles.map(f => f.id))
    }
  }

  const handleTransfer = () => {
    if (selectedFiles.length === 0) {
      Taro.showToast({ title: '请先选择文件', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/transfer-confirm/index?categoryId=${category.id}&count=${selectedFiles.length}`
    })
  }

  const handleDelete = () => {
    if (selectedFiles.length === 0) {
      Taro.showToast({ title: '请先选择文件', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/delete-confirm/index?count=${selectedFiles.length}&album=${category.name}`
    })
  }

  const totalSelectedSize = allFiles
    .filter(f => selectedFiles.includes(f.id))
    .reduce((sum, f) => sum + f.size, 0)

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.categoryInfo}>
          <View
            className={styles.categoryIcon}
            style={{ backgroundColor: category.bgColor }}
          >
            <Text>{category.icon}</Text>
          </View>
          <View className={styles.categoryText}>
            <Text className={styles.categoryName}>{category.name}</Text>
            <Text className={styles.categoryCount}>
              共 {category.totalCount} 项，云端已有 {category.cloudFiles.length} 项
            </Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.primary}`}>
              {category.totalCount}
            </Text>
            <Text className={styles.statLabel}>本机总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.warning}`}>
              {category.duplicateCount}
            </Text>
            <Text className={styles.statLabel}>重复项</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.success}`}>
              {formatFileSize(category.duplicateSize)}
            </Text>
            <Text className={styles.statLabel}>可节省</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>重复文件对比</Text>
          <Text className={styles.sectionBadge}>{duplicateFiles.length} 组</Text>
        </View>

        {duplicateFiles.map((file, index) => {
          const cloudMatch = category.cloudFiles[index % category.cloudFiles.length]
          return (
            <View key={file.id} className={styles.compareItem}>
              <View className={styles.compareItemInner}>
                <View className={`${styles.compareSide} ${styles.left}`}>
                  <Text className={`${styles.compareLabel} ${styles.local}`}>本机</Text>
                  <View className={styles.compareThumb}>
                    <Image src={file.thumbnail} className={styles.thumbImage} mode='aspectFill' />
                    {file.type === 'video' && (
                      <Text className={styles.videoBadge}>
                        {formatDuration(file.duration || 0)}
                      </Text>
                    )}
                  </View>
                  <Text className={styles.compareName}>{file.name}</Text>
                  <Text className={styles.compareTime}>{formatTime(file.createTime)}</Text>
                </View>

                <View className={styles.matchIcon}>
                  <Text>=</Text>
                </View>

                <View className={styles.compareSide}>
                  <Text className={`${styles.compareLabel} ${styles.cloud}`}>云端</Text>
                  <View className={styles.compareThumb}>
                    <Image src={cloudMatch.thumbnail} className={styles.thumbImage} mode='aspectFill' />
                  </View>
                  <Text className={styles.compareName}>{cloudMatch.name}</Text>
                  <Text className={styles.compareTime}>{formatTime(cloudMatch.createTime)}</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>云端已有文件</Text>
          <Text className={`${styles.sectionBadge} ${styles.cloud}`}>
            {category.cloudFiles.length} 项
          </Text>
        </View>

        <View className={styles.fileList}>
          {category.cloudFiles.map(file => (
            <View key={file.id} className={styles.fileItem}>
              <View className={styles.fileThumb}>
                <Image src={file.thumbnail} className={styles.thumbImage} mode='aspectFill' />
                {file.type === 'video' && (
                  <Text className={styles.videoBadge}>
                    {formatDuration(file.duration || 0)}
                  </Text>
                )}
              </View>
              <View className={styles.fileInfo}>
                <Text className={styles.fileName}>{file.name}</Text>
                <View className={styles.fileMeta}>
                  <Text className={styles.fileSize}>{formatFileSize(file.size)}</Text>
                  <Text className={styles.fileTime}>{formatTime(file.createTime)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.bottomBtn}>
          <BigButton
            text='一键秒传'
            subText={selectedFiles.length > 0 ? `已选 ${selectedFiles.length} 项` : '省流量秒传'}
            type='success'
            size='normal'
            onClick={handleTransfer}
          />
        </View>
        <View className={styles.bottomBtn}>
          <BigButton
            text='清理重复'
            subText={selectedFiles.length > 0 ? `释放 ${formatFileSize(totalSelectedSize)}` : '安心删除'}
            type='danger'
            size='normal'
            onClick={handleDelete}
          />
        </View>
      </View>
    </ScrollView>
  )
}

export default AlbumDetailPage
