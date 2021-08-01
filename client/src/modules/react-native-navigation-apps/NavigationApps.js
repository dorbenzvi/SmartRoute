import React, { Component } from 'react'
import {
  TouchableOpacity,
  Linking,
  Platform,
  Image,
  View,
  Modal,
  Text,
  StyleSheet,
  ViewPropTypes,
} from 'react-native'
import PropTypes from 'prop-types'
import ActionSheet from 'react-native-actionsheet'
import {
  actions,
  googleMapsTravelModes,
  mapsTravelModes,
} from './NavigationAppsTools'
import wazeIcon from './assets/wazeIcon.png'
import googleMapsIcon from './assets/googleMapsIcon.png'
import mapsIcon from './assets/mapsIcon.png'

const waze = {
  title: 'waze',
  icon: wazeIcon,
  address: '',
  action: actions.navigateByLatAndLon,
  lat: '',
  lon: '',
  travelModes: {},
}
const googleMaps = {
  title: 'google maps',
  icon: googleMapsIcon,
  address: '',
  lat: '',
  lon: '',
  travelMode: googleMapsTravelModes.driving,
  action: actions.navigateByAddress,
}
const maps = {
  title: 'maps',
  icon: mapsIcon,
  address: '',
  lat: '',
  lon: '',
  travelMode: mapsTravelModes.driving,
  action: actions.navigateByAddress,
}

class NavigationApps extends Component {
  constructor(props) {
    super(props)
    this.state = {
      navApps: {
        waze: {
          ...Platform.select({
            ios: {
              storeUri: 'itms-apps://itunes.apple.com/us/app/id323229106?mt=8',
              appDeepLinkUri: 'waze://',
              appDeepLinkUriToUse: 'waze://?',
            },
            android: {
              appDeepLinkUri: 'waze://',
              appDeepLinkUriToUse: 'waze://?',
              storeUri: 'market://details?id=com.waze',
            },
          }),
          ...waze,
          ...props.waze,
          navigateByAddress: ({ addressToNavigate }) =>
            encodeURI(
              this.state.navApps.waze.appDeepLinkUriToUse +
                `q=${addressToNavigate}&navigate=yes`
            ),

          navigateByLatAndLon: ({ lat, lon }) =>
            encodeURI(
              this.state.navApps.waze.appDeepLinkUriToUse +
                `ll=${lat},${lon}&navigate=yes`
            ),
          searchLocationByLatAndLon: ({ lat, lon }) =>
            encodeURI(
              this.state.navApps.waze.appDeepLinkUriToUse + `ll=${lat},${lon}`
            ),
        },
        googleMaps: {
          ...Platform.select({
            ios: {
              appDeepLinkUri: 'comgooglemaps://',
              appDeepLinkUriToUse: 'comgooglemaps://?',
              storeUri: 'itms-apps://itunes.apple.com/us/app/id585027354?mt=8',
              navigateByAddress: ({ addressToNavigate, travelMode }) =>
                this.state.navApps.googleMaps.appDeepLinkUriToUse +
                `daddr=${addressToNavigate}&directionsmode=${travelMode}`,
              navigateByLatAndLon: ({
                addressToNavigate,
                travelMode,
                lat,
                lon,
              }) =>
                encodeURI(
                  this.state.navApps.googleMaps.appDeepLinkUriToUse +
                    `q=${addressToNavigate}&center=${lat},${lon}`
                ),
              searchLocationByLatAndLon: ({ lat, lon }) =>
                encodeURI(
                  this.state.navApps.googleMaps.appDeepLinkUriToUse +
                    `search/?api=1&query=${lat},${lon}`
                ),
            },
            android: {
              appDeepLinkUri: 'https://www.google.com/maps/',
              appDeepLinkUriToUse: 'https://www.google.com/maps/',
              storeUri: 'market://details?id=com.google.android.apps.maps',
              navigateByAddress: ({ address, travelMode }) =>
                this.state.navApps.googleMaps.appDeepLinkUriToUse +
                `dir/?api=1&destination=${address}&travelmode=${travelMode}`,
              navigateByLatAndLon: ({ address, travelMode, lat, lon }) =>
                encodeURI(
                  this.state.navApps.googleMaps.appDeepLinkUriToUse +
                    `search/?api=1&query=${lat},${lon}`
                ),
              searchLocationByLatAndLon: ({ lat, lon }) =>
                encodeURI(
                  this.state.navApps.googleMaps.appDeepLinkUriToUse +
                    `search/?api=1&query=${lat},${lon}`
                ),
            },
          }),
          ...googleMaps,
          ...props.googleMaps,
        },
        ...Platform.select({
          ios: {
            maps: {
              ...maps,
              ...props.maps,
              appDeepLinkUri: 'maps://app',
              appDeepLinkUriToUse: 'maps://app?',
              navigateByAddress: ({ addressToNavigate, travelMode }) =>
                encodeURI(
                  this.state.navApps.maps.appDeepLinkUriToUse +
                    `daddr=${addressToNavigate}&dirflg=${travelMode}`
                ),
              navigateByLatAndLon: ({
                addressToNavigate,
                travelMode,
                lat,
                lon,
              }) =>
                encodeURI(
                  this.state.navApps.maps.appDeepLinkUriToUse +
                    `daddr=${addressToNavigate}&dirflg=${travelMode}&ll=${lat},${lon}`
                ),
              searchLocationByLatAndLon: ({ lat, lon }) =>
                encodeURI(
                  this.state.navApps.maps.appDeepLinkUriToUse +
                    `ll=${lat},${lon}`
                ),
            },
          },
        }),
      },
      modalVisible: false,
    }
    this.actionSheetRef = null
  }

