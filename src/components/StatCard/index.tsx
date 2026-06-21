import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatCardProps {
  title: string
  value: string
  subValue?: string
  icon?: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  size?: 'normal' | 'small'
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon,
  color = 'primary',
  size = 'normal'
}) => {
  return (
    <View className={classnames(styles.statCard, styles[color], styles[size])}>
      {icon && <Text className={styles.icon}>{icon}</Text>}
      <View className={styles.content}>
        <Text className={styles.value}>{value}</Text>
        <Text className={styles.title}>{title}</Text>
        {subValue && <Text className={styles.subValue}>{subValue}</Text>}
      </View>
    </View>
  )
}

export default StatCard
