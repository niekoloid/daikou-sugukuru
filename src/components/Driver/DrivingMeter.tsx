'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, MapPin, Clock, Navigation, DollarSign } from 'lucide-react';

interface Position {
  lat: number;
  lng: number;
}

interface DrivingMeterProps {
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  className?: string;
}

export default function DrivingMeter({
  onStart,
  onPause,
  onStop,
  className = '',
}: DrivingMeterProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);
  const [routePoints, setRoutePoints] = useState<Position[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // 料金計算の基本設定
  const BASE_FARE = 1000; // 基本料金
  const TIME_RATE = 50; // 1分あたりの料金
  const DISTANCE_RATE = 100; // 1kmあたりの料金

  // 時間の更新
  useEffect(() => {
    if (isRunning && !isPaused && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, startTime]);

  // 位置情報の追跡
  useEffect(() => {
    if (isRunning && !isPaused) {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const newPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            if (lastPosition) {
              // 距離の計算（ハヴァーサイン公式）
              const distance = calculateDistance(lastPosition, newPosition);
              setTotalDistance(prev => prev + distance);
              setRoutePoints(prev => [...prev, newPosition]);
            }

            setLastPosition(newPosition);
            setCurrentSpeed(position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0);
          },
          (error) => {
            console.error('位置情報の取得に失敗しました:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 1000,
          }
        );
      }
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isRunning, isPaused, lastPosition]);

  // 料金の計算
  useEffect(() => {
    const timeMinutes = elapsedTime / (1000 * 60);
    const distanceKm = totalDistance / 1000;
    const fare = BASE_FARE + (timeMinutes * TIME_RATE) + (distanceKm * DISTANCE_RATE);
    setEstimatedFare(Math.round(fare));
  }, [elapsedTime, totalDistance]);

  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371000; // 地球の半径（メートル）
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
    const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1.lat * Math.PI) / 180) *
        Math.cos((pos2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const handleStart = () => {
    if (!isRunning) {
      setStartTime(new Date());
      setIsRunning(true);
      setIsPaused(false);
      setElapsedTime(0);
      setTotalDistance(0);
      setRoutePoints([]);
      onStart?.();
    } else if (isPaused) {
      setIsPaused(false);
      onStart?.();
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    onPause?.();
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setTotalDistance(0);
    setCurrentSpeed(0);
    setEstimatedFare(0);
    setLastPosition(null);
    setRoutePoints([]);
    onStop?.();
  };

  return (
    <div className={`bg-black text-white w-full h-screen flex ${className}`}>
      {/* 縦向きレイアウト */}
      <div className="landscape:hidden w-full flex flex-col">
        {/* メイン料金表示 */}
        <div className="text-center mb-6 px-4 flex-shrink-0">
          <div className="text-6xl sm:text-7xl font-bold text-green-400 mb-2">
            ¥{estimatedFare.toLocaleString()}
          </div>
          <div className="text-lg text-gray-300">推定料金</div>
        </div>

        {/* メトリクス表示 */}
        <div className="grid grid-cols-1 gap-4 mb-6 px-4 flex-shrink-0">
          {/* 時間 */}
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              <span className="text-sm text-gray-300">経過時間</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {formatTime(elapsedTime)}
            </div>
          </div>

          {/* 距離 */}
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Navigation className="w-5 h-5 mr-2 text-orange-400" />
              <span className="text-sm text-gray-300">走行距離</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">
              {formatDistance(totalDistance)}
            </div>
          </div>

          {/* 速度 */}
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="w-5 h-5 mr-2 text-purple-400" />
              <span className="text-sm text-gray-300">現在速度</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">
              {currentSpeed} km/h
            </div>
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="flex justify-center space-x-4 px-4 flex-1 items-end pb-8">
          {!isRunning || isPaused ? (
            <button
              onClick={handleStart}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg flex items-center text-lg font-semibold transition-colors"
            >
              <Play className="w-6 h-6 mr-2" />
              {!isRunning ? '開始' : '再開'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg flex items-center text-lg font-semibold transition-colors"
            >
              <Pause className="w-6 h-6 mr-2" />
              一時停止
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg flex items-center text-lg font-semibold transition-colors"
            >
              <Square className="w-6 h-6 mr-2" />
              終了
            </button>
          )}
        </div>

        {/* ステータス表示 */}
        <div className="text-center px-4 py-4 flex-shrink-0">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            isRunning && !isPaused
              ? 'bg-green-900 text-green-300'
              : isPaused
              ? 'bg-yellow-900 text-yellow-300'
              : 'bg-gray-900 text-gray-300'
          }`}>
            {isRunning && !isPaused
              ? '運行中'
              : isPaused
              ? '一時停止中'
              : '待機中'}
          </div>
        </div>
      </div>

      {/* 横向きレイアウト */}
      <div className="hidden landscape:flex w-full h-full">
        {/* 左側: メイン料金表示 */}
        <div className="flex-1 flex flex-col justify-center items-center px-4">
          <div className="text-center">
            <div className="text-5xl xl:text-6xl font-bold text-green-400 mb-2">
              ¥{estimatedFare.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">推定料金</div>
          </div>

          {/* ステータス表示 */}
          <div className="mt-4">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              isRunning && !isPaused
                ? 'bg-green-900 text-green-300'
                : isPaused
                ? 'bg-yellow-900 text-yellow-300'
                : 'bg-gray-900 text-gray-300'
            }`}>
              {isRunning && !isPaused
                ? '運行中'
                : isPaused
                ? '一時停止中'
                : '待機中'}
            </div>
          </div>
        </div>

        {/* 中央: メトリクス表示 */}
        <div className="flex-1 flex flex-col justify-center px-4">
          <div className="grid grid-cols-1 gap-2">
            {/* 時間 */}
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-3 h-3 mr-1 text-blue-400" />
                <span className="text-xs text-gray-300">経過時間</span>
              </div>
              <div className="text-lg font-bold text-blue-400">
                {formatTime(elapsedTime)}
              </div>
            </div>

            {/* 距離 */}
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Navigation className="w-3 h-3 mr-1 text-orange-400" />
                <span className="text-xs text-gray-300">走行距離</span>
              </div>
              <div className="text-lg font-bold text-orange-400">
                {formatDistance(totalDistance)}
              </div>
            </div>

            {/* 速度 */}
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <MapPin className="w-3 h-3 mr-1 text-purple-400" />
                <span className="text-xs text-gray-300">現在速度</span>
              </div>
              <div className="text-lg font-bold text-purple-400">
                {currentSpeed} km/h
              </div>
            </div>
          </div>

          {/* 料金詳細 */}
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-400">基本料金</div>
                <div className="text-white font-semibold">¥{BASE_FARE}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">時間料金</div>
                <div className="text-white font-semibold">¥{TIME_RATE}/分</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">距離料金</div>
                <div className="text-white font-semibold">¥{DISTANCE_RATE}/km</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側: コントロールボタン */}
        <div className="flex-1 flex flex-col justify-center items-center px-4">
          <div className="flex flex-col space-y-3 w-full max-w-48">
            {!isRunning || isPaused ? (
              <button
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg flex items-center justify-center text-base font-semibold transition-colors w-full"
              >
                <Play className="w-5 h-5 mr-2" />
                {!isRunning ? '開始' : '再開'}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-4 rounded-lg flex items-center justify-center text-base font-semibold transition-colors w-full"
              >
                <Pause className="w-5 h-5 mr-2" />
                一時停止
              </button>
            )}

            {isRunning && (
              <button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg flex items-center justify-center text-base font-semibold transition-colors w-full"
              >
                <Square className="w-5 h-5 mr-2" />
                終了
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}