  handleNavApp = async (navApp) => {
    const { address } = this.props
    const { navApps } = this.state
    const navAppItem = navApps[navApp]
    const { storeUri, appDeepLinkUri } = navApp

    const addressToNavigate = navAppItem.address ? navAppItem.address : address

    const lat = navAppItem.lat ? navAppItem.lat : ''
    const lon = navAppItem.lon ? navAppItem.lon : ''
    const travelMode = navAppItem.travelMode ? navAppItem.travelMode : ''
    const navAppUri = navAppItem[navAppItem.action]({
      addressToNavigate,
      lat,
      lon,
      travelMode,
    })

    try {
      const supported = await Linking.canOpenURL(navAppItem.appDeepLinkUri)
      if (!supported) {
        return await Linking.openURL(storeUri)
      } else {
        return await Linking.openURL(navAppUri)
      }
    } catch (e) {
      alert(e)
    }
  }

  renderNavigationApps = () => {
    const { iconSize } = this.props
    const { navApps } = this.state
    return Object.keys(navApps).map((navApp, key) => {
      const navAppItem = navApps[navApp]

      if (navApp == this.props.chooseApp)
        return (
          <TouchableOpacity onPress={() => this.handleNavApp(navApp)} key={key}>
            <Image
              style={{ width: iconSize, height: iconSize }}
              source={navAppItem.icon}
            />
          </TouchableOpacity>
        )
    })
  }

  renderNavigationAppsAsModal = () => {
    const setModalVisible = (visible) => {
      this.setState({ modalVisible: visible })
    }
    const renderModalBtnOpen = () => {
      const {
        modalBtnOpenStyle,
        modalBtnOpenTitle,
        modalBtnOpenTextStyle,
        disable,
      } = this.props

      return (
        <TouchableOpacity
          style={modalBtnOpenStyle}
          onPress={() => (disable ? null : setModalVisible(true))}
        >
          <Text style={modalBtnOpenTextStyle}>{modalBtnOpenTitle}</Text>
        </TouchableOpacity>
      )
    }
    const renderModalBtnClose = () => {
      const {
        modalBtnCloseStyle,
        modalBtnCloseTitle,
        modalBtnCloseTextStyle,
      } = this.props

      return (
        <TouchableOpacity
          style={modalBtnCloseStyle}
          onPress={() => {
            setModalVisible(false)
          }}
        >
          <Text style={modalBtnCloseTextStyle}>{modalBtnCloseTitle}</Text>
        </TouchableOpacity>
      )
    }

    const {
      modalProps,
      modalContainerStyle,
      modalCloseBtnContainerStyle,
    } = this.props
    const { modalVisible } = this.state
    return (
      <React.Fragment>
        {renderModalBtnOpen()}
        <Modal {...modalProps} visible={modalVisible}>
          <View style={styles.modalStyle}>
            <View style={modalContainerStyle}>
              {this.renderNavigationAppsView()}
              <View style={modalCloseBtnContainerStyle}>
                {renderModalBtnClose()}
              </View>
            </View>
          </View>
        </Modal>
      </React.Fragment>
    )
  }

