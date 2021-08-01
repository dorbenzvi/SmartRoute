import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  Dimensions,
  Platform,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHome, faFlag, faClock } from '@fortawesome/free-solid-svg-icons'
import Icon from 'react-native-vector-icons/FontAwesome'
import { connect } from 'react-redux'
import {
  saveRouteIdToView,
  saveAllRoutes,
  getAllRoutes,
  deleteRoute,
} from '../../actions/index'
import moment from 'moment'
import RemoveIcon from '../../components/RemoveIcon'
import EditIcon from '../../components/EditIcon'

let screenWidth = Dimensions.get('window').width
let screenHeight = Dimensions.get('window').height
import Url from '../../components/Url'
import { CollectionsOutlined } from '@material-ui/icons'

class CardThree extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <View
        style={{
          backgroundColor: this.props.background
            ? this.props.background
            : '#fff',
          margin: scale(5),
          alignSelf: 'center',
          borderRadius: 12,
          elevation: 3,
          flexDirection: 'column',
          width: screenWidth - scale(20),
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 7,
          shadowOffset: {
            height: 6,
            width: 0,
          },
          height: 200,
        }}
      >
        <View
          style={{
            height: verticalScale(75),
            marginRight: scale(20),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
            }}
          >
            <View
              style={{
                backgroundColor: 'transparent',
                flex: 1,
                borderBottomLeftRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={this.props.image}
                style={{
                  width: scale(this.props.width || 40),
                  height: scale(this.props.height || 40),
                }}
                borderRadius={1}
              />
            </View>

            <View
              style={{
                backgroundColor: 'transparent',
                flex: 3,
                justifyContent: 'center',
                marginLeft: 3,
              }}
            >
              <Text
                style={{
                  color: this.props.background ? '#fff' : '#535bfe',
                  fontSize: scale(13),
                  margin: 3,
                }}
              >
                {this.props.routeName}
              </Text>

              <Text
                style={{ color: '#adb3bf', fontSize: scale(11), margin: 3 }}
              >
                {this.props.km.toFixed(1) +
                  ' Km ' +
                  this.props.stops +
                  ' Stops'}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                borderBottomRightRadius: 12,
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Delete Route',
                    'Are you sure?',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: 'OK',
                        onPress: () => {
                          fetch(Url + '/api/route/' + this.props.id, {
                            method: 'DELETE',
                          })
                            .then(() => {
                              if (this.props.id == this.props.routeToView) {
                                this.props.saveRouteIdToView(null)
                              }
                              this.props.deleteRoute(this.props.id)
                            })
                            .catch((err) => {
                              console.error(err)
                            })
                        },
                      },
                    ],
                    { cancelable: false }
                  )
                }}
              >
                <RemoveIcon />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.props.saveRouteIdToView(this.props.id)
                  console.log(
                    'here--------',
                    this.props.routesData[this.props.id]
                  )
                  if (this.props.FieldsRef['EditRoute'])
                    this.props.FieldsRef['EditRoute'].setState({
                      name: this.props.routesData[this.props.id]['RouteName'],
                      fromAddress: this.props.routesData[this.props.id][
                        'Origin'
                      ],
                      toAddress: this.props.routesData[this.props.id][
                        'Destination'
                      ],
                      selectedDate: moment().format('DD/MM/YYYY hh:mm'),
                      fromLat: this.props.routesData[this.props.id][
                        'OriginLatitude'
                      ],
                      fromLon: this.props.routesData[this.props.id][
                        'OriginLongitude'
                      ],
                      toLat: this.props.routesData[this.props.id][
                        'DestinationLatitude'
                      ],
                      toLon: this.props.routesData[this.props.id][
                        'DestinationLongitude'
                      ],
                    })

                  this.props.navigation.navigate('EditRoute', {
                    fromAddress: this.props.routesData[this.props.id]['Origin'],
                    toAddress: this.props.routesData[this.props.id][
                      'Destination'
                    ],
                    name: this.props.routesData[this.props.id]['RouteName'],
                    fromLat: this.props.routesData[this.props.id][
                      'OriginLatitude'
                    ],
                    fromLon: this.props.routesData[this.props.id][
                      'OriginLongitude'
                    ],
                    toLat: this.props.routesData[this.props.id][
                      'DestinationLatitude'
                    ],
                    toLon: this.props.routesData[this.props.id][
                      'DestinationLongitude'
                    ],
                  })
                }}
              >
                <EditIcon />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-around',
            flex: 1,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              marginLeft: scale(15),
            }}
          >
            <FontAwesomeIcon icon={faHome} size={24} />
            <Text> {this.props.origin}</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              marginLeft: scale(15),
            }}
          >
            <FontAwesomeIcon icon={faFlag} size={24} />
            <Text style={{ marginLeft: scale(5) }}>
              {this.props.destination}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              marginLeft: scale(15),
            }}
          >
            <FontAwesomeIcon icon={faClock} size={24} />
            <Text style={{ marginLeft: scale(5) }}>{this.props.date}</Text>
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    routesData: state.RoutesData,
    userData: state.UserData,
    FieldsRef: state.FieldsRef,
    routeToView: state.RouteView,
  }
}

const mapDispatchToProps = () => {
  return {
    saveRouteIdToView,
    saveAllRoutes,
    getAllRoutes,
    deleteRoute,
  }
}

export default connect(mapStateToProps, mapDispatchToProps())(CardThree)
