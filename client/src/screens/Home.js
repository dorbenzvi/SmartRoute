import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer'
import Route from './Route'
import React from 'react'
import AddRoute from './AddRoute'
import Settings from '../screens/Settings'
import Dashboard from './Dashboard'
import AddStop from './AddStop'
import EditRoute from './EditRoute'
import moment from 'moment'
import { DrawerContent } from './DrawerContent'
import { useSelector, useDispatch } from 'react-redux'
const Drawer = createDrawerNavigator()
const Home = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <DrawerContent {...props}></DrawerContent>}
    >
      <Drawer.Screen
        options={{
          title: 'Dashboard',
        }}
        name="Dashboard"
        component={Dashboard}
        initialParams={{ routeName: 'DashBoard' }}
      />
      <Drawer.Screen
        options={{
          title: 'Settings',
        }}
        name="Settings"
        component={Settings}
      />

      <Drawer.Screen
        options={{
          title: 'AddRoute',
        }}
        name="AddRoute"
        component={AddRoute}
        initialParams={{ routeName: 'AddRoute' }}
      />
      <Drawer.Screen
        options={{
          title: 'Route',
        }}
        name="Route"
        component={Route}
      />
      <Drawer.Screen
        options={{
          title: 'AddStop',
        }}
        name="AddStop"
        component={AddStop}
      />
      <Drawer.Screen
        options={{
          title: 'EditRoute',
        }}
        name="EditRoute"
        component={EditRoute}
      />
    </Drawer.Navigator>
  )
}

export default Home
