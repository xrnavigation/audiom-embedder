import { Expression } from './expressions/Expression';
import { toString } from './expressions/Serialize';
import { SpatialFilter } from './expressions/SpatialFilter';
import { TimeInstant, TimeExtent } from './expressions/TemporalFilter';
import { OrderByField, PaginationOptions, orderByFieldsToString } from './expressions/QueryOptions';

/**
 * Map type for rendering sources
 */
export enum MapType {
  Travel = 'travel',
  Heatmap = 'heatmap',
  Indoor = 'indoor'
}

/**
 * Source loader type
 */
export enum SourceType {
  OSM = 'osm',
  TDEI = 'TDEI',
  ESRI = 'esri',
  GeoJSON = 'geojson'
}

/**
 * Interface for a single Audiom data source
 */
export interface IAudiomSource {
  /**
   * Source name or URL to GeoJSON data
   */
  source: string;

  /**
   * Override the source loader type
   */
  type?: SourceType | string;

  /**
   * Override the map rendering type for this source
   */
  mapType?: MapType;

  /**
   * Custom display name for the source
   */
  name?: string;

  /**
   * URL for dynamic sources (required for ESRI type)
   */
  url?: string;

  /**
   * Path to rules file for this source
   */
  rules?: string;

  /**
   * Where clause / definition expression to filter features.
   * Use `parse()` to convert raw SQL strings, or the fluent builder
   * (`field('name').eq('value')`) to construct expressions.
   */
  where?: Expression;

  /**
   * Spatial filter for geometry-based queries (Esri sources)
   */
  spatialFilter?: SpatialFilter;

  /**
   * Temporal filter for time-aware layers (Esri sources)
   */
  time?: TimeInstant | TimeExtent;

  /**
   * Limit which fields/properties are returned in results.
   * Pass `['*']` to return all fields.
   *
   * @see https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/
   */
  outFields?: string[];

  /**
   * Sort results by one or more fields.
   * Use `orderBy('field', SortOrder.Descending)` to build entries.
   */
  orderByFields?: OrderByField[];

  /**
   * Pagination options: limit and offset for result sets.
   */
  pagination?: PaginationOptions;

  /**
   * Additional custom parameters for the source
   */
  additionalParams?: Record<string, string | number | boolean>;
}

/**
 * Single Audiom data source configuration
 */
export class AudiomSource implements IAudiomSource {
  source: string;
  type?: SourceType | string;
  mapType?: MapType;
  name?: string;
  url?: string;
  rules?: string;
  where?: Expression;
  spatialFilter?: SpatialFilter;
  time?: TimeInstant | TimeExtent;
  outFields?: string[];
  orderByFields?: OrderByField[];
  pagination?: PaginationOptions;
  additionalParams?: Record<string, string | number | boolean>;

  constructor(config: IAudiomSource) {
    this.source = config.source;
    this.type = config.type;
    this.mapType = config.mapType;
    this.name = config.name;
    this.url = config.url;
    this.rules = config.rules;
    this.where = config.where;
    this.spatialFilter = config.spatialFilter;
    this.time = config.time;
    this.outFields = config.outFields;
    this.orderByFields = config.orderByFields;
    this.pagination = config.pagination;
    this.additionalParams = config.additionalParams;
  }

  /**
   * Create a simple source by name (e.g., "osm", "TDEI")
   */
  static fromName(sourceName: string): AudiomSource {
    return new AudiomSource({ source: sourceName });
  }

  /**
   * Create a source from a GeoJSON URL
   */
  static fromGeoJsonUrl(url: string, name?: string): AudiomSource {
    return new AudiomSource({
      source: url,
      type: SourceType.GeoJSON,
      name
    });
  }

  /**
   * Create an ESRI feature service source
   */
  static fromEsri(config: {
    source: string;
    url: string;
    name?: string;
    mapType?: MapType;
    rules?: string;
    where?: Expression;
    spatialFilter?: SpatialFilter;
    time?: TimeInstant | TimeExtent;
    outFields?: string[];
    orderByFields?: OrderByField[];
    pagination?: PaginationOptions;
  }): AudiomSource {
    return new AudiomSource({
      source: config.source,
      type: SourceType.ESRI,
      url: config.url,
      name: config.name,
      mapType: config.mapType,
      rules: config.rules,
      where: config.where,
      spatialFilter: config.spatialFilter,
      time: config.time,
      outFields: config.outFields,
      orderByFields: config.orderByFields,
      pagination: config.pagination,
    });
  }

  /**
   * Convert to URL query parameters
   * Returns an object with namespaced parameters for multi-source configuration
   */
  toQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};

    const sourceName = this.source;

    if (this.type) {
      params[`${sourceName}.type`] = this.type;
    }
    if (this.mapType) {
      params[`${sourceName}.mapType`] = this.mapType;
    }
    if (this.name) {
      params[`${sourceName}.name`] = this.name;
    }
    if (this.url) {
      params[`${sourceName}.url`] = this.url;
    }
    if (this.rules) {
      params[`${sourceName}.rules`] = this.rules;
    }
    if (this.where) {
      params[`${sourceName}.where`] = toString(this.where);
    }
    if (this.spatialFilter) {
      const spatialParams = this.spatialFilter.toQueryParams();
      Object.entries(spatialParams).forEach(([key, value]) => {
        params[`${sourceName}.${key}`] = value;
      });
    }
    if (this.time) {
      params[`${sourceName}.time`] = this.time.toQueryParam();
    }
    if (this.outFields && this.outFields.length > 0) {
      params[`${sourceName}.outFields`] = this.outFields.join(',');
    }
    if (this.orderByFields && this.orderByFields.length > 0) {
      params[`${sourceName}.orderByFields`] = orderByFieldsToString(this.orderByFields);
    }
    if (this.pagination) {
      params[`${sourceName}.resultRecordCount`] = String(this.pagination.count);
      if (this.pagination.offset !== undefined) {
        params[`${sourceName}.resultOffset`] = String(this.pagination.offset);
      }
    }
    if (this.additionalParams) {
      Object.entries(this.additionalParams).forEach(([key, value]) => {
        params[`${sourceName}.${key}`] = String(value);
      });
    }

    return params;
  }
}
