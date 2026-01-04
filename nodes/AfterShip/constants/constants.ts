/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const DELIVERY_STATUSES = [
	{ name: 'Pending', value: 'Pending', description: 'Tracking created, awaiting carrier' },
	{ name: 'Info Received', value: 'InfoReceived', description: 'Carrier received info' },
	{ name: 'In Transit', value: 'InTransit', description: 'Package in transit' },
	{ name: 'Out For Delivery', value: 'OutForDelivery', description: 'Out for delivery' },
	{ name: 'Attempt Failed', value: 'AttemptFail', description: 'Delivery attempt failed' },
	{ name: 'Delivered', value: 'Delivered', description: 'Successfully delivered' },
	{ name: 'Available For Pickup', value: 'AvailableForPickup', description: 'Ready for pickup' },
	{ name: 'Exception', value: 'Exception', description: 'Delivery exception' },
	{ name: 'Expired', value: 'Expired', description: 'Tracking expired' },
] as const;

export const WEBHOOK_EVENTS = [
	{ name: 'Tracking Update', value: 'tracking_update', description: 'Tracking status changed' },
	{ name: 'Out For Delivery', value: 'out_for_delivery', description: 'Package out for delivery' },
	{ name: 'Delivered', value: 'delivered', description: 'Package delivered' },
	{ name: 'Exception', value: 'exception', description: 'Delivery exception occurred' },
	{ name: 'Expired', value: 'expired', description: 'Tracking expired' },
	{ name: 'Pending Pickup', value: 'pending_pickup', description: 'Awaiting pickup' },
	{ name: 'In Transit', value: 'in_transit', description: 'In transit update' },
	{ name: 'Available For Pickup', value: 'available_for_pickup', description: 'Ready for pickup' },
	{ name: 'Return To Sender', value: 'return_to_sender', description: 'Returned to sender' },
	{ name: 'Failed Attempt', value: 'failed_attempt', description: 'Delivery attempt failed' },
] as const;

export const POPULAR_COURIERS = [
	{ name: 'FedEx', value: 'fedex' },
	{ name: 'UPS', value: 'ups' },
	{ name: 'USPS', value: 'usps' },
	{ name: 'DHL Express', value: 'dhl' },
	{ name: 'DHL eCommerce', value: 'dhl-ecommerce' },
	{ name: 'Amazon Logistics', value: 'amazon-fba-us' },
	{ name: 'Canada Post', value: 'canada-post' },
	{ name: 'Royal Mail', value: 'royal-mail' },
	{ name: 'Australia Post', value: 'australia-post' },
	{ name: 'China Post', value: 'china-post' },
	{ name: 'Japan Post', value: 'japan-post' },
	{ name: 'La Poste', value: 'france-post' },
	{ name: 'Deutsche Post', value: 'deutsche-post' },
	{ name: 'TNT', value: 'tnt' },
	{ name: 'Aramex', value: 'aramex' },
	{ name: 'SF Express', value: 'sf-express' },
	{ name: 'YTO Express', value: 'yto' },
	{ name: 'Cainiao', value: 'cainiao' },
	{ name: 'PostNL', value: 'postnl' },
	{ name: 'Swiss Post', value: 'swiss-post' },
] as const;

export const API_ENDPOINTS = {
	TRACKING: '/tracking',
	SHIPPING: '/postmen/v3',
	RETURNS: '/returns',
} as const;

export const RETURN_STATUSES = [
	{ name: 'Pending', value: 'pending' },
	{ name: 'Approved', value: 'approved' },
	{ name: 'Rejected', value: 'rejected' },
	{ name: 'In Transit', value: 'in_transit' },
	{ name: 'Received', value: 'received' },
	{ name: 'Completed', value: 'completed' },
	{ name: 'Cancelled', value: 'cancelled' },
] as const;

export const SHIPMENT_STATUSES = [
	{ name: 'Created', value: 'created' },
	{ name: 'Pending', value: 'pending' },
	{ name: 'Manifested', value: 'manifested' },
	{ name: 'Failed', value: 'failed' },
	{ name: 'Voided', value: 'voided' },
] as const;

export const LABEL_FORMATS = [
	{ name: 'PDF', value: 'pdf' },
	{ name: 'PNG', value: 'png' },
	{ name: 'ZPL', value: 'zpl' },
] as const;

export const PAPER_SIZES = [
	{ name: '4x6', value: '4x6' },
	{ name: '4x8', value: '4x8' },
	{ name: 'A4', value: 'a4' },
	{ name: 'Letter', value: 'letter' },
] as const;
