// Barrel exports for the expressions module

export type {
  Expression,
  ComparisonExpr,
  LogicalExpr,
  NotExpr,
  LikeExpr,
  InExpr,
  BetweenExpr,
  IsNullExpr,
  RawExpr,
  LiteralValue
} from './Expression';
export { ComparisonOp, LogicalOp, ExpressionType } from './Expression';

export { FieldRef, field, and, or, not, raw } from './AttributeFilter';

export {
  SpatialRelationship,
  GeometryType,
  DistanceUnit,
  SpatialFilter
} from './SpatialFilter';
export type { ISpatialFilter, EsriEnvelope, EsriPoint, GeometryInput } from './SpatialFilter';

export {
  TimeInstant,
  TimeExtent,
  IntervalUnit,
  CompoundIntervalUnit,
  interval,
  intervalToString
} from './TemporalFilter';
export type { IntervalExpression } from './TemporalFilter';

export { toString } from './Serialize';
export { parse } from './parsing';

export {
  SortOrder,
  orderBy,
  orderByFieldsToString
} from './QueryOptions';
export type { OrderByField, PaginationOptions } from './QueryOptions';
