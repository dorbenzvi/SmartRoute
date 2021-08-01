import React from 'react'
import { Image, StyleSheet } from 'react-native'

const AddStopIcon = () => (
  <Image source={require('../assets/AddStop.png')} style={styles.image} />
)

const styles = StyleSheet.create({
  image: {
    width: 170,
    height: 170,
    marginBottom: 0,
  },
})

export default AddStopIcon
