import React from 'react'
//import { Provider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { theme } from './src/core/theme'

import StartScreen from './src/screens/StartScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen'
import Home from './src/screens/Home'
import { createStore } from 'redux'
import allReducers from './src/reducers'
import { Provider } from 'react-redux'
import { LogBox } from 'react-native'
LogBox.ignoreLogs(['Warning: ...']) // Ignore log notification by message
LogBox.ignoreAllLogs() //Ignore all log notifications
//Redux

//STORE
const store = createStore(allReducers)
console.log(store.getState())

// END REDUX

const Stack = createStackNavigator()

const App = () => {
  return (
    <Provider store={store} theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="StartScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  )
}

export default App
