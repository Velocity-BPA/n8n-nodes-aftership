/**
 * Unit tests for AfterShip Credentials
 */

import { AfterShipApi } from '../../credentials/AfterShipApi.credentials';

describe('AfterShip Credentials', () => {
  let credentials: AfterShipApi;

  beforeEach(() => {
    credentials = new AfterShipApi();
  });

  describe('Credential Definition', () => {
    it('should have correct name', () => {
      expect(credentials.name).toBe('afterShipApi');
    });

    it('should have correct display name', () => {
      expect(credentials.displayName).toBe('AfterShip API');
    });

    it('should have documentation URL', () => {
      expect(credentials.documentationUrl).toBeDefined();
    });
  });

  describe('Properties', () => {
    it('should have apiKey property', () => {
      const apiKeyProp = credentials.properties.find((p) => p.name === 'apiKey');
      expect(apiKeyProp).toBeDefined();
      expect(apiKeyProp?.type).toBe('string');
      expect(apiKeyProp?.typeOptions?.password).toBe(true);
    });

    it('should have apiVersion property', () => {
      const apiVersionProp = credentials.properties.find((p) => p.name === 'apiVersion');
      expect(apiVersionProp).toBeDefined();
      expect(apiVersionProp?.type).toBe('options');
    });

    it('should have baseUrl property', () => {
      const baseUrlProp = credentials.properties.find((p) => p.name === 'baseUrl');
      expect(baseUrlProp).toBeDefined();
      expect(baseUrlProp?.default).toBe('https://api.aftership.com');
    });

    it('should have correct API version options', () => {
      const apiVersionProp = credentials.properties.find((p) => p.name === 'apiVersion');
      const options = apiVersionProp?.options as Array<{ value: string }>;
      const versionValues = options?.map((o) => o.value) || [];

      expect(versionValues).toContain('2025-01');
      expect(versionValues).toContain('2024-10');
      expect(versionValues).toContain('2024-07');
      expect(versionValues).toContain('2024-04');
    });
  });

  describe('Authentication', () => {
    it('should have test method for credential verification', () => {
      expect(credentials.test).toBeDefined();
    });
  });
});
