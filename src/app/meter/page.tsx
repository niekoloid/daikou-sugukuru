'use client';

import { useEffect, useState } from 'react';
import DrivingMeter from '@/components/Driver/DrivingMeter';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MeterPage() {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 画面の向きを固定しない（縦横両対応）
    if (screen.orientation) {
      screen.orientation.unlock();
    }

    // スリープを防ぐ（Wake Lock API）
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock failed:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.log('Fullscreen failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.log('Exit fullscreen failed:', err);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* ヘッダー（非フルスクリーン時のみ表示） */}
      {!isFullscreen && (
        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-white hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            戻る
          </button>
          
          <h1 className="text-white text-lg font-semibold">料金メーター</h1>
          
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-300"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* メーター本体 */}
      <div className={`${isFullscreen ? 'h-screen' : 'min-h-[calc(100vh-80px)]'}`}>
        <DrivingMeter
          onStart={() => {
            console.log('メーター開始');
            // バイブレーション
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          }}
          onPause={() => {
            console.log('メーター一時停止');
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
          }}
          onStop={() => {
            console.log('メーター停止');
            if (navigator.vibrate) {
              navigator.vibrate([300, 100, 300]);
            }
          }}
          className="h-full"
        />
      </div>

      {/* フルスクリーン時の終了ボタン */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleFullscreen}
            className="bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}