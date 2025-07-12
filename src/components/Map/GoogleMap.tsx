'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Position } from '@/types';

interface MapMarker {
  id: string;
  position: Position;
  title: string;
  type: 'customer' | 'driver' | 'restaurant' | 'destination';
  info?: string;
}

interface GoogleMapProps {
  center: Position;
  markers?: MapMarker[];
  zoom?: number;
  className?: string;
  onMapClick?: (position: Position) => void;
}

const markerIcons = {
  customer: {
    fillColor: '#3B82F6',
    strokeColor: '#1E40AF',
    text: '客',
  },
  driver: {
    fillColor: '#10B981',
    strokeColor: '#047857',
    text: '車',
  },
  restaurant: {
    fillColor: '#8B5CF6',
    strokeColor: '#5B21B6',
    text: '店',
  },
  destination: {
    fillColor: '#EF4444',
    strokeColor: '#B91C1C',
    text: '家',
  },
};

export default function GoogleMap({
  center,
  markers = [],
  zoom = 15,
  className = '',
  onMapClick,
}: GoogleMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }],
        },
      ],
    });

    if (onMapClick) {
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          onMapClick({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
        }
      });
    }

    mapInstanceRef.current = map;
    setIsMapReady(true);
  }, [isLoaded, loadError, center, zoom, onMapClick]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    markers.forEach((markerData) => {
      const iconConfig = markerIcons[markerData.type];
      
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current,
        title: markerData.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: iconConfig.fillColor,
          fillOpacity: 0.8,
          strokeColor: iconConfig.strokeColor,
          strokeWeight: 2,
          scale: 15,
        },
        label: {
          text: iconConfig.text,
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      });

      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${markerData.title}</h3>
              <p class="text-sm text-gray-600">${markerData.info}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, isMapReady]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center]);

  if (loadError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <p className="text-red-600 font-medium">地図の読み込みに失敗しました</p>
          <p className="text-sm text-gray-500 mt-2">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
}