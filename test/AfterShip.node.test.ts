/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { AfterShip } from '../nodes/AfterShip/AfterShip.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('AfterShip Node', () => {
  let node: AfterShip;

  beforeAll(() => {
    node = new AfterShip();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('AfterShip');
      expect(node.description.name).toBe('aftership');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Tracking Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.aftership.com/v4',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	it('should create a tracking successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createTracking')
			.mockReturnValueOnce('1234567890')
			.mockReturnValueOnce('ups');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			meta: { code: 200 },
			data: { tracking: { id: 'test-id' } },
		});

		const result = await executeTrackingOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://api.aftership.com/v4/trackings',
			headers: {
				'aftership-api-key': 'test-key',
				'Content-Type': 'application/json',
			},
			body: {
				tracking: {
					tracking_number: '1234567890',
					slug: 'ups',
				},
			},
			json: true,
		});

		expect(result).toHaveLength(1);
		expect(result[0].json.data.tracking.id).toBe('test-id');
	});

	it('should get all trackings successfully', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getAllTrackings')
			.mockReturnValueOnce('ups')
			.mockReturnValueOnce('')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(10);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			meta: { code: 200 },
			data: { trackings: [] },
		});

		const result = await executeTrackingOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.aftership.com/v4/trackings',
			headers: {
				'aftership-api-key': 'test-key',
			},
			qs: {
				slug: 'ups',
				limit: 10,
			},
			json: true,
		});

		expect(result).toHaveLength(1);
	});

	it('should handle errors when continueOnFail is true', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createTracking');
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

		const result = await executeTrackingOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toHaveLength(1);
		expect(result[0].json.error).toBe('API Error');
	});
});

describe('Courier Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.aftership.com/v4' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get all couriers successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllCouriers');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      data: { couriers: [{ slug: 'ups', name: 'UPS' }] }
    });

    const result = await executeCourierOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.aftership.com/v4/couriers',
      headers: {
        'aftership-api-key': 'test-key',
        'Content-Type': 'application/json'
      },
      json: true
    });
    expect(result).toHaveLength(1);
  });

  it('should detect courier for tracking number successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'detectCourier';
      if (param === 'trackingNumber') return '1234567890';
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      data: { couriers: [{ slug: 'fedex', name: 'FedEx' }] }
    });

    const result = await executeCourierOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.aftership.com/v4/couriers/detect',
      headers: {
        'aftership-api-key': 'test-key',
        'Content-Type': 'application/json'
      },
      qs: {
        tracking_number: '1234567890'
      },
      json: true
    });
    expect(result).toHaveLength(1);
  });

  it('should handle errors when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllCouriers');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeCourierOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllCouriers');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executeCourierOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
  });
});

describe('Checkpoint Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.aftership.com/v4',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getCheckpoints operation', () => {
    it('should get checkpoints successfully', async () => {
      const mockResponse = {
        meta: { code: 200 },
        data: {
          checkpoints: [
            {
              slug: 'ups',
              checkpoint_time: '2023-01-01T10:00:00Z',
              message: 'Package delivered',
              location: 'New York, NY',
            },
          ],
        },
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getCheckpoints')
        .mockReturnValueOnce('ups')
        .mockReturnValueOnce('1234567890');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCheckpointOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.aftership.com/v4/trackings/ups/1234567890/checkpoints',
        headers: {
          'aftership-api-key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);
    });

    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getCheckpoints')
        .mockReturnValueOnce('ups')
        .mockReturnValueOnce('1234567890');

      const apiError = new Error('API Error: Invalid tracking number');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

      await expect(
        executeCheckpointOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('API Error: Invalid tracking number');
    });

    it('should continue on fail when enabled', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getCheckpoints')
        .mockReturnValueOnce('ups')
        .mockReturnValueOnce('1234567890');

      const apiError = new Error('API Error: Invalid tracking number');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

      const result = await executeCheckpointOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toEqual([
        {
          json: { error: 'API Error: Invalid tracking number' },
          pairedItem: { item: 0 },
        },
      ]);
    });
  });
});

