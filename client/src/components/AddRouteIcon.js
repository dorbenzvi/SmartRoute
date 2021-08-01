import React from 'react'
import { Image, StyleSheet } from 'react-native'

const AddRouteIcon = () => (
  <Image source={require('../assets/AddRoute.png')} style={styles.image} />
)

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
  },
})

export default AddRouteIcon
