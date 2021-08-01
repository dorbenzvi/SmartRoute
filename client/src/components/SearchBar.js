import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} from 'react-native'

import config from '../../config'
import { TextInput as Input } from 'react-native-paper'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { theme } from '../core/theme'
import { setRefToField } from '../actions/index'
import { connect } from 'react-redux'

//https://github.com/FaridSafi/react-native-google-places-autocomplete

class SearchBar extends React.Component {
  constructor(props) {
    super(props)
    this.myRef = React.createRef()
  }
  state = {
    address: '',
    data: null,
  }

  _fetchResults = () => {
    let addressArray = []
    fetch(
      'http://dev.virtualearth.net/REST/v1/Autosuggest?query=' +
        this.state.address +
        '&maxResults=5&key=API_KEY_HERE',
      {
        method: 'GET',
        headers: new Headers({
          'Content-type': 'application/json; charset=UTF-8', //very important to add the 'charset=UTF-8'!!!!
        }),
      }
    )
      .then((res) => {
        return res.json()
      })
      .then(
        (result) => {
          addressArray = this._getAddressArray(result)
          this.setState({ data: addressArray })
          //console.log(result['resourceSets'][0]['resources'][0]['value'][0].address.formattedAddress)
        },
        (error) => {
          console.log('err post=', error)
        }
      )
  }

  componentDidMount() {
    this.props.setRefToField(this.props.type, this.myRef.current)
    // console.log(this.props.type + ' ' + this.myRef.current.setAddressText)
  }

  render() {
    return (
      <View>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <GooglePlacesAutocomplete
            ref={this.myRef}
            style={styles.input}
            autoFillOnNotFound={true}
            placeholder={this.props.placeholder}
            minLength={5} // minimum length of text to search
            autoFocus={false}
            fetchDetails={true}
            onChangeText={(text) => {
              this.setState({ address: text })
            }}
            textInputProps={{
              InputComp: Input,

              mode: 'outlined',
              fontSize: 13,
              selectionColor: theme.colors.primary,
              width: '100%',
              underlineColor: 'transparent',
              leftIcon: { type: 'font-awesome', name: 'faHome' },
              errorStyle: { color: 'red' },
              error: this.props.error,
              errorText: this.props.errorText,
            }}
            onPress={(data, details = null) => {
              // 'details' is provided when fetchDetails = true
              //console.log(data)

              //Here we detect from where the request came from:
              //1. Add route screen
              //2. Add stop screen
              let type
              if (this.props.setFromLat) {
                //From add route screen - the origin textinput
                this.props.setFromLat(details['geometry']['location']['lat'])
                this.props.setFromLon(details['geometry']['location']['lng'])
                this.props.setFromAddress({
                  value: details['formatted_address'],
                })
              } else if (this.props.setToLat) {
                //From add route screen - the destination textinput
                this.props.setToLat(details['geometry']['location']['lat'])
                this.props.setToLon(details['geometry']['location']['lng'])
                this.props.setToAddress({ value: details['formatted_address'] })
              } else {
                //From add stop screen
                this.props.setLat(details['geometry']['location']['lat'])
                this.props.setLon(details['geometry']['location']['lng'])
                this.props.setCustomerAddress({
                  value: details['formatted_address'],
                })
              }

              //this.GooglePlacesRef.setAddressText('') - This is how i clear the field
            }}
            getDefaultValue={() => {
              return '' // text input default value
            }}
            query={{
              // available options: https://developers.google.com/places/web-service/autocomplete
              key: config.GOOGLE_API,
              language: 'en', // language of the results
              types: 'address', // default: 'geocode'
              input: this.state.address,
            }}
            styles={{
              description: {
                fontWeight: 'bold',
              },
              predefinedPlacesDescription: {
                color: '#1faadb',
              },
            }}
            currentLocationLabel="Current location"
            nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
            GoogleReverseGeocodingQuery={
              {
                // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
              }
            }
            GooglePlacesSearchQuery={{
              // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
              rankby: 'distance',
              types: 'food',
            }}
            GooglePlacesDetailsQuery={{
              // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
              fields: ['formatted_address', 'geometry'],
            }}
            filterReverseGeocodingByTypes={[
              'country',
              'administrative_area_level_3',
            ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          />
        </View>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          {this.props.errorText ? (
            <Text style={styles.error}>{this.props.errorText}</Text>
          ) : null}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = () => {
  return {
    setRefToField,
  }
}

export default connect(mapStateToProps, mapDispatchToProps())(SearchBar)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  container: {
    width: '100%',
    marginVertical: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  description: {
    fontSize: 13,
    color: theme.colors.secondary,
    paddingTop: 8,
  },
  error: {
    fontSize: 13,
    color: theme.colors.error,
    paddingTop: 8,
  },
})
