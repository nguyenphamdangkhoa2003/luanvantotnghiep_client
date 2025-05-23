'use client'

import React, { useEffect, useState } from 'react'
import RegistrationForm from '@/components/form/RegistrationForm'
import { UserLocationContext } from '@/hooks/use-user-location-context'
import { IUserLocation } from '@/types/user-location'

const RegisterATripPage = () => {
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
    <UserLocationContext.Provider value={{ userLocation, setUserLocation }}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl  p-6 lg:p-8 ">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Đăng ký tuyến đường
          </h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Hãy nhập thông tin chi tiết về tuyến đường bạn muốn chia sẻ để kết
            nối với những hành khách phù hợp.
          </p>
          <RegistrationForm />
        </div>
      </div>
    </UserLocationContext.Provider>
  )
}

export default RegisterATripPage
