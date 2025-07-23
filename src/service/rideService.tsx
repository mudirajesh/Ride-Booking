import { resetAndNavigate } from "@/utils/Helpers"
import { router } from "expo-router"
import { Alert } from "react-native"
import { appAxios } from "./apiInterceptors"

interface coords {
  address: string
  latitude: number
  longitude: number
}

export const createRide = async (payload: {
  vehicle: "blue" | "auto" | "cabEconomy" | "cabPremium"
  pickup: coords
  drop: coords
}) => {
  try {
    const res = await appAxios.post(`/ride/create`, payload)
    router?.navigate({
      pathname: "/customer/liveride",
      params: {
        id: res?.data?.ride?._id,
      },
    })
  } catch (error) {
    Alert.alert("Oh! Dang ther was an error")
    console.log("Error: Create Ride ", error)
  }
}

export const getMyRides = async (isCustomer: boolean = true) => {
  try {
    const res = await appAxios.get(`/ride/riders`)

    const filterRides = res.data.rides?.filter(
      (ride: any) => ride?.status != "COMPLETED"
    )

    if (filterRides?.length > 0) {
      router?.navigate({
        pathname: isCustomer ? "/customer/liveride" : "/rider/liveride",
        params: {
          id: filterRides![0]?._id,
        },
      })
    }
  } catch (error: any) {
    Alert.alert("Oh! Dang ther was an error")
    console.log("Error: Get My Ride ", error)
  }
}

export const acceptRideOffer = async (rideId: string) => {
  try {
    const res = await appAxios.patch(`/ride/accept/${rideId}`)
    resetAndNavigate({
      pathname: "/rider/liveride",
      params: {
        id: rideId,
      },
    })
  } catch (error: any) {
    Alert.alert("Oh! Dang there was an error")
    console.log(error)
  }
}

export const updateRideStatus = async (rideId: string, status: string) => {
  try {
    const res = await appAxios.patch(`/ride/update/${rideId}`, { status })

    return true
  } catch (error: any) {
    Alert.alert("Oh! Dang there was an error ")
    console.log(error)

    return false
  }
}
