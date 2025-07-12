'use client';

import { useState, useEffect, useCallback } from 'react';
import { Position, RideStatus, User } from '@/types';
import { useRealTimeLocation } from './useRealTimeLocation';

interface RideTrackingData {
  rideId: string;
  customerId: string;
  driverId?: string;
  customerPosition: Position;
  driverPosition?: Position;
  destinationPosition: Position;
  status: RideStatus;
  estimatedArrival?: Date;
  distance?: number;
}

interface UseRideTrackingOptions {
  user: User;
  rideId?: string;
  enableLocationTracking?: boolean;
}

export function useRideTracking(options: UseRideTrackingOptions) {
  const { user, rideId, enableLocationTracking = true } = options;
  
  const [rideData, setRideData] = useState<RideTrackingData | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  
  const {
    position: currentPosition,
    error: locationError,
    isTracking,
    startTracking,
    stopTracking,
  } = useRealTimeLocation({
    interval: 3000,
    enableHighAccuracy: true,
  });

  const mockDriverPosition = {
    lat: 35.6762 + (Math.random() - 0.5) * 0.01,
    lng: 139.6503 + (Math.random() - 0.5) * 0.01,
  };

  const mockCustomerPosition = {
    lat: 35.6762,
    lng: 139.6503,
  };

  const mockDestinationPosition = {
    lat: 35.6862,
    lng: 139.6603,
  };

  const simulateRealTimeUpdates = useCallback(() => {
    if (!rideId) return;

    const updateInterval = setInterval(() => {
      if (rideData && rideData.status !== 'completed') {
        setRideData(prev => {
          if (!prev) return null;
          
          const newDriverPosition = {
            lat: prev.driverPosition?.lat || mockDriverPosition.lat + (Math.random() - 0.5) * 0.001,
            lng: prev.driverPosition?.lng || mockDriverPosition.lng + (Math.random() - 0.5) * 0.001,
          };

          const customerPosition = prev.customerPosition;
          const distance = calculateDistance(newDriverPosition, customerPosition);
          const estimatedMinutes = Math.max(1, Math.floor(distance * 10));
          
          return {
            ...prev,
            driverPosition: newDriverPosition,
            distance,
            estimatedArrival: new Date(Date.now() + estimatedMinutes * 60000),
          };
        });
      }
    }, 5000);

    return () => clearInterval(updateInterval);
  }, [rideId, rideData, mockDriverPosition]);

  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371;
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startRideTracking = useCallback((newRideId: string, status: RideStatus = 'accepted') => {
    const initialData: RideTrackingData = {
      rideId: newRideId,
      customerId: user.id,
      driverId: 'driver-1',
      customerPosition: currentPosition || mockCustomerPosition,
      driverPosition: mockDriverPosition,
      destinationPosition: mockDestinationPosition,
      status,
    };

    setRideData(initialData);
    setTrackingError(null);

    if (enableLocationTracking && user.type === 'driver') {
      startTracking();
    }
  }, [user.id, user.type, currentPosition, enableLocationTracking, startTracking]);

  const updateRideStatus = useCallback((newStatus: RideStatus) => {
    setRideData(prev => {
      if (!prev) return null;
      return { ...prev, status: newStatus };
    });
  }, []);

  const stopRideTracking = useCallback(() => {
    setRideData(null);
    if (isTracking) {
      stopTracking();
    }
  }, [isTracking, stopTracking]);

  useEffect(() => {
    if (locationError) {
      setTrackingError(locationError);
    }
  }, [locationError]);

  useEffect(() => {
    if (currentPosition && rideData && user.type === 'driver') {
      setRideData(prev => {
        if (!prev) return null;
        return { ...prev, driverPosition: currentPosition };
      });
    } else if (currentPosition && rideData && user.type === 'customer') {
      setRideData(prev => {
        if (!prev) return null;
        return { ...prev, customerPosition: currentPosition };
      });
    }
  }, [currentPosition, rideData, user.type]);

  useEffect(() => {
    const cleanup = simulateRealTimeUpdates();
    return cleanup;
  }, [simulateRealTimeUpdates]);

  const getEstimatedArrivalText = (): string => {
    if (!rideData?.estimatedArrival) return '';
    
    const now = new Date();
    const arrival = rideData.estimatedArrival;
    const diffMinutes = Math.floor((arrival.getTime() - now.getTime()) / 60000);
    
    if (diffMinutes <= 0) return '到着予定';
    if (diffMinutes === 1) return '約1分後';
    return `約${diffMinutes}分後`;
  };

  const getRideStatusText = (): string => {
    if (!rideData) return '';
    
    switch (rideData.status) {
      case 'waiting':
        return '代行業者を探しています...';
      case 'accepted':
        return '代行業者が確定しました';
      case 'en_route':
        return '代行業者が向かっています';
      case 'arrived':
        return '代行業者が到着しました';
      case 'in_progress':
        return '運転中です';
      case 'completed':
        return '完了しました';
      default:
        return '';
    }
  };

  return {
    rideData,
    trackingError,
    isLocationTracking: isTracking,
    currentPosition,
    startRideTracking,
    updateRideStatus,
    stopRideTracking,
    getEstimatedArrivalText,
    getRideStatusText,
  };
}