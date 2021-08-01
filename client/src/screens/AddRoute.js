import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import Background from '../components/Background'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { theme } from '../core/theme'
import SearchBar from '../components/SearchBar'
import config from '../../config'
import moment from 'moment'
import DatePicker from 'react-native-datepicker'
import RNDatePicker from '@react-native-community/datetimepicker'
import { useSelector, useDispatch } from 'react-redux'
import {
  createRoute,
  getRefToGoogleSearchBar,
  setRefToField,
} from '../actions/index'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Url from '../components/Url'
import AddRouteIcon from '../components/AddRouteIcon'
import { routeNameValidator } from '../helpers/routeNameValidator'
import { fromAddressValidator } from '../helpers/fromAddressValidator'
import { toAddressValidator } from '../helpers/toAddressValidator'
//https://github.com/xgfe/react-native-datepicker

const AddRoute = ({ navigation }) => {
  const dispatch = useDispatch()
  const [name, setName] = useState({
    value: moment().format('ddd MMM DD'),
    error: '',
  })

  const [selectedDate, setDate] = useState(moment().format('DD/MM/YYYY HH:mm'))
  const [fromAddress, setFromAddress] = useState({ value: '', error: '' })
  const [fromLat, setFromLat] = useState('')
  const [fromLon, setFromLon] = useState('')
  const [toAddress, setToAddress] = useState({ value: '', error: '' })
  const [toLat, setToLat] = useState('')
  const [toLon, setToLon] = useState('')
  const refFields = useSelector((state) => state.FieldsRef)
  dispatch(setRefToField('SetNameToRoute', setName))
  dispatch(setRefToField('SetDateToRoute', setDate))
  //Add the route and navigate to Dashboard screen
  const onCreateRoutePress = async () => {
    const routeNameError = routeNameValidator(name.value)
    const fromAddressError = fromAddressValidator(fromAddress.value)
    const toAddressError = toAddressValidator(toAddress.value)

    if (routeNameError || fromAddressError || toAddressError) {
      setName({ ...name, error: routeNameError })
      setFromAddress({ ...fromAddress, error: fromAddressError })
      setToAddress({ ...toAddress, error: toAddressError })
      return
    }
    //Need to
    unsubscribe = navigation.addListener('blur', (e) => {
      setFromAddress({ value: '' })
      setToAddress({ value: '' })
      refFields['AddFrom'].setAddressText('')
      refFields['AddTo'].setAddressText('')
    })

    let momentObj = moment(selectedDate, 'DD/MM/YYYY HH:mm')
    let date = new Date(momentObj)
    const userId = await AsyncStorage.getItem('UserId')

    fetch(Url + '/api/route/' + userId, {
      method: 'POST',
      body: JSON.stringify({
        RouteName: name.value,
        Origin: fromAddress.value,
        OriginLongitude: fromLon,
        OriginLatitude: fromLat,
        Destination: toAddress.value,
        DestinationLongitude: toLon,
        DestinationLatitude: toLat,
        Date: moment(date).format('MM/DD/YYYY HH:mm'),
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
          try {
            dispatch(
              createRoute(result, {
                Id: result,
                RouteName: name.value,
                Origin: fromAddress.value,
                OriginLongitude: fromLon,
                OriginLatitude: fromLat,
                Destination: toAddress.value,
                DestinationLongitude: toLon,
                DestinationLatitude: toLat,
                Date: moment(date).format('MM/DD/YYYY HH:mm'),
                Stops: [],
              })
            )

            refFields['AddFrom'].setAddressText('')
            refFields['AddTo'].setAddressText('')

            setFromAddress({ value: '' })
            setToAddress({ value: '' })
            navigation.navigate('Dashboard')
          } catch (e) {
            // saving error
          }
        },
        (error1) => {}
      )
  }

  return (
    <Background>
      <AddRouteIcon></AddRouteIcon>
      <TextInput
        label="Route Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text })}
        error={!!name.error}
        errorText={name.error}
      />

      <SearchBar
        setFromLat={setFromLat}
        setFromLon={setFromLon}
        setFromAddress={setFromAddress}
        placeholder={'From'}
        type={'AddFrom'}
        error={!!fromAddress.error}
        errorText={fromAddress.error}
      ></SearchBar>
      <SearchBar
        setToLat={setToLat}
        setToLon={setToLon}
        setToAddress={setToAddress}
        placeholder={'To'}
        type={'AddTo'}
        error={!!toAddress.error}
        errorText={toAddress.error}
      ></SearchBar>

      <DatePicker
        iOSDatePickerComponent={(props) => (
          <RNDatePicker
            {...props}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          />
        )}
        style={{ width: '95%' }}
        date={selectedDate}
        mode="datetime"
        androidMode="spinner"
        placeholder="Select date"
        format="DD/MM/YYYY HH:mm"
        minDate={moment().format('DD/MM/YYYY HH:mm:ss')} //Set the minimun datetime to NOW
        maxDate={moment().add(120, 'years').format('DD/MM/YYYY HH:mm:ss')} // Set the maximum to today+120 years
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        is24Hour={true}
        customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 4,
            marginLeft: 0,
          },
          dateInput: {
            marginLeft: 36,
          },
          // ... You can check the source to find the other keys.
        }}
        onDateChange={(date) => {
          setDate(date)
        }}
      />

      <Button
        mode="contained"
        onPress={onCreateRoutePress}
        style={{ marginTop: 24 }}
      >
        Create Route
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

export default AddRoute
