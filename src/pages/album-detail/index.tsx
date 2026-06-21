import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import BigButton from '../../components/BigButton'
import { useAppStore } from '../../store'
import { AlbumCategory } from '../../types'
import { formatFileSize, formatTime, formatDuration } from '../../utils/format'

const AlbumDetailPage: React.FC = () => {
  const router = useRouter()
  const categoryId = router.params.id || 'baby'

  const categories = useAppStore((state) => state.categories)
  const selectedFileIds = useAppStore((state) => state.selectedFileIds)
  const toggleFileSelection = useAppStore((state) => state.toggleFileSelection)
  const selectAllFiles = useAppStore((state) => state.selectAllFiles)
  const clearSelection = useAppStore((state) => state.clearSelection)
  const setCurrentCategoryId = useAppStore((state) => state.setCurrentCategoryId)

  const category = useMemo(
    () => categories.find((c: AlbumCategory) => c.id === categoryId),
    [categories, categoryId]
  )

  const duplicateFiles = useMemo(() => {
    if (!category) return []
    const cloudHashes = new Set(category.cloudFiles.map((f) => f.hash))
    return category.files.filter((f) => cloudHashes.has(f.hash))
  }, [category])

  const allDuplicateIds = useMemo(
    () => duplicateFiles.map((f) => f.id),
    [duplicateFiles]
  )

  const selectedDuplicateIds = useMemo(
    () => selectedFileIds.filter((id) => allDuplicateIds.includes(id)),
    [selectedFileIds, allDuplicateIds]
  )

  const isAllSelected = useMemo(() => {
    if (allDuplicateIds.length === 0) return false
    return allDuplicateIds.every((id) => selectedFileIds.includes(id))
  }, [allDuplicateIds, selectedFileIds])

  const totalSelectedSize = useMemo(() => {
    if (!category) return 0
    return category.files
      .filter((f) => selectedFileIds.includes(f.id))
      .reduce((sum, f) => sum + f.size, 0)
  }, [category, selectedFileIds])

  useEffect(() => {
    if (category) {
      Taro.setNavigationBarTitle({ title: category.name })
      setCurrentCategoryId(category.id)
    }
    return () => {
      clearSelection()
      setCurrentCategoryId(null)
    }
  }, [category, clearSelection, setCurrentCategoryId])

  useDidShow(() => {
    console.log('[AlbumDetail] 页面显示')
  })

  if (!category) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const handleSelectAll = () => {
    selectAllFiles(allDuplicateIds)
  }

  const handleTransfer = () => {
    if (selectedDuplicateIds.length === 0) {
      Taro.showToast({ title: '请先选择重复文件', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/transfer-confirm/index?albumId=${category.id}&albumName=${encodeURIComponent(category.name)}&count=${selectedDuplicateIds.length}`
    })
  }

  const handleDelete = () => {
    if (selectedDuplicateIds.length === 0) {
      Taro.showToast({ title: '请先选择重复文件', icon: 'none' })
      return
    }
    Taro.navigateTo({
      url: `/pages/delete-confirm/index?albumId=${category.id}&albumName=${encodeURIComponent(category.name)}&count=${selectedDuplicateIds.length}`
    })
  }

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
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
              {duplicateFiles.length}
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
          <View
            className={styles.selectAllBtn}
            onClick={handleSelectAll}
          >
            <Text className={styles.selectAllText}>
              {isAllSelected ? '取消全选' : '全选'}
            </Text>
          </View>
        </View>

        {duplicateFiles.length === 0 ? (
          <View className={styles.emptyList}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>暂无重复文件</Text>
          </View>
        ) : (
          duplicateFiles.map((file, index) => {
            const cloudMatch = category.cloudFiles[
              index % category.cloudFiles.length
            ]
            const isSelected = selectedFileIds.includes(file.id)

            return (
              <View
                key={file.id}
                className={`${styles.compareItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <View className={styles.compareItemInner}>
                  <View className={`${styles.compareSide} ${styles.left}`}>
                    <Text className={`${styles.compareLabel} ${styles.local}`}>
                      本机
                    </Text>
                    <View className={styles.compareThumb}>
                      <Image
                        src={file.thumbnail}
                        className={styles.thumbImage}
                        mode='aspectFill'
                      />
                      {file.type === 'video' && (
                        <Text className={styles.videoBadge}>
                          {formatDuration(file.duration || 0)}
                        </Text>
                      )}
                    </View>
                    <Text className={styles.compareName}>{file.name}</Text>
                    <Text className={styles.compareTime}>
                      {formatTime(file.createTime)}
                    </Text>
                  </View>

                  <View className={styles.matchIcon}>
                    <Text>=</Text>
                  </View>

                  <View className={styles.compareSide}>
                    <Text className={`${styles.compareLabel} ${styles.cloud}`}>
                      云端
                    </Text>
                    <View className={styles.compareThumb}>
                      <Image
                        src={cloudMatch.thumbnail}
                        className={styles.thumbImage}
                        mode='aspectFill'
                      />
                    </View>
                    <Text className={styles.compareName}>{cloudMatch.name}</Text>
                    <Text className={styles.compareTime}>
                      {formatTime(cloudMatch.createTime)}
                    </Text>
                  </View>

                  <View
                    className={`${styles.fileCheck} ${isSelected ? styles.checked : ''}`}
                    onClick={(e) => {
                      e.stopPropagation?.()
                      toggleFileSelection(file.id)
                    }}
                  >
                    {isSelected && <Text className={styles.checkIcon}>✓</Text>}
                  </View>
                </View>
              </View>
            )
          })
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>云端已有文件</Text>
          <Text className={`${styles.sectionBadge} ${styles.cloud}`}>
            {category.cloudFiles.length} 项
          </Text>
        </View>

        <View className={styles.fileList}>
          {category.cloudFiles.map((file) => (
            <View key={file.id} className={styles.fileItem}>
              <View className={styles.fileThumb}>
                <Image
                  src={file.thumbnail}
                  className={styles.thumbImage}
                  mode='aspectFill'
                />
                {file.type === 'video' && (
                  <Text className={styles.videoBadge}>
                    {formatDuration(file.duration || 0)}
                  </Text>
                )}
              </View>
              <View className={styles.fileInfo}>
                <Text className={styles.fileName}>{file.name}</Text>
                <View className={styles.fileMeta}>
                  <Text className={styles.fileSize}>
                    {formatFileSize(file.size)}
                  </Text>
                  <Text className={styles.fileTime}>
                    {formatTime(file.createTime)}
                  </Text>
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
            subText={
              selectedDuplicateIds.length > 0
                ? `已选 ${selectedDuplicateIds.length} 项`
                : '省流量秒传'
            }
            type='success'
            size='normal'
            onClick={handleTransfer}
          />
        </View>
        <View className={styles.bottomBtn}>
          <BigButton
            text='清理重复'
            subText={
              selectedDuplicateIds.length > 0
                ? `释放 ${formatFileSize(totalSelectedSize)}`
                : '安心删除'
            }
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
