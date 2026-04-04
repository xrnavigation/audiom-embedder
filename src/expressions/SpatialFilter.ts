/**
 * Typed spatial filter configuration for Esri feature service queries.
 *
 * Spatial filters constrain query results to features that have a specific
 * spatial relationship with an input geometry (e.g., intersects, within,
 * contains). Optionally includes a distance buffer.
 *
 * @see https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/
 * @see https://developers.arcgis.com/rest/services-reference/enterprise/geometry-objects/
 */

// ── Esri spatial relationship values ────────────────────────────────

export enum SpatialRelationship {
  Intersects = 'esriSpatialRelIntersects',
  Contains = 'esriSpatialRelContains',
  Crosses = 'esriSpatialRelCrosses',
  EnvelopeIntersects = 'esriSpatialRelEnvelopeIntersects',
  IndexIntersects = 'esriSpatialRelIndexIntersects',
  Overlaps = 'esriSpatialRelOverlaps',
  Touches = 'esriSpatialRelTouches',
  Within = 'esriSpatialRelWithin'
}

// ── Esri geometry type values ───────────────────────────────────────

export enum GeometryType {
  Point = 'esriGeometryPoint',
  Multipoint = 'esriGeometryMultipoint',
  Polyline = 'esriGeometryPolyline',
  Polygon = 'esriGeometryPolygon',
  Envelope = 'esriGeometryEnvelope'
}

// ── Distance unit values ────────────────────────────────────────────

export enum DistanceUnit {
  Meter = 'esriSRUnit_Meter',
  Foot = 'esriSRUnit_Foot',
  Kilometer = 'esriSRUnit_Kilometer',
  StatuteMile = 'esriSRUnit_StatuteMile',
  NauticalMile = 'esriSRUnit_NauticalMile'
}

// ── Geometry input types ────────────────────────────────────────────

/**
 * Esri envelope geometry (bounding box).
 */
export interface EsriEnvelope {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference?: { wkid: number };
}

/**
 * Esri point geometry.
 */
export interface EsriPoint {
  x: number;
  y: number;
  spatialReference?: { wkid: number };
}

/**
 * Any Esri geometry JSON object, or a simple comma-delimited string.
 *
 * `EsriEnvelope` and `EsriPoint` cover the most common cases. For more complex
 * geometry types (Polyline with `paths`, Polygon with `rings`, Multipoint with
 * `points`), `Record<string, unknown>` serves as an escape hatch — these
 * structures vary by geometry type and are serialized to JSON for the Esri
 * query API.
 *
 * @see https://developers.arcgis.com/rest/services-reference/enterprise/geometry-objects/
 */
export type GeometryInput = EsriEnvelope | EsriPoint | Record<string, unknown> | string;

// ── Spatial filter interface ────────────────────────────────────────

export interface ISpatialFilter {
  geometry: GeometryInput;
  geometryType: GeometryType;
  spatialRel: SpatialRelationship;
  inSR?: number | { wkid: number };
  distance?: number;
  units?: DistanceUnit;
}

/**
 * Typed spatial filter that serializes to Esri query parameters.
 */
export class SpatialFilter implements ISpatialFilter {
  geometry: GeometryInput;
  geometryType: GeometryType;
  spatialRel: SpatialRelationship;
  inSR?: number | { wkid: number };
  distance?: number;
  units?: DistanceUnit;

  constructor(config: ISpatialFilter) {
    this.geometry = config.geometry;
    this.geometryType = config.geometryType;
    this.spatialRel = config.spatialRel;
    this.inSR = config.inSR;
    this.distance = config.distance;
    this.units = config.units;
  }

  /**
   * Create a spatial filter that finds features intersecting the given geometry.
   */
  static intersects(geometry: GeometryInput, geometryType: GeometryType): SpatialFilter {
    return new SpatialFilter({ geometry, geometryType, spatialRel: SpatialRelationship.Intersects });
  }

  /**
   * Create a spatial filter that finds features contained by the given geometry.
   */
  static contains(geometry: GeometryInput, geometryType: GeometryType): SpatialFilter {
    return new SpatialFilter({ geometry, geometryType, spatialRel: SpatialRelationship.Contains });
  }

  /**
   * Create a spatial filter that finds features within the given geometry.
   */
  static within(geometry: GeometryInput, geometryType: GeometryType): SpatialFilter {
    return new SpatialFilter({ geometry, geometryType, spatialRel: SpatialRelationship.Within });
  }

  /**
   * Create a spatial filter that finds features within a distance of the given geometry.
   */
  static withinDistance(
    geometry: GeometryInput,
    geometryType: GeometryType,
    distance: number,
    units: DistanceUnit = DistanceUnit.Meter
  ): SpatialFilter {
    return new SpatialFilter({
      geometry,
      geometryType,
      spatialRel: SpatialRelationship.Intersects,
      distance,
      units
    });
  }

  /**
   * Create a spatial filter using an envelope (bounding box).
   */
  static fromEnvelope(xmin: number, ymin: number, xmax: number, ymax: number, wkid?: number): SpatialFilter {
    const envelope: EsriEnvelope = { xmin, ymin, xmax, ymax };
    if (wkid) {
      envelope.spatialReference = { wkid };
    }
    return SpatialFilter.intersects(envelope, GeometryType.Envelope);
  }

  /**
   * Convert to Esri query parameters.
   */
  toQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};

    params['geometryType'] = this.geometryType;
    params['spatialRel'] = this.spatialRel;

    if (typeof this.geometry === 'string') {
      params['geometry'] = this.geometry;
    } else {
      params['geometry'] = JSON.stringify(this.geometry);
    }

    if (this.inSR !== undefined) {
      params['inSR'] = typeof this.inSR === 'number'
        ? String(this.inSR)
        : JSON.stringify(this.inSR);
    }

    if (this.distance !== undefined) {
      params['distance'] = String(this.distance);
    }

    if (this.units) {
      params['units'] = this.units;
    }

    return params;
  }
}
