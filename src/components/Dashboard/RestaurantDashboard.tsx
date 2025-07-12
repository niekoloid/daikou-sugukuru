'use client';

import { useState, useEffect } from 'react';
import { User, Position } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import GoogleMap from '@/components/Map/GoogleMap';
import { 
  Store, 
  Users, 
  Car, 
  QrCode, 
  BarChart3, 
  Phone, 
  MapPin,
  Plus,
  Clock,
  CheckCircle 
} from 'lucide-react';

interface RestaurantDashboardProps {
  user: User;
}

interface Customer {
  id: string;
  name: string;
  tableNumber: string;
  phone: string;
  requestTime: Date;
  status: 'waiting' | 'called' | 'completed';
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '田中太郎',
    tableNumber: 'テーブル5',
    phone: '090-1234-5678',
    requestTime: new Date(Date.now() - 300000),
    status: 'waiting',
  },
  {
    id: '2',
    name: '佐藤花子',
    tableNumber: 'カウンター2',
    phone: '090-9876-5432',
    requestTime: new Date(Date.now() - 600000),
    status: 'called',
  },
];

export default function RestaurantDashboard({ user }: RestaurantDashboardProps) {
  const { position: currentPosition, loading: locationLoading } = useGeolocation();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'stats'>('overview');
  const [todayStats, setTodayStats] = useState({
    totalRides: 23,
    totalRevenue: 45000,
    averageRating: 4.7,
    completedRides: 21,
  });

  const restaurantPosition: Position = currentPosition || { lat: 35.6762, lng: 139.6503 };

  const handleCallRide = (customerId: string) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, status: 'called' }
          : customer
      )
    );
  };

  const handleCompleteRide = (customerId: string) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, status: 'completed' }
          : customer
      )
    );
    
    setTimeout(() => {
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    }, 2000);
  };

  const addNewCustomer = () => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: '新規お客様',
      tableNumber: 'テーブル8',
      phone: '090-0000-0000',
      requestTime: new Date(),
      status: 'waiting',
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'called':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: Customer['status']) => {
    switch (status) {
      case 'waiting':
        return '待機中';
      case 'called':
        return '手配済み';
      case 'completed':
        return '完了';
      default:
        return '';
    }
  };

  const getMapMarkers = () => {
    return [{
      id: 'restaurant',
      position: restaurantPosition,
      title: user.name || '店舗',
      type: 'restaurant' as const,
      info: '店舗位置',
    }];
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
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            概要
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 px-4 py-3 text-sm font-medium relative ${
              activeTab === 'customers'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            お客様管理
            {customers.filter(c => c.status === 'waiting').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {customers.filter(c => c.status === 'waiting').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'stats'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            統計
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <GoogleMap
              center={restaurantPosition}
              markers={getMapMarkers()}
              className="w-full h-full"
              zoom={16}
            />
          </div>
          
          <div className="bg-white border-t border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {user.name || '店舗名'}
              </h2>
              <span className="text-sm text-gray-500">代行サービス</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700">待機中</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {customers.filter(c => c.status === 'waiting').length}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">本日完了</span>
                </div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {todayStats.completedRides}
                </div>
              </div>
            </div>

            <button
              onClick={addNewCustomer}
              className="w-full btn-primary"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              代行を呼ぶ
            </button>

            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <QrCode className="w-16 h-16 text-gray-400" />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">QRコード</h3>
                <p className="text-sm text-gray-600">お客様用アクセス</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">お客様管理</h2>
            <button
              onClick={addNewCustomer}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              追加
            </button>
          </div>

          <div className="space-y-4">
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  お客様はいません
                </h3>
                <p className="text-gray-600 mb-4">
                  代行を必要とするお客様を追加してください
                </p>
                <button onClick={addNewCustomer} className="btn-primary">
                  お客様を追加
                </button>
              </div>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`bg-white rounded-lg border p-4 ${
                    customer.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {customer.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            customer.status
                          )}`}
                        >
                          {getStatusText(customer.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{customer.tableNumber}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {customer.requestTime.toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`tel:${customer.phone}`}
                        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {customer.status === 'waiting' && (
                      <button
                        onClick={() => handleCallRide(customer.id)}
                        className="flex-1 btn-primary text-sm"
                      >
                        <Car className="w-4 h-4 inline mr-1" />
                        代行手配
                      </button>
                    )}

                    {customer.status === 'called' && (
                      <button
                        onClick={() => handleCompleteRide(customer.id)}
                        className="flex-1 btn-success text-sm"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        完了
                      </button>
                    )}

                    {customer.status === 'completed' && (
                      <div className="flex-1 bg-green-100 text-green-700 text-center py-2 rounded-lg text-sm font-medium">
                        完了済み
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            本日の統計
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Car className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">総配車数</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {todayStats.totalRides}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">完了数</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {todayStats.completedRides}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">売上貢献</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ¥{todayStats.totalRevenue.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">平均評価</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {todayStats.averageRating}⭐
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium text-gray-900 mb-4">時間別利用状況</h3>
            <div className="space-y-3">
              {[
                { time: '18:00-19:00', count: 3, percentage: 60 },
                { time: '19:00-20:00', count: 5, percentage: 100 },
                { time: '20:00-21:00', count: 4, percentage: 80 },
                { time: '21:00-22:00', count: 6, percentage: 120 },
                { time: '22:00-23:00', count: 5, percentage: 100 },
              ].map((slot) => (
                <div key={slot.time} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-20">
                    {slot.time}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${Math.min(slot.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {slot.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}