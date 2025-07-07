import { useWS } from "@/service/WSProvider"
import { useUserStore } from "@/store/userStore"
import { customMapStyle, indiaIntialRegion } from "@/utils/CustomMap"
import { useIsFocused } from "@react-navigation/native"
import MapView,{Marker,Region} from 'react-native-maps'
import React, { FC, memo, useRef, useState } from "react"
import { Image, Text, TouchableOpacity, View } from "react-native"
import { reverseGeocode } from "@/utils/mapUtils"
import haversine from 'haversine-distance'
import {FontAwesome6, MaterialCommunityIcons} from '@expo/vector-icons'
import { mapStyles } from "@/styles/mapStyles"
import { RFValue } from "react-native-responsive-fontsize"
import * as Location from 'expo-location'

const DraggableMap :FC<(height: number)> = ({height}) => {
  const isFocused = useIsFocused()
  const [markers,setMarkers]  = useState<any>([1])
  const mapRef = useRef<MapView> (null)
  const{setLocation,location,outOfRange,setOutOfRange} = useUserStore()
  const {emit,on,off} = useWS()
  const  MAX_DISTANCE_THRESHOLD = 10000

  const handleRegionChangeComplete = async(newRegion: Region) => {
    const address = await reverseGeocode(
      newRegion.latitude,
      newRegion.longitude
    )
    setLocation({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
      address: address
    })

    const userLocation = {
      latitude: location?.latitude,
      longitude: location?.longitude
    } as any

    if(userLocation){
      const newLocation = {
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      }
    }

    const distance = haversine(userLocation,newLocation)
    setOutOfRange(distance > MAX_DISTANCE_THRESHOLD)
  }

  const handleGpsBUttonPress = async()=> {
    try {
      const { status }  = await Location.requestForegroundPermissionAsync()
      const location = await Location.getCurrentPositionAsync({})
      const {latitude,longitude} = location.coords
      mapRef.current?.fitToCoordinates([{
        latitude, longitude
      }],
        {
            edgePadding: { top: 50, right: 50, bottom:50, left: 50},
            animated: true,
        }
      )

      const address = await reverseGeocode(latitude,longitude)
      setLocation({latitude,longitude,address})

    } catch (error) {
      console.error("Error getting location", error )
      
    }
  }



  return (
    <View style={{height: height,width:"100%"}}>
      <MapView
      ref={mapRef}
      maxZoomLevel={12}
      pitchEnabled={false}
      onRegionChangeComplete={handleRegionChangeComplete}
      style={{flex:1}}
      initialRegion={indiaIntialRegion}
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
      >

        </MapView>

        <View style={mapStyles.centerMarkerContainer}>
          <Image
          source={require('@/assets/icons/marker.png')}
          style={mapStyles.marker}
          />

          <TouchableOpacity
          style={mapStyles.gpsButton}
          onPress={handleGpsButtonPress}
          >
            <MaterialCommunityIcons
            name="crosshairs-gps"
            size={RFValue(16)}
            color="#3C75BE"
            />
          </TouchableOpacity>
        </View>

        {outOfRange && (
          <View style={mapStyles.outOfRange}>
            <FontAwesome6
            name="road-circle-exclamation"
            size={24}
            color="red"
            />
          </View>
        )}

      
    </View>
  )
}

export default memo(DraggableMap)
