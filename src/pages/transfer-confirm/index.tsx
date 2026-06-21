import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import BigButton from '../../components/BigButton'
import { mockAlbumCategories } from '../../data/mock'
import { formatFileSize } from '../../utils/format'

const TransferConfirmPage: React.FC = () => {
  const router = useRouter()
  const categoryId = router.params.categoryId || 'all'
  const countParam = parseInt(router.params.count || '0', 10) || 0
  const [selectedAlbum, setSelectedAlbum] = useState<string>(categoryId === 'all' ? 'baby' : categoryId)
  const [showSuccess, setShowSuccess] = useState(false)

  const categories = mockAlbumCategories
  const selectedCategory = categories.find(c => c.id === selectedAlbum)

  const fileCount = countParam > 0 ? countParam : (selectedCategory?.duplicateCount || 0)
  const savedSize = selectedCategory?.duplicateSize || 183500800

  const handleConfirmTransfer = () => {
    setShowSuccess(true)
  }

  const handleBackToAlbum = () => {
    Taro.switchTab({
      url: '/pages/album/index'
    })
  }

  const handleGoToStats = () => {
    Taro.switchTab({
      url: '/pages/stats/index'
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerIcon}>⚡</Text>
        <Text className={styles.headerTitle}>省流量秒传</Text>
        <Text className={styles.headerSubtitle}>云端已有，直接创建，无需重新上传</Text>
      </View>

      <View className={styles.saveSection}>
        <View className={styles.saveCard}>
          <Text className={styles.saveValue}>{formatFileSize(savedSize)}</Text>
          <Text className={styles.saveLabel}>预计节省流量</Text>
          <View className={styles.saveDetails}>
            <View className={styles.saveDetailItem}>
              <Text className={styles.saveDetailValue}>{fileCount}</Text>
              <Text className={styles.saveDetailLabel}>秒传文件</Text>
            </View>
            <View className={styles.saveDetailItem}>
              <Text className={styles.saveDetailValue}>
                0秒
              </Text>
              <Text className={styles.saveDetailLabel}>预计用时</Text>
            </View>
            <View className={styles.saveDetailItem}>
              <Text className={styles.saveDetailValue}>100%</Text>
              <Text className={styles.saveDetailLabel}>成功率</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>选择目标家庭相册</Text>
        </View>
        <View className={styles.albumList}>
          {categories.map(cat => (
            <View
              key={cat.id}
              className={`${styles.albumOption} ${selectedAlbum === cat.id ? styles.selected : ''}`}
              onClick={() => setSelectedAlbum(cat.id)}
            >
              <View
                className={styles.albumIcon}
                style={{ backgroundColor: cat.bgColor }}
              >
                <Text>{cat.icon}</Text>
              </View>
              <View className={styles.albumInfo}>
                <Text className={styles.albumName}>{cat.name}</Text>
                <Text className={styles.albumCount}>
                  已有 {cat.cloudFiles.length} 项云端文件
                </Text>
              </View>
              <View className={styles.albumCheck}>
                {selectedAlbum === cat.id && (
                  <Text className={styles.checkIcon}>✓</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.tipSection}>
        <Text className={styles.tipIcon}>💡</Text>
        <Text className={styles.tipText}>
          秒传只是在家庭相册中创建文件引用，不会重复利用云端已有的文件，不占用额外存储空间，全家都能看到。
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.bottomInfo}>
          <Text className={styles.bottomLabel}>共 {fileCount} 个文件，秒传至 {selectedCategory?.name || '家庭相册'}</Text>
          <Text className={styles.bottomValue}>
            省 {formatFileSize(savedSize)}
          </Text>
        </View>
        <BigButton
          text='确认秒传'
          subText='一键创建到家庭相册'
          type='success'
          size='large'
          onClick={handleConfirmTransfer}
        />
      </View>

      {showSuccess && (
        <View className={styles.successModal}>
          <View className={styles.successContent}>
            <View className={styles.successIcon}>
            <Text>✅</Text>
          </View>
          <Text className={styles.successTitle}>秒传成功！</Text>
          <Text className={styles.successDesc}>
            已将 {fileCount} 个文件创建到
            家庭相册
          </Text>
          <View className={styles.successSave}>
            <Text className={styles.successSaveValue}>
              {formatFileSize(savedSize)}
            </Text>
            <Text className={styles.successSaveLabel}>节省流量</Text>
          </View>
          <View className={styles.successButton}>
            <BigButton
              text='查看秒传记录'
              type='primary'
              size='normal'
              onClick={handleGoToStats}
            />
          </View>
          <Text className={styles.successLink} onClick={handleBackToAlbum}>
            返回相册列表
          </Text>
        </View>
      </View>
    </View>
  )
}

export default TransferConfirmPage
