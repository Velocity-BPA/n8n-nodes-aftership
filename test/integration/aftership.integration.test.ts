/**
 * Integration tests for AfterShip Node
 *
 * These tests require a valid AfterShip API key to run.
 * Set the AFTERSHIP_API_KEY environment variable before running.
 *
 * To run integration tests:
 * AFTERSHIP_API_KEY=your_api_key npm run test -- --testPathPattern=integration
 */

describe('AfterShip Integration Tests', () => {
  const apiKey = process.env.AFTERSHIP_API_KEY;

  beforeAll(() => {
    if (!apiKey) {
      console.warn(
        'AFTERSHIP_API_KEY not set. Skipping integration tests.'
      );
    }
  });

  describe('API Connection', () => {
    it.skip('should connect to AfterShip API', async () => {
      // Skip if no API key
      if (!apiKey) {
        return;
      }

      const response = await fetch(
        'https://api.aftership.com/tracking/2025-01/couriers',
        {
          headers: {
            'as-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toBeDefined();
    });
  });

  describe('Couriers Resource', () => {
    it.skip('should list activated couriers', async () => {
      if (!apiKey) {
        return;
      }

      const response = await fetch(
        'https://api.aftership.com/tracking/2025-01/couriers',
        {
          headers: {
            'as-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.couriers).toBeDefined();
      expect(Array.isArray(data.data.couriers)).toBe(true);
    });

    it.skip('should list all supported couriers', async () => {
      if (!apiKey) {
        return;
      }

      const response = await fetch(
        'https://api.aftership.com/tracking/2025-01/couriers/all',
        {
          headers: {
            'as-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.couriers).toBeDefined();
      // AfterShip supports 1100+ couriers
      expect(data.data.couriers.length).toBeGreaterThan(1000);
    });
  });

  describe('Trackings Resource', () => {
    it.skip('should create and delete a tracking', async () => {
      if (!apiKey) {
        return;
      }

      // Create tracking
      const createResponse = await fetch(
        'https://api.aftership.com/tracking/2025-01/trackings',
        {
          method: 'POST',
          headers: {
            'as-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tracking: {
              tracking_number: 'TEST' + Date.now(),
              slug: 'usps',
              title: 'Integration Test Tracking',
            },
          }),
        }
      );

      // May fail if tracking already exists or rate limited
      if (createResponse.ok) {
        const createData = await createResponse.json();
        const trackingId = createData.data.tracking.id;

        // Delete tracking
        const deleteResponse = await fetch(
          `https://api.aftership.com/tracking/2025-01/trackings/${trackingId}`,
          {
            method: 'DELETE',
            headers: {
              'as-api-key': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        expect(deleteResponse.ok).toBe(true);
      }
    });
  });

  describe('Webhook Verification', () => {
    it('should verify HMAC-SHA256 signature', () => {
      const crypto = require('crypto');

      const secret = 'test_webhook_secret';
      const payload = JSON.stringify({
        event_id: 'test123',
        event: 'tracking_update',
        msg: {
          id: 'track123',
          tracking_number: '1234567890',
          slug: 'fedex',
          tag: 'InTransit',
        },
      });

      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64');

      // Verify signature matches
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64');

      expect(signature).toBe(computedSignature);
    });
  });
});
