import { Injectable, Logger } from '@nestjs/common';
import { MapsResult } from '../interfaces/search-result.interface';
import { SearchUrlOptions } from '../builders/search-url.builder';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
  extratags?: Record<string, string>;
}

@Injectable()
export class NominatimProvider {
  private readonly logger = new Logger(NominatimProvider.name);

  async searchPlaces(
    query: string,
    limit: number,
    language: string,
    options: SearchUrlOptions = {},
  ): Promise<MapsResult[]> {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: String(limit),
      'accept-language': language,
    });

    if (options.lat != null && options.lng != null && options.radius) {
      const viewbox = this.viewboxFromRadius(options.lat, options.lng, options.radius);
      params.set('viewbox', `${viewbox.minLng},${viewbox.maxLat},${viewbox.maxLng},${viewbox.minLat}`);
      params.set('bounded', '1');
    } else if (options.lat != null && options.lng != null) {
      params.set('lat', String(options.lat));
      params.set('lon', String(options.lng));
    }

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SerperPlatform/1.0 (contact@serper.local)',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Nominatim HTTP ${response.status}`);
        return [];
      }

      const data = (await response.json()) as NominatimResult[];
      return data.map((item, index) => this.toMapsResult(item, index + 1));
    } catch (error) {
      this.logger.warn(`Nominatim error: ${error}`);
      return [];
    }
  }

  private toMapsResult(item: NominatimResult, position: number): MapsResult {
    const parts = item.display_name.split(',');
    const name = parts[0]?.trim() || item.display_name;

    return {
      name,
      address: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      phone: item.extratags?.phone,
      website: item.extratags?.website,
      category: item.type || item.class,
      position,
    };
  }

  private viewboxFromRadius(lat: number, lng: number, radiusMeters: number) {
    const latDelta = radiusMeters / 111_320;
    const lngDelta = radiusMeters / (111_320 * Math.cos((lat * Math.PI) / 180));

    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  }
}
