import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import styles from './index.module.scss'
import { formatFileSize } from '../../utils/format'
import { AlbumCategory as AlbumCategoryType } from '../../types'

interface AlbumCategoryCardProps {
  category: AlbumCategoryType
  onClick?: () => void
}

const AlbumCategoryCard: React.FC<AlbumCategoryCardProps> = ({
  category,
  onClick
}) => {
  const duplicatePercent = category.totalCount > 0
    ? Math.round((category.duplicateCount / category.totalCount) * 100)
    : 0

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View
          className={styles.iconWrap}
          style={{ backgroundColor: category.bgColor }}
        >
          <Text className={styles.icon}>{category.icon}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{category.name}</Text>
          <Text className={styles.count}>共 {category.totalCount} 项</Text>
        </View>
        <View className={styles.arrow}>
          <Text className={styles.arrowText}>›</Text>
        </View>
      </View>

      <View className={styles.preview}>
        {category.files.slice(0, 4).map((file, index) => (
          <Image
            key={file.id}
            src={file.thumbnail}
            className={styles.previewImg}
            mode='aspectFill'
          />
        ))}
      </View>

      <View className={styles.footer}>
        <View className={styles.duplicateInfo}>
          <View
            className={styles.duplicateBadge}>
            <Text className={styles.duplicateBadgeText}>
            {category.duplicateCount} 项重复
          </Text>
          </View>
          <Text className={styles.duplicateSize}>
            可释放 {formatFileSize(category.duplicateSize)}
          </Text>
        </View>
        <View className={styles.progressWrap}>
          <View className={styles.progressBg}>
            <View
              className={styles.progressFill}
              style={{
                width: `${duplicatePercent}%`,
                backgroundColor: category.color
              }}
            />
          </View>
          <Text className={styles.progressText}>{duplicatePercent}%</Text>
        </View>
      </View>
    </View>
  )
}

export default AlbumCategoryCard
