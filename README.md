# Audiom Embed API Client

A strongly-typed TypeScript client library for embedding Audiom inclusive mapping solutions.

## Overview

This library provides a complete set of TypeScript interfaces, classes, and utilities for working with the Audiom Embed API. It offers type safety, autocompletion support, and a clean API for generating embed URLs and handling PostMessage communication.

## Features

- ✅ **Strictly-typed interfaces** for all API parameters
- ✅ **Builder pattern** for easy configuration
- ✅ **Type-safe enums** for constants
- ✅ **URL generation** from configuration objects
- ✅ **PostMessage handler** for iframe communication
- ✅ **Multi-source support** with namespaced parameters
- ✅ **Multi-source query serialization** — Esri SQL, OGC CQL2-Text, Overpass QL
- ✅ **Typed expression builder** with fluent API and SQL parsing
- ✅ **Spatial & temporal filters** — vendor-neutral and source-specific
- ✅ **Step size utilities** with multiple unit support

## Installation

```typescript
import {
  AudiomEmbedConfig,
  AudiomSource,
  Coordinates,
  StepSize,
  MapType,
  AudiomMessageHandler,
  // Expression builder
  field, and, or, not, toEsriSql, parse,
  // Multi-source serializers
  toEsriParams, toOgcParams, toOverpassQuery,
  // Spatial & temporal
  SpatialFilter, bbox, OverpassAroundFilter,
  TimeInstant, TimeExtent, DateTimeInstant, DateTimeInterval
} from 'audiom-embedder';
```

## Quick Start

### Simple Dynamic Embed

```typescript
const config = AudiomEmbedConfig.dynamic({
  apiKey: 'your-api-key-here',
  sources: ['osm'],
  center: Coordinates.create(-122.1431, 47.6495),
  zoom: 15
});

const url = config.toUrl();
// https://audiom-staging.herokuapp.com/embed/dynamic?apiKey=...&sources=osm&center=-122.1431,47.6495&zoom=15
```

### Static Map with Numeric ID

```typescript
const config = AudiomEmbedConfig.static(12345, 'your-api-key-here', {
  zoom: 16,
  showVisualMap: false
});

const url = config.toUrl();
```

### Using StepSize

```typescript
const config = AudiomEmbedConfig.dynamic({
  apiKey: 'your-api-key-here',
  sources: ['osm'],
  center: Coordinates.create(-122.1431, 47.6495),
  stepSize: StepSize.meters(10) // Type-safe step size
});

// Alternative units:
StepSize.kilometers(5);
StepSize.miles(2);
StepSize.feet(100);
StepSize.parse('50m'); // Parse from string
```

## Working with Sources

### Simple Named Sources

```typescript
const config = AudiomEmbedConfig.dynamic({
  apiKey: 'your-api-key',
  sources: ['osm', 'TDEI'] // Simple string array
});
```

### ESRI Feature Services

```typescript
const source = AudiomSource.fromEsri({
  source: 'buildings',
  url: 'https://services.arcgis.com/.../FeatureServer/0',
  name: 'Building Details',
  mapType: MapType.Indoor,
  rules: '/rules/esri-indoor.json'
});

const config = AudiomEmbedConfig.dynamic({
  apiKey: 'your-api-key',
  sources: [source]
});
```

### GeoJSON URLs

```typescript
const source = AudiomSource.fromGeoJsonUrl(
  'https://example.com/data.geojson',
  'Custom Data'
);
```

### OGC API Features (TDEI)

```typescript
const source = AudiomSource.fromOgc({
  source: 'sidewalks',
  url: 'https://tdei.example.com/collections/sidewalks',
  where: field('surface').eq('concrete'),
  bbox: bbox(-122.35, 47.60, -122.30, 47.65),
  datetime: DateTimeInterval.create(
    new Date(Date.UTC(2024, 0, 1)),
    null // open-ended (to present)
  )
});
```

### Overpass / OSM

```typescript
const source = AudiomSource.fromOverpass({
  source: 'cafes',
  where: field('amenity').eq('cafe'),
  bbox: bbox(-122.42, 37.76, -122.38, 37.80),
  aroundFilter: OverpassAroundFilter.aroundPoint(500, 37.78, -122.40)
});
```

### Mixed Source Types

```typescript
const config = AudiomEmbedConfig.dynamic({
  apiKey: 'your-api-key',
  sources: [
    AudiomSource.fromName('osm'),
    AudiomSource.fromEsri({
      source: 'indoor',
      url: 'https://...',
      mapType: MapType.Indoor
    }),
    AudiomSource.fromOgc({
      source: 'sidewalks',
      url: 'https://tdei.example.com/collections/sidewalks'
    }),
    AudiomSource.fromGeoJsonUrl('https://example.com/data.geojson')
  ]
});
```

## Complex Multi-Source Example

This example matches the indoor mapping URL from the documentation:

```typescript
const config = AudiomEmbedConfig.dynamic({
  apiKey: 'wO35blaGsjJREGuXehqWU',
  sources: [
    AudiomSource.fromEsri({
      source: 'details',
      url: 'https://services7.arcgis.com/.../FeatureServer/0',
      name: 'Details',
      mapType: MapType.Indoor,
      rules: '/rules/esri-indoor.json'
    }),
    AudiomSource.fromEsri({
      source: 'units',
      url: 'https://services7.arcgis.com/.../FeatureServer/1',
      name: 'Units',
      mapType: MapType.Indoor,
      rules: '/rules/esri-indoor.json'
    }),
    AudiomSource.fromEsri({
      source: 'levels',
      url: 'https://services7.arcgis.com/.../FeatureServer/2',
      name: 'Levels',
      mapType: MapType.Indoor,
      rules: '/rules/esri-indoor.json'
    })
  ],
  center: Coordinates.create(-117.1945001420124, 34.05679755835778)
});

const url = config.toUrl();
```

