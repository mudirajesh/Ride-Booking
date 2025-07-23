import { mapStyles } from "@/styles/mapStyles"
import { customMapStyle, indiaIntialRegion } from "@/utils/CustomMap"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import React, { FC, memo, useEffect, useRef } from "react"
import { Image, TouchableOpacity, View } from "react-native"
import MapView, { Marker } from "react-native-maps"
import MapViewDirections from "react-native-maps-directions"
import { RFValue } from "react-native-responsive-fontsize"

const apiKey = process.env.EXPO_PUBLIC_MAP_API_KEY || ""

const RoutesMap: FC<{ drop: any; pickup: any }> = ({ drop, pickup }) => {
  //fit to marker
  //map reference
  //calculate initial region

  const mapRef = useRef<MapView>(null)

  const fitToMarkers = async () => {
    const coordinates = []

    if (pickup?.latitude && pickup?.longitude) {
      coordinates.push({
        latitude: pickup?.latitude,
        longitude: pickup?.longitude,
      })
    }

    if (drop?.latitude && drop?.longitude) {
      coordinates.push({
        latitude: drop?.latitude,
        longitude: drop?.longitude,
      })
    }

    if (coordinates.length === 0) return

    try {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50,
          left: 50,
          bottom: 50,
          right: 50,
        },
        animated: true,
      })
    } catch (error) {
      console.log("Error fitting")
    }
  }

  const fitToMarkersWithDelay = () => {
    setTimeout(() => {
      fitToMarkers()
    }, 500)
  }

  useEffect(() => {
    if (drop?.latitude && pickup?.latitude && mapRef) {
      fitToMarkersWithDelay()
    }
  }, [drop?.latitude, pickup?.latitude, mapRef])

  //kaha focus krna hai
  const calculateInitialRegion = () => {
    if (pickup?.latitude && drop?.latitude) {
      const latitude = (pickup?.latitude + drop?.latitude) / 2
      const longitude = (pickup?.latitude + drop?.longitude) / 2

      return {
        latitude,
        longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }
    }
    return indiaIntialRegion
  }

  return (
    <View style={{ flex: 1 }}>
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
      >
        {/* direction ke liye jo line banti hai na whi */}

        {pickup?.latitude && drop?.latitude && (
          <MapViewDirections
            origin={pickup}
            destination={drop}
            apikey={apiKey}
            strokeWidth={5}
            precision="high"
            onReady={() => fitToMarkersWithDelay()}
            strokeColor="#D2D2D2"
            strokeColors={["#D2D2D2"]}
            onError={(err) => console.log("Directions Error", err)}
          />
        )}

        {drop?.latitude && (
          <Marker
            coordinate={{ longitude: drop.longitude, latitude: drop.latitude }}
            anchor={{ x: 0.5, y: 1 }}
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

export default memo(RoutesMap)
