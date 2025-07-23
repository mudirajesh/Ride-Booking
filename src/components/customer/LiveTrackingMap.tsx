import { mapStyles } from "@/styles/mapStyles"
import { Colors } from "@/utils/Constants"
import { customMapStyle, indiaIntialRegion } from "@/utils/CustomMap"
import { getPoints } from "@/utils/mapUtils"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { FC, memo, useEffect, useRef, useState } from "react"
import { Image, TouchableOpacity, View } from "react-native"
import MapView, { Marker, Polyline } from "react-native-maps"
import MapViewDirections from "react-native-maps-directions" // map pe line dikhne ke liye
import { RFValue } from "react-native-responsive-fontsize"

const apikey = process.env.EXPO_PUBLIC_MAP_API_KEY || ""

const LiveTrackingMap: FC<{
  height: number
  drop: any
  pickup: any
  rider: any
  status: string
}> = ({ height, drop, pickup, rider, status }) => {
  const mapRef = useRef<MapView>(null)
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  const fitToMarkers = async () => {
    if (isUserInteracting) return
    const coordinates = []

    if (pickup?.latiutde && pickup?.longitude && status == "START") {
      coordinates.push({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      })
    }

    if (drop?.longitude && drop?.latitude && status === "ARRIVED") {
      coordinates.push({
        latitude: drop.latitude,
        longitude: drop.longitude,
      })
    }

    if (rider?.longitude && rider?.latitude) {
      coordinates.push({
        longitude: rider.longitude,
        latitude: rider.latitude,
      })
    }

    if (coordinates.length === 0) return

    try {
      mapRef?.current?.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50,
          left: 50,
          bottom: 50,
          right: 50,
        },
        animated: true,
      })
    } catch (error) {
      console.error("Error fitting to markers:", error)
    }
  }

  const calculateInitialRegion = () => {
    if (pickup?.latitude && drop?.latitude) {
      const latitude = (pickup.latitude + drop.latitude) / 2
      const longitude = (pickup.longitude + drop.longitude) / 2

      return {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    }

    return indiaIntialRegion
  }

  useEffect(() => {
    if (pickup?.latitude && drop?.latitude) fitToMarkers()
  }, [drop?.latitude, pickup?.latitude, rider.latitude])

  return (
    <View>
      <MapView
        ref={mapRef}
        followsUserLocation
        style={{ flex: 1 }}
        initialRegion={calculateInitialRegion()}
        provider="google"
        showsMyLocationButton={false}
        showsCompass={false}
        showsIndoors={false}
        customMapStyle={customMapStyle}
        showsUserLocation={true}
        onRegionChange={() => setIsUserInteracting(true)}
        onRegionChangeComplete={() => setIsUserInteracting(false)}
      >
        {/* //rider direction map view //drop direction marker map view //pickup
        direction marker map view //rider direction marker map view */}
        {rider?.latitude && pickup?.latitude && (
          <MapViewDirections
            origin={rider}
            destination={status === "START" ? pickup : drop}
            onReady={fitToMarkers}
            apikey={apikey}
            strokeColor={Colors.iosColor}
            strokeColors={[Colors.iosColor]}
            strokeWidth={5}
            precision="high"
            onError={(error) => console.log("Directions error:", error)}
          />
        )}
        {drop?.latitude && (
          <Marker
            coordinate={{ longitude: drop.longitude, latitude: drop.latitude }}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={1}
          >
            <Image
              source={require("@/assets/icons/drop_marker.png")}
              style={{ height: 30, width: 30, resizeMode: "contain" }}
            />
          </Marker>
        )}
        {pickup?.latitude && (
          <Marker
            coordinate={{
              longitude: pickup.longitude,
              latitude: pickup.latitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={2}
          >
            <Image
              source={require("@/assets/icons/marker.png")}
              style={{ height: 30, width: 30, resizeMode: "contain" }}
            />
          </Marker>
        )}
        {rider?.latitudde && (
          <Marker
            coordinate={{
              latitude: rider.latitude,
              longitude: rider.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={3}
          >
            <View
              style={{
                transform: [
                  {
                    rotate: `${rider?.heading}deg`,
                  },
                ],
              }}
            >
              <Image
                source={require("@/assets/icons/cab_marker.png")}
                style={{ height: 40, width: 40, resizeMode: "contain" }}
              />
            </View>
          </Marker>
        )}
        {drop && pickup && (
          <Polyline
            coordinates={getPoints([drop, pickup])}
            strokeColor={Colors.text}
            strokeWidth={2}
            geodesic={true}
            lineDashPattern={[12, 10]}
          />
        )}
      </MapView>

      <TouchableOpacity style={mapStyles.gpsButton} onPress={fitToMarkers}>
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={RFValue(16)}
          color="#3C75BE"
        />
      </TouchableOpacity>
    </View>
  )
}

export default memo(LiveTrackingMap)
