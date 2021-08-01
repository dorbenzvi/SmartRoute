import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native'

import Background from '../components/Background'
import AddStopIcon from '../components/AddStopIcon'

import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { emailValidator } from '../helpers/emailValidator'
import { theme } from '../core/theme'
import { useSelector, useDispatch } from 'react-redux'
import SearchBar from '../components/SearchBar'
import { customerAddressValidator } from '../helpers/customerAddressValidator'
import { addStopToRoute, getDefaultTimeAtStop } from '../actions/index'
import Url from '../components/Url'
//https://github.com/xgfe/react-native-datepicker

const AddStop = ({ navigation }) => {
  const dispatch = useDispatch()
  const currentId = useSelector((state) => state.RouteView)
  const route = useSelector((state) => state.RoutesData)
  const time = useSelector((state) => state.Settings)
  const [customerName, setName] = useState('')
  const [customerPhone, setPhone] = useState('')
  const [timeAtStop, setTimeAtStop] = useState(time.timeAtStop)
  const [email, setEmail] = useState({ value: '', error: '' })
  const [customerAddress, setCustomerAddress] = useState({
    value: '',
    error: '',
  })
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const refFields = useSelector((state) => state.FieldsRef)

  const onAddStopPress = async () => {
    const customerAddressError = customerAddressValidator(customerAddress.value)
    const emailError = emailValidator(email.value)
    if (customerAddressError || emailError) {
      setCustomerAddress({ ...customerAddress, error: customerAddressError })
      setEmail({ ...email, error: emailError })
      return
    }

    fetch(Url + '/api/stop/' + currentId, {
      method: 'POST',
      body: JSON.stringify({
        Address: customerAddress.value,
        Lat: lat,
        Lon: lon,
        CustomerName: customerName,
        Customerphone: customerPhone,
        Note: 'some detail',
        Email: email.value,
        MinutesInStop: timeAtStop,
        StopOrder: route[currentId].Stops.length + 1,
        IsDone: 0,
      }),
      headers: new Headers({
        'Content-type': 'application/json; charset=UTF-8', //very important to add the 'charset=UTF-8'!!!!
      }),
    })
      .then((res) => {
        return res.json()
      })
      .then(
        (result) => {
          dispatch(
            addStopToRoute(currentId, {
              Address: customerAddress.value,
              Latitude: lat,
              Longitude: lon,
              CustomerName: customerName,
              CustomerPhone: customerPhone,
              Note: 'some detail',
              Email: email.value,
              MinutesInStop: timeAtStop,
              StopOrder: route[currentId].Stops.length + 1,
              IsDone: 0,
              StopID: result,
            })
          )
          setName('')
          setPhone('')
          setEmail({ value: '' })
          setCustomerAddress({ value: '' })
        },
        (error1) => {}
      )
    refFields['AddStop'].setAddressText('')
    refFields['indexArray'] = []
    navigation.navigate('Route')
  }

  return (
    <Background>
      <AddStopIcon></AddStopIcon>
      <TextInput
        label="Customer Name"
        returnKeyType="next"
        value={customerName}
        onChangeText={(text) => setName(text)}
      />
      <TextInput
        label="Customer Phone Number"
        returnKeyType="next"
        value={customerPhone}
        onChangeText={(text) => setPhone(text)}
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
      <SearchBar
        setCustomerAddress={setCustomerAddress}
        setLat={setLat}
        setLon={setLon}
        placeholder={'Stop Address'}
        type={'AddStop'}
        error={!!customerAddress.error}
        errorText={customerAddress.error}
      ></SearchBar>
      <TextInput
        label="Time at stop"
        returnKeyType="next"
        value={timeAtStop}
        onChangeText={(text) => setTimeAtStop(text)}
      />

      <Button
        mode="contained"
        onPress={onAddStopPress.bind(this)}
        style={{ marginTop: 24 }}
      >
        Add Stop
      </Button>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigation.replace('LoginScreen')}
        ></TouchableOpacity>
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

export default AddStop
