import { logout } from "@/service/authService"
import { useWS } from "@/service/WSProvider"
import { useUserStore } from "@/store/userStore"
import { uiStyles } from "@/styles/uiStyles"
import { Colors } from "@/utils/Constants"
import AntDesign from "@expo/vector-icons/AntDesign"
import { router } from "expo-router"
import React from "react"
import { SafeAreaView, TouchableOpacity, View } from "react-native"
import { RFValue } from "react-native-responsive-fontsize"
import CustomText from "../shared/CustomText"

const LocationBar = () => {
  const { location } = useUserStore()
  const { disconnect } = useWS()

  return (
    <View style={uiStyles.absoluteTop}>
      <SafeAreaView />
      <View style={uiStyles.container}>
        <TouchableOpacity
          style={uiStyles.btn}
          onPress={() => logout(disconnect)}
        >
          <AntDesign name="poweroff" size={RFValue(12)} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={uiStyles.locationBar}
          onPress={() => router.navigate("/customer/selectLocations")}
        >
          <View style={uiStyles.dot} />

          <CustomText numberOfLines={1} style={uiStyles.locationText}>
            {location?.address || "Getting address ..."}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default LocationBar
