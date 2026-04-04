# Audiom Embed API Client

A strongly-typed TypeScript client library for embedding Audiom inclusive mapping solutions.

## Overview

This library provides a complete set of TypeScript interfaces, classes, and utilities for working with the Audiom Embed API. It offers type safety, autocompletion support, and a clean API for generating embed URLs and handling bidirectional PostMessage communication.

## Features

- ✅ **Strictly-typed interfaces** for all API parameters
- ✅ **Builder pattern** for easy configuration
- ✅ **Type-safe enums** for constants
- ✅ **URL generation** from configuration objects
- ✅ **Bidirectional PostMessage API** for iframe communication
- ✅ **Multi-source support** with namespaced parameters
- ✅ **Step size utilities** with multiple unit support
- ✅ **Feature filters** with global and scan modes

## Installation

```typescript
import {
  AudiomEmbedConfig,
  AudiomSource,
  StepSize,
  MapType,
  FilterMode,
  VisualStyle,
  AudiomMessageHandler,
  AudiomOutboundEventType,
  AudiomInboundCommandType
} from './audiom-client';
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
    AudiomSource.fromGeoJsonUrl('https://example.com/data.geojson')
  ]
});
```

## Filters

```typescript
// Filter features by type in the URL
const config = AudiomEmbedConfig.dynamic({
  apiKey: 'your-api-key',
  sources: ['osm'],
  filters: ['walls', 'poi', 'building'],
  filterMode: FilterMode.Global // or FilterMode.Scan (default)
});
// Produces: &filters=walls,poi,building&filterMode=global
```

## Expression Filters (WHERE Clauses)

For sources that support query filtering (e.g., Esri feature services), you can build typed WHERE clause expressions using the fluent builder API, or parse raw SQL strings.

### Building Expressions

```typescript
import { field, and, or, not, raw, toString, parse } from 'audiom-embedder';

// Simple comparison
const expr = field('status').eq('active');
// → status = 'active'

// Numeric comparisons
field('height').gt(100);       // height > 100
field('floors').gte(10);       // floors >= 10
field('population').lt(5000);  // population < 5000
field('score').lte(99);        // score <= 99
field('type').neq('deleted');  // type <> 'deleted'
```

### Compound Expressions

```typescript
// AND / OR
const expr = and(
  field('type').eq('building'),
  or(
    field('height').gt(100),
    field('floors').gte(10)
  )
);
toString(expr);
// → type = 'building' AND (height > 100 OR floors >= 10)

// NOT
toString(not(field('status').eq('demolished')));
// → NOT (status = 'demolished')
```

### Pattern Matching, Sets, and Ranges

```typescript
// LIKE / NOT LIKE
field('name').like('Main%');        // name LIKE 'Main%'
field('name').notLike('%test%');     // name NOT LIKE '%test%'

// IN / NOT IN
field('category').in(['residential', 'commercial']);
// → category IN ('residential', 'commercial')

field('id').notIn([1, 2, 3]);
// → id NOT IN (1, 2, 3)

// BETWEEN / NOT BETWEEN
field('population').between(1000, 50000);
// → population BETWEEN 1000 AND 50000

// IS NULL / IS NOT NULL
field('notes').isNull();       // notes IS NULL
field('notes').isNotNull();    // notes IS NOT NULL
```

### Date Expressions

```typescript
// Date values serialize as TIMESTAMP literals
const cutoff = new Date(Date.UTC(2024, 0, 15, 10, 30, 0));
toString(field('created').gt(cutoff));
// → created > TIMESTAMP '2024-01-15 10:30:00'
```

### Raw SQL Escape Hatch

For vendor-specific syntax not covered by the typed builder:

```typescript
// ⚠️ Never pass untrusted user input to raw()
const expr = raw("position(current_user in workersfield) > 0");
toString(expr);
// → position(current_user in workersfield) > 0
```

### Parsing SQL Strings

Parse existing SQL WHERE clauses into the typed AST:

