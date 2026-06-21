import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface ProgressBarProps {
  percent: number
  showText?: boolean
  height?: number
  color?: string
  bgColor?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  showText = true,
  height = 16,
  color,
  bgColor
}) => {
  const safePercent = Math.min(100, Math.max(0, percent))

  return (
    <View className={styles.progressContainer}>
      <View
        className={styles.progressBg}
        style={{
          height: `${height}rpx`,
          backgroundColor: bgColor || undefined
        }}
      >
        <View
          className={styles.progressFill}
          style={{
            width: `${safePercent}%`,
            height: `${height}rpx`,
            backgroundColor: color || undefined
          }}
        />
      </View>
      {showText && (
        <Text className={styles.progressText}>{safePercent.toFixed(1)}%</Text>
      )}
    </View>
  )
}

export default ProgressBar
