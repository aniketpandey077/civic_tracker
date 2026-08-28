'use client';

import { useState, useEffect } from 'react';
import { reverseGeocodeReal, RealGeoAddress } from './zoneMatcher';

export interface UserLocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  city: string;
  wardName: string;
  department: string;
  cityCode: string;
  isLoaded: boolean;
  isCustomLocation: boolean;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocationState>({
    latitude: 26.9068,
    longitude: 75.7873,
    accuracy: null,
    city: 'Detecting location...',
    wardName: 'Detecting Ward...',
    department: 'Municipal Corporation',
    cityCode: 'JPR',
    isLoaded: false,
    isCustomLocation: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user previously saved coordinates in localStorage
    const cachedLat = localStorage.getItem('civic_user_lat');
    const cachedLng = localStorage.getItem('civic_user_lng');
    const cachedCity = localStorage.getItem('civic_user_city');

    if (cachedLat && cachedLng && cachedCity) {
      setLocation(prev => ({
        ...prev,
        latitude: parseFloat(cachedLat),
        longitude: parseFloat(cachedLng),
        city: cachedCity,
        wardName: `Ward (${cachedCity})`,
        isLoaded: true,
        isCustomLocation: true,
      }));
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = Number(position.coords.latitude.toFixed(6));
          const lng = Number(position.coords.longitude.toFixed(6));
          const acc = Math.round(position.coords.accuracy);

          const geo = await reverseGeocodeReal(lat, lng);
          const detectedCity = geo.city || geo.town || geo.suburb || 'Local Area';

          localStorage.setItem('civic_user_lat', lat.toString());
          localStorage.setItem('civic_user_lng', lng.toString());
          localStorage.setItem('civic_user_city', detectedCity);

          setLocation({
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            city: detectedCity,
            wardName: geo.ward_name,
            department: geo.department,
            cityCode: geo.city_code,
            isLoaded: true,
            isCustomLocation: true,
          });
        },
        (error) => {
          console.warn('Location detection note:', error.message);
          setLocation(prev => ({
            ...prev,
            city: 'Your City',
            wardName: 'Local Municipal Ward',
            isLoaded: true,
          }));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocation(prev => ({
        ...prev,
        city: 'Your City',
        wardName: 'Local Municipal Ward',
        isLoaded: true,
      }));
    }
  }, []);

  return location;
}
