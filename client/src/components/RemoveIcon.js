import React from 'react'
import { Image, StyleSheet } from 'react-native'

const AddStopIcon = () => (
  <Image source={require('../assets/remove_icon.png')} style={styles.image} />
)

const styles = StyleSheet.create({
  image: {
    width: 25,
    height: 25,
    position: 'relative',
    marginTop: 0,
  },
})

export default AddStopIcon
