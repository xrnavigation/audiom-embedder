/**
 * Serialize an Expression AST to an Esri SQL-92 WHERE clause string.
 *
 * @see https://developers.arcgis.com/rest/services-reference/enterprise/sql-reference-for-query-expressions-used-in-the-arcgis-rest-api/
 */

import { Expression, ExpressionType, ComparisonExpr, LogicalExpr, LikeExpr, InExpr, BetweenExpr, IsNullExpr, LiteralValue } from './Expression';

// ── SQL keyword constants ───────────────────────────────────────────

enum SqlKeyword {
  Null = 'NULL',
  Not = 'NOT',
  And = 'AND',
  Like = 'LIKE',
  NotLike = 'NOT LIKE',
  In = 'IN',
  NotIn = 'NOT IN',
  Between = 'BETWEEN',
  NotBetween = 'NOT BETWEEN',
  IsNull = 'IS NULL',
  IsNotNull = 'IS NOT NULL',
  Timestamp = 'TIMESTAMP',
}

const SINGLE_QUOTE_PATTERN = /'/g;

/**
 * Serialize a literal value to its SQL string representation.
 */
function literalToString(value: LiteralValue): string {
  if (value === null) {
    return SqlKeyword.Null;
  }
  if (typeof value === 'string') {
    // Escape single quotes by doubling them (SQL-92 standard)
    return `'${value.replace(SINGLE_QUOTE_PATTERN, "''")}'`;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  if (value instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = value.getUTCFullYear();
    const MM = pad(value.getUTCMonth() + 1);
    const dd = pad(value.getUTCDate());
    const HH = pad(value.getUTCHours());
    const mm = pad(value.getUTCMinutes());
    const ss = pad(value.getUTCSeconds());
    return `${SqlKeyword.Timestamp} '${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}'`;
  }
  return String(value);
}

function comparisonToString(expr: ComparisonExpr): string {
  return `${expr.field} ${expr.op} ${literalToString(expr.value)}`;
}

function logicalToString(expr: LogicalExpr): string {
  const parts = expr.children.map(child => {
    const serialized = toString(child);
    // Wrap child logical expressions of lower precedence in parens
    if (child.type === 'logical' && child.op !== expr.op) {
      return `(${serialized})`;
    }
    return serialized;
  });
  return parts.join(` ${expr.op} `);
}

function likeToString(expr: LikeExpr): string {
  const op = expr.not ? SqlKeyword.NotLike : SqlKeyword.Like;
  return `${expr.field} ${op} '${expr.pattern.replace(SINGLE_QUOTE_PATTERN, "''")}'`;
}

function inToString(expr: InExpr): string {
  const op = expr.not ? SqlKeyword.NotIn : SqlKeyword.In;
  const vals = expr.values.map(literalToString).join(', ');
  return `${expr.field} ${op} (${vals})`;
}

function betweenToString(expr: BetweenExpr): string {
  const op = expr.not ? SqlKeyword.NotBetween : SqlKeyword.Between;
  return `${expr.field} ${op} ${literalToString(expr.low)} ${SqlKeyword.And} ${literalToString(expr.high)}`;
}

function isNullToString(expr: IsNullExpr): string {
  return expr.not
    ? `${expr.field} ${SqlKeyword.IsNotNull}`
    : `${expr.field} ${SqlKeyword.IsNull}`;
}

/**
 * Serialize an Expression AST node to an Esri SQL-92 string.
 */
export function toString(expr: Expression): string {
  switch (expr.type) {
    case ExpressionType.Comparison:
      return comparisonToString(expr);
    case ExpressionType.Logical:
      return logicalToString(expr);
    case ExpressionType.Not:
      return `${SqlKeyword.Not} (${toString(expr.child)})`;
    case ExpressionType.Like:
      return likeToString(expr);
    case ExpressionType.In:
      return inToString(expr);
    case ExpressionType.Between:
      return betweenToString(expr);
    case ExpressionType.IsNull:
      return isNullToString(expr);
    case ExpressionType.Raw:
      return expr.sql;
  }
}
