import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import AlbumCategoryCard from '../../components/AlbumCategory'
import { useAppStore } from '../../store'
import { formatFileSize } from '../../utils/format'

const AlbumPage: React.FC = () => {
  const categories = useAppStore((state) => state.categories)

  useDidShow(() => {
    console.log('[Album] 页面显示')
  })

  const totalCount = useMemo(
    () => categories.reduce((sum, c) => sum + c.totalCount, 0),
    [categories]
  )

  const totalDuplicate = useMemo(
    () => categories.reduce((sum, c) => sum + c.duplicateCount, 0),
    [categories]
  )

  const totalDuplicateSize = useMemo(
    () => categories.reduce((sum, c) => sum + c.duplicateSize, 0),
    [categories]
  )

  const handleCategoryClick = (categoryId: string) => {
    Taro.navigateTo({
      url: `/pages/album-detail/index?id=${categoryId}`
    })
  }

  const handleRefresh = () => {
    console.log('[Album] 下拉刷新')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  }

  return (
    <ScrollView
      className={styles.page}
      scrollY
      enhanced
      showScrollbar={false}
      refresherEnabled
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <Text className={styles.pageTitle}>亲情相册</Text>
        <Text className={styles.pageSubtitle}>按分类查看云端重复文件</Text>
      </View>

      <View className={styles.summarySection}>
        <View className={styles.summaryCards}>
          <View className={styles.summaryCard}>
            <Text className={`${styles.summaryValue} ${styles.primary}`}>
              {totalCount}
            </Text>
            <Text className={styles.summaryLabel}>本机总数</Text>
          </View>
          <View className={styles.summaryCard}>
            <Text className={`${styles.summaryValue} ${styles.warning}`}>
              {totalDuplicate}
            </Text>
            <Text className={styles.summaryLabel}>云端重复</Text>
          </View>
          <View className={styles.summaryCard}>
            <Text className={`${styles.summaryValue} ${styles.primary}`}>
              {formatFileSize(totalDuplicateSize)}
            </Text>
            <Text className={styles.summaryLabel}>可释放空间</Text>
          </View>
        </View>
      </View>

      <View className={styles.categorySection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>相册分类</Text>
          <Text className={styles.sectionAction}>共 {categories.length} 类</Text>
        </View>

        <View className={styles.categoryList}>
          {categories.map((category) => (
            <AlbumCategoryCard
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </View>
      </View>

      <View className={styles.bottomTip}>
        <Text>点击分类卡片可查看详细对比，支持批量秒传和删除</Text>
      </View>
    </ScrollView>
  )
}

export default AlbumPage