```typescript
const expr = parse("type = 'building' AND status = 'active'");
// → LogicalExpr { op: 'AND', children: [ComparisonExpr, ComparisonExpr] }

// Round-trip: parse then serialize
toString(parse("name LIKE 'Main%'"));
// → name LIKE 'Main%'

// Unparseable syntax falls back to RawExpr instead of throwing
parse("SOME_FUNC(a, b)");
// → RawExpr { sql: 'SOME_FUNC(a, b)' }
```

### Applying Expressions to Sources

```typescript
const source = AudiomSource.fromEsri({
  source: 'buildings',
  url: 'https://services.arcgis.com/.../FeatureServer/0',
  where: and(
    field('status').eq('active'),
    field('floors').gte(3)
  )
});
// Serializes to: buildings.where=status%20%3D%20'active'%20AND%20floors%20%3E%3D%203
```

### Spatial Filters

Constrain queries to features with a specific spatial relationship to an input geometry:

```typescript
import { SpatialFilter, GeometryType, DistanceUnit } from 'audiom-embedder';

// Bounding box intersection
const bbox = SpatialFilter.fromEnvelope(-123, 37, -122, 38, 4326);

// Point with distance buffer
const nearby = SpatialFilter.withinDistance(
  { x: -122.4, y: 37.8 },
  GeometryType.Point,
  1000,
  DistanceUnit.Meter
);

// Apply to a source
const source = AudiomSource.fromEsri({
  source: 'poi',
  url: 'https://services.arcgis.com/.../FeatureServer/0',
  spatialFilter: nearby
});
```

### Temporal Filters

Filter time-aware layers by instant or range:

```typescript
import { TimeInstant, TimeExtent } from 'audiom-embedder';

// Single point in time
const instant = TimeInstant.fromDate(new Date(Date.UTC(2024, 6, 1)));

// Time range
const range = TimeExtent.fromDates(
  new Date(Date.UTC(2024, 0, 1)),
  new Date(Date.UTC(2024, 11, 31))
);

// Open-ended range (from a date to present)
const since = TimeExtent.fromDates(new Date(Date.UTC(2024, 0, 1)), null);

// Apply to a source
const source = AudiomSource.fromEsri({
  source: 'events',
  url: 'https://services.arcgis.com/.../FeatureServer/0',
  time: range
});
```

## PostMessage API

The PostMessage API enables bidirectional communication between your app and an embedded Audiom map. It must be enabled by specifying `allowedOrigins`.

### Enabling the API

```typescript
const config = AudiomEmbedConfig.dynamic({
  apiKey: 'your-api-key',
  sources: ['osm'],
  latitude: 47.6495,
  longitude: -122.1431,
  allowedOrigins: ['https://myapp.com', 'https://staging.myapp.com']
  // or allowedOrigins: '*' for development
});
```

### Listening for Events

```typescript
const handler = new AudiomMessageHandler('https://your-audiom-instance.com');

// Embed is ready
handler.on(AudiomOutboundEventType.Ready, (payload) => {
  console.log('Audiom ready, API version:', payload.apiVersion);
});

// Avatar moved
handler.on(AudiomOutboundEventType.PositionChanged, (payload) => {
  const [lng, lat] = payload.position;
  console.log('User moved to:', lng, lat);
});

// Avatar entered features
handler.on(AudiomOutboundEventType.FeatureEntered, (payload) => {
  payload.features.forEach(f => {
    console.log(`Entered ${f.type}: ${f.name}`);
  });
});

// Avatar exited features  
handler.on(AudiomOutboundEventType.FeatureExited, (payload) => {
  payload.features.forEach(f => console.log('Exited:', f.id));
});

// State query response
handler.on(AudiomOutboundEventType.StateChanged, (payload) => {
  console.log('Current position:', payload.position);
});

// Errors
handler.on(AudiomOutboundEventType.Error, (payload) => {
  console.error(`Audiom error [${payload.code}]:`, payload.message);
});

// Remove a specific listener
handler.off(AudiomOutboundEventType.PositionChanged, myListener);

// Clean up
handler.dispose();
```

