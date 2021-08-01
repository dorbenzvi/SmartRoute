import React, { Component } from 'react'
import { AlertPrompt } from 'react-native-alert-prompt'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
  Dimensions,
  Button,
} from 'react-native'
import moment from 'moment'
import DialogInput from 'react-native-dialog-input'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Divider } from 'react-native-paper'
import LottieView from 'lottie-react-native'
import AwesomeAlert from 'react-native-awesome-alerts'
import {
  faPhone,
  faTimesCircle,
  faCheckCircle,
  faTrash,
  faFlag,
  faClock,
} from '@fortawesome/free-solid-svg-icons'

import {
  NavigationApps,
  actions,
  googleMapsTravelModes,
} from '../modules/react-native-navigation-apps'
import { connect } from 'react-redux'
import {
  saveStopIdToView,
  markStopAsDone,
  deleteStop,
  setRefToField,
  addConstraints,
  addStopToRoute,
  deleteConstraints,
} from '../actions/index'
import Url from '../components/Url'
//https://www.npmjs.com/package/react-native-drag-sort
const { width } = Dimensions.get('window')
class StopsView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
      alertVisable: false,
      fixedItems: [],
      showAlert: false,
    }

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }
  componentDidMount() {
    this.props.setRefToField('Stop' + this.props.stopOrder, this)
  }
  showDialog = () => {
    this.setState({ alertVisable: true })
  }

  handleCancel = () => {
    this.setState({ alertVisable: false })
  }
  showAlert = () => {
    this.setState({
      showAlert: true,
    })
  }

  hideAlert = () => {
    this.setState({
      showAlert: false,
    })
  }
  handleSubmit = (time) => {
    this.props.addStopToRoute(234, { test: 'test' })
    var regex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
    var matches = time.match(regex)
    if (matches) {
      let splited = time.split(':')
      let today = moment()
      today.set('hour', parseInt(splited[0]) + 3)
      today.set('minute', splited[1])

      this.props.addConstraints(
        this.props.routeView,
        this.props.data.StopID,
        today
      )
    } else {
      this.setState({ showAlert: true })
    }
    this.setState({ alertVisable: false })
  }
  closeAllStops = () => {
    if (this.props.FieldsRef['indexArray'] != undefined) {
      for (let index of this.props.FieldsRef['indexArray']) {
        this.props.FieldsRef['toggle'].toggle(index, 4)
      }
    }
    this.props.FieldsRef['indexArray'] = []
  }

  calculateDriveTime = () => {
    let wayPoints = ''
    for (
      let i = 0;
      i < this.props.routesData[this.props.routeToView].Stops.length;
      i++
    ) {
      wayPoints +=
        this.props.routesData[this.props.routeToView].Stops[i].Address + '|'
    }
    let url =
      'https://maps.googleapis.com/maps/api/directions/json?origin=' +
      this.props.routesData[this.props.routeToView].Origin +
      '&destination=' +
      this.props.routesData[this.props.routeToView].Destination +
      '&key=API_KEY_HERE=' +
      wayPoints +
      '&departure_time=' +
      moment.utc(this.props.routesData[this.props.routeToView].Date).valueOf()

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
  fixStop = (stopID) => {
    let tempArr = [...this.props.FieldsRef['RouteView'].state.fixedItems]

    if (tempArr.includes(stopID)) {
      let filteredArray = tempArr.filter((item) => item !== stopID)
      //console.log(filteredArray)
      this.props.FieldsRef['RouteView'].setState({ fixedItems: filteredArray })
    } else {
      tempArr.push(stopID)
      //console.log(tempArr)
      this.props.FieldsRef['RouteView'].setState({ fixedItems: tempArr })
    }
    this.setState({ fixedItems: tempArr })
  }
  deleteStop = (stopId) => {
    fetch(
      Url +
        '/api/stop/?stopId=' +
        stopId +
        '&stopOrder=' +
        this.props.data.StopOrder +
        '&routeId=' +
        this.props.routeToView +
        '',
      {
        method: 'DELETE',
      }
    )
      .then(() => {
        this.props.deleteStop(
          stopId,
          this.props.routeToView,
          this.props.data.StopOrder
        )
        this.closeAllStops()
      })
      .catch((err) => {
        console.error(err)
      })
  }

  func = (data) => {
    console.log('data', data)
    return data
  }

  markStopAsDone = (stopId) => {
    fetch(Url + '/api/stop/' + stopId + '/' + !this.props.data.IsDone + '', {
      method: 'PUT',
      headers: new Headers({
        'Content-type': 'application/json; charset=UTF-8', //very important to add the 'charset=UTF-8'!!!!
      }),
    })
      .then(() => {
        this.props.markStopAsDone(stopId, this.props.routeView)
        this.closeAllStops()
      })
      .catch((err) => {
        console.error(err)
      })
  }

  //this.props.addConstraints(this.props.routeView, this.props.data.StopID, data)
  render() {
    console.log(this.props.data)
    const { showAlert } = this.state
    return (
      <View>
        <DialogInput
          isDialogVisible={this.state.alertVisable}
          title={'Time Constraint'}
          message={'Please enter time constraint.'}
          hintInput={
            this.props.data.Constraints
              ? moment(this.props.data.Constraints).utc().format('HH:mm')
              : 'Format: HH:MM'
          }
          submitInput={(inputText) => {
            this.handleSubmit(inputText)
          }}
          closeDialog={this.handleCancel}
          routeView={this.props.routeView}
          StopID={this.props.data.StopID}
        ></DialogInput>
        <AwesomeAlert
          show={showAlert}
          showProgress={false}
          title="Time Format Invalid"
          message="Time format should be: HH:MM, ex: 13:45"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Let me try again"
          confirmButtonColor="#DD6B55"
          onCancelPressed={() => {
            this.hideAlert()
          }}
          onConfirmPressed={() => {
            this.hideAlert()
          }}
        />
        {this.props.end == false ? (
          <View>
            <View
              ref={this.accordion}
              style={!this.props.data.IsDone ? styles.row : styles.rowDone}
              onPress={() => {
                this.props.saveStopIdToView(this.props.data)
              }}
            >
              <Text style={[styles.title, styles.font]}>
                {this.props.stopOrder + '.  ' + this.props.data.Address}
              </Text>

              <View style={{ flexDirection: 'row' }}>
                {this.props.edit == true ? (
                  <TouchableOpacity
                    onPress={() => {
                      this.deleteStop(this.props.data.StopID)
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} size={20} />
                  </TouchableOpacity>
                ) : (
                  <Text></Text>
                )}

                <TouchableOpacity
                  ref={this.accordion}
                  onPress={() => {
                    this.props.saveStopIdToView(this.props.data)
                  }}
                >
                  <Icon
                    name={
                      this.state.expanded
                        ? 'keyboard-arrow-up'
                        : 'keyboard-arrow-down'
                    }
                    size={30}
                    color="#000000"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {this.state.expanded && (
              <View
                style={
                  !this.props.data.IsDone ? styles.child : styles.childDone
                }
              >
                <NavigationApps
                  iconSize={40}
                  row
                  waze={{
                    lat: this.props.data.Latitude,
                    lon: this.props.data.Longitude,
                    action: actions.navigateByLatAndLon,
                  }} // specific settings for waze
                  googleMaps={{
                    lat: this.props.data.Latitude,
                    lon: this.props.data.Longitude,
                    action: actions.navigateByLatAndLon,
                    travelMode: 'driving',
                  }} // specific settings for google maps
                  maps={{
                    lat: this.props.data.Latitude,
                    lon: this.props.data.Longitude,
                    action: actions.navigateByLatAndLon,
                    travelMode: 'driving',
                  }} // specific settings for maps
                  chooseApp={this.props.Settings.navigationApp}
                />

                {this.props.data.ArrivalTime ? (
                  <View
                    style={{
                      borderLeftWidth: 2,
                      borderLeftColor: 'black',
                      paddingLeft: '8%',
                    }}
                  >
                    <Text style={[styles.title, styles.font]}>
                      {'Arrive time:'}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 'bold',
                      }}
                    >
                      {this.props.data.ArrivalTime.slice(11, 16)}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={{
                    borderLeftWidth: 2,
                    borderLeftColor: 'black',
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`tel:${this.props.data.CustomerPhone}`)
                  }}
                >
                  <Text style={[styles.title, styles.font]}>
                    {this.props.data.CustomerName}
                  </Text>

                  <FontAwesomeIcon icon={faPhone} size={30} />
                </TouchableOpacity>
                <View
                  style={{
                    borderLeftWidth: 2,
                    borderLeftColor: 'black',
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    this.markStopAsDone(
                      this.props.data.StopID,
                      this.props.routeView
                    )
                  }}
                >
                  <FontAwesomeIcon
                    icon={
                      !this.props.data.IsDone ? faCheckCircle : faTimesCircle
                    }
                    size={30}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    borderLeftWidth: 2,
                    borderLeftColor: 'black',
                  }}
                />
                <TouchableOpacity onPress={this.showDialog}>
                  <FontAwesomeIcon
                    color={this.props.data.Constraints ? 'red' : 'black'}
                    icon={faClock}
                    size={30}
                  />
                </TouchableOpacity>
              </View>
            )}
            <Divider></Divider>
          </View>
        ) : (
          <View>
            <TouchableOpacity
              ref={this.accordion}
              style={!this.props.data.IsDone ? styles.row : styles.rowDone}
              onPress={() => {
                this.props.saveStopIdToView(this.props.data)
                this.closeAllStops()
              }}
            >
              <FontAwesomeIcon icon={faFlag} size={15} />
              <Text style={[styles.title, styles.font]}>
                {this.props.data.Destination + '.'}
              </Text>

              <Icon
                name={
                  this.state.expanded
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={30}
                color="#000000"
              />
            </TouchableOpacity>
            {this.state.expanded && (
              <View style={styles.child}>
                <NavigationApps
                  iconSize={40}
                  row
                  waze={{
                    lat: this.props.data.DestinationLatitude,
                    lon: this.props.data.DestinationLongitude,
                    action: actions.navigateByLatAndLon,
                  }} // specific settings for waze
                  googleMaps={{
                    lat: this.props.data.DestinationLatitude,
                    lon: this.props.data.DestinationLongitude,
                    action: actions.navigateByLatAndLon,
                    travelMode: 'driving',
                  }} // specific settings for google maps
                  maps={{
                    lat: this.props.data.DestinationLatitude,
                    lon: this.props.data.DestinationLongitude,
                    action: actions.navigateByLatAndLon,
                    travelMode: 'driving',
                  }} // specific settings for maps
                  chooseApp={this.props.Settings.navigationApp}
                />

                {this.props.data.FinishTime ? (
                  <View
                    style={{
                      borderLeftWidth: 2,
                      borderLeftColor: 'black',
                      paddingLeft: '9%',
                    }}
                  >
                    <Text style={styles.time}>
                      {' '}
                      {'Arrive time: ' +
                        this.props.data.FinishTime.slice(11, 16)}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        )}
      </View>
    )
  }

  toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear)
    this.setState({ expanded: !this.state.expanded })
  }
}

const mapStateToProps = (state) => {
  return {
    Settings: state.Settings,
    routeView: state.RouteView,
    routesData: state.RoutesData,
    routeToView: state.RouteView,
    FieldsRef: state.FieldsRef,
  }
}

const mapDispatchToProps = () => {
  return {
    saveStopIdToView,
    markStopAsDone,
    addConstraints,
    deleteStop,
    setRefToField,
    addStopToRoute,
  }
}

export default connect(mapStateToProps, mapDispatchToProps())(StopsView)

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 25,
    width: width,

    paddingRight: 18,

    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  rowDone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 25,
    paddingRight: 18,
    width: width,
    alignItems: 'center',
    backgroundColor: 'rgba(92, 184, 92, 0.5)',
  },
  parentHr: {
    height: 52,
    width: width,
  },
  child: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,

    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  childDone: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'rgba(92, 184, 92, 0.5)',
  },
  icon: {
    flexDirection: 'row',
    padding: 16,
  },
  time: {
    color: '#000000',
    fontWeight: 'bold',
  },
})
