import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} from 'react-native'
import { TextInput as Input } from 'react-native-paper'
import config from '../../config'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { theme } from '../core/theme'
import { setRefToField } from '../actions/index'
import { connect } from 'react-redux'

//https://github.com/FaridSafi/react-native-google-places-autocomplete

class EditSearchBar extends React.Component {
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
    // this.props.setRefToField('searchBarState', this.myRef.current)
    this.props.setRefToField(this.props.type, this.myRef.current)
  }

  render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <GooglePlacesAutocomplete
          ref={this.myRef}
          autoFillOnNotFound={true}
          placeholder={this.props.placeholder}
          minLength={5} // minimum length of text to search
          autoFocus={false}
          fetchDetails={true}
          textInputProps={{
            InputComp: Input,

            mode: 'outlined',
            fontSize: 13,
            selectionColor: theme.colors.primary,
            width: '100%',
            underlineColor: 'transparent',
            leftIcon: { type: 'font-awesome', name: 'faHome' },
            errorStyle: { color: 'red' },
          }}
          onChangeText={(text) => {
            this.setState({ address: text })
          }}
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            //console.log(data)

            //Here we detect from where the request came from:
            //1. Add route screen
            //2. Add stop screen

            if (this.props.type === 'EditFrom') {
              this.props.searchEditFrom.setState({
                fromLat: details['geometry']['location']['lat'],
                fromLon: details['geometry']['location']['lng'],
                fromAddress: details['formatted_address'],
              })
              this.ref.setAddressText(details['formatted_address'])
            } else if (this.props.type === 'EditTo') {
              this.props.searchEditTo.setState({
                toLat: details['geometry']['location']['lat'],
                toLon: details['geometry']['location']['lng'],
                toAddress: details['formatted_address'],
              })
            }
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

export default connect(mapStateToProps, mapDispatchToProps())(EditSearchBar)

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