  renderNavigationAppsAsActionSheet = () => {
    const renderActionSheetOpenBtn = () => {
      const {
        actionSheetBtnOpenStyle,
        actionSheetBtnOpenTitle,
        actionSheetBtnOpenTextStyle,
        disable,
      } = this.props
      return (
        <TouchableOpacity
          style={actionSheetBtnOpenStyle}
          onPress={() => (disable ? null : this.actionSheetRef.show())}
        >
          <Text style={actionSheetBtnOpenTextStyle}>
            {actionSheetBtnOpenTitle}
          </Text>
        </TouchableOpacity>
      )
    }
    const actionSheetOptions = () => {
      const { actionSheetBtnCloseTitle } = this.props
      const { navApps } = this.state
      const actionSheetArray = Object.keys(navApps).map((navApp, key) => {
        const navAppItem = navApps[navApp]
        return navAppItem.title
      })
      actionSheetArray.push(actionSheetBtnCloseTitle)
      return actionSheetArray
    }
    const { actionSheetTitle } = this.props

    return (
      <React.Fragment>
        {renderActionSheetOpenBtn()}
        <ActionSheet
          ref={(ref) => (this.actionSheetRef = ref)}
          title={actionSheetTitle}
          options={actionSheetOptions()}
          cancelButtonIndex={actionSheetOptions().length - 1}
          destructiveButtonIndex={actionSheetOptions().length - 1}
          onPress={async (index) => {
            if (index !== actionSheetOptions().length - 1) {
              await this.handleNavApp(actionSheetOptions()[index])
            }
          }}
        />
      </React.Fragment>
    )
  }

  renderNavigationAppsView = () => {
    const { row, viewContainerStyle } = this.props
    return (
      <View
        style={[{ flexDirection: row ? 'row' : 'column' }, viewContainerStyle]}
      >
        {this.renderNavigationApps()}
      </View>
    )
  }

  renderMainView = () => {
    const { viewMode } = this.props
    switch (viewMode) {
      case 'view':
        return this.renderNavigationAppsView()
      case 'modal':
        return this.renderNavigationAppsAsModal()
      case 'sheet':
        return this.renderNavigationAppsAsActionSheet()
      default:
        return this.renderNavigationAppsView()
    }
  }

  render() {
    return this.renderMainView()
  }
}

const styles = StyleSheet.create({
  modalStyle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

NavigationApps.defaultProps = {
  iconSize: 100,
  viewMode: 'view',
  row: false,
  viewContainerStyle: {},
  modalProps: {},
  modalContainerStyle: {},
  modalBtnOpenTitle: 'open modal',
  modalBtnCloseTitle: 'close modal',
  modalBtnCloseContainerStyle: {},
  modalBtnCloseStyle: {},
  modalBtnCloseTextStyle: {},
  modalBtnOpenTextStyle: {},
  modalBtnOpenStyle: {},
  actionSheetBtnOpenTitle: 'open action sheet',
  actionSheetBtnCloseTitle: 'close action sheet',
  actionSheetTitle: 'choose navigation app',
  actionSheetBtnOpenStyle: {},
  actionSheetBtnOpenTextStyle: {},
  address: '',
  disable: false,
}
NavigationApps.propTypes = {
  disable: PropTypes.bool,
  iconSize: PropTypes.number,
  viewMode: PropTypes.oneOf(['view', 'modal', 'sheet']),
  row: PropTypes.bool,
  address: PropTypes.string,
  containerStyle: ViewPropTypes.style,
  modalBtnOpenTitle: PropTypes.string,
  modalBtnCloseTitle: PropTypes.string,
  modalBtnCloseContainerStyle: ViewPropTypes.style,
  modalBtnCloseStyle: ViewPropTypes.style,
  modalBtnCloseTextStyle: Text.propTypes.style,
  modalBtnOpenTextStyle: Text.propTypes.style,
  modalBtnOpenStyle: ViewPropTypes.style,
  modalProps: PropTypes.object,
  modalContainerStyle: PropTypes.object,
  actionSheetBtnOpenTitle: PropTypes.string,
  actionSheetBtnCloseTitle: PropTypes.string,
  actionSheetTitle: PropTypes.string,
  actionSheetBtnOpenStyle: ViewPropTypes.style,
  actionSheetBtnOpenTextStyle: Text.propTypes.style,
  waze: PropTypes.object,
  googleMaps: PropTypes.object,
  maps: PropTypes.object,
}

export { NavigationApps }
