export const appName = (name) => {
  return {
    type: name,
  }
}

export const saveRouteIdToView = (routeId) => {
  return {
    type: 'SAVE_ROUTE_ID_TO_VIEW',
    payload: routeId,
  }
}

export const getRouteIdToView = () => {
  return {
    type: 'GET_ROUTE_ID_TO_VIEW',
  }
}

export const saveAllRoutes = (data) => {
  return {
    type: 'SET_ROUTES',
    payload: data,
  }
}

export const getAllRoutes = (data) => {
  return {
    type: 'GET_ALL_ROUTES',
    payload: data,
  }
}

export const getRouteById = (routeId) => {
  return {
    type: 'GET_ROUTE_BY_ID',
    payload: routeId,
  }
}

export const createRoute = (routeIndex, data) => {
  return {
    type: 'CREATE_ROUTE',
    routeIndex: routeIndex,
    payload: data,
  }
}

export const addStopToRoute = (routeId, stop) => {
  return {
    type: 'ADD_STOP_TO_ROUTE',
    routeId: routeId,
    payload: stop,
  }
}

export const saveUserId = (userId) => {
  return {
    type: 'SAVE_USER_ID',
    payload: userId,
  }
}

export const getUserId = () => {
  return {
    type: 'GET_USER_ID',
  }
}

export const saveStopIdToView = (stopId) => {
  return {
    type: 'SAVE_STOP_ID',
    payload: stopId,
  }
}

export const getStopIdToView = () => {
  return {
    type: 'GET_STOP_ID',
  }
}

export const markStopAsDone = (stopId, routeId) => {
  return {
    type: 'DONE_STOP_ID',
    payload: { stopId, routeId },
  }
}

export const addConstraints = (routeId ,stopId , constraints ) => {
  return {
    type: 'ADD_CONSTRAINTS',
    payload: {routeId ,stopId , constraints},
  }
}

export const deleteConstraints = (routeId ,stopId) => {
  return {
    type: 'REMOVE_CONSTRAINTS',
    payload: {routeId ,stopId},
  }
}

export const deleteRoute = (routeId) => {
  return {
    type: 'DELETE_ROUTE',
    payload: routeId,
  }
}

export const setRefToField = (field, ref) => {
  return {
    type: 'SET',
    payload: { field, ref },
  }
}

export const deleteStop = (stopId, routeId ,stopOrder) => {
  return {
    type: 'DELETE_STOP',
    payload: { stopId, routeId ,stopOrder},
  }
}

export const editRoute = (routeId, data) => {
  return {
    type: 'EDIT_ROUTE',
    payload: { data, routeId },
  }
}

export const addTime = (routeId, data) => {
  return {
    type: 'ADD_TIME_ROUTE',
    payload: { data, routeId },
  } 
}

export const saveDefaultTimeAtStop = (value) => {
  return {
    type: 'TIME_AT_STOP',
    payload: value,
  }
}


export const stopNewOrder = (newOrder, routeId) => {
  return {
    type: 'TSP_ORDER',
    payload: { newOrder, routeId },
  }
}

export const updateDragChange = (newOrder, routeId) => {
  return {
    type: 'UPDATE_DRAG',
    payload: { newOrder, routeId },
  }
}