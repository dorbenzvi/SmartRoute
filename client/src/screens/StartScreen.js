import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSelector, useDispatch } from 'react-redux'
import { saveUserId, appName } from '../actions/index'
//AsyncStorage.clear()
const StartScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('UserId')
      if (value !== null) {
        dispatch(saveUserId(value))
        try {
          const navApp = await AsyncStorage.getItem('defaultNavApp')
          if (value !== null) {
            dispatch(appName(navApp))
            navigation.navigate('Home')
          }
        } catch (e) {
          console.log(e)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  getData()

  return (
    <Background>
      <Logo />
      <Header>Get Delivery</Header>
      <Paragraph>Register now to start plan your path.</Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        Sign Up
      </Button>
    </Background>
  )
}
export default StartScreen
