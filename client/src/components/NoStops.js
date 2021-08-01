import React from 'react'
import { Image, StyleSheet, View, Text } from 'react-native'

const NoStops = () => (
  <View
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <Image source={require('../assets/no_stops.png')} style={styles.image} />
    <Text>Click The Plus Button To Create Your First Stop.</Text>
  </View>
)

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  },
})

export default NoStops
