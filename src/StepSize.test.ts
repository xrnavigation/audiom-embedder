import { describe, it, expect } from 'vitest';
import { StepSize, StepSizeUnit } from './StepSize';

// Test constants
const TEST_VALUES = {
  meters: 100,
  feet: 100,
  miles: 1,
  kilometers: 2
} as const;

const CONVERSION_FACTORS = {
  metersPerKilometer: 1000,
  metersPerMile: 1609.34,
  metersPerFoot: 30.48,
  feetPerMeter: 3.28084
} as const;

describe('StepSize', () => {
  describe('Factory Methods', () => {
    it('should create StepSize from meters', () => {
      const stepSize = StepSize.Meters(100);
      expect(stepSize.value).toBe(100);
      expect(stepSize.unit).toBe(StepSizeUnit.Meters);
      expect(stepSize.toString()).toBe('100m');
    });

    it('should create StepSize from feet', () => {
      const stepSize = StepSize.Feet(100);
      expect(stepSize.value).toBe(100);
      expect(stepSize.unit).toBe(StepSizeUnit.Feet);
      expect(stepSize.toString()).toBe('100ft');
    });

    it('should create StepSize from miles', () => {
      const stepSize = StepSize.Miles(1);
      expect(stepSize.value).toBe(1);
      expect(stepSize.unit).toBe(StepSizeUnit.Miles);
      expect(stepSize.toString()).toBe('1mi');
    });

    it('should create StepSize from kilometers', () => {
      const stepSize = StepSize.Kilometers(2);
      expect(stepSize.value).toBe(2);
      expect(stepSize.unit).toBe(StepSizeUnit.Kilometers);
      expect(stepSize.toString()).toBe('2km');
    });
  });

  describe('parse', () => {
    it('should parse step size string with unit', () => {
      expect(StepSize.parse('100m').toString()).toBe('100m');
      expect(StepSize.parse('50ft').toString()).toBe('50ft');
      expect(StepSize.parse('2mi').toString()).toBe('2mi');
      expect(StepSize.parse('3km').toString()).toBe('3km');
    });

    it('should parse decimal values', () => {
      const stepSize = StepSize.parse('50.5m');
      expect(stepSize.value).toBe(50.5);
    });

    it('should default to meters when no unit specified', () => {
      const stepSize = StepSize.parse('100');
      expect(stepSize.unit).toBe(StepSizeUnit.Meters);
    });

    it('should throw error for invalid format', () => {
      expect(() => StepSize.parse('invalid')).toThrow('Invalid step size format');
    });
  });

  describe('convertTo', () => {
    it('should convert meters to kilometers', () => {
      const stepSize = StepSize.Meters(1500);
      const converted = stepSize.convertTo(StepSizeUnit.Kilometers);
      expect(converted.value).toBe(1.5);
      expect(converted.unit).toBe(StepSizeUnit.Kilometers);
    });

    it('should convert kilometers to meters', () => {
      const stepSize = StepSize.Kilometers(2);
      const converted = stepSize.convertTo(StepSizeUnit.Meters);
      expect(converted.value).toBe(2000);
    });

    it('should convert miles to meters', () => {
      const stepSize = StepSize.Miles(1);
      const converted = stepSize.convertTo(StepSizeUnit.Meters);
      expect(converted.value).toBeCloseTo(1609.34, 2);
    });

    it('should convert feet to meters', () => {
      const stepSize = StepSize.Feet(100);
      const converted = stepSize.convertTo(StepSizeUnit.Meters);
      expect(converted.value).toBeCloseTo(30.48, 2);
    });

    it('should return same unit when converting to same unit', () => {
      const stepSize = StepSize.Meters(100);
      const converted = stepSize.convertTo(StepSizeUnit.Meters);
      expect(converted.value).toBe(100);
      expect(converted.unit).toBe(StepSizeUnit.Meters);
    });
  });

  describe('Conversion Methods', () => {
    it('toMeters should convert to meters', () => {
      expect(StepSize.Kilometers(1).toMeters().value).toBe(1000);
      expect(StepSize.Meters(100).toMeters().value).toBe(100);
      expect(StepSize.Miles(1).toMeters().value).toBeCloseTo(1609.34, 2);
      expect(StepSize.Feet(100).toMeters().value).toBeCloseTo(30.48, 2);
    });

    it('toKilometers should convert to kilometers', () => {
      expect(StepSize.Meters(1000).toKilometers().value).toBe(1);
      expect(StepSize.Kilometers(2).toKilometers().value).toBe(2);
      expect(StepSize.Meters(500).toKilometers().value).toBe(0.5);
    });

    it('toMiles should convert to miles', () => {
      expect(StepSize.Miles(1).toMiles().value).toBe(1);
      expect(StepSize.Meters(1609.34).toMiles().value).toBeCloseTo(1, 2);
      expect(StepSize.Kilometers(1.60934).toMiles().value).toBeCloseTo(1, 2);
    });

    it('toFeet should convert to feet', () => {
      expect(StepSize.Feet(100).toFeet().value).toBe(100);
      expect(StepSize.Meters(30.48).toFeet().value).toBeCloseTo(100, 2);
      expect(StepSize.Meters(1).toFeet().value).toBeCloseTo(3.28084, 2);
    });
  });

  describe('toString', () => {
    it('should return correct string representation for each unit', () => {
      expect(StepSize.Meters(100).toString()).toBe('100m');
      expect(StepSize.Feet(50).toString()).toBe('50ft');
      expect(StepSize.Miles(2).toString()).toBe('2mi');
      expect(StepSize.Kilometers(3).toString()).toBe('3km');
    });
  });
});
