import React, { FC, useRef, useState } from "react"
import { Text, View } from "react-native"
import MapView from "react-native-maps"

const RideLiveTracking:FC<{

  drop: any,
  pickup: any,
  rider: any,
  status: string,

}> = ({drop,pickup,rider,status}) => {

  //map ke liye mapRef

  const mapRef = useRef<MapView>(null)
  const [isUserInteracting,setIsUserInteracting ]= useState(false)

  // automatically marker fit to jai map pr

  const fitToMarkers = async() => {
    if(isUserInteracting){ return
      const coordinates = []

      if(pickup?.longitude && pickup?.latitude && status ===" START"){
        coordinates.push({
          longitude: pickup.longitude,
          latitude: pickup.latitude,


        })
      }

      if(drop?.longitude && drop?.latitude && status ==="ARRIVED"){
        coordinates.push({
          longitude: drop.longitude,
          latitude: drop.latitude
        })
      }


      if(rider?.longitude && rider?.latitude){
        coordinates.push({
          latitude: rider.latitude,
          longitude: rider.longitude
        })
      }


      3:34:12
  }


  return (
    <View>
      <Text>RideLiveTracking</Text>
    </View>
  )
}

export default RideLiveTracking
