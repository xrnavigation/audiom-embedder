import { describe, it, expect } from 'vitest';
import { AudiomSource, SourceType, MapType } from './AudiomSource';
import { field } from './expressions/AttributeFilter';

describe('AudiomSource', () => {
  describe('constructor', () => {
    it('assigns all config properties', () => {
      const whereExpr = field('type').eq('building');
      const src = new AudiomSource({
        source: 'mySource',
        type: SourceType.ESRI,
        mapType: MapType.Indoor,
        name: 'My Source',
        url: 'https://example.com/service',
        rules: '/rules.json',
        where: whereExpr,
        additionalParams: { foo: 'bar' }
      });

      expect(src.source).toBe('mySource');
      expect(src.type).toBe(SourceType.ESRI);
      expect(src.mapType).toBe(MapType.Indoor);
      expect(src.name).toBe('My Source');
      expect(src.url).toBe('https://example.com/service');
      expect(src.rules).toBe('/rules.json');
      expect(src.where).toBe(whereExpr);
      expect(src.additionalParams).toEqual({ foo: 'bar' });
    });

    it('leaves optional properties undefined when not provided', () => {
      const src = new AudiomSource({ source: 'osm' });
      expect(src.source).toBe('osm');
      expect(src.type).toBeUndefined();
      expect(src.mapType).toBeUndefined();
      expect(src.name).toBeUndefined();
      expect(src.url).toBeUndefined();
      expect(src.rules).toBeUndefined();
      expect(src.where).toBeUndefined();
      expect(src.additionalParams).toBeUndefined();
    });
  });

  describe('fromName', () => {
    it('creates a source with just a name', () => {
      const src = AudiomSource.fromName('osm');
      expect(src.source).toBe('osm');
      expect(src.type).toBeUndefined();
    });
  });

  describe('fromGeoJsonUrl', () => {
    it('creates a GeoJSON source from URL', () => {
      const src = AudiomSource.fromGeoJsonUrl('https://example.com/data.geojson');
      expect(src.source).toBe('https://example.com/data.geojson');
      expect(src.type).toBe(SourceType.GeoJSON);
      expect(src.name).toBeUndefined();
    });

    it('accepts an optional display name', () => {
      const src = AudiomSource.fromGeoJsonUrl('https://example.com/data.geojson', 'My GeoJSON');
      expect(src.name).toBe('My GeoJSON');
    });
  });

  describe('fromEsri', () => {
    it('creates an ESRI source', () => {
      const whereExpr = field('type').eq('commercial');
      const src = AudiomSource.fromEsri({
        source: 'buildings',
        url: 'https://services.arcgis.com/layer',
        name: 'Buildings',
        mapType: MapType.Indoor,
        rules: '/rules.json',
        where: whereExpr
      });

      expect(src.source).toBe('buildings');
      expect(src.type).toBe(SourceType.ESRI);
      expect(src.url).toBe('https://services.arcgis.com/layer');
      expect(src.name).toBe('Buildings');
      expect(src.mapType).toBe(MapType.Indoor);
      expect(src.rules).toBe('/rules.json');
      expect(src.where).toBe(whereExpr);
    });

    it('works with only required fields', () => {
      const src = AudiomSource.fromEsri({ source: 'layer1', url: 'https://example.com' });
      expect(src.type).toBe(SourceType.ESRI);
      expect(src.name).toBeUndefined();
    });
  });

  describe('toQueryParams', () => {
    it('returns empty object for a source with no optional params', () => {
      const src = AudiomSource.fromName('osm');
      expect(src.toQueryParams()).toEqual({});
    });

    it('namespaces all parameters with the source name', () => {
      const src = new AudiomSource({
        source: 'mySource',
        type: SourceType.GeoJSON,
        mapType: MapType.Travel,
        name: 'Display Name',
        url: 'https://example.com/data',
        rules: '/rules.json',
        where: field('status').eq('active')
      });

      const params = src.toQueryParams();
      expect(params['mySource.type']).toBe('geojson');
      expect(params['mySource.mapType']).toBe('travel');
      expect(params['mySource.name']).toBe('Display Name');
      expect(params['mySource.url']).toBe('https://example.com/data');
      expect(params['mySource.rules']).toBe('/rules.json');
      expect(params['mySource.where']).toBe("status = 'active'");
    });

    it('includes additionalParams with namespaced keys', () => {
      const src = new AudiomSource({
        source: 'src',
        additionalParams: { custom: 'value', count: 5, enabled: true }
      });

      const params = src.toQueryParams();
      expect(params['src.custom']).toBe('value');
      expect(params['src.count']).toBe('5');
      expect(params['src.enabled']).toBe('true');
    });
  });
});

// ── Enum values ─────────────────────────────────────────────────────

describe('MapType', () => {
  it('has expected string values', () => {
    expect(MapType.Travel).toBe('travel');
    expect(MapType.Heatmap).toBe('heatmap');
    expect(MapType.Indoor).toBe('indoor');
  });
});

describe('SourceType', () => {
  it('has expected string values', () => {
    expect(SourceType.OSM).toBe('osm');
    expect(SourceType.TDEI).toBe('TDEI');
    expect(SourceType.ESRI).toBe('esri');
    expect(SourceType.GeoJSON).toBe('geojson');
  });
});
