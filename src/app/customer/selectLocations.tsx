import LocationInput from "@/components/customer/LocationInput"
import LocationItem from "@/components/customer/LocationItem"
import MapPickerModal from "@/components/customer/MapPickerModal"
import CustomText from "@/components/shared/CustomText"
import { useUserStore } from "@/store/userStore"
import { commonStyles } from "@/styles/commonStyles"
import { homeStyles } from "@/styles/homeStyles"
import { locationStyles } from "@/styles/locationStyles"
import { uiStyles } from "@/styles/uiStyles"
import { Colors } from "@/utils/Constants"
import { calculateDistance } from "@/utils/mapUtils"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState } from "react"
import {
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
  View,
} from "react-native"

const LocationSelection = () => {
  const { location, setLocation } = useUserStore()

  const { pickup, setPickup } = useState("")
  const { pickupCoords, setPickupCoords } = useState<any>(null)
  const { dropCoords, setDropCoords } = useState<any>(null)
  const { drop, setDrop } = useState("")
  const { locations, setLocations } = useState([])
  const { focusedInput, setFocusedInput } = useState("drop")
  const { modalTitle, setModalTitle } = useState("drop")
  const { isMapModalVisible, setMapModalVisible } = useState(false)

  const fetchLocation = async (query: string) => {
    if (query?.length > 4) {
      const data = await getPlacesSuggestions(query)
      setLocation(data)
    }
  }

  const addLocation = async (id: string) => {
    const data = await getLatLong(id)
    if (data) {
      if (focusedInput === "drop") {
        setDrop(data?.address)
        setDropCoords(data)
      } else {
        setLocation(data)
        setPickupCoords(data)
        setPickup(data?.address)
      }
    }
  }

  const renderLocations = ({ item }: any) => {
    return (
      <LocationItem item={item} onPress={() => addLocation(item?.place_id)} />
    )
  }

  const checkDistance = async () => {
    if (!pickupCoords || !dropCoords) {
      return
    }

    const { latitude: lat1, longitude: lon1 } = pickupCoords
    const { latitude: lat2, longitude: lon2 } = dropCoords

    if (lat1 === lat2 && lon1 === lon2) {
      alert(
        "Pickup and drop locations cannot be same . Please select different locations"
      )
      return
    }

    const distance = calculateDistance(lat1, lat2, lon1, lon2)

    const minDistance = 0.5 //Minimum distance in km (e.g., 500 meters)
    const maxDistance = 50 //Maximum distance in km (e.g., 50 km)

    if (distance < minDistance) {
      alert(
        "The selected locations are to close. Please choose locations that are further apart"
      )
    } else if (distance > maxDistance) {
      alert(
        "The selected locations are to far apart . Please select a closer drop locations"
      )
    } else {
      setLocation([])
      router.navigate({
        pathname: "/customer/ridebooking",
        params: {
          distanceInKm: distance.toFixed(2),
          drop_latitude: dropCoords?.latitude,
          drop_longitude: dropCoords?.longitude,
          drop_address: drop,
        },
      })
      console.log(`Distance is valid : ${distance.toFixed(2)}`)
    }
  }

  useEffect(() => {
    if (dropCoords && pickupCoords) {
      checkDistance()
    } else {
      setLocations([])
      setMapModalVisible(false)
    }
  }, [dropCoords, pickupCoords])

  useEffect(() => {
    if (location) {
      setPickupCoords(location)
      setPickup(location?.address)
    }
  }, [location])

  return (
    <View style={homeStyles.container}>
      <StatusBar style="light" backgroundColor="orange" translucent={false} />
      <SafeAreaView />

      <TouchableOpacity
        style={commonStyles.flexRow}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color={Colors.iosColor} />

        <CustomText
          fontFamily="Regular"
          style={{
            color: Colors.iosColor,
          }}
        >
          Back
        </CustomText>
      </TouchableOpacity>

      <View style={uiStyles.locationInputs}>
        <LocationInput
          placeholder="Search Pickup Location"
          type="pickup"
          value={pickup}
          onChangeText={(text) => {
            setPickup(text)
            fetchLocation(text)
          }}
          onFocus={() => setFocusedInput(pickup)}
        />

        <LocationInput
          placeholder="Search Drop Location"
          type="drop"
          value={drop}
          onChangeText={(text) => {
            setDrop(text)
            fetchLocation(text)
          }}
          onFocus={() => setFocusedInput("drop")}
        />

        <CustomText
          fontFamily="Medium"
          fontSize={10}
          style={uiStyles.suggestionText}
        >
          {focusedInput} suggestions
        </CustomText>
      </View>

      <FlatList
        data={locations}
        renderItem={renderLocations}
        keyExtractor={(item: any) => item?.place_id}
        initialNumToRender={5}
        windowSize={5}
        ListFooterComponent={
          <TouchableOpacity
            style={[commonStyles.flexRow, locationStyles.container]}
            onPress={() => {
              setModalTitle(focusedInput)
              setMapModalVisible(true)
            }}
          >
            <Image
              source={require("@assets/icons/map_pin.png")}
              style={uiStyles.mapPinIcon}
            />

            <CustomText fontFamily="Medium" fontSize={12}>
              Select Your Map
            </CustomText>
          </TouchableOpacity>
        }
      />

      {isMapModalVisible && (
        <MapPickerModal
          selectedLocation={{
            latitude:
              focusedInput === "drop"
                ? dropCoords?.latitude
                : pickupCoords?.latitude,

            longitude:
              focusedInput === "drop"
                ? dropCoords?.longitude
                : pickupCoords?.longitude,
            address: focusedInput === "drop" ? drop : pickup,
          }}
          title={modalTitle}
          visible={isMapModalVisible}
          onClose={() => setMapModalVisible(false)}
          onSelectLocation={(data) => {
            if (data) {
              if (modalTitle === "drop") {
                setDropCoords(data)
                setDrop(drop?.address)
              } else {
                setLocation(data)
                setPickupCoords(data)
                setPickup(data?.address)
              }
            }
          }}
        />
      )}
    </View>
  )
}

export default LocationSelection
