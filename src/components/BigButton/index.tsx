import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface BigButtonProps {
  text: string
  subText?: string
  type?: 'primary' | 'success' | 'danger' | 'default'
  size?: 'large' | 'normal'
  disabled?: boolean
  onClick?: () => void
}

const BigButton: React.FC<BigButtonProps> = ({
  text,
  subText,
  type = 'primary',
  size = 'large',
  disabled = false,
  onClick
}) => {
  return (
    <View
      className={classnames(
        styles.bigButton,
        styles[type],
        styles[size],
        disabled && styles.disabled
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <Text className={styles.buttonText}>{text}</Text>
      {subText && <Text className={styles.buttonSubText}>{subText}</Text>}
    </View>
  )
}

export default BigButton
