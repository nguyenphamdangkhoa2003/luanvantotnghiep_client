'use client'
import { UserLocationContext } from '@/hooks/use-user-location-context'
import { IUserLocation } from '@/types/user-location'
import TripManage from "./_components/TripManage"
import { useEffect, useState } from 'react'

export default function TripManagePage() {
  const [userLocation, setUserLocation] = useState<IUserLocation | undefined>()
  
    function getUserLocation() {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            })
          },
          (error) => {
            console.error('Error getting location: ', error.message)
          }
        )
      } else {
        console.error('Geolocation is not supported by this browser.')
      }
    }
  
    useEffect(() => {
      getUserLocation()
    }, [])
  return (
  <UserLocationContext.Provider value={{ userLocation, setUserLocation }}> <TripManage /></UserLocationContext.Provider>
 )
}
