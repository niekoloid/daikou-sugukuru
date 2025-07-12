'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Position } from '@/types';

interface UseRealTimeLocationOptions {
  interval?: number;
  enableHighAccuracy?: boolean;
  timeout?: number;
}

export function useRealTimeLocation(options: UseRealTimeLocationOptions = {}) {
  const { interval = 5000, enableHighAccuracy = true, timeout = 10000 } = options;
  
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentPosition = useCallback((): Promise<Position> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('位置情報サービスがサポートされていません'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          resolve(newPosition);
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              reject(new Error('位置情報の使用が拒否されました'));
              break;
            case err.POSITION_UNAVAILABLE:
              reject(new Error('位置情報が取得できません'));
              break;
            case err.TIMEOUT:
              reject(new Error('位置情報の取得がタイムアウトしました'));
              break;
            default:
              reject(new Error('位置情報の取得に失敗しました'));
              break;
          }
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge: 30000,
        }
      );
    });
  }, [enableHighAccuracy, timeout]);

  const startTracking = useCallback(async () => {
    if (isTracking) return;

    try {
      const initialPosition = await getCurrentPosition();
      setPosition(initialPosition);
      setError(null);
      setIsTracking(true);

      if (navigator.geolocation.watchPosition) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const newPosition = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setPosition(newPosition);
          },
          (err) => {
            console.error('Watch position error:', err);
          },
          {
            enableHighAccuracy,
            timeout,
            maximumAge: 30000,
          }
        );
      } else {
        intervalIdRef.current = setInterval(async () => {
          try {
            const newPosition = await getCurrentPosition();
            setPosition(newPosition);
          } catch (err) {
            console.error('Interval position error:', err);
          }
        }, interval);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '位置情報の取得に失敗しました');
      setIsTracking(false);
    }
  }, [isTracking, getCurrentPosition, interval, enableHighAccuracy, timeout]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    setIsTracking(false);
  }, [isTracking]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    position,
    error,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentPosition,
  };
}