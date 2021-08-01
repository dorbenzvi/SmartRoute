import {
  SettingsDividerShort,
  SettingsDividerLong,
  SettingsEditText,
  SettingsCategoryHeader,
  SettingsSwitch,
  SettingsPicker,
} from '../modules/react-native-settings-components'
import React from 'react'
import { ScrollView, Button, ImageBackground } from 'react-native'
import { connect } from 'react-redux'
import {
  appName,
  saveRouteIdToView,
  saveAllRoutes,
  saveUserId,
  saveDefaultTimeAtStop,
} from '../actions/index'
import AsyncStorage from '@react-native-async-storage/async-storage'
class Settings extends React.Component {
  constructor() {
    super()
    this.state = {
      username: '',
      defaultTimeAtStop: '',
      NavApp: '',
    }
  }
  componentDidMount() {
    this.setState({
      NavApp: this.props.Settings.navigationApp,
      defaultTimeAtStop: this.props.Settings.timeAtStop,
    })
  }

  //Delete async storage and navigate to StartScreen.js
  logoutButtonPressed = () => {
    this.props.saveAllRoutes(null)

    this.props.saveUserId(null)

    AsyncStorage.clear().then(() => {
      this.props.navigation.popToTop() // go to the top of the stack
      this.props.navigation.goBack(null)
    })
  }

  render() {
    return (
      <ImageBackground
        source={require('../assets/background_dot.png')}
        resizeMode="repeat"
        style={{
          flex: 1,
          marginTop: '10%',
          backgroundColor:
            Platform.OS === 'ios' ? colors.iosSettingsBackground : colors.white,
        }}
      >
        <SettingsCategoryHeader
          title={'My Account'}
          textStyle={Platform.OS === 'android' ? { color: colors.monza } : null}
        />
        <SettingsDividerLong android={false} />

        <SettingsDividerShort />
        <SettingsPicker
          title="Default Navigation App"
          dialogDescription={'Choose default navigation app'}
          options={[
            { label: 'Waze', value: 'Waze' },
            { label: 'Google Maps', value: 'Google Maps' },
            { label: 'Apple Maps', value: 'Apple Maps' },
          ]}
          onValueChange={async (value) => {
            this.props.appName(value)
            try {
              await AsyncStorage.setItem('defaultNavApp', value)

              navigation.navigate('Home')
            } catch (e) {
              // saving error
            }
            this.setState({
              NavApp: value,
            })
          }}
          value={this.state.NavApp}
          styleModalButtonsText={{ color: colors.monza }}
        />
        <SettingsEditText
          title="Default Time at stop"
          dialogDescription={'Enter your username.'}
          valuePlaceholder={this.state.defaultTimeAtStop}
          negativeButtonTitle={'Cancel'}
          positiveButtonTitle={'Save'}
          onValueChange={(value) => {
            this.setState({
              defaultTimeAtStop: value,
            })
            this.props.saveDefaultTimeAtStop(value)
          }}
          value={this.state.defaultTimeAtStop}
        />

        <Button title="Log out" onPress={this.logoutButtonPressed} />
      </ImageBackground>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    Settings: state.Settings,
  }
}

const mapDispatchToProps = () => {
  return {
    appName,
    saveRouteIdToView,
    saveDefaultTimeAtStop,
    saveAllRoutes,
    saveUserId,
  }
}

export default connect(mapStateToProps, mapDispatchToProps())(Settings)

const colors = {
  white: '#f7f7f7',
  monza: '#0275d8',
  switchEnabled: '#5cb85c',
  switchDisabled: '#efeff3',
  blueGem: '#0275d8',
}
