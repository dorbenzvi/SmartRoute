const userReducer = (state = null, action) => {
  switch (action.type) {
    case 'SAVE_USER_ID':
      return (state = action.payload)
    case 'GET_USER_ID':
      return state
    default:
      return state
  }
}

export default userReducer
