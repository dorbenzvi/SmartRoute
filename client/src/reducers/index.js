//STORE
import settingsReducer from './Settings'
import routeViewReducer from './RouteView'
import routesDataReducer from './RouteData'
import stopViewReducer from './StopView'
import userReducer from './User'
import fieldsRefReducer from './Fields'
import { combineReducers } from 'redux'

const allReducers = combineReducers({
  Settings: settingsReducer,
  RouteView: routeViewReducer,
  RoutesData: routesDataReducer,
  UserData: userReducer,
  StopView: stopViewReducer,
  FieldsRef: fieldsRefReducer,
})

export default allReducers
