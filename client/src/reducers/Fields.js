const fieldsRefReducer = (state = {}, action) => {
  switch (action.type) {
    case 'GET':
      return state
    case 'SET':
      newState = state
      newState[action.payload.field] = action.payload.ref

      return newState
    default:
      return state
  }
}

export default fieldsRefReducer
