import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  StyleSheet,
  View,
  Text,
  Button,
  Dimensions,
  SafeAreaView,
} from 'react-native'
import { updateDragChange, setRefToField } from '../actions/index'
import LottieView from 'lottie-react-native'
import { ScrollView } from 'react-native-gesture-handler'
import StopsView from './StopsView'
import AutoDragSortableView from '../../src/modules/react-native-drag-sort/AutoDragSortableView'
const { width } = Dimensions.get('window')
const parentWidth = width
const childrenWidth = width - 20
const childrenHeight = 56

class RouteView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      size: this.props.data.Stops.length,
      fixedItems: [],
    }
  }
  componentDidMount() {
    this.props.setRefToField('RouteView', this)
  }

  render() {
    return (
      <AutoDragSortableView
        dataSource={this.props.data.Stops}
        parentWidth={parentWidth}
        childrenWidth={childrenWidth}
        marginChildrenBottom={0}
        marginChildrenRight={0}
        marginChildrenLeft={0}
        marginChildrenTop={0}
        childrenHeight={childrenHeight}
        onDataChange={(data) => {
          // update store

          data.forEach((element, index) => {
            element.StopOrder = index + 1
          })
          data.sort(function (a, b) {
            var keyA = a.StopOrder
            var keyB = b.StopOrder
            // Compare the 2 dates
            if (keyA < keyB) return -1
            if (keyA > keyB) return 1
            return 0
          })

          this.props.updateDragChange(data, this.props.routeToView)
        }}
        renderBottomView={
          <StopsView
            edit={this.props.edit}
            data={{
              Destination: this.props.data.Destination,
              DestinationLongitude: this.props.data.DestinationLongitude,
              DestinationLatitude: this.props.data.DestinationLatitude,
              FinishTime: this.props.data.FinishTime,
            }}
            end={true}
          />
        }
        keyExtractor={(item, index) => index}
        renderItem={(item, index) => {
          var temp = this.props.data.Stops.find(
            (item) => item.StopOrder == index + 1
          )
          return (
            <StopsView
              edit={this.props.edit}
              data={temp}
              end={false}
              key={index}
              stopOrder={index + 1}
            />
          )
        }}
      />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    routesData: state.RoutesData,
    routeToView: state.RouteView,
    stopView: state.StopView,
    FieldsRef: state.FieldsRef,
  }
}

const mapDispatchToProps = () => {
  return {
    updateDragChange,
    setRefToField,
  }
}

export default connect(mapStateToProps, mapDispatchToProps())(RouteView)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',

    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
  },
})
