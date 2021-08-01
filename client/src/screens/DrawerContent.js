import React from 'react'
import { View, StyleSheet, Button } from 'react-native'
import { useState, useEffect, useCallback, useContext } from 'react'
import {
  useTheme,
  Avatar,
  Title,
  Caption,
  Paragraph,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
} from 'react-native-paper'
import { createRoute } from '../actions/index'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { useSelector, useDispatch } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Url from '../components/Url'
import * as DocumentPicker from 'expo-document-picker'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export function DrawerContent(props) {
  const dispatch = useDispatch()
  const refFields = useSelector((state) => state.FieldsRef)
  const routeData = useSelector((state) => state.RoutesData)
  const [userEmail, setUserEmail] = useState({ value: '' })

  const getData = async () => {
    try {
      let email = await AsyncStorage.getItem('UserEmail')
      setUserEmail({ value: email })
    } catch (e) {
      console.log(e)
    }
  }

  const pickFile = useCallback(async () => {
    props.navigation.closeDrawer()
    const res = await DocumentPicker.getDocumentAsync({})

    const userId = await AsyncStorage.getItem('UserId')
    if (res.type === 'success') {
      refFields['Dashboard'].setState({ loading: true })
      refFields['loadingCsv'].play()
      let { name, size, uri } = res
      let nameParts = name.split('.')
      let fileType = nameParts[nameParts.length - 1]
      var fileToUpload = {
        name: name,
        size: size,
        uri: uri,
        type: 'application/' + fileType,
      }

      const data = new FormData()
      data.append('upload', fileToUpload)
      data.append('userId', userId)

      fetch(Url + '/api/upload', {
        method: 'post',
        body: data,
      })
        .then((res) => res.json())
        .then((response) => {
          if (response !== {}) {
            try {
              dispatch(createRoute(response.Id, response))
              refFields['loadingCsv'].reset()
              refFields['Dashboard'].setState({ loading: false })
            } catch (e) {
              // saving error
            }
          } else console.log('File type must be xlsx')
        })
    }
  })

  getData()
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View style={styles.row}>
              <View style={styles.section}>
                <Paragraph style={[styles.paragraph, styles.caption]}>
                  {'Hello, ' + userEmail.value}
                </Paragraph>
                <Paragraph style={[styles.paragraph, styles.caption]}>
                  <Caption>
                    {routeData
                      ? 'You have ' + Object.keys(routeData).length + ' Routes'
                      : ''}
                  </Caption>
                </Paragraph>
              </View>
            </View>
          </View>
          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Dashboard"
              onPress={() => {
                props.navigation.navigate('Dashboard')
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="map-marker-outline" color={color} size={size} />
              )}
              label="Add Route"
              onPress={() => {
                props.navigation.navigate('AddRoute')
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="settings-outline" color={color} size={size} />
              )}
              label="Settings"
              onPress={() => {
                props.navigation.navigate('Settings')
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="settings-outline" color={color} size={size} />
              )}
              label="Upload Route from file"
              onPress={pickFile}
            />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
})
