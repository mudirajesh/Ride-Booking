import CustomText from "@/components/shared/CustomText"
import PhoneInput from "@/components/shared/PhoneInput"
import { useWS } from "@/service/WSProvider"
import { authStyles } from "@/styles/authStyles"
import { commonStyles } from "@/styles/commonStyles"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import React, { useState } from "react"
import {
    Image,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native"

const Auth = () => {
  const { updateAccessToken } = useWS()
  const [phone, setPhone] = useState("")
  return (
    <SafeAreaView style={authStyles.container}>
      <ScrollView contentContainerStyle={authStyles.container}>
        <View style={commonStyles.flexRowBetween}>
          <Image
            source={require("@/assets/images/logo_t.png")}
            style={authStyles.logo}
          />
          <TouchableOpacity style={authStyles.flexRowGap}>
            <MaterialIcons name="help" size={18} color="grey" />
            <CustomText fontFamily="Medium" variant="h7">
              Help
            </CustomText>
          </TouchableOpacity>
        </View>

        <CustomText fontFamily="Medium" variant="h6">
          What's your number?
        </CustomText>

        <CustomText
          variant="h7"
          fontFamily="Regular"
          style={commonStyles.lightText}
        >
          Enter your phone number to proceed
        </CustomText>

        <PhoneInput onChangeText={setPhone} value={phone} />
      </ScrollView>

      <View style={authStyles.footerContainer}>
        <TouchableOpacity style={authStyles.button}>
          <CustomText fontFamily="Medium" variant="h7" style={authStyles.buttonText}>
            Continue
          </CustomText>
        </TouchableOpacity>

        <CustomText variant="h7" fontFamily="Regular" style={commonStyles.lightText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </CustomText>
      </View>
    </SafeAreaView>
  )
}

export default Auth
