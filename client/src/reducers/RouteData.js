import moment from 'moment'

const routesDataReducer = (state = null, action) => {
  switch (action.type) {
    case 'SET_ROUTES':
      return action.payload
    case 'GET_ROUTE_BY_ID':
      return state.filter((x) => x == action.payload)
    case 'GET_ALL_ROUTES':
      return state
    case 'CREATE_ROUTE':
      return { ...state, [action.routeIndex]: action.payload }
    case 'ADD_STOP_TO_ROUTE':
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.routeId)
          newState[key].Stops = newState[key].Stops.concat(action.payload)
      }
      return newState
    case 'DONE_STOP_ID':
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.payload.routeId) {
          newState[key].Stops.map((stop) => {
            if (stop.StopID == action.payload.stopId) {
              stop.IsDone = !stop.IsDone
            }
            return stop
          })
        }
      }
      return newState
    case 'ADD_CONSTRAINTS':
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.payload.routeId) {
          newState[key].Stops.map((stop) => {
            if (stop.StopID == action.payload.stopId) {
              stop.Constraints = action.payload.constraints
            }
            return stop
          })
        }
      }
      return newState
    case 'REMOVE_CONSTRAINTS':
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.payload.routeId) {
          newState[key].Stops.map((stop) => {
            if (stop.StopID == action.payload.stopId) {
              stop.Constraints = null
            }
            return stop
          })
        }
      }
      return newState
    case 'DELETE_ROUTE':
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        if (key != action.payload) {
          newState[key] = value
        }
      }

      if (Object.keys(newState).length === 0) {
        return null
      } else {
        return newState
      }
    case 'DELETE_STOP':
      newState = {}

      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.payload.routeId) {
          newState[key].Stops = newState[key].Stops.filter(
            (stop) => stop.StopID != action.payload.stopId
          )
          var temp = []
          for (let index = 1; index < action.payload.stopOrder; index++) {
            let item = newState[key].Stops.find(
              (stop) => stop.StopOrder == index
            )
            temp.push(item)
          }
          for (
            var index = action.payload.stopOrder + 1;
            index <= newState[key].Stops.length + 1;
            index++
          ) {
            let item = newState[key].Stops.find(
              (stop) => stop.StopOrder == index
            )
            item.StopOrder = index - 1
            temp.push(item)
          }
          newState[key].Stops = temp
        }
      }

      return newState
    case 'EDIT_ROUTE':
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.payload.routeId) {
          newState[key] = action.payload.data
        }
      }

      return newState
    case 'ADD_TIME_ROUTE':
      console.log('ADD_TIME_ROUTE')
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.payload.routeId) {
          let total = 0

          let startTime = moment(newState[key].Date).utc().format(
            'DD/MM/YYYY HH:mm:ss'
          )

          action.payload.data['routes'][0]['legs'].forEach((item, index) => {
            let timeAtStop = 0
            var nextStop = newState[key].Stops.find(
              (stop) => stop.StopOrder == index + 1
            )
            if (index != 0) {
              let prevStop = newState[key].Stops.find(
                (stop) => stop.StopOrder == index
              )
              timeAtStop = prevStop.MinutesInStop * 60
              console.log(timeAtStop)
            }

            startTime = moment(startTime, 'DD/MM/YYYY HH:mm:ss')
              .add(item.duration.value + timeAtStop, 'second')
              .format('DD/MM/YYYY HH:mm:ss')

            if (index != newState[key].Stops.length) {
              nextStop['ArrivalTime'] = startTime
            }

            total += item.duration.value + timeAtStop
          })

          newState[key]['FinishTime'] = startTime
          newState[key]['TotalTime'] = total / 60
        }
      }
      console.log(newState)
      return newState
    case 'TSP_ORDER':
      //console.log('state')
      // console.log(action.payload.newOrder)
      //console.log(state)
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.payload.routeId) {
          for (let i = 1; i <= newState[key].Stops.length; i++) {
            newState[key].Stops[action.payload.newOrder[i] - 1].StopOrder = i
          }
          //console.log(newState[key].Stops)
          newState[key].Stops.sort(function (a, b) {
            var keyA = a.StopOrder
            var keyB = b.StopOrder
            // Compare the 2 dates
            if (keyA < keyB) return -1
            if (keyA > keyB) return 1
            return 0
          })
        }
      }
      //console.log('tsp order'  )
      //console.log(newState)
      return newState
    case 'UPDATE_DRAG':
      newState = {}
      for (const [key, value] of Object.entries(state)) {
        newState[key] = value
        if (key == action.payload.routeId) {
          newState[key].Stops = action.payload.newOrder
        }
      }
      return newState
    default:
      return state
  }
}

export default routesDataReducer
