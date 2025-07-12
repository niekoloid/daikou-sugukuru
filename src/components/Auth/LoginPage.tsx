'use client';

import { useState } from 'react';
import { UserType } from '@/types';
import { Car, Store, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userType: UserType, name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && name.trim()) {
      onLogin(selectedType, name.trim());
    }
  };

  const userTypes = [
    {
      type: 'customer' as UserType,
      title: 'お客様',
      description: '代行を呼ぶ',
      icon: User,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      type: 'driver' as UserType,
      title: '代行業者',
      description: '代行を提供する',
      icon: Car,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      type: 'restaurant' as UserType,
      title: '飲食店',
      description: 'お客様の代行手配',
      icon: Store,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">代行すぐ来る</h1>
          <p className="text-gray-600">安全で便利な代行運転マッチングサービス</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ユーザータイプを選択
              </label>
              <div className="grid gap-3">
                {userTypes.map(({ type, title, description, icon: Icon, color }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedType === type
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg text-white ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{title}</div>
                        <div className="text-sm text-gray-500">{description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedType && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  お名前
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="山田太郎"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedType || !name.trim()}
              className="w-full btn-primary text-lg"
            >
              ログイン
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>※ このアプリはデモンストレーション用です</p>
        </div>
      </div>
    </div>
  );
}