describe('Notification Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key', 
        baseUrl: 'https://api.aftership.com/v4' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('createSmsNotification', () => {
    it('should create SMS notification successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createSmsNotification')
        .mockReturnValueOnce('ups')
        .mockReturnValueOnce('1234567890')
        .mockReturnValueOnce('+1234567890');

      const mockResponse = { data: { notification: { id: 'notif123', sms: '+1234567890' } } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNotificationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.aftership.com/v4/notifications/sms',
        headers: {
          'aftership-api-key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          slug: 'ups',
          tracking_number: '1234567890',
          sms: '+1234567890',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle errors when creating SMS notification', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createSmsNotification')
        .mockReturnValueOnce('ups')
        .mockReturnValueOnce('1234567890')
        .mockReturnValueOnce('+1234567890');

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeNotificationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('createEmailNotification', () => {
    it('should create email notification successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createEmailNotification')
        .mockReturnValueOnce('ups')
        .mockReturnValueOnce('1234567890')
        .mockReturnValueOnce('test@example.com');

      const mockResponse = { data: { notification: { id: 'notif123', email: 'test@example.com' } } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNotificationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.aftership.com/v4/notifications/email',
        headers: {
          'aftership-api-key': 'test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          slug: 'ups',
          tracking_number: '1234567890',
          email: 'test@example.com',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteSmsNotification', () => {
    it('should delete SMS notification successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteSmsNotification')
        .mockReturnValueOnce('ups')
        .mockReturnValueOnce('1234567890');

      const mockResponse = { data: { success: true } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNotificationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://api.aftership.com/v4/notifications/sms/ups/1234567890',
        headers: {
          'aftership-api-key': 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteEmailNotification', () => {
    it('should delete email notification successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteEmailNotification')
        .mockReturnValueOnce('ups')
        .mockReturnValueOnce('1234567890');

      const mockResponse = { data: { success: true } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeNotificationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://api.aftership.com/v4/notifications/email/ups/1234567890',
        headers: {
          'aftership-api-key': 'test-api-key',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Webhook Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key',
        baseUrl: 'https://api.aftership.com/v4'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('createWebhook operation', () => {
    it('should create webhook successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createWebhook')
        .mockReturnValueOnce('https://example.com/webhook');

      const mockResponse = {
        data: { webhook: { id: 'webhook-123', url: 'https://example.com/webhook' } },
        meta: { code: 200 }
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.aftership.com/v4/webhooks',
        headers: {
          'aftership-api-key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true,
        body: {
          webhook: {
            url: 'https://example.com/webhook'
          }
        }
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle errors when creating webhook', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createWebhook')
        .mockReturnValueOnce('https://example.com/webhook');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const error = new Error('Invalid webhook URL');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ 
        json: { error: 'Invalid webhook URL', meta: {} }, 
        pairedItem: { item: 0 } 
      }]);
    });
  });

  describe('getAllWebhooks operation', () => {
    it('should get all webhooks successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllWebhooks');

      const mockResponse = {
        data: { webhooks: [{ id: 'webhook-123', url: 'https://example.com/webhook' }] },
        meta: { code: 200 }
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.aftership.com/v4/webhooks',
        headers: {
          'aftership-api-key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getWebhook operation', () => {
    it('should get webhook by ID successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getWebhook')
        .mockReturnValueOnce('webhook-123');

      const mockResponse = {
        data: { webhook: { id: 'webhook-123', url: 'https://example.com/webhook' } },
        meta: { code: 200 }
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.aftership.com/v4/webhooks/webhook-123',
        headers: {
          'aftership-api-key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateWebhook operation', () => {
    it('should update webhook successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateWebhook')
        .mockReturnValueOnce('webhook-123')
        .mockReturnValueOnce('https://updated.com/webhook');

      const mockResponse = {
        data: { webhook: { id: 'webhook-123', url: 'https://updated.com/webhook' } },
        meta: { code: 200 }
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://api.aftership.com/v4/webhooks/webhook-123',
        headers: {
          'aftership-api-key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true,
        body: {
          webhook: {
            url: 'https://updated.com/webhook'
          }
        }
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteWebhook operation', () => {
    it('should delete webhook successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteWebhook')
        .mockReturnValueOnce('webhook-123');

      const mockResponse = {
        data: { webhook: { id: 'webhook-123' } },
        meta: { code: 200 }
      };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://api.aftership.com/v4/webhooks/webhook-123',
        headers: {
          'aftership-api-key': 'test-key',
          'Content-Type': 'application/json'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});
});
