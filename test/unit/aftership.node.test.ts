/**
 * Unit tests for AfterShip Node
 */

import { AfterShip } from '../../nodes/AfterShip/AfterShip.node';
import { AfterShipTrigger } from '../../nodes/AfterShip/AfterShipTrigger.node';

describe('AfterShip Node', () => {
  let afterShipNode: AfterShip;

  beforeEach(() => {
    afterShipNode = new AfterShip();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(afterShipNode.description.displayName).toBe('AfterShip');
    });

    it('should have correct node name', () => {
      expect(afterShipNode.description.name).toBe('afterShip');
    });

    it('should be in correct group', () => {
      expect(afterShipNode.description.group).toContain('transform');
    });

    it('should have version 1', () => {
      expect(afterShipNode.description.version).toBe(1);
    });

    it('should require credentials', () => {
      expect(afterShipNode.description.credentials).toBeDefined();
      expect(afterShipNode.description.credentials).toHaveLength(1);
      expect(afterShipNode.description.credentials?.[0].name).toBe('afterShipApi');
    });

    it('should have one input', () => {
      expect(afterShipNode.description.inputs).toEqual(['main']);
    });

    it('should have one output', () => {
      expect(afterShipNode.description.outputs).toEqual(['main']);
    });
  });

  describe('Resources', () => {
    it('should have resource property', () => {
      const resourceProp = afterShipNode.description.properties.find(
        (p) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp?.type).toBe('options');
    });

    it('should have all expected resources', () => {
      const resourceProp = afterShipNode.description.properties.find(
        (p) => p.name === 'resource'
      );
      const options = resourceProp?.options as Array<{ value: string }>;
      const resourceValues = options?.map((o) => o.value) || [];

      expect(resourceValues).toContain('trackings');
      expect(resourceValues).toContain('couriers');
      expect(resourceValues).toContain('estimatedDelivery');
      expect(resourceValues).toContain('notifications');
      expect(resourceValues).toContain('labels');
      expect(resourceValues).toContain('shipments');
      expect(resourceValues).toContain('carriers');
      expect(resourceValues).toContain('returns');
      expect(resourceValues).toContain('returnSettings');
      expect(resourceValues).toContain('orders');
      expect(resourceValues).toContain('exports');
      expect(resourceValues).toContain('checkpoints');
    });
  });

  describe('Tracking Operations', () => {
    it('should have tracking operations', () => {
      const operationProp = afterShipNode.description.properties.find(
        (p) => p.name === 'operation' && 
        JSON.stringify(p.displayOptions?.show?.resource || []).includes('tracking')
      );
      expect(operationProp).toBeDefined();
    });
  });
});

describe('AfterShip Trigger Node', () => {
  let triggerNode: AfterShipTrigger;

  beforeEach(() => {
    triggerNode = new AfterShipTrigger();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(triggerNode.description.displayName).toBe('AfterShip Trigger');
    });

    it('should have correct node name', () => {
      expect(triggerNode.description.name).toBe('afterShipTrigger');
    });

    it('should be in trigger group', () => {
      expect(triggerNode.description.group).toContain('trigger');
    });

    it('should have no inputs', () => {
      expect(triggerNode.description.inputs).toEqual([]);
    });

    it('should have one output', () => {
      expect(triggerNode.description.outputs).toEqual(['main']);
    });
  });

  describe('Events', () => {
    it('should have event property', () => {
      const eventProp = triggerNode.description.properties.find(
        (p) => p.name === 'event'
      );
      expect(eventProp).toBeDefined();
      expect(eventProp?.type).toBe('options');
    });

    it('should have all expected events', () => {
      const eventProp = triggerNode.description.properties.find(
        (p) => p.name === 'event'
      );
      const options = eventProp?.options as Array<{ value: string }>;
      const eventValues = options?.map((o) => o.value) || [];

      expect(eventValues).toContain('all');
      expect(eventValues).toContain('trackingUpdate');
      expect(eventValues).toContain('delivered');
      expect(eventValues).toContain('exception');
      expect(eventValues).toContain('outForDelivery');
      expect(eventValues).toContain('inTransit');
    });
  });

  describe('Webhook Methods', () => {
    it('should have webhook methods defined', () => {
      expect(triggerNode.webhookMethods).toBeDefined();
      expect(triggerNode.webhookMethods.default).toBeDefined();
    });
  });
});