## Listening to User Position Updates

```typescript
import {
  AudiomMessageHandler,
  AudiomOutboundEventType
} from 'audiom-embedder';

// Create message handler
const handler = new AudiomMessageHandler(
  'https://audiom-staging.herokuapp.com' // Optional: restrict to origin
);

// Add listener
handler.on(AudiomOutboundEventType.PositionChanged, (payload) => {
  const [longitude, latitude] = payload.position;
  console.log('User moved to:', longitude, latitude);
  // Update your UI, sync with other maps, etc.
});

// Clean up when done
handler.removeAllListeners();
handler.dispose();
```

## Full Configuration Example

```typescript
const config = AudiomEmbedConfig.dynamic({
  apiKey: 'your-api-key-here',
  sources: [
    AudiomSource.fromEsri({
      source: 'buildings',
      url: 'https://example.com/featureserver/0',
      name: 'Building Data',
      mapType: MapType.Indoor
    })
  ],
  center: Coordinates.create(-117.19, 34.06),
  zoom: 18,
  title: 'Campus Indoor Navigation',
  soundpack: '/audio/campus',
  demo: false,
  showVisualMap: true,
  heading: 1,
  showHeading: true,
  stepSize: StepSize.meters(5),
  additionalParams: {
    organizationId: '12345',
    customFlag: true
  }
});

const url = config.toUrl();
```

## Using Custom Base URLs

```typescript
// Development
const devUrl = config.toUrl('https://audiom-dev.herokuapp.com');

// Production
const prodUrl = config.toUrlWithBase('https://audiom.example.com');
```

## API Reference

### Classes

- **`AudiomEmbedConfig`** - Main configuration class for embed maps
- **`AudiomSource`** - Data source configuration (factories: `fromEsri`, `fromOgc`, `fromOverpass`, `fromName`, `fromGeoJsonUrl`)
- **`StepSize`** - Step size with unit support
- **`Coordinates`** - Geographic coordinate (longitude, latitude)
- **`GeoQuad`** - Geographic quadrilateral (4 corners)
- **`AudiomMessageHandler`** - Bidirectional PostMessage communication handler
- **`SpatialFilter`** - Esri spatial query filter
- **`OverpassAroundFilter`** - Overpass proximity filter
- **`TimeInstant`** / **`TimeExtent`** - Esri temporal filters (epoch-based)
- **`DateTimeInstant`** / **`DateTimeInterval`** - Vendor-neutral temporal filters (Date-based)

### Serializers

- **`toEsriSql(expr)`** - Expression → Esri SQL-92 WHERE clause
- **`toCql2Text(expr)`** - Expression → OGC CQL2-Text
- **`toOverpassFilters(expr)`** - Expression → Overpass QL tag filters
- **`toEsriParams(options)`** - Full Esri REST query parameters
- **`toOgcParams(options)`** - Full OGC API Features parameters
- **`toOverpassQuery(options)`** - Complete Overpass QL query body

### Enums

- **`MapType`** - `Travel`, `Heatmap`, `Indoor`
- **`SourceType`** - `OSM`, `TDEI`, `ESRI`, `GeoJSON`
- **`StepSizeUnit`** - `Kilometers`, `Meters`, `Miles`, `Feet`
- **`VisualStyle`** - `Geology`, `Indoor`, `Outdoor`, `Travel`
- **`FilterMode`** - `Global`, `Scan`
- **`SpatialRelationship`** - `Intersects`, `Contains`, `Within`, etc.
- **`GeometryType`** - `Point`, `Multipoint`, `Polyline`, `Polygon`, `Envelope`
- **`SortOrder`** - `Ascending`, `Descending`
- **`OverpassElementType`** - `Node`, `Way`, `Relation`, `Nwr`

### Types

- **`IAudiomEmbedConfig`** - Configuration interface
- **`IAudiomSource`** - Source interface
- **`BoundingBox`** - Vendor-neutral bounding box (`{ west, south, east, north }`)
- **`Expression`** - Discriminated union of filter expression AST nodes
- **`AudiomOutboundMessage`** - Discriminated union of all outbound event messages
- **`AudiomInboundCommand`** - Discriminated union of all inbound command messages

## Type Safety

All parameters are strongly typed with TypeScript:

```typescript
const config: AudiomEmbedConfig = AudiomEmbedConfig.dynamic({
  apiKey: 'key',
  heading: 1, // ✅ Valid (1-6)
  // heading: 7, // ❌ TypeScript error
  
  center: Coordinates.create(-122.14, 47.65), // ✅ Coordinates object
  
  visualStyle: VisualStyle.Indoor, // ✅ Type-safe enum
  // visualStyle: 'invalid', // ❌ TypeScript error
});
```

## Error Handling

```typescript
try {
  // Invalid step size
  const stepSize = StepSize.parse('invalid');
} catch (error) {
  console.error('Invalid step size format:', error.message);
}

try {
  // Negative step size
  const stepSize = StepSize.meters(-5);
} catch (error) {
  console.error('Step size must be positive:', error.message);
}
```

## License

See project license.
