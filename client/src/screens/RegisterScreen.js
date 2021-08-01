import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
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
import { nameValidator } from '../helpers/nameValidator'
import { phoneValidator } from '../helpers/phoneValidator'
import * as SecureStore from 'expo-secure-store'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector, useDispatch } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { saveUserId } from '../actions/index'
import Url from '../components/Url'

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const [name, setName] = useState({ value: '', error: '' })
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [phoneNumber, setPhone] = useState({ value: '', error: '' })
  const [address, setAddress] = useState({ value: '' })

  const onSignUpPressed = async () => {
    const nameError = nameValidator(name.value)
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    const phoneError = phoneValidator(phoneNumber.value)
    if (emailError || passwordError || nameError) {
      setName({ ...name, error: nameError })
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      setPhone({ ...phoneNumber, error: phoneError })
      return
    }

    const newUser = {
      name: name.value,
      email: email.value,
      password: password.value,
      phoneNumber: phoneNumber.value,
      defaultAddress: address.value,
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
        async (result) => {
          dispatch(saveUserId(result))

          try {
            await AsyncStorage.setItem('UserId', '' + result)
            await AsyncStorage.setItem('UserEmail', '' + email.value)
            navigation.navigate('Home')
          } catch (e) {
            console.log(e)
          }
        },
        (error) => {
          console.log('err post=', error)
        }
      )
  }

  const encryptData = (text, key) => {
    return Aes.randomKey(16).then((iv) => {
      return Aes.encrypt(text, key, iv).then((cipher) => ({
        cipher,
        iv,
      }))
    })
  }

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Create Account</Header>
      <TextInput
        label="Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="Phone"
        returnKeyType="next"
        value={phoneNumber.value}
        onChangeText={(text) => setPhone({ value: text, error: '' })}
        error={!!phoneNumber.error}
        errorText={phoneNumber.error}
        keyboardType="number-pad"
      />
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
        returnKeyType="next"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      {/* <TextInput
        label="Address"
        returnKeyType="done"
        value={address.value}
        onChangeText={(text) => setAddress({ value: text })}
      /> */}
      <Button
        mode="contained"
        onPress={onSignUpPressed.bind(this)}
        style={{ marginTop: 24 }}
      >
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})

export default RegisterScreen
