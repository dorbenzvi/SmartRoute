import React, { useState } from 'react'
import { TouchableOpacity, StyleSheet, View, Image, Alert } from 'react-native'
import { Text } from 'react-native-paper'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSelector, useDispatch } from 'react-redux'
import { saveUserId } from '../actions/index'
import Url from '../components/Url'
import * as Google from 'expo-google-app-auth'

//Google login tutorial: https://inaguirre.medium.com/react-native-login-with-google-quick-guide-fe351e464752
const IOS_CLIENT_ID =
  ''
const ANDROID_CLIENT_ID =
  ''
const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const [email, setEmail] = useState({
    value: '',
    error: '',
  })
  const [password, setPassword] = useState({ value: '', error: '' })
  const usertId = useSelector((state) => state.UserData)

  const signInWithGoogle = async () => {
    try {
      const result = await Google.logInAsync({
        iosClientId: IOS_CLIENT_ID,
        androidClientId: ANDROID_CLIENT_ID,
        scopes: ['profile', 'email'],
      })

      if (result.type === 'success') {
        newUser = {
          name: result.user.name,
          email: result.user.email,
          password: result.user.id,
          phoneNumber: 'Google',
          defaultAddress: '',
        }
        fetch(Url + '/api/user/', {
          method: 'POST',
          body: JSON.stringify(newUser),
          headers: new Headers({
            'Content-type': 'application/json; charset=UTF-8', //very important to add the 'charset=UTF-8'!!!!
          }),
        })
          .then((res) => {
            return res.json()
          })
          .then(
            async (dbResult) => {
              if (dbResult) {
                dispatch(saveUserId(dbResult))
                try {
                  await AsyncStorage.setItem('UserId', '' + dbResult)
                  await AsyncStorage.setItem(
                    'UserEmail',
                    '' + result.user.email
                  )
                  await AsyncStorage.setItem('defaultNavApp', 'Waze')

                  navigation.navigate('Home')
                } catch (e) {
                  // saving error
                }

                //navigation.navigate('Home')
              }
            },
            (error) => {
              console.log('err post=', error)
            }
          )
      } else {
        return { cancelled: true }
      }
    } catch (e) {
      console.log('LoginScreen.js.js 30 | Error with login', e)
      return { error: true }
    }
  }

  const onLoginPressed = () => {
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })

      return
    }
    fetch(
      Url +
        '/api/user/?email=' +
        email.value +
        '&password=' +
        password.value +
        '',
      {
        method: 'GET',
        headers: new Headers({
          'Content-type': 'application/json; charset=UTF-8', //very important to add the 'charset=UTF-8'!!!!
        }),
      }
    )
      .then((res) => {
        console.log(res)
        return res.json()
      })
      .then(
        async (result) => {
          if (result != -1) {
            dispatch(saveUserId(result))

            try {
              await AsyncStorage.setItem('UserId', '' + result)
              await AsyncStorage.setItem('UserEmail', '' + email.value)
              await AsyncStorage.setItem('defaultNavApp', 'waze')

              navigation.navigate('Home')
            } catch (e) {
              // saving error
            }
          } else {
            Alert.alert(
              'Login Failed',
              'User Doesnt exist',
              [
                {
                  text: 'Try Again',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
              ],
              { cancelable: false }
            )
          }
        },
        (error) => {}
      )
  }

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome back.</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      {/* <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPasswordScreen')}
        >
          <Text style={styles.forgot}>Forgot your password? </Text>
        </TouchableOpacity>
      </View> */}
      <TouchableOpacity onPress={signInWithGoogle}>
        <Image source={require('../assets/google.png')} style={styles.image} />
      </TouchableOpacity>
      <Button mode="contained" onPress={onLoginPressed}>
        Login
      </Button>

      <TouchableOpacity onPress={() => navigation.replace('RegisterScreen')}>
        <Text style={styles.link}>Sign up</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text>Don’t have an account ? </Text>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
  },
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})

export default LoginScreen
