const stopViewReducer = (state = null, action) => {
  switch (action.type) {
    case 'SAVE_STOP_ID':
      return (state = action.payload)
    case 'GET_STOP_ID':
      return state
    default:
      return state
  }
}

export default stopViewReducer
