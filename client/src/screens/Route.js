import React from 'react'

import { NavigationContainer } from '@react-navigation/native'

import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import RouteView from '../components/RouteView'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import Modal from 'react-native-modal'
import {
  faHome,
  faFlag,
  faClock,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
import LottieView from 'lottie-react-native'
import * as WebBrowser from 'expo-web-browser'
import Pin from '../assets/Pin.png'
import config from '../../config'
import ActionButton from 'react-native-action-button'
import Icon from 'react-native-vector-icons/Ionicons'
import moment from 'moment'

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { Button as ButtonCard, Card } from 'react-native-paper'
import { connect } from 'react-redux'
import {
  getRouteById,
  setRefToField,
  addTime,
  stopNewOrder,
} from '../actions/index'

import Url from '../components/Url'
const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height
const widthstatusbar = windowHeight - getStatusBarHeight()
//https://github.com/mastermoo/react-native-action-button
const Drawer = createDrawerNavigator()

class Route extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      latitude: this.GetCenterFromDegrees()[0],
      longitude: this.GetCenterFromDegrees()[1],
      edit: false,
      totalTime: null,
      loading: false,
      isModalVisible: false,
      firstRouteOption: null,
      secondRouteOption: null,
    }
  }
  loadingAnimation = undefined
  renderMarkers = (stops) => {
    stops.sort((a, b) => (a.StopOrder > b.StopOrder ? 1 : -1)) // Sort the array by stop number

    const listItems = stops.map((stop, index) => (
      <Marker
        key={index}
        title={'Stop: ' + (index + 1)}
        description={stop.Address}
        coordinate={{ latitude: stop.Latitude, longitude: stop.Longitude }}
      >
        <View>
          <ImageBackground
            source={require('../assets/Pin.png')}
            style={{ height: 50, width: 50 }}
          >
            <Text style={{ paddingLeft: 20, paddingTop: 7 }}>{index + 1}</Text>
          </ImageBackground>
        </View>
      </Marker>
    ))

    return listItems
  }

  GetCenterFromDegrees = () => {
    let data = this.getWaypointOfRoute(
      this.props.routesData[this.props.routeToView].Stops
    )
    if (!(data.length > 0)) {
      return false
    }

    var num_coords = data.length

    var X = 0.0
    var Y = 0.0
    var Z = 0.0

    for (let i = 0; i < data.length; i++) {
      var lat = (data[i].latitude * Math.PI) / 180
      var lon = (data[i].longitude * Math.PI) / 180

      var a = Math.cos(lat) * Math.cos(lon)
      var b = Math.cos(lat) * Math.sin(lon)
      var c = Math.sin(lat)

      X += a
      Y += b
      Z += c
    }

    X /= num_coords
    Y /= num_coords
    Z /= num_coords

    var lon = Math.atan2(Y, X)
    var hyp = Math.sqrt(X * X + Y * Y)
    var lat = Math.atan2(Z, hyp)

    var newX = (lat * 180) / Math.PI
    var newY = (lon * 180) / Math.PI

    return new Array(newX, newY)
  }

  closeAllStops = () => {
    if (this.props.FieldsRef['indexArray'] != undefined) {
      for (let index of this.props.FieldsRef['indexArray']) {
        this.props.FieldsRef['toggle'].toggle(index, 4)
      }
    }

    this.props.FieldsRef['indexArray'] = []
  }

  componentDidMount() {
    const route = this.props.routeToView
    unsubscribe = this.props.navigation.addListener('blur', (e) => {
      this.closeAllStops()
      this.props.FieldsRef['RouteView'].setState({ fixedItems: [] }) // Clear the pinned stops when leaving the route

      if (this.state.edit) this.setState({ edit: !this.state.edit })
    })
    this.props.setRefToField('RouteRef', this)

    //My Location - set current location as default

    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     this.setState({
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude,
    //     })
    //   },
    //   (error) => this.setState
    // )
  }

  setLimitedRoute = () => {
    this.props.stopNewOrder(
      this.state.firstRouteOption.order.individual,
      this.props.routeToView
    )
    this.setState({ isModalVisible: false })
    this.calculateDriveTime()
  }
  setUnlimitedRoute = () => {
    this.props.stopNewOrder(
      this.state.secondRouteOption.order.individual,
      this.props.routeToView
    )
    this.setState({ isModalVisible: false })
    this.calculateDriveTime()
  }

  optimize = () => {
    this.setState({ loading: true })
    let wayPoints = []
    let Constraints = []
    wayPoints.push({
      Address: this.props.routesData[this.props.routeToView].Origin,
      MinutesInStop: 0,
    })
    for (
      let i = 0;
      i < this.props.routesData[this.props.routeToView].Stops.length;
      i++
    ) {
      if (this.props.routesData[this.props.routeToView].Stops[i].Constraints) {
        Constraints[
          this.props.routesData[this.props.routeToView].Stops[i].Address
        ] = this.props.routesData[this.props.routeToView].Stops[i].Constraints
      }
      wayPoints.push({
        Address: this.props.routesData[this.props.routeToView].Stops[i].Address,
        Constraint: this.props.routesData[this.props.routeToView].Stops[i]
          .Constraints,
        MinutesInStop: this.props.routesData[this.props.routeToView].Stops[i]
          .MinutesInStop,
      })
    }
    wayPoints.push({
      Address: this.props.routesData[this.props.routeToView].Destination,
      MinutesInStop: 0,
    })
    fetch(Url + '/api/Tsp/', {
      method: 'POST',
      body: JSON.stringify({
        points: wayPoints,
        startTime: this.props.routesData[this.props.routeToView].Date,
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
          console.log('order is :' + result)
          console.log(result)
          if (result.length == 2) {
            this.setState({
              firstRouteOption: result[0],
              secondRouteOption: result[1],
              loading: false,
              isModalVisible: true,
            })
          } else {
            this.setState({ loading: false })
            this.props.stopNewOrder(
              result[0].order.individual,
              this.props.routeToView
            )
            this.calculateDriveTime()
          }

          // console.log('after change')
          // console.log(this.props.routesData[this.props.routeToView].Stops)
        },
        (error) => {
          console.log('err get=', error)
        }
      )
  }

  getWaypointOfRoute = (stops) => {
    let wayPoints = []

    stops.map((stop) => {
      wayPoints.push({ latitude: stop.Latitude, longitude: stop.Longitude })
    })

    return wayPoints
  }

  showTotalTime = () => {
    var num = this.props.routesData[this.props.routeToView].TotalTime
    var hours = num / 60
    var rhours = Math.floor(hours)
    var minutes = (hours - rhours) * 60
    var rminutes = Math.round(minutes)
    let timestring =
      rhours == 0
        ? rhours + ':' + rminutes + ' Minutes'
        : rhours + ':' + rminutes + ' Hours'
    return timestring
  }

  TotalRouteTime = (time) => {
    var num = time / 60
    var hours = num / 60
    var rhours = Math.floor(hours)
    var minutes = (hours - rhours) * 60
    var rminutes = Math.round(minutes)
    let timestring =
      rhours == 0
        ? rhours + ':' + rminutes + ' Minutes'
        : rhours + ':' + rminutes + ' Hours'
    return timestring
  }

  calculateDriveTime = () => {
    let wayPoints = ''
    for (
      let i = 0;
      i < this.props.routesData[this.props.routeToView].Stops.length;
      i++
    ) {
      let item = this.props.routesData[this.props.routeToView].Stops.find(
        (stop) => stop.StopOrder == i + 1
      )
      wayPoints += item.Address + '|'
    }
    let url =
      'https://maps.googleapis.com/maps/api/directions/json?origin=' +
      this.props.routesData[this.props.routeToView].Origin +
      '&destination=' +
      this.props.routesData[this.props.routeToView].Destination +
      '&key=AIzaSyDSPbGU97zuuoaYX9QJHJ16SMEZweIXXr4&waypoints=' +
      wayPoints +
      '&departure_time=' +
      moment(this.props.routesData[this.props.routeToView].Date).utc().valueOf()

    console.log(url)
    fetch(url, {
      method: 'POST',
      headers: new Headers({
        'Content-type': 'application/json; charset=UTF-8', //very important to add the 'charset=UTF-8'!!!!
      }),
    })
      .then((res) => {
        return res.json()
      })
      .then(
        async (result) => {
          this.props.addTime(this.props.routeToView, result)
        },
        (error) => {
          console.log('err post=', error)
        }
      )
  }

  exportToXlsx = async () => {
    WebBrowser.openBrowserAsync(
      Url +
        '/api/download?userId=' +
        this.props.userData +
        '&RouteId=' +
        this.props.routeToView
    )
  }

  render() {
    return this.props.routesData && this.props.routeToView ? (
      <View>
        {this.state.loading ? (
          <LottieView
            ref={(animation) => {
              this.loadingAnimation = animation
            }}
            autoPlay={true}
            source={require('../assets/5733-location-map.json')}
            style={{ zIndex: 1 }}
          />
        ) : null}

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.text}>
              {' ' +
                this.props.routesData[this.props.routeToView].RouteName +
                '  |  ' +
                this.props.routesData[this.props.routeToView].Stops.length +
                ' Stops'}
            </Text>

            <Text style={styles.text}>
              <FontAwesomeIcon icon={faClock} size={20} />
              {'Start Time: ' +
                moment(this.props.routesData[this.props.routeToView].Date)
                  .utc()
                  .format('HH:mm')}
            </Text>
            <Text style={styles.text}>
              {this.props.routesData[this.props.routeToView].FinishTime !=
              undefined
                ? 'Duartion: ' + this.showTotalTime()
                : null}
            </Text>
          </View>

          <MapView
            loadingEnabled={true}
            followsUserLocation={true}
            showsMyLocationButton={false}
            showsUserLocation={true}
            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            region={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.8315,
              longitudeDelta: 1.0121,
              loadingEnabled: true,
            }}
          >
            <MapViewDirections
              origin={this.props.routesData[this.props.routeToView].Origin}
              destination={
                this.props.routesData[this.props.routeToView].Destination
              }
              apikey={config.GOOGLE_API}
              strokeWidth={3}
              precision={'high'}
              strokeColor="blue"
              optimizeWaypoints={false}
              timePrecision={'now'}
              waypoints={this.getWaypointOfRoute(
                this.props.routesData[this.props.routeToView].Stops
              )}
            />

            <Marker
              title={'Origin'}
              description={
                this.props.routesData[this.props.routeToView]['Origin']
              }
              coordinate={{
                latitude: this.props.routesData[this.props.routeToView]
                  .OriginLatitude,
                longitude: this.props.routesData[this.props.routeToView]
                  .OriginLongitude,
              }}
            >
              <FontAwesomeIcon icon={faHome} size={24} />
            </Marker>
            <Marker
              title={'Destination'}
              description={
                this.props.routesData[this.props.routeToView]['Destination']
              }
              coordinate={{
                latitude: this.props.routesData[this.props.routeToView]
                  .DestinationLatitude,
                longitude: this.props.routesData[this.props.routeToView]
                  .DestinationLongitude,
              }}
            >
              <FontAwesomeIcon icon={faFlag} size={24} />
            </Marker>
            {this.renderMarkers(
              this.props.routesData[this.props.routeToView].Stops
            )}
          </MapView>

          <View style={styles.routesView}>
            <RouteView
              edit={this.state.edit}
              style={styles.route}
              data={this.props.routesData[this.props.routeToView]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Modal
              deviceWidth={windowWidth}
              deviceHeight={windowHeight}
              isVisible={this.state.isModalVisible}
              backdropOpacity={0.4}
            >
              <View
                style={{
                  flex: 1,
                  marginTop: '50%',
                }}
              >
                <Card>
                  <Card.Title title="Select Route" />
                  <Card.Content>
                    <Text>We have 2 options for you:</Text>
                  </Card.Content>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity onPress={() => this.setLimitedRoute()}>
                        <Image
                          style={{ height: 120, width: 120 }}
                          source={require('../assets/clock_limit.png')}
                        ></Image>
                        <Text>
                          Total Time:{' '}
                          {this.state.firstRouteOption
                            ? this.TotalRouteTime(
                                this.state.firstRouteOption.order.fitness
                              )
                            : null}
                        </Text>
                        <Text>
                          Possible Constraint:{' '}
                          {this.state.firstRouteOption
                            ? this.state.firstRouteOption.msg
                            : null}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity
                        onPress={() => this.setUnlimitedRoute()}
                      >
                        <Image
                          style={{ height: 120, width: 120 }}
                          source={require('../assets/no_limit.png')}
                        ></Image>
                        <Text>
                          Total Time:
                          {this.state.secondRouteOption
                            ? this.TotalRouteTime(
                                this.state.secondRouteOption.order.fitness
                              )
                            : null}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              </View>
            </Modal>
          </View>
          <ActionButton buttonColor="#5067FF" offsetX={8} offsetY={295}>
            <ActionButton.Item
              size={38}
              buttonColor="#5067FF"
              title="Add Stop"
              onPress={() => {
                this.props.navigation.navigate('AddStop')
              }}
            >
              <Icon name="md-add" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item
              size={38}
              buttonColor="#5067FF"
              title="Edit Stops"
              onPress={() => {
                this.setState({ edit: !this.state.edit })
                this.closeAllStops()
              }}
            >
              <Icon name="md-create" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item
              size={38}
              buttonColor="#5067FF"
              title="Calculate Time"
              onPress={() => {
                this.calculateDriveTime()
              }}
            >
              <Icon name="md-time" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item
              size={38}
              buttonColor="#5067FF"
              title="TSP"
              onPress={() => {
                this.optimize()
              }}
            >
              <Icon name="md-time" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item
              size={38}
              buttonColor="#5067FF"
              title="Export"
              onPress={() => {
                this.exportToXlsx()
              }}
            >
              <Icon name="md-download" style={styles.actionButtonIcon} />
            </ActionButton.Item>
          </ActionButton>
        </View>
      </View>
    ) : null
  }
}

const mapStateToProps = (state) => {
  return {
    routesData: state.RoutesData,
    routeToView: state.RouteView,
    stopView: state.StopView,
    userData: state.UserData,
    FieldsRef: state.FieldsRef,
  }
}

const mapDispatchToProps = () => {
  return {
    getRouteById,
    setRefToField,
    addTime,
    stopNewOrder,
  }
}

export default connect(mapStateToProps, mapDispatchToProps())(Route)

const styles = StyleSheet.create({
  container: {
    //...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    display: 'flex',
    height: windowHeight - getStatusBarHeight(),
    alignContent: 'stretch',
    flexDirection: 'column',
    //justifyContent: 'space-around',
    marginTop: getStatusBarHeight(),
  },
  map: {
    height: '100%',
    width: '100%',
    borderRadius: 20,
  },
  route: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    marginBottom: 10,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  routesView: {
    position: 'absolute',
    height: 280,
    bottom: 0,
    width: '100%',

    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
})
