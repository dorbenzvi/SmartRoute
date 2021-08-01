import React from 'react'
import CardThree from '../modules/react-native-card-ui/Cards'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  ImageBackground,
  StatusBar,
} from 'react-native'

import moment from 'moment'
import LottieView from 'lottie-react-native'
import config from '../../config'
import Header from '../components/Header'
import { TouchableOpacity, Dimensions } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import {
  saveRouteIdToView,
  saveAllRoutes,
  getAllRoutes,
  setRefToField,
} from '../actions/index'
import Url from '../components/Url'
import ActionButton from 'react-native-action-button'
const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

StatusBar.setBarStyle('dark-content')
//https://www.npmjs.com/package/react-native-status-bar-height
class Dashboard extends React.Component {
  state = {
    routes: null,
    loading: false,
  }
  loading = undefined
  componentDidMount() {
    this.props.setRefToField('Dashboard', this)
    if (this.props.routesData == null) {
      const url = Url + '/api/route?userId=' + this.props.userData + ''

      fetch(url, {
        method: 'GET',
        headers: new Headers({
          'Content-type': 'application/json; charset=UTF-8', //very important to add the 'charset=UTF-8'!!!!
        }),
      })
        .then((res) => {
          return res.json()
        })
        .then(
          (result) => {
            //console.log('fetch POST= ', JSON.stringify(result))
            this.props.saveAllRoutes(result)
          },
          (error) => {
            console.log('err get==', error)
          }
        )
    }
    //Get all route for user from DB and save it on store
  }

  getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371 // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1) // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1)
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c // Distance in km
    return d
  }

  deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  calcTotalKM = (route) => {
    let stopsNumber = route.Stops.length
    let totalKm = 0
    if (stopsNumber > 0) {
      totalKm += this.getDistanceFromLatLonInKm(
        route.OriginLatitude,
        route.OriginLongitude,
        route.Stops[0].Latitude,
        route.Stops[0].Longitude
      )
    }
    for (let index = 0; index < stopsNumber - 1; index++) {
      totalKm += this.getDistanceFromLatLonInKm(
        route.Stops[index].Latitude,
        route.Stops[index].Longitude,
        route.Stops[index + 1].Latitude,
        route.Stops[index + 1].Longitude
      )
    }

    //Need to bring it back once we add the last endpoint
    // if (stopsNumber > 0) {
    //   totalKm += this.getDistanceFromLatLonInKm(
    //     route.Stops[stopsNumber - 1].Latitude,
    //     route.Stops[stopsNumber - 1].Longitude,
    //     route.DestinationLatitude,
    //     route.DestinationLongitude
    //   )
    // }

    return totalKm
  }

  render() {
    return (
      <View>
        <ImageBackground
          source={require('../assets/background_dot.png')}
          resizeMode="repeat"
          style={{
            height: windowHeight - getStatusBarHeight(),
            marginTop: getStatusBarHeight(),
            alignItems: 'center',
          }}
        >
          <Header>Your Routes:</Header>

          <ScrollView>
            {this.props.routesData != undefined
              ? Object.keys(this.props.routesData).map((key) => {
                let totalKm = this.calcTotalKM(this.props.routesData[key])

                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      this.props.saveRouteIdToView(key)
                      this.props.navigation.navigate('Route')
                    }}
                  >
                    <CardThree
                      key={key}
                      id={key}
                      navigation={this.props.navigation}
                      km={totalKm}
                      routeName={this.props.routesData[key].RouteName}
                      stops={this.props.routesData[key].Stops.length}
                      image={{
                        uri:
                          'https://i.ibb.co/bzgRdqS/map-route-removebg-preview.png',
                      }}
                      icon={'eye'}
                      origin={this.props.routesData[key].Origin}
                      destination={this.props.routesData[key].Destination}
                      date={moment(this.props.routesData[key].Date).utc().format(
                        'DD/MM/YYYY HH:mm'
                      )}
                    />
                  </TouchableOpacity>
                )
              })
              : null}
          </ScrollView>
          <ActionButton
            buttonColor="#5067FF"
            onPress={() => {
              if (
                this.props.FieldsRef['SetNameToRoute'] &&
                this.props.FieldsRef['SetDateToRoute']
              ) {
                this.props.FieldsRef['SetNameToRoute']({
                  value: moment().format('ddd MMM DD'),
                })
                this.props.FieldsRef['SetDateToRoute'](
                  moment().format('DD/MM/YYYY HH:mm')
                )
              }
              this.props.navigation.navigate('AddRoute')
            }}
          />
        </ImageBackground>
        {this.state.loading ? (
          <LottieView
            ref={(animation) => {
              this.loading = animation
              this.props.setRefToField('loadingCsv', this.loading)
            }}
            source={require('../assets/5733-location-map.json')}
          />
        ) : null}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    routesData: state.RoutesData,
    userData: state.UserData,
    FieldsRef: state.FieldsRef,
  }
}

const mapDispatchToProps = () => {
  return {
    saveRouteIdToView,
    saveAllRoutes,
    getAllRoutes,
    setRefToField,
  }
}

export default connect(mapStateToProps, mapDispatchToProps())(Dashboard)
const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backdrop: {},
  menuOptions: {
    padding: 50,
  },
  menuTrigger: {
    padding: 5,
  },
  triggerText: {
    fontSize: 20,
  },
  contentText: {
    fontSize: 18,
  },
})
