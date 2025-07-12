'use client';

import { useState, useEffect } from 'react';
import { User, Position, Ride, RideStatus } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import GoogleMap from '@/components/Map/GoogleMap';
import DrivingMeter from '@/components/Driver/DrivingMeter';
import { Car, DollarSign, Clock, Phone, Navigation, CheckCircle, AlertCircle, Gauge } from 'lucide-react';
import Link from 'next/link';

interface DriverDashboardProps {
  user: User;
}

const mockRideRequests = [
  {
    id: 'ride-1',
    customerId: 'customer-1',
    customerName: '山田太郎',
    restaurantId: 'restaurant-1',
    restaurantName: '居酒屋やまだ',
    restaurantAddress: '東京都渋谷区道玄坂1-1-1',
    customerPosition: { lat: 35.6762, lng: 139.6503 },
    destinationPosition: { lat: 35.6862, lng: 139.6603 },
    restaurantPosition: { lat: 35.6762, lng: 139.6503 },
    estimatedPrice: 3500,
    distance: '2.5km',
    createdAt: new Date(),
  },
];

export default function DriverDashboard({ user }: DriverDashboardProps) {
  const { position: currentPosition, loading: locationLoading, error: locationError } = useGeolocation();
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState<typeof mockRideRequests[0] | null>(null);
  const [rideStatus, setRideStatus] = useState<RideStatus>('waiting');
  const [dailyEarnings, setDailyEarnings] = useState(12500);
  const [rideRequests, setRideRequests] = useState(mockRideRequests);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleAcceptRide = (ride: typeof mockRideRequests[0]) => {
    setCurrentRide(ride);
    setRideStatus('accepted');
    setRideRequests([]);
    
    setTimeout(() => setRideStatus('en_route'), 1000);
  };

  const handleUpdateStatus = (newStatus: RideStatus) => {
    setRideStatus(newStatus);
    
    if (newStatus === 'completed') {
      setDailyEarnings(prev => prev + (currentRide?.estimatedPrice || 0));
      setCurrentRide(null);
      setTimeout(() => {
        setRideStatus('waiting');
        setRideRequests(mockRideRequests);
      }, 2000);
    }
  };

  const getStatusColor = () => {
    switch (rideStatus) {
      case 'waiting':
        return isOnline ? 'bg-green-500' : 'bg-gray-400';
      case 'accepted':
        return 'bg-blue-500';
      case 'en_route':
        return 'bg-purple-500';
      case 'arrived':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (rideStatus) {
      case 'waiting':
        return isOnline ? 'オンライン - 待機中' : 'オフライン';
      case 'accepted':
        return '配車受付済み';
      case 'en_route':
        return '現場に向かい中';
      case 'arrived':
        return '現場到着';
      case 'in_progress':
        return '運転中';
      case 'completed':
        return '完了';
      default:
        return '';
    }
  };

  const getMapMarkers = () => {
    const markers = [];

    if (currentPosition) {
      markers.push({
        id: 'driver',
        position: currentPosition,
        title: 'あなたの現在地',
        type: 'driver' as const,
        info: '現在地',
      });
    }

    if (currentRide) {
      markers.push({
        id: 'customer',
        position: currentRide.customerPosition,
        title: currentRide.customerName,
        type: 'customer' as const,
        info: 'お客様',
      });

      markers.push({
        id: 'restaurant',
        position: currentRide.restaurantPosition,
        title: currentRide.restaurantName,
        type: 'restaurant' as const,
        info: currentRide.restaurantAddress,
      });

      markers.push({
        id: 'destination',
        position: currentRide.destinationPosition,
        title: 'お送り先',
        type: 'destination' as const,
        info: 'お送り先',
      });
    }

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

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${getStatusColor()}`}></div>
            <span className="font-medium text-gray-900">{getStatusText()}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">本日の売上</div>
              <div className="font-semibold text-green-600">
                ¥{dailyEarnings.toLocaleString()}
              </div>
            </div>
            
            <button
              onClick={handleToggleOnline}
              className={`px-4 py-2 rounded-lg font-medium ${
                isOnline
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isOnline ? 'オフライン' : 'オンライン'}
            </button>
          </div>
        </div>
      </div>

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

      <div className="bg-white border-t border-gray-200 p-4">
        {!isOnline && (
          <div className="text-center py-8">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">オフライン中</h3>
            <p className="text-gray-600 mb-4">オンラインにして配車依頼を受け取りましょう</p>
            <button onClick={handleToggleOnline} className="btn-primary">
              オンラインにする
            </button>
          </div>
        )}

        {isOnline && rideStatus === 'waiting' && rideRequests.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">待機中</h3>
            <p className="text-gray-600">配車依頼をお待ちしています...</p>
          </div>
        )}

        {isOnline && rideStatus === 'waiting' && rideRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">新しい配車依頼</h3>
            {rideRequests.map((ride) => (
              <div key={ride.id} className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{ride.customerName}</h4>
                    <p className="text-sm text-gray-600">{ride.restaurantName}</p>
                    <p className="text-xs text-gray-500">{ride.restaurantAddress}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      ¥{ride.estimatedPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{ride.distance}</div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAcceptRide(ride)}
                    className="flex-1 btn-primary"
                  >
                    受諾
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
                    拒否
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {rideStatus === 'accepted' && currentRide && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">配車受付済み</h3>
              <span className="text-sm text-blue-600">現場に向かってください</span>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{currentRide.customerName}</h4>
                  <p className="text-sm text-gray-600">{currentRide.restaurantName}</p>
                  <p className="text-xs text-gray-500">{currentRide.restaurantAddress}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    ¥{currentRide.estimatedPrice.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleUpdateStatus('en_route')}
                className="w-full btn-primary"
              >
                <Navigation className="w-5 h-5 inline mr-2" />
                出発
              </button>
            </div>
          </div>
        )}

        {rideStatus === 'en_route' && currentRide && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">現場に向かい中</h3>
              <span className="text-sm text-purple-600">運転中</span>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{currentRide.customerName}</h4>
                  <p className="text-sm text-gray-600">{currentRide.restaurantName}</p>
                </div>
                <a
                  href={`tel:090-1234-5678`}
                  className="p-2 bg-purple-100 text-purple-600 rounded-full"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
              
              <button
                onClick={() => handleUpdateStatus('arrived')}
                className="w-full btn-success"
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                現場到着
              </button>
            </div>
          </div>
        )}

        {rideStatus === 'arrived' && currentRide && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">現場到着</h3>
              <span className="text-sm text-green-600">お客様をお待ちしています</span>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{currentRide.customerName}</h4>
                  <p className="text-sm text-gray-600">現場で待機中</p>
                </div>
                <a
                  href={`tel:090-1234-5678`}
                  className="p-2 bg-green-100 text-green-600 rounded-full"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
              
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                className="w-full btn-primary"
              >
                運転開始
              </button>
            </div>
          </div>
        )}

        {rideStatus === 'in_progress' && currentRide && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">運転中</h3>
              <span className="text-sm text-orange-600">お送り中</span>
            </div>
            
            {/* リアルタイム料金メーター */}
            <DrivingMeter
              onStart={() => console.log('運転開始')}
              onPause={() => console.log('運転一時停止')}
              onStop={() => handleUpdateStatus('completed')}
              className="rounded-lg"
            />
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{currentRide.customerName}</h4>
                <p className="text-sm text-gray-600">目的地まで安全運転でお送りください</p>
              </div>
              
              <div className="flex space-x-3 mb-4">
                <Link
                  href="/meter"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                >
                  <Gauge className="w-4 h-4 mr-2" />
                  フルスクリーンメーター
                </Link>
              </div>
              
              <button
                onClick={() => handleUpdateStatus('completed')}
                className="w-full btn-success"
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                完了
              </button>
            </div>
          </div>
        )}

        {rideStatus === 'completed' && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                お疲れ様でした！
              </h3>
              <p className="text-gray-600 mb-4">配車完了</p>
              <div className="text-2xl font-bold text-green-600">
                +¥{currentRide?.estimatedPrice.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}