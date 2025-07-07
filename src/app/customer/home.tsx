import { homeStyles } from "@/styles/homeStyles"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { View } from "react-native"

const CustomerHome = () => {
  return (
    <View style={homeStyles.container}>
      <StatusBar style="light" backgroundColor="orange" translucent={false} />
    </View>
  )
}

export default CustomerHome
