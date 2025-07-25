import { commonStyles } from "@/styles/commonStyles"
import { locationStyles } from "@/styles/locationStyles"
import { uiStyles } from "@/styles/uiStyles"
import { Ionicons } from "@expo/vector-icons"
import React, { FC } from "react"
import { Image, TouchableOpacity, View } from "react-native"
import CustomText from "../shared/CustomText"

const LocationItem: FC<{
  item: any
  onPress: () => void
}> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={[commonStyles.flexRowBetween, locationStyles.container]}
    >
      <View style={commonStyles?.flexRow}>
        <Image
          source={require("@/assets/icons/map_pin.png")}
          style={uiStyles.mapPinIcon}
        />

        <View>
          <CustomText fontFamily="Medium" numberOfLines={1} fontSize={12}>
            {item?.title}
          </CustomText>

          <CustomText
            fontFamily="Medium"
            numberOfLines={1}
            style={{ opacity: 0.7, margin: 2 }}
            fontSize={10}
          >
            {item?.description}
          </CustomText>
        </View>
      </View>

      <Ionicons name="heart-outline" size={20} color="#ccc" />
    </TouchableOpacity>
  )
}

export default LocationItem
