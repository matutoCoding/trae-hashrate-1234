import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import BigButton from '../../components/BigButton'
import { formatFileSize } from '../../utils/format'

const DeleteConfirmPage: React.FC = () => {
  const router = useRouter()
  const countParam = parseInt(router.params.count || '0', 10) || 3
  const albumName = router.params.album || '宝宝成长'

  const fileCount = countParam
  const savedSize = Math.floor(183500800 * (fileCount / 45))

  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const canDelete = checked1 && checked2

  const handleDelete = () => {
    if (!canDelete) {
      Taro.showToast({
        title: '请先确认以上事项',
        icon: 'none'
      })
      return
    }
    setShowSuccess(true)
  }

  const handleCancel = () => {
    Taro.navigateBack()
  }

  const handleBackToAlbum = () => {
    Taro.switchTab({
      url: '/pages/album/index'
    })
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
          <Text className={styles.cloudText}>
            <strong>云端保存位置：</strong>
            {'\n'}家庭云盘 / 家庭相册 / {albumName}
            {'\n'}这些文件云端已安全保存，全家共享
          </Text>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.infoTitle}>删除详情</Text>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>删除文件数</Text>
            <Text className={styles.infoValue}>{fileCount} 个</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>释放空间</Text>
            <Text className={styles.infoValue} style={{ color: '#52c41a' }}>
              {formatFileSize(savedSize)}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>所在相册</Text>
            <Text className={styles.infoValue}>{albumName}</Text>
          </View>
        </View>

        <View className={styles.safeSection}>
          <Text className={styles.safeIcon}>🛡️</Text>
          <Text className={styles.safeText}>
            <strong>安心保障：</strong>
            {'\n'}• 仅删除本机重复文件，云端文件不受影响
            {'\n'}• 删除的文件会在"最近删除"保留30天
            {'\n'}• 随时可以从云端重新下载
          </Text>
        </View>

        <View className={styles.checkSection}>
          <View className={styles.checkItem} onClick={() => setChecked1(!checked1)}>
            <View className={`${styles.checkBox} ${checked1 ? styles.checked : ''}`}>
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

          <View className={styles.checkItem} onClick={() => setChecked2(!checked2)}>
            <View className={`${styles.checkBox} ${checked2 ? styles.checked : ''}`}>
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
        <View className={styles.successModal}>
          <View className={styles.successContent}>
            <View className={styles.successIcon}>
              <Text>✅</Text>
            </View>
            <Text className={styles.successTitle}>删除成功！</Text>
            <Text className={styles.successDesc}>
              已删除本机 {fileCount} 个重复文件
              {'\n'}云端文件安全保留，全家共享
            </Text>
            <View className={styles.saveInfo}>
              <Text className={styles.saveValue}>
                {formatFileSize(savedSize)}
              </Text>
              <Text className={styles.saveLabel}>已释放空间</Text>
            </View>
            <View className={styles.successButton}>
              <BigButton
                text='返回相册列表'
                type='primary'
                size='normal'
                onClick={handleBackToAlbum}
              />
            </View>
            <Text className={styles.successLink} onClick={handleCancel}>
              留在当前页面
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default DeleteConfirmPage
