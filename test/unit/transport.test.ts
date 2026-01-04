/**
 * Unit tests for AfterShip Transport Layer
 */

import {
  buildTrackingIdentifier,
  formatTrackingData,
  formatAddressData,
  formatParcelData,
} from '../../nodes/AfterShip/transport';

describe('AfterShip Transport Layer', () => {
  describe('buildTrackingIdentifier', () => {
    it('should build identifier from tracking ID', () => {
      const result = buildTrackingIdentifier('track123', undefined, undefined);
      expect(result).toBe('/track123');
    });

    it('should build identifier from slug and tracking number', () => {
      const result = buildTrackingIdentifier(undefined, 'fedex', '1234567890');
      expect(result).toBe('/fedex/1234567890');
    });

    it('should throw error when both trackingId and slug/number are missing', () => {
      expect(() => {
        buildTrackingIdentifier(undefined, undefined, undefined);
      }).toThrow('Either trackingId or both slug and trackingNumber must be provided');
    });

    it('should throw error when slug is provided but tracking number is missing', () => {
      expect(() => {
        buildTrackingIdentifier(undefined, 'fedex', undefined);
      }).toThrow('Either trackingId or both slug and trackingNumber must be provided');
    });

    it('should throw error when tracking number is provided but slug is missing', () => {
      expect(() => {
        buildTrackingIdentifier(undefined, undefined, '1234567890');
      }).toThrow('Either trackingId or both slug and trackingNumber must be provided');
    });

    it('should prefer tracking ID over slug/number', () => {
      const result = buildTrackingIdentifier('track123', 'fedex', '1234567890');
      expect(result).toBe('/track123');
    });
  });

  describe('formatTrackingData', () => {
    it('should format complete tracking data', () => {
      const input = {
        tracking_number: '1234567890',
        slug: 'fedex',
        title: 'Test Package',
        smses: ['+1234567890'],
        emails: ['test@example.com'],
        order_id: 'ORDER123',
        order_id_path: '/orders/123',
        custom_fields: { key: 'value' },
        language: 'en',
      };

      const result = formatTrackingData(input);

      expect(result.tracking_number).toBe('1234567890');
      expect(result.slug).toBe('fedex');
      expect(result.title).toBe('Test Package');
      expect(result.smses).toEqual(['+1234567890']);
      expect(result.emails).toEqual(['test@example.com']);
      expect(result.order_id).toBe('ORDER123');
      expect(result.custom_fields).toEqual({ key: 'value' });
    });

    it('should handle empty input', () => {
      const result = formatTrackingData({});
      expect(result).toEqual({});
    });

    it('should filter undefined values', () => {
      const input = {
        tracking_number: '1234567890',
        title: undefined,
        slug: 'ups',
      };

      const result = formatTrackingData(input);
      expect(result.tracking_number).toBe('1234567890');
      expect(result.slug).toBe('ups');
      expect(result).not.toHaveProperty('title');
    });

    it('should filter empty string values', () => {
      const input = {
        tracking_number: '1234567890',
        title: '',
        slug: 'ups',
        customer_name: '',
      };

      const result = formatTrackingData(input);
      expect(result.tracking_number).toBe('1234567890');
      expect(result.slug).toBe('ups');
      expect(result).not.toHaveProperty('title');
      expect(result).not.toHaveProperty('customer_name');
    });

    it('should only include allowed fields', () => {
      const input = {
        tracking_number: '1234567890',
        slug: 'ups',
        invalid_field: 'should be ignored',
        another_invalid: 123,
      };

      const result = formatTrackingData(input);
      expect(result.tracking_number).toBe('1234567890');
      expect(result.slug).toBe('ups');
      expect(result).not.toHaveProperty('invalid_field');
      expect(result).not.toHaveProperty('another_invalid');
    });
  });

  describe('formatAddressData', () => {
    it('should format complete address data', () => {
      const input = {
        contact_name: 'John Doe',
        company_name: 'ACME Inc',
        street1: '123 Main St',
        street2: 'Suite 100',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        phone: '+1234567890',
        email: 'john@example.com',
        type: 'residential',
      };

      const result = formatAddressData(input);

      expect(result.contact_name).toBe('John Doe');
      expect(result.company_name).toBe('ACME Inc');
      expect(result.street1).toBe('123 Main St');
      expect(result.street2).toBe('Suite 100');
      expect(result.city).toBe('New York');
      expect(result.state).toBe('NY');
      expect(result.postal_code).toBe('10001');
      expect(result.country).toBe('USA');
      expect(result.phone).toBe('+1234567890');
      expect(result.email).toBe('john@example.com');
      expect(result.type).toBe('residential');
    });

    it('should handle empty input', () => {
      const result = formatAddressData({});
      expect(result).toEqual({});
    });

    it('should handle address with prefix', () => {
      const input = {
        origin_contact_name: 'John Doe',
        origin_street1: '123 Main St',
        origin_city: 'New York',
        origin_state: 'NY',
        origin_postal_code: '10001',
        origin_country: 'USA',
      };

      const result = formatAddressData(input, 'origin');

      expect(result.contact_name).toBe('John Doe');
      expect(result.street1).toBe('123 Main St');
      expect(result.city).toBe('New York');
    });

    it('should filter empty values', () => {
      const input = {
        contact_name: 'John Doe',
        street1: '123 Main St',
        street2: '',
        city: undefined,
      };

      const result = formatAddressData(input);
      expect(result.contact_name).toBe('John Doe');
      expect(result.street1).toBe('123 Main St');
      expect(result).not.toHaveProperty('street2');
      expect(result).not.toHaveProperty('city');
    });
  });

  describe('formatParcelData', () => {
    it('should format complete parcel data', () => {
      const input = {
        box_type: 'custom',
        weight_value: 2.5,
        weight_unit: 'kg',
        dimension_width: 20,
        dimension_height: 10,
        dimension_depth: 30,
        dimension_unit: 'cm',
        description: 'Electronics',
      };

      const result = formatParcelData(input);

      expect(result.box_type).toBe('custom');
      expect(result.weight).toEqual({ value: 2.5, unit: 'kg' });
      expect(result.dimension).toEqual({ width: 20, height: 10, depth: 30, unit: 'cm' });
      expect(result.description).toBe('Electronics');
    });

    it('should handle parcel with weight only', () => {
      const input = {
        weight_value: 1.5,
        weight_unit: 'lb',
      };

      const result = formatParcelData(input);
      expect(result.weight).toEqual({ value: 1.5, unit: 'lb' });
      expect(result).not.toHaveProperty('dimension');
    });

    it('should use default unit for weight if not specified', () => {
      const input = {
        weight_value: 1.5,
      };

      const result = formatParcelData(input);
      expect(result.weight).toEqual({ value: 1.5, unit: 'kg' });
    });

    it('should handle parcel with dimensions only', () => {
      const input = {
        dimension_width: 20,
        dimension_height: 10,
        dimension_depth: 30,
      };

      const result = formatParcelData(input);
      expect(result.dimension).toEqual({ width: 20, height: 10, depth: 30, unit: 'cm' });
      expect(result).not.toHaveProperty('weight');
    });

    it('should handle empty input', () => {
      const result = formatParcelData({});
      expect(result).toEqual({});
    });
  });
});
