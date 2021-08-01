import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  Dimensions,
  Platform,
  ProgressViewIOS,
  ProgressBarAndroid,
  ImageBackground,
  TouchableOpacity,
  ScrollView
} from "react-native";
import propTypes from "prop-types";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

import Icon from "react-native-vector-icons/FontAwesome";

let screenWidth = Dimensions.get("window").width;
let screenHeight = Dimensions.get("window").height;

import {
  CardEcomOne,
  CardEcomTwo,
  CardEcomThree,
  CardEcomFour
} from "./CardEC";




