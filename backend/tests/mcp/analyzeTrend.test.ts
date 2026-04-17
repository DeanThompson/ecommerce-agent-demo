/**
 * Integration tests for analyze_trend MCP tool
 */

import { describe, it, expect } from 'vitest';
import { analyzeTrend } from '../../src/mcp/tools/analyzeTrend.js';

describe('analyzeTrend', () => {
  describe('daily period', () => {
    it('should return daily trend data', () => {
      const result = analyzeTrend({
        metric: 'orders',
        period: 'daily',
        start_date: '2018-01-01',
        end_date: '2018-01-31',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('data');
      expect(result.data).toHaveProperty('summary');
      expect(Array.isArray(result.data.data)).toBe(true);
    });
  });

  describe('weekly period', () => {
    it('should return weekly trend data', () => {
      const result = analyzeTrend({
        metric: 'sales',
        period: 'weekly',
        start_date: '2018-01-01',
        end_date: '2018-03-31',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('data');
      expect(Array.isArray(result.data.data)).toBe(true);
    });
  });

  describe('monthly period', () => {
    it('should return monthly trend data', () => {
      const result = analyzeTrend({
        metric: 'orders',
        period: 'monthly',
        start_date: '2017-01-01',
        end_date: '2018-12-31',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('data');
      expect(Array.isArray(result.data.data)).toBe(true);
    });
  });

  describe('quarterly period', () => {
    it('should return quarterly trend data', () => {
      const result = analyzeTrend({
        metric: 'sales',
        period: 'quarterly',
        start_date: '2017-01-01',
        end_date: '2018-12-31',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('data');
      expect(Array.isArray(result.data.data)).toBe(true);
    });
  });

  describe('comparison calculations', () => {
    it('should calculate same_period_last_year comparison when enabled', () => {
      const result = analyzeTrend({
        metric: 'orders',
        period: 'monthly',
        start_date: '2018-01-01',
        end_date: '2018-12-31',
        compare_with: 'same_period_last_year',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('data');
      if (result.data.data.length > 0) {
        // Some items should have comparison data
        const hasComparison = result.data.data.some(d => d.compare_value !== undefined);
        expect(hasComparison).toBe(true);
      }
    });

    it('should calculate previous_period comparison when enabled', () => {
      const result = analyzeTrend({
        metric: 'orders',
        period: 'monthly',
        start_date: '2018-01-01',
        end_date: '2018-06-30',
        compare_with: 'previous_period',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('data');
    });
  });

  describe('metrics', () => {
    it('should support orders metric', () => {
      const result = analyzeTrend({
        metric: 'orders',
        period: 'monthly',
        start_date: '2018-01-01',
        end_date: '2018-03-31',
      });

      expect(result.success).toBe(true);
    });

    it('should support sales metric', () => {
      const result = analyzeTrend({
        metric: 'sales',
        period: 'monthly',
        start_date: '2018-01-01',
        end_date: '2018-03-31',
      });

      expect(result.success).toBe(true);
    });

    it('should support customers metric', () => {
      const result = analyzeTrend({
        metric: 'customers',
        period: 'monthly',
        start_date: '2018-01-01',
        end_date: '2018-03-31',
      });

      expect(result.success).toBe(true);
    });

    it('should support avg_score metric', () => {
      const result = analyzeTrend({
        metric: 'avg_score',
        period: 'monthly',
        start_date: '2018-01-01',
        end_date: '2018-03-31',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('filters', () => {
    it('should filter by state', () => {
      const result = analyzeTrend({
        metric: 'orders',
        period: 'monthly',
        start_date: '2018-01-01',
        end_date: '2018-06-30',
        filters: { state: 'SP' },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('summary', () => {
    it('should include summary statistics', () => {
      const result = analyzeTrend({
        metric: 'orders',
        period: 'monthly',
        start_date: '2018-01-01',
        end_date: '2018-06-30',
      });

      expect(result.success).toBe(true);
      expect(result.data.summary).toHaveProperty('total');
      expect(result.data.summary).toHaveProperty('avg');
      expect(result.data.summary).toHaveProperty('max');
      expect(result.data.summary).toHaveProperty('min');
    });
  });

  describe('error handling', () => {
    it('should return empty data for date range with no data', () => {
      const result = analyzeTrend({
        metric: 'orders',
        period: 'monthly',
        start_date: '2000-01-01',
        end_date: '2000-12-31',
      });

      expect(result.success).toBe(true);
      expect(result.data.data).toEqual([]);
    });
  });
});