### Sending Commands

```typescript
const iframe = document.getElementById('audiom-embed') as HTMLIFrameElement;
const audiomOrigin = 'https://your-audiom-instance.com';

// Move the avatar
handler.moveAvatar(iframe, [-122.4194, 37.7749], audiomOrigin);
// Or with Coordinates:
handler.moveAvatar(iframe, Coordinates.create(-122.4194, 37.7749), audiomOrigin);

// Query current position (responds with stateChanged event)
handler.getState(iframe, audiomOrigin);

// Query enclosing features (responds with featureSelected event)
handler.getEnclosingFeatures(iframe, audiomOrigin);

// Set filters
handler.setFilters(iframe, {
  global: ['building', 'park'],
  scan: ['poi', 'transit']
}, audiomOrigin);

// Execute a keyboard command
handler.executeCommand(iframe, 'announcePosition', audiomOrigin);
// Common commands: 'up', 'down', 'left', 'right', 'toggleSonar', 'announcePosition'
```

## Complex Multi-Source Example

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
  filters: ['walls', 'poi'],
  filterMode: FilterMode.Scan,
  visualStyle: VisualStyle.Indoor,
  allowedOrigins: ['https://myapp.com'],
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
- **`AudiomSource`** - Data source configuration
- **`StepSize`** - Step size with unit support
- **`Coordinates`** - Geographic coordinate (longitude, latitude)
- **`GeoQuad`** - Geographic quadrilateral (4 corners)
- **`AudiomMessageHandler`** - Bidirectional PostMessage communication handler

### Enums

- **`MapType`** - `Travel`, `Heatmap`, `Indoor`
- **`SourceType`** - `OSM`, `TDEI`, `ESRI`, `GeoJSON`
- **`StepSizeUnit`** - `Kilometers`, `Meters`, `Miles`, `Feet`
- **`VisualStyle`** - `Geology`, `Indoor`, `Outdoor`, `Travel`
- **`FilterMode`** - `Global`, `Scan`
- **`AudiomOutboundEventType`** - `Ready`, `PositionChanged`, `FeatureEntered`, `FeatureExited`, `FeatureSelected`, `StateChanged`, `Error`
- **`AudiomInboundCommandType`** - `MoveAvatar`, `GetState`, `GetEnclosingFeatures`, `SetFilters`, `ExecuteCommand`
- **`AudiomErrorCode`** - `INVALID_ORIGIN`, `INVALID_MESSAGE`, `UNKNOWN_COMMAND`, `COMMAND_FAILED`, `NOT_READY`

### Interfaces

- **`IAudiomEmbedConfig`** - Configuration interface
- **`IAudiomSource`** - Source interface
- **`IVisualBaseLayer`** - Visual base layer configuration
- **`IFeaturePayload`** - Map feature payload in PostMessage events
- **`ISetFiltersPayload`** - Filter configuration for PostMessage commands
- **`AudiomEventPayloadMap`** - Type map for event payloads

### Types

- **`AudiomOutboundMessage`** - Discriminated union of all outbound event messages
- **`AudiomInboundCommand`** - Discriminated union of all inbound command messages
- **`AudiomEventListener<T>`** - Typed listener callback for a specific event type

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
  
  filterMode: FilterMode.Global, // ✅ Type-safe enum
});

// Typed event listeners
handler.on(AudiomOutboundEventType.PositionChanged, (payload) => {
  // payload is typed as IPositionChangedPayload
  const [lng, lat] = payload.position; // ✅ [number, number]
});

handler.on(AudiomOutboundEventType.FeatureEntered, (payload) => {
  // payload is typed as IFeatureEnteredPayload
  payload.features[0].name; // ✅ string
  payload.features[0].properties; // ✅ Record<string, unknown>
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
