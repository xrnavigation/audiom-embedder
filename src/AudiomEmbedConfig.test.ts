import { describe, it, expect } from 'vitest';
import { AudiomEmbedConfig } from './AudiomEmbedConfig';
import { StepSize } from './StepSize';

describe('AudiomEmbedConfig', () => {
  describe('dynamic', () => {
    it('should create a dynamic embed configuration', () => {
      const config = AudiomEmbedConfig.dynamic({
        apiKey: 'test-key',
        sources: ['osm'],
        center: [-122.1431, 47.6495],
        zoom: 15
      });

      expect(config).toBeDefined();
      const url = config.toUrl();
      expect(url).toContain('embed/dynamic');
      expect(url).toContain('apiKey=test-key');
      expect(url).toContain('sources=osm');
    });

    it('should handle multiple sources', () => {
      const config = AudiomEmbedConfig.dynamic({
        apiKey: 'test-key',
        sources: ['osm', 'google']
      });

      const url = config.toUrl();
      expect(url).toContain('sources=osm,google');
    });

    it('should include step size when provided', () => {
      const config = AudiomEmbedConfig.dynamic({
        apiKey: 'test-key',
        sources: ['osm'],
        stepSize: StepSize.Meters(50)
      });

      const url = config.toUrl();
      expect(url).toContain('stepsize=50m');
    });
  });

  describe('static', () => {
    it('should create a static embed configuration with numeric ID', () => {
        const key = 12345;
        const keyName = 'test-key';
        const config = AudiomEmbedConfig.static(key, keyName);

        const url = config.toUrl();
        expect(url).toContain(`embed/${key}`);
        expect(url).toContain(`apiKey=${keyName}`);
    });

    it('should create a static embed configuration with string ID', () => {
      const config = AudiomEmbedConfig.static(1, 'test-key');

      const url = config.toUrl();
      expect(url).toContain('embed/1');
      expect(url).toContain('apiKey=test-key');
    });

    it('should accept optional parameters', () => {
      const config = AudiomEmbedConfig.static(12345, 'test-key', {
        zoom: 10,
      });

      const url = config.toUrl();
      expect(url).toContain('zoom=10');
    });
  });

  describe('toUrl', () => {
    it('should generate a valid URL', () => {
      const config = AudiomEmbedConfig.dynamic({
        apiKey: 'test-key',
        sources: ['osm']
      });

      const url = config.toUrl();
      expect(url).toMatch(/^https?:\/\//);
    });

    it('should include center coordinates when provided', () => {
      const config = AudiomEmbedConfig.dynamic({
        apiKey: 'test-key',
        sources: ['osm'],
        center: [-122.5, 47.5]
      });

      const url = config.toUrl();
      expect(url).toContain('center=-122.5,47.5');
    });
  });
});
