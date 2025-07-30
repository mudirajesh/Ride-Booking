import { useWS } from "@/service/WSProvider"
import { useRiderStore } from "@/store/riderStore"
import { rideStyles } from "@/styles/rideStyles"
import { resetAndNavigate } from "@/utils/Helpers"
import { useRoute } from "@react-navigation/native"
import * as Location from "expo-location"
import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState } from "react"
import { Alert, View } from "react-native"

const LiveRide = () => {
  const [isOtpModalVisible, setOtpModalVisible] = useState(false)
  const { setLocation, location, setOnDuty } = useRiderStore()
  const { emit, on, off } = useWS()
  const [rideData, setRideData] = useState<any>(null)
  const route = useRoute() as any
  const params = route?.params || {}
  const id = params.id

  // send location to user and database

  useEffect(() => {
    let locationSubscription: any

    const startLocationUpdates = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 200,
          },

          (location) => {
            const { latitude, longitude, heading } = location.coords
            setLocation({
              latitude: latitude,
              longitude: longitude,
              address: "Something",
              heading: heading as number,
            })

            setOnDuty(true)

            emit("goOnDuty", {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: heading as number,
            })

            emit("updateLocation", {
              latitude,
              longitude,
              heading,
            })

            console.log(
              `Location updated : Lat ${latitude} , Lon ${longitude} , Heading ${heading} `
            )
          }
        )
      } else {
        console.log("Location permission denied")
      }
    }

    startLocationUpdates()

    return () => {
      if (locationSubscription) {
        locationSubscription.remove()
      }
    }
  }, [id])

  //iske event ko listen bhi krna hai iselei

  useEffect(() => {
    if (id) {
      emit("subscribeRide", id)

      on("rideData", (data) => {
        setRideData(data)
      })

      on("rideCanceled", (error) => {
        console.log("Ride error: ", error)
        resetAndNavigate("/rider/home")
        Alert.alert("Ride Canceled")
      })

      on("rideUpdate", (data) => {
        setRideData(data)
      })

      on("error", (error) => {
        console.log("Ride error: ", error)
        resetAndNavigate("/rider/home")
        Alert.alert("Oh Dang! There was an error")
      })
    }

    return () => {
      off("rideData")
      off("error")
    }
  }, [id, emit, on, off])

  return (
    <View style={rideStyles.container}>
      <StatusBar style="light" backgroundColor="orange" translucent={false} />

      {rideData && (
        <RiderLiveTracking
          status={rideData?.status}
          drop={{
            latitude: parseFloat(rideData?.drop?.latitude),
            longitude: parseFloat(rideData?.drop?.longitude),
          }}
          pickup={{
            latitude: parseFloat(rideData?.pickup?.latitude),
            longitude: parseFloat(rideData?.pickup?.longitude),
          }}
          rider={{
            latitude: location?.latitude,
            longitude: location?.longitude,
            heading: location?.heading,
          }}
        />
      )}
    </View>
  )
}

export default LiveRide
