import { useUserStore } from "@/store/userStore"
import { mapStyles } from "@/styles/mapStyles"
import { modalStyles } from "@/styles/modalStyles"
import { customMapStyle, indiaIntialRegion } from "@/utils/CustomMap"
import {
  getLatLong,
  getPlacesSuggestions,
  reverseGeocode,
} from "@/utils/mapUtils"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from "expo-location"
import React, { FC, memo, useEffect, useRef, useState } from "react"
import {
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import MapView, { Region } from "react-native-maps"
import { RFValue } from "react-native-responsive-fontsize"
import LocationItem from "./LocationItem"

interface MapPickerModalProps {
  title: string
  visible: boolean
  selectedLocation: {
    latitude: number
    longitude: number
    address: string
  }
  onSelectLocation: (location: any) => void
}

const MapPickerModal: FC<MapPickerModalProps> = ({
  title,
  visible,
  onClose,
  selectedLocation,
  onSelectLocation,
}) => {
  // search engine implemented

  const mapRef = useRef<MapView>(null)
  const [text, setText] = useState("")
  const { location } = useUserStore()
  const { address, setAddress } = useState("")
  const { region, setRegion } = useState<Region | null>(null)
  const { locations, setLocations } = useState([])
  const textInputRef = useRef<TextInput>(null)

  const fetchLocation = async (query: string) => {
    if (query?.length > 4) {
      const data = await getPlacesSuggestions(query)
      setLocations(data)
    } else {
      setLocations([])
    }
  }
  // finished

  // automatic map fit
  useEffect(() => {
    if (selectedLocation?.latitude) {
      setAddress(selectedLocation?.address)
      setRegion({
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      })

      mapRef?.current?.fitToCoordinates(
        [
          {
            longitude: selectedLocation?.longitude,
            latitude: selectedLocation?.latitude,
          },
        ],
        {
          edgePadding: {
            top: 50,
            left: 50,
            bottom: 50,
            right: 50,
          },

          animated: true,
        }
      )
    }
  }, [selectedLocation, mapRef])

  const addLocation = async (place_id: string) => {
    const data = await getLatLong(place_id)
    if (data) {
      setRegion({
        latitude: data.latitude,
        longitude: data.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      })
      setAddress(data.address)
    }
    textInputRef?.current?.blur()
    setText("")
  }

  const renderLocations = ({ item }: any) => {
    return (
      <LocationItem item={item} onPress={() => addLocation(item?.place_id)} />
    )
  }

  const handleRegionChangeComplete = async (newRegion: Region) => {
    try {
      const address = await reverseGeocode(
        newRegion?.longitude,
        newRegion?.latitude
      )

      setRegion(newRegion)
      setAddress(address)
    } catch (error) {
      console.log(error)
    }
  }

  //this buttom go to current location....
  const handleGpsButtomPress = async () => {
    try {
      // * as Location -> expo-location
      const location = await Location.getCurrentPositionAsync({})
      const { longitude, latitude } = location.coords

      mapRef?.current?.fitToCoordinates(
        [
          {
            longitude,
            latitude,
          },
        ],
        {
          edgePadding: {
            top: 50,
            left: 50,
            bottom: 50,
            right: 50,
          },
          animated: true,
        }
      )
      const address = await reverseGeocode(latitude, longitude)
      setAddress(address)
      setRegion({
        longitude: address?.longitude,
        latitude: address?.latitude,
        longitudeDelta: 0.5,
        latitudeDelta: 0.5,
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles?.modalContainer}>
        <Text style={modalStyles?.centerText}> Select {title}</Text>

        <TouchableOpacity onPress={onClose}>
          <Text style={modalStyles?.cancelButton}> Cancel </Text>
        </TouchableOpacity>

        <View>
          <Ionicons name="search-outline" size={RFValue(16)} color="#777" />

          <TextInput
            ref={textInputRef}
            style={modalStyles?.input}
            placeholder="Search address"
            placeholderTextColor="#aaa"
            value={text}
            onChangeText={(e) => {
              setText(e)
              fetchLocation(e)
            }}
          />
        </View>

        {text !== "" ? (
          <FlatList
            ListHeaderComponent={
              <View>
                {text.length > 4 ? null : (
                  <Text style={{ marginHorizontal: 16 }}>
                    Enter a least 4 characters to search
                  </Text>
                )}
              </View>
            }
            data={locations}
            renderItem={renderLocations}
            keyExtractor={(item: any) => {
              item?.place_id
            }}
            initialNumToRender={5}
            windowSize={5}
          />
        ) : (
          //full map view
          <>
            <View>
              <MapView
                ref={mapRef}
                maxZoomLevel={16}
                minZoomLevel={12}
                pitchEnabled={false}
                onRegionChangeComplete={handleRegionChangeComplete}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude:
                    region?.latitude ??
                    location?.latitude ??
                    indiaIntialRegion?.latitude,

                  longitude:
                    region?.longitude ??
                    location?.longitude ??
                    indiaIntialRegion?.longitude,

                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                }}
                provider="google"
                showsMyLocationButton={false}
                showsCompass={false}
                showsIndoors={false}
                showsIndoorLevelPicker={false}
                showsTraffic={false}
                showsScale={false}
                showsBuildings={false}
                showsPointsOfInterest={false}
                customMapStyle={customMapStyle}
                showsUserLocation={true}
              />
            </View>

            {/* marker pin center */}
            <View>
              <Image
                source={
                  title === "drop"
                    ? require("@/assets/icons/drop_marker.png")
                    : require("@/assets/icons/marker.png")
                }
                style={mapStyles.marker}
              />
            </View>

            <TouchableOpacity>
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={RFValue(16)}
                color="#3C75BE"
              />
            </TouchableOpacity>

            <View style={modalStyles?.footerContainer}>
              <Text style={modalStyles.addressText} numberOfLines={2}>
                {address === "" ? "Getting address ..." : address}
              </Text>

              <View style={modalStyles.buttonContainer}>
                <TouchableOpacity
                  style={modalStyles.button}
                  onPress={() => {
                    onSelectLocation({
                      type: title,
                      longitude: region?.longitude,
                      latitude: region?.latitude,
                      address: address,
                    })
                    onClose()
                  }}
                >
                  <Text style={modalStyles.buttonText}>Set Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  )
}

export default memo(MapPickerModal)
