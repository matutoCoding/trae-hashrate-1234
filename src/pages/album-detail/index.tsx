import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import BigButton from '../../components/BigButton'
import { useAppStore } from '../../store'
import { AlbumCategory, FamilyFilter, TimeFilter } from '../../types'
import { formatFileSize, formatTime, formatDuration } from '../../utils/format'

const AlbumDetailPage: React.FC = () => {
  const router = useRouter()
  const categoryId = router.params.id || 'baby'
  const scanRecordId = router.params.scanRecordId || ''

  const [familyFilter, setFamilyFilter] = useState<FamilyFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  const categories = useAppStore((state) => state.categories)
  const selectedFileIds = useAppStore((state) => state.selectedFileIds)
  const toggleFileSelection = useAppStore((state) => state.toggleFileSelection)
  const selectAllFiles = useAppStore((state) => state.selectAllFiles)
  const clearSelection = useAppStore((state) => state.clearSelection)
  const setCurrentCategoryId = useAppStore((state) => state.setCurrentCategoryId)
  const cloudHashPool = useAppStore((state) => state.cloudHashPool)
  const getCloudHashMatch = useAppStore((state) => state.getCloudHashMatch)

  const category = useMemo(
    () => categories.find((c: AlbumCategory) => c.id === categoryId),
    [categories, categoryId]
  )

  const availableFiles = useMemo(() => {
    if (!category) return []
    return category.files.filter((f) => {
      if (f.status === 'deleted' || f.status === 'transferred') return false
      if (scanRecordId && f.scanRecordId !== scanRecordId) return false
      return true
    })
  }, [category, scanRecordId])

  const now = Date.now()
  const timeThreshold = useMemo(() => {
    if (timeFilter === 'week') return now - 7 * 24 * 60 * 60 * 1000
    if (timeFilter === 'month') return now - 30 * 24 * 60 * 60 * 1000
    if (timeFilter === 'year') return now - 365 * 24 * 60 * 60 * 1000
    return 0
  }, [timeFilter, now])

  const duplicateFiles = useMemo(() => {
    if (!category) return []
    return availableFiles.filter((f) => {
      if (familyFilter !== 'all' && f.familyTag !== familyFilter) {
        return false
      }
      if (timeFilter !== 'all' && f.createTime < timeThreshold) {
        return false
      }
      return !!getCloudHashMatch(f.hash)
    })
  }, [category, availableFiles, familyFilter, timeFilter, timeThreshold, getCloudHashMatch])

  const validTotalCount = availableFiles.length
  const validTotalSize = useMemo(
    () => availableFiles.reduce((sum, f) => sum + f.size, 0),
    [availableFiles]
  )

  const findCloudMatch = (fileHash: string) => {
    return getCloudHashMatch(fileHash) || null
  }

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
      .filter((f) => selectedDuplicateIds.includes(f.id))
      .reduce((sum, f) => sum + f.size, 0)
  }, [category, selectedDuplicateIds])

  const filteredDuplicateCount = duplicateFiles.length
  const filteredDuplicateSize = useMemo(
    () => duplicateFiles.reduce((sum, f) => sum + f.size, 0),
    [duplicateFiles]
  )

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

  const familyOptions = [
    { key: 'all' as FamilyFilter, label: '全部', icon: '👨‍👩‍👧‍👦' },
    { key: 'baby' as FamilyFilter, label: '宝宝', icon: '👶' },
    { key: 'elderly' as FamilyFilter, label: '老人', icon: '👴' },
    { key: 'travel' as FamilyFilter, label: '旅游', icon: '✈️' },
    { key: 'certificate' as FamilyFilter, label: '证件', icon: '📄' },
    { key: 'daily' as FamilyFilter, label: '日常', icon: '📷' },
  ]

  const timeOptions = [
    { key: 'all' as TimeFilter, label: '全部时间' },
    { key: 'year' as TimeFilter, label: '最近一年' },
    { key: 'month' as TimeFilter, label: '最近一月' },
    { key: 'week' as TimeFilter, label: '最近一周' },
  ]

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

  const hasFilter = familyFilter !== 'all' || timeFilter !== 'all'

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
              共 {validTotalCount} 项，云端已有 {category.cloudFiles.length} 项
            </Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.primary}`}>
              {validTotalCount}
            </Text>
            <Text className={styles.statLabel}>本机总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.warning}`}>
              {filteredDuplicateCount}
            </Text>
            <Text className={styles.statLabel}>重复项</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles.success}`}>
              {formatFileSize(filteredDuplicateSize)}
            </Text>
            <Text className={styles.statLabel}>可节省</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterRow}>
          <Text className={styles.filterLabel}>家庭成员：</Text>
          <ScrollView className={styles.filterScroll} scrollX enhanced showScrollbar={false}>
            <View className={styles.filterOptions}>
              {familyOptions.map((opt) => (
                <View
                  key={opt.key}
                  className={`${styles.filterChip} ${familyFilter === opt.key ? styles.active : ''}`}
                  onClick={() => setFamilyFilter(opt.key)}
                >
                  <Text className={styles.filterIcon}>{opt.icon}</Text>
                  <Text className={styles.filterText}>{opt.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className={styles.filterRow}>
          <Text className={styles.filterLabel}>拍摄时间：</Text>
          <View className={styles.filterOptions}>
            {timeOptions.map((opt) => (
              <View
                key={opt.key}
                className={`${styles.filterChip} ${styles.smallChip} ${timeFilter === opt.key ? styles.active : ''}`}
                onClick={() => setTimeFilter(opt.key)}
              >
                <Text className={styles.filterText}>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {hasFilter && (
          <View className={styles.filterHint}>
            <Text className={styles.filterHintText}>
              已筛选，共 {filteredDuplicateCount} 个重复文件，可省 {formatFileSize(filteredDuplicateSize)}
            </Text>
            <Text
              className={styles.filterClear}
              onClick={() => { setFamilyFilter('all'); setTimeFilter('all') }}
            >
              清除筛选
            </Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            重复文件对比
            {hasFilter && (
              <Text className={styles.filterBadge}>已筛选</Text>
            )}
          </Text>
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
            <Text className={styles.emptyText}>
              {hasFilter ? '当前筛选条件下无重复文件' : '暂无重复文件'}
            </Text>
          </View>
        ) : (
          duplicateFiles.map((file) => {
            const cloudMatch = findCloudMatch(file.hash)
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
                    {file.familyTag && file.familyTag !== 'unknown' && (
                      <Text className={styles.fileTag}>
                        {file.familyTag === 'baby' ? '👶 宝宝' :
                         file.familyTag === 'elderly' ? '👴 老人' :
                         file.familyTag === 'travel' ? '✈️ 旅游' :
                         file.familyTag === 'certificate' ? '📄 证件' : '📷 日常'}
                      </Text>
                    )}
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
                        src={cloudMatch?.thumbnail || ''}
                        className={styles.thumbImage}
                        mode='aspectFill'
                      />
                    </View>
                    <Text className={styles.compareName}>{cloudMatch?.name || '云端文件'}</Text>
                    <Text className={styles.compareTime}>
                      {formatTime(cloudMatch?.createTime || 0)}
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
