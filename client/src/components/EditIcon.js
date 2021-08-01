import React from 'react'
import { Image, StyleSheet } from 'react-native'

const AddRouteIcon = () => (
  <Image source={require('../assets/edit_icon.png')} style={styles.image} />
)

const styles = StyleSheet.create({
  image: {
    width: 25,
    height: 25,
  },
})

export default AddRouteIcon
