const routeViewReducer = (state = null, action) => {
  switch (action.type) {
    case 'SAVE_ROUTE_ID_TO_VIEW':
      return (state = action.payload)
    case 'GET_ROUTE_ID_TO_VIEW':
      return state
    default:
      return state
  }
}

export default routeViewReducer
