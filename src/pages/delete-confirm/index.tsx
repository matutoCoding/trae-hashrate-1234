import React, { useState, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import BigButton from '../../components/BigButton'
import { useAppStore } from '../../store'
import { AlbumCategory } from '../../types'
import { formatFileSize } from '../../utils/format'

const DeleteConfirmPage: React.FC = () => {
  const router = useRouter()
  const albumId = router.params.albumId || 'baby'
  const albumNameParam = router.params.albumName
    ? decodeURIComponent(router.params.albumName)
    : '宝宝成长'
  const countParam = parseInt(router.params.count || '0', 10) || 0

  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [resultInfo, setResultInfo] = useState({
    count: 0,
    freedSize: 0
  })

  const categories = useAppStore((state) => state.categories)
  const selectedFileIds = useAppStore((state) => state.selectedFileIds)
  const deleteLocalFiles = useAppStore((state) => state.deleteLocalFiles)
  const clearSelection = useAppStore((state) => state.clearSelection)

  const currentCategory = useMemo(
    () => categories.find((c: AlbumCategory) => c.id === albumId),
    [categories, albumId]
  )

  const fileCount = useMemo(() => {
    if (countParam > 0) return countParam
    if (!currentCategory) return 0
    return currentCategory.files.filter((f) => selectedFileIds.includes(f.id))
      .length
  }, [countParam, currentCategory, selectedFileIds])

  const savedSize = useMemo(() => {
    if (!currentCategory) return 0
    const selectedFiles = currentCategory.files.filter((f) =>
      selectedFileIds.includes(f.id)
    )
    if (selectedFiles.length > 0) {
      return selectedFiles.reduce((sum, f) => sum + f.size, 0)
    }
    return currentCategory.duplicateSize
  }, [currentCategory, selectedFileIds])

  const canDelete = checked1 && checked2

  const handleDelete = () => {
    if (!canDelete) {
      Taro.showToast({
        title: '请先确认以上事项',
        icon: 'none'
      })
      return
    }

    const fileIdsToDelete = currentCategory
      ? currentCategory.files
          .filter((f) => selectedFileIds.includes(f.id))
          .map((f) => f.id)
      : []

    const result = deleteLocalFiles(
      albumId,
      fileIdsToDelete.length > 0 ? fileIdsToDelete : []
    )

    const actualCount = result.count > 0 ? result.count : fileCount
    const actualFreed = result.freedSize > 0 ? result.freedSize : savedSize

    setResultInfo({
      count: actualCount,
      freedSize: actualFreed
    })

    clearSelection()

    Taro.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 1000
    })

    setTimeout(() => {
      setShowSuccess(true)
    }, 500)
  }

  const handleCancel = () => {
    Taro.navigateBack()
  }

  const handleBackToAlbum = () => {
    setShowSuccess(false)
    setTimeout(() => {
      Taro.navigateBack()
    }, 100)
  }

  const handleBackToAlbumList = () => {
    setShowSuccess(false)
    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/album/index'
      })
    }, 100)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
  }

  return (
    <View className={styles.page}>
      <View className={styles.warningHeader}>
        <View className={styles.warningIcon}>
          <Text>⚠️</Text>
        </View>
        <Text className={styles.warningTitle}>确认删除本机重复文件？</Text>
        <Text className={styles.warningSubtitle}>删除前请仔细确认以下信息</Text>
      </View>

      <View className={styles.infoSection}>
        <View className={styles.cloudInfo}>
          <Text className={styles.cloudIcon}>☁️</Text>
          <View className={styles.cloudText}>
            <Text className={styles.cloudTextTitle}>云端保存位置：</Text>
            <Text className={styles.cloudTextLine}>
              家庭云盘 / 家庭相册 / {albumNameParam}
            </Text>
            <Text className={styles.cloudTextLine}>
              这些文件云端已安全保存，全家共享
            </Text>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.infoTitle}>删除详情</Text>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>删除文件数</Text>
            <Text className={styles.infoValue}>{fileCount} 个</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>释放空间</Text>
            <Text className={`${styles.infoValue} ${styles.successText}`}>
              {formatFileSize(savedSize)}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>所在相册</Text>
            <Text className={styles.infoValue}>{albumNameParam}</Text>
          </View>
        </View>

        <View className={styles.safeSection}>
          <Text className={styles.safeIcon}>🛡️</Text>
          <View className={styles.safeText}>
            <Text className={styles.safeTextTitle}>安心保障：</Text>
            <Text className={styles.safeTextLine}>
              • 仅删除本机重复文件，云端文件不受影响
            </Text>
            <Text className={styles.safeTextLine}>
              • 删除的文件会在"最近删除"保留30天
            </Text>
            <Text className={styles.safeTextLine}>
              • 随时可以从云端重新下载
            </Text>
          </View>
        </View>

        <View className={styles.checkSection}>
          <View
            className={styles.checkItem}
            onClick={() => setChecked1(!checked1)}
          >
            <View
              className={`${styles.checkBox} ${checked1 ? styles.checked : ''}`}
            >
              {checked1 && <Text className={styles.checkIcon}>✓</Text>}
            </View>
            <View className={styles.checkContent}>
              <Text className={styles.checkTitle}>
                我确认这些文件云端已有备份
              </Text>
              <Text className={styles.checkDesc}>
                删除本机文件后，可以从家庭云盘重新下载
              </Text>
            </View>
          </View>

          <View
            className={styles.checkItem}
            onClick={() => setChecked2(!checked2)}
          >
            <View
              className={`${styles.checkBox} ${checked2 ? styles.checked : ''}`}
            >
              {checked2 && <Text className={styles.checkIcon}>✓</Text>}
            </View>
            <View className={styles.checkContent}>
              <Text className={styles.checkTitle}>
                我确认要删除本机重复文件
              </Text>
              <Text className={styles.checkDesc}>
                删除后30天内可以在"最近删除"恢复
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.deleteButton}>
          <BigButton
            text='确认删除'
            subText={`释放 ${formatFileSize(savedSize)} 空间`}
            type={canDelete ? 'danger' : 'default'}
            size='large'
            disabled={!canDelete}
            onClick={handleDelete}
          />
        </View>
        <View className={styles.cancelButton}>
          <BigButton
            text='取消，再想想'
            type='default'
            size='normal'
            onClick={handleCancel}
          />
        </View>
      </View>

      {showSuccess && (
        <View className={styles.successModal} onClick={handleCloseSuccess}>
          <View
            className={styles.successContent}
            onClick={(e) => {
              e.stopPropagation?.()
            }}
          >
            <View className={styles.successIcon}>
              <Text>✅</Text>
            </View>
            <Text className={styles.successTitle}>删除成功！</Text>
            <View className={styles.successDesc}>
              <Text>已删除本机 {resultInfo.count} 个重复文件</Text>
              <Text>云端文件安全保留，全家共享</Text>
            </View>
            <View className={styles.saveInfo}>
              <Text className={styles.saveValue}>
                {formatFileSize(resultInfo.freedSize)}
              </Text>
              <Text className={styles.saveLabel}>已释放空间</Text>
            </View>
            <View className={styles.successButton}>
              <BigButton
                text='返回相册详情'
                type='primary'
                size='normal'
                onClick={handleBackToAlbum}
              />
            </View>
            <Text className={styles.successLink} onClick={handleBackToAlbumList}>
              返回相册列表
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default DeleteConfirmPage
