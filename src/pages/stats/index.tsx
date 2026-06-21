import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useAppStore } from '../../store'
import { formatFileSize, formatTime } from '../../utils/format'
import { ScanRecord } from '../../types'

const StatsPage: React.FC = () => {
  const stats = useAppStore((state) => state.stats)
  const [showScanRecords, setShowScanRecords] = useState(false)

  useDidShow(() => {
    console.log('[Stats] 页面显示')
  })

  const handleRefresh = () => {
    console.log('[Stats] 下拉刷新')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  }

  const handleGoToTransfer = () => {
    Taro.switchTab({
      url: '/pages/scan/index'
    })
  }

  const handleRecordClick = (record: ScanRecord) => {
    console.log('[Stats] 点击扫描记录:', record.id, record.categoryId)
    Taro.navigateTo({
      url: `/pages/album-detail/index?id=${record.categoryId}&scanRecordId=${record.id}`
    })
  }

  const displayRecords = useMemo(
    () => stats.records.slice(0, 10),
    [stats.records]
  )

  const displayScanRecords = useMemo(
    () => showScanRecords ? stats.scanRecords : stats.scanRecords.slice(0, 5),
    [stats.scanRecords, showScanRecords]
  )

  const totalDuplicate = useMemo(
    () => stats.scanRecords.reduce((sum, r) => sum + r.duplicateCount, 0),
    [stats.scanRecords]
  )

  const totalScanSize = useMemo(
    () => stats.scanRecords.reduce((sum, r) => sum + r.duplicateSize, 0),
    [stats.scanRecords]
  )

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
        <Text className={styles.headerTitle}>累计节省流量</Text>
        <Text className={styles.headerValue}>
          {formatFileSize(stats.totalSavedSize)}
        </Text>
        <Text className={styles.headerSubtitle}>
          共完成 {stats.totalTransferCount} 次秒传
        </Text>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statIcon}>📅</Text>
            <Text className={styles.statValue}>
              {formatFileSize(stats.todaySavedSize)}
            </Text>
            <Text className={styles.statLabel}>今日节省</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statIcon}>⚡</Text>
            <Text className={styles.statValue}>
              {stats.todayTransferCount}
            </Text>
            <Text className={styles.statLabel}>今日秒传</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statIcon}>📁</Text>
            <Text className={styles.statValue}>
              {stats.totalTransferCount}
            </Text>
            <Text className={styles.statLabel}>总秒传数</Text>
          </View>
        </View>
      </View>

      {stats.scanRecords.length > 0 && (
        <View className={styles.scanStatsSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>扫描总览</Text>
        </View>
        <View className={styles.scanStatsGrid}>
          <View className={styles.scanStatCard}>
            <Text className={styles.scanStatValue}>{stats.scanRecords.length}</Text>
            <Text className={styles.scanStatLabel}>累计扫描</Text>
          </View>
          <View className={styles.scanStatCard}>
            <Text className={styles.scanStatValue}>{totalDuplicate}</Text>
            <Text className={styles.scanStatLabel}>发现重复</Text>
          </View>
          <View className={styles.scanStatCard}>
            <Text className={styles.scanStatValue}>{formatFileSize(totalScanSize)}</Text>
            <Text className={styles.scanStatLabel}>可节省</Text>
          </View>
        </View>
      </View>
      )}

      <View className={styles.tipSection}>
        <Text className={styles.tipIcon}>💚</Text>
        <Text className={styles.tipText}>
          秒传技术通过文件哈希比对，云端已有的文件无需重新上传，既省流量又省时间。重复文件直接创建到家庭相册，全家共享。
        </Text>
      </View>

      {stats.scanRecords.length > 0 && (
        <View
          className={styles.section}
          style={{ margin: `0 ${32}rpx ${24}rpx` }}
        >
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>扫描记录</Text>
            <Text className={styles.sectionAction} onClick={() => setShowScanRecords(!showScanRecords)}>
              {showScanRecords ? '收起' : '查看全部'}
            </Text>
          </View>
          <View className={styles.recordList}>
            {displayScanRecords.map((record) => (
              <View
                key={record.id}
                className={styles.recordItem}
                onClick={() => handleRecordClick(record)}
              >
                <View className={styles.recordIcon}>
                  <Text>
                    {record.source === 'wechat' ? '💬' : record.source === 'album' ? '📷' : '📁'}
                  </Text>
                </View>
                <View className={styles.recordInfo}>
                  <Text className={styles.recordName}>{record.sourceName}</Text>
                  <View className={styles.recordMeta}>
                    <Text className={styles.recordAlbum}>
                      {record.totalCount}个 · {record.duplicateCount}个重复
                    </Text>
                    <Text>{formatTime(record.scanTime)}</Text>
                  </View>
                </View>
                <View className={styles.recordSave}>
                  <Text className={styles.saveValue}>
                    - {formatFileSize(record.duplicateSize)}
                  </Text>
                  <Text className={styles.saveLabel}>可省</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View
        className={styles.section}
        style={{ margin: `0 ${32}rpx ${24}rpx` }}
      >
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>秒传记录</Text>
          <Text className={styles.sectionAction} onClick={handleGoToTransfer}>
            去秒传
          </Text>
        </View>

        {displayRecords.length > 0 ? (
          <View className={styles.recordList}>
            {displayRecords.map((record) => (
              <View key={record.id} className={styles.recordItem}>
                <View className={styles.recordIcon}>
                  <Text>{record.type === 'video' ? '🎬' : '🖼️'}</Text>
                </View>
                <View className={styles.recordInfo}>
                  <Text className={styles.recordName}>{record.fileName}</Text>
                  <View className={styles.recordMeta}>
                    <Text className={styles.recordAlbum}>
                      {record.targetAlbum}
                    </Text>
                    <Text>{formatTime(record.transferTime)}</Text>
                  </View>
                </View>
                <View className={styles.recordSave}>
                  <Text className={styles.saveValue}>
                    - {formatFileSize(record.savedSize)}
                  </Text>
                  <Text className={styles.saveLabel}>节省</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无秒传记录</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default StatsPage
