const settingsReducer = (
  state = { navigationApp: 'waze', timeAtStop: '5' },
  action
) => {
  switch (action.type) {
    case 'Waze':
      newstate = state
      newstate.navigationApp = 'waze'
      return newstate

    case 'Google Maps':
      newstate = state
      newstate.navigationApp = 'googleMaps'
      return newstate

    case 'Apple Maps':
      newstate = state
      newstate.navigationApp = 'maps'
      return newstate
    case 'TIME_AT_STOP':
      newstate = state
      newstate.timeAtStop = action.payload
      return newstate
    default:
      return state
  }
}

export default settingsReducer
