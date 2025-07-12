'use client';

import { useState, useEffect } from 'react';
import { User, Position, Ride, RideStatus } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import GoogleMap from '@/components/Map/GoogleMap';
import { MapPin, Clock, Phone, Star, Navigation } from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
}

const mockDriver = {
  id: 'driver-1',
  name: '田中運転手',
  phone: '090-1234-5678',
  position: { lat: 35.6762, lng: 139.6503 },
  rating: 4.8,
};

const mockRestaurant = {
  id: 'restaurant-1',
  name: '居酒屋やまだ',
  position: { lat: 35.6762, lng: 139.6503 },
  address: '東京都渋谷区道玄坂1-1-1',
};

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const { position: currentPosition, loading: locationLoading, error: locationError, refetch } = useGeolocation();
  const [rideStatus, setRideStatus] = useState<RideStatus>('waiting');
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [destinationPosition, setDestinationPosition] = useState<Position | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');

  useEffect(() => {
    if (rideStatus === 'accepted' || rideStatus === 'en_route') {
      const interval = setInterval(() => {
        const now = new Date();
        const arrival = new Date(now.getTime() + 8 * 60000);
        setEstimatedArrival(arrival.toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [rideStatus]);

  const handleRequestRide = () => {
    if (!currentPosition) {
      alert('現在地が取得できていません。位置情報を有効にしてください。');
      return;
    }

    const mockDestination = {
      lat: currentPosition.lat + 0.01,
      lng: currentPosition.lng + 0.01,
    };

    setDestinationPosition(mockDestination);
    setRideStatus('accepted');
    setCurrentRide({
      id: Date.now().toString(),
      customerId: user.id,
      driverId: mockDriver.id,
      restaurantId: mockRestaurant.id,
      status: 'accepted',
      customerPosition: currentPosition,
      destinationPosition: mockDestination,
      restaurantPosition: mockRestaurant.position,
      estimatedPrice: 3500,
      createdAt: new Date(),
    });

    setTimeout(() => setRideStatus('en_route'), 2000);
    setTimeout(() => setRideStatus('arrived'), 5000);
  };

  const handleCompleteRide = (rating: number) => {
    setRideStatus('completed');
    setCurrentRide(null);
    setDestinationPosition(null);
    setTimeout(() => setRideStatus('waiting'), 2000);
  };

  const getStatusMessage = () => {
    switch (rideStatus) {
      case 'waiting':
        return '代行を呼ぶ';
      case 'accepted':
        return '代行業者が確定しました';
      case 'en_route':
        return '代行業者が向かっています';
      case 'arrived':
        return '代行業者が到着しました';
      case 'in_progress':
        return '運転中です';
      case 'completed':
        return 'ご利用ありがとうございました';
      default:
        return '';
    }
  };

  const getMapMarkers = () => {
    const markers = [];

    if (currentPosition) {
      markers.push({
        id: 'customer',
        position: currentPosition,
        title: 'あなたの現在地',
        type: 'customer' as const,
        info: '現在地',
      });
    }

    if (rideStatus !== 'waiting' && mockDriver) {
      markers.push({
        id: 'driver',
        position: mockDriver.position,
        title: mockDriver.name,
        type: 'driver' as const,
        info: `評価: ${mockDriver.rating}⭐`,
      });
    }

    if (destinationPosition) {
      markers.push({
        id: 'destination',
        position: destinationPosition,
        title: 'お送り先',
        type: 'destination' as const,
        info: 'お送り先',
      });
    }

    markers.push({
      id: 'restaurant',
      position: mockRestaurant.position,
      title: mockRestaurant.name,
      type: 'restaurant' as const,
      info: mockRestaurant.address,
    });

    return markers;
  };

  if (locationLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">位置情報を取得中...</p>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="p-4">
        <div className="card text-center">
          <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">位置情報エラー</h2>
          <p className="text-gray-600 mb-4">{locationError}</p>
          <button onClick={refetch} className="btn-primary">
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 relative">
        {currentPosition && (
          <GoogleMap
            center={currentPosition}
            markers={getMapMarkers()}
            className="w-full h-full"
            zoom={14}
          />
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-4 space-y-4">
        {rideStatus === 'waiting' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {mockRestaurant.name}
              </h2>
              <p className="text-sm text-gray-600">{mockRestaurant.address}</p>
            </div>
            
            <button
              onClick={handleRequestRide}
              className="w-full btn-primary text-xl py-4"
              disabled={!currentPosition}
            >
              <Navigation className="w-6 h-6 inline mr-2" />
              代行を呼ぶ
            </button>
          </div>
        )}

        {(rideStatus === 'accepted' || rideStatus === 'en_route') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">車</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{mockDriver.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{mockDriver.rating}</span>
                  </div>
                </div>
              </div>
              <a
                href={`tel:${mockDriver.phone}`}
                className="p-2 bg-primary-100 text-primary-600 rounded-full"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">{getStatusMessage()}</span>
              </div>
              {estimatedArrival && (
                <p className="text-sm text-blue-700 mt-1">
                  到着予定: {estimatedArrival}
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                料金: ¥{currentRide?.estimatedPrice.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {rideStatus === 'arrived' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                代行業者が到着しました！
              </h3>
              <p className="text-green-700">{mockDriver.name}さんがお待ちしています</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${mockDriver.phone}`}
                className="btn-secondary text-center"
              >
                <Phone className="w-5 h-5 inline mr-2" />
                電話
              </a>
              <button
                onClick={() => setRideStatus('in_progress')}
                className="btn-success"
              >
                運転開始
              </button>
            </div>
          </div>
        )}

        {rideStatus === 'in_progress' && (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                運転中です
              </h3>
              <p className="text-orange-700">安全運転でお送りしています</p>
            </div>

            <button
              onClick={() => setRideStatus('completed')}
              className="w-full btn-primary"
            >
              到着しました
            </button>
          </div>
        )}

        {rideStatus === 'completed' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                サービス評価
              </h3>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleCompleteRide(rating)}
                    className="p-2"
                  >
                    <Star className="w-8 h-8 text-yellow-500 hover:text-yellow-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}