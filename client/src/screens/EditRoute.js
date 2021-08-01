import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import Background from '../components/Background'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { theme } from '../core/theme'
import SearchBar from '../components/SearchBar'
import moment from 'moment'
import DatePicker from 'react-native-datepicker'
import RNDatePicker from '@react-native-community/datetimepicker'
import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import { createRoute, setRefToField, editRoute } from '../actions/index'
import AddRouteIcon from '../components/AddRouteIcon'
import Url from '../components/Url'
import EditSearchBar from '../components/EditSearchBar'
//https://github.com/xgfe/react-native-datepicker

class EditRoute extends React.Component {
  constructor(props) {
    super(props)
    this.myRef = React.createRef()
  }
  state = {
    name: moment().format('ddd MMM DD'),
    selectedDate: moment().format('DD/MM/YYYY HH:mm'),
    fromAddress: null,
    fromLat: null,
    fromLon: null,
    toAddress: null,
    toLat: null,
    toLon: null,
  }

  componentDidMount() {
    this.props.setRefToField('EditRoute', this)
    this.setState({
      RouteName: this.props.route.params.Name,
      toAddress: this.props.route.params.toAddress,
      fromAddress: this.props.route.params.fromAddress,
      fromLat: this.props.route.params.fromLat,
      fromLon: this.props.route.params.fromLon,
      toLat: this.props.route.params.toLat,
      toLon: this.props.route.params.toLon,
    })
    // console.log(this.props.routesData[this.props.id]['Origin'])
  }

  //Add the route and navigate to Dashboard screen
  onSaveRoutePress = () => {
    let momentObj = moment(this.state.selectedDate, 'DD/MM/YYYY HH:mm')
    let date = new Date(momentObj)

    fetch(Url + '/api/route/' + this.props.routeToView, {
      method: 'PUT',
      body: JSON.stringify({
        RouteName: this.state.name,
        Origin: this.state.fromAddress
          ? this.state.fromAddress
          : this.props.route.params.fromAddress,
        Destination: this.state.toAddress
          ? this.state.toAddress
          : this.props.route.params.toAddress,
        Date: moment(date).format('MM/DD/YYYY HH:mm'),
        DestinationLatitude: this.state.toLat
          ? this.state.toLat
          : this.props.route.params.toLat,
        DestinationLongitude: this.state.toLon
          ? this.state.toLon
          : this.props.route.params.toLon,
        OriginLatitude: this.state.fromLat
          ? this.state.fromLat
          : this.props.route.params.fromLat,
        OriginLongitude: this.state.fromLon
          ? this.state.fromLon
          : this.props.route.params.fromLon,
      }),
      headers: new Headers({
        'Content-type': 'application/json; charset=UTF-8', //very important to add the 'charset=UTF-8'!!!!
      }),
    }).then(
      (result) => {
        this.props.editRoute(this.props.routeToView, {
          RouteName: this.state.name,
          Origin: this.state.fromAddress
            ? this.state.fromAddress
            : this.props.route.params.fromAddress,
          Destination: this.state.toAddress
            ? this.state.toAddress
            : this.props.route.params.toAddress,
          Date: moment(date).format('MM/DD/YYYY HH:mm'),
          DestinationLatitude: this.state.toLat
            ? this.state.toLat
            : this.props.route.params.toLat,
          DestinationLongitude: this.state.toLon
            ? this.state.toLon
            : this.props.route.params.toLon,
          OriginLatitude: this.state.fromLat
            ? this.state.fromLat
            : this.props.route.params.fromLat,
          OriginLongitude: this.state.fromLon
            ? this.state.fromLon
            : this.props.route.params.fromLon,
          Stops: this.props.routesData[this.props.routeToView].Stops,
        })

        this.props.navigation.navigate('Dashboard')
      },
      (error1) => {}
    )
  }
  render() {
    //Check if the state changed due to editing
    if (
      this.props.FieldsRef['EditFrom'] &&
      this.props.FieldsRef['EditTo'] &&
      ((this.state.fromAddress !== this.props.route.params.fromAddress &&
        this.state.fromAddress !== null) ||
        (this.state.toAddress !== this.props.route.params.toAddress &&
          this.state.toAddress !== null))
    ) {
      this.props.FieldsRef['EditFrom'].setAddressText(this.state.fromAddress)
      this.props.FieldsRef['EditTo'].setAddressText(this.state.toAddress)
    } else if (
      //This is happend when the state not changed, meaning it just need to provide the address
      this.props.FieldsRef['EditFrom'] &&
      this.props.FieldsRef['EditTo']
    ) {
      this.props.FieldsRef['EditFrom'].setAddressText(
        this.props.route.params.fromAddress
      )
      this.props.FieldsRef['EditTo'].setAddressText(
        this.props.route.params.toAddress
      )
    }
    return (
      <Background>
        <AddRouteIcon />
        <TextInput
          label="Route Name"
          returnKeyType="next"
          value={this.state.name}
          onChangeText={(text) => this.setState({ name: text })}
        />

        <EditSearchBar
          setFromLat={this.state.fromLat}
          setFromLon={this.state.fromLon}
          setFromAddress={this.fromAddress}
          placeholder={'From'}
          type={'EditFrom'}
          searchEditFrom={this}
        ></EditSearchBar>
        <EditSearchBar
          setToLat={this.state.toLat}
          setToLon={this.state.toLon}
          setToAddress={this.toAddress}
          placeholder={'To'}
          type={'EditTo'}
          searchEditTo={this}
        ></EditSearchBar>

        <DatePicker
          iOSDatePickerComponent={(props) => (
            <RNDatePicker
              {...props}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            />
          )}
          style={{ width: '95%' }}
          date={this.state.selectedDate}
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
            this.setState({ selectedDate: date })
          }}
        />

        <Button
          mode="contained"
          onPress={this.onSaveRoutePress}
          style={{ marginTop: 24 }}
        >
          Save
        </Button>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => navigation.replace('LoginScreen')}
          ></TouchableOpacity>
        </View>
      </Background>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    FieldsRef: state.FieldsRef,
    routesData: state.RoutesData,
    routeToView: state.RouteView,
  }
}

const mapDispatchToProps = () => {
  return {
    editRoute,
    setRefToField, // I think we should change it to EditRoute
  } //test
}
export default connect(mapStateToProps, mapDispatchToProps())(EditRoute)
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
