/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import { POPULAR_COURIERS, DELIVERY_STATUSES } from './constants/constants';
import { afterShipApiRequest } from './transport';
import type { IDataObject } from 'n8n-workflow';

// Import action handlers
import * as trackings from './actions/trackings/trackings';
import * as couriers from './actions/couriers/couriers';
import * as estimatedDelivery from './actions/estimatedDelivery/estimatedDelivery';
import * as notifications from './actions/notifications/notifications';
import * as labels from './actions/labels/labels';
import * as shipments from './actions/shipments/shipments';
import * as carriers from './actions/carriers/carriers';
import * as returns from './actions/returns/returns';
import * as returnSettings from './actions/returnSettings/returnSettings';
import * as orders from './actions/orders/orders';
import * as dataExports from './actions/exports/exports';
import * as checkpoints from './actions/checkpoints/checkpoints';

// Emit licensing notice once on load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licenseNoticeShown = false;
if (!licenseNoticeShown) {
	console.warn(LICENSING_NOTICE);
	licenseNoticeShown = true;
}

export class AfterShip implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AfterShip',
		name: 'afterShip',
		icon: 'file:aftership.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with AfterShip API for shipment tracking, labels, returns, and more',
		defaults: {
			name: 'AfterShip',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'afterShipApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Tracking',
						value: 'trackings',
						description: 'Manage shipment trackings',
					},
					{
						name: 'Courier',
						value: 'couriers',
						description: 'List and detect couriers',
					},
					{
						name: 'Estimated Delivery',
						value: 'estimatedDelivery',
						description: 'Get AI-powered delivery date predictions',
					},
					{
						name: 'Notification',
						value: 'notifications',
						description: 'Manage notification receivers',
					},
					{
						name: 'Label',
						value: 'labels',
						description: 'Create and manage shipping labels',
					},
					{
						name: 'Shipment',
						value: 'shipments',
						description: 'Create and manage shipments',
					},
					{
						name: 'Carrier Account',
						value: 'carriers',
						description: 'Manage shipper/carrier accounts',
					},
					{
						name: 'Return',
						value: 'returns',
						description: 'Manage return requests',
					},
					{
						name: 'Return Settings',
						value: 'returnSettings',
						description: 'Configure returns settings and reasons',
					},
					{
						name: 'Order',
						value: 'orders',
						description: 'Manage orders',
					},
					{
						name: 'Export',
						value: 'exports',
						description: 'Create and download data exports',
					},
					{
						name: 'Checkpoint',
						value: 'checkpoints',
						description: 'Get tracking checkpoints',
					},
				],
				default: 'trackings',
			},

			// ==================== TRACKINGS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['trackings'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all trackings',
						action: 'List trackings',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a tracking by ID or number',
						action: 'Get tracking',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new tracking',
						action: 'Create tracking',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update tracking info',
						action: 'Update tracking',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a tracking',
						action: 'Delete tracking',
					},
					{
						name: 'Retrack',
						value: 'retrack',
						description: 'Retrack an expired tracking',
						action: 'Retrack tracking',
					},
					{
						name: 'Mark as Completed',
						value: 'markAsCompleted',
						description: 'Mark tracking as completed',
						action: 'Mark tracking as completed',
					},
					{
						name: 'Get Last Checkpoint',
						value: 'getLastCheckpoint',
						description: 'Get the latest checkpoint',
						action: 'Get last checkpoint',
					},
					{
						name: 'Batch Create',
						value: 'batchCreate',
						description: 'Create multiple trackings at once',
						action: 'Batch create trackings',
					},
					{
						name: 'Get by Slug',
						value: 'getBySlug',
						description: 'Get tracking by carrier slug and number',
						action: 'Get tracking by slug',
					},
					{
						name: 'Detect Courier',
						value: 'detectCourier',
						description: 'Auto-detect courier for a tracking number',
						action: 'Detect courier',
					},
				],
				default: 'list',
			},

			// ==================== COURIERS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['couriers'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List couriers activated in your account',
						action: 'List couriers',
					},
					{
						name: 'List All',
						value: 'listAll',
						description: 'List all 1100+ supported couriers',
						action: 'List all couriers',
					},
					{
						name: 'Detect',
						value: 'detect',
						description: 'Detect couriers for a tracking number',
						action: 'Detect couriers',
					},
					{
						name: 'Get by Slug',
						value: 'getBySlug',
						description: 'Get courier by slug identifier',
						action: 'Get courier by slug',
					},
				],
				default: 'list',
			},

			// ==================== ESTIMATED DELIVERY OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['estimatedDelivery'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get estimated delivery date for a tracking',
						action: 'Get estimated delivery',
					},
					{
						name: 'Batch Get',
						value: 'batchGet',
						description: 'Get estimated delivery dates for multiple trackings',
						action: 'Batch get estimated delivery',
					},
				],
				default: 'get',
			},

			// ==================== NOTIFICATIONS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['notifications'],
					},
				},
				options: [
					{
						name: 'Get Settings',
						value: 'getSettings',
						description: 'Get notification settings for a tracking',
						action: 'Get notification settings',
					},
					{
						name: 'Add Receiver',
						value: 'addReceiver',
						description: 'Add email or SMS notification receiver',
						action: 'Add notification receiver',
					},
					{
						name: 'Remove Receiver',
						value: 'removeReceiver',
						description: 'Remove notification receiver',
						action: 'Remove notification receiver',
					},
				],
				default: 'getSettings',
			},

			// ==================== LABELS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['labels'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a shipping label',
						action: 'Create label',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get label by ID',
						action: 'Get label',
					},
					{
						name: 'Cancel',
						value: 'cancel',
						description: 'Cancel/void a label',
						action: 'Cancel label',
					},
					{
						name: 'Get Rates',
						value: 'getRates',
						description: 'Get shipping rates',
						action: 'Get rates',
					},
					{
						name: 'Create Manifest',
						value: 'createManifest',
						description: 'Create carrier manifest',
						action: 'Create manifest',
					},
					{
						name: 'Get Manifest',
						value: 'getManifest',
						description: 'Get manifest by ID',
						action: 'Get manifest',
					},
				],
				default: 'create',
			},

			// ==================== SHIPMENTS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['shipments'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a shipment',
						action: 'Create shipment',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get shipment by ID',
						action: 'Get shipment',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List shipments',
						action: 'List shipments',
					},
				],
				default: 'list',
			},

			// ==================== CARRIERS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['carriers'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List shipper accounts',
						action: 'List shipper accounts',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Add a carrier account',
						action: 'Create shipper account',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get account details',
						action: 'Get shipper account',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update account',
						action: 'Update shipper account',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Remove account',
						action: 'Delete shipper account',
					},
				],
				default: 'list',
			},

			// ==================== RETURNS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['returns'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List return requests',
						action: 'List returns',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get return by ID',
						action: 'Get return',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create return request',
						action: 'Create return',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update return',
						action: 'Update return',
					},
					{
						name: 'Get Labels',
						value: 'getLabels',
						description: 'Get return labels',
						action: 'Get return labels',
					},
					{
						name: 'Create Label',
						value: 'createLabel',
						description: 'Generate return label',
						action: 'Create return label',
					},
				],
				default: 'list',
			},

			// ==================== RETURN SETTINGS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['returnSettings'],
					},
				},
				options: [
					{
						name: 'Get Settings',
						value: 'getSettings',
						description: 'Get returns settings',
						action: 'Get return settings',
					},
					{
						name: 'Update Settings',
						value: 'updateSettings',
						description: 'Update returns settings',
						action: 'Update return settings',
					},
					{
						name: 'List Reasons',
						value: 'listReasons',
						description: 'Get return reasons',
						action: 'List return reasons',
					},
					{
						name: 'Create Reason',
						value: 'createReason',
						description: 'Add return reason',
						action: 'Create return reason',
					},
				],
				default: 'getSettings',
			},

			// ==================== ORDERS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['orders'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List orders',
						action: 'List orders',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get order by ID',
						action: 'Get order',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create order',
						action: 'Create order',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update order',
						action: 'Update order',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete order',
						action: 'Delete order',
					},
				],
				default: 'list',
			},

			// ==================== EXPORTS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['exports'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create data export',
						action: 'Create export',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get export status',
						action: 'Get export',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Download export file',
						action: 'Download export',
					},
				],
				default: 'create',
			},

			// ==================== CHECKPOINTS OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['checkpoints'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get all checkpoints for a tracking',
						action: 'Get checkpoints',
					},
				],
				default: 'get',
			},

			// ==================== COMMON FIELDS ====================

			// Identifier Type (for trackings, notifications, estimated delivery, checkpoints)
			{
				displayName: 'Identifier Type',
				name: 'identifierType',
				type: 'options',
				options: [
					{
						name: 'Tracking ID',
						value: 'id',
					},
					{
						name: 'Slug + Tracking Number',
						value: 'slugNumber',
					},
				],
				default: 'id',
				displayOptions: {
					show: {
						resource: ['trackings', 'notifications', 'estimatedDelivery', 'checkpoints'],
						operation: [
							'get',
							'update',
							'delete',
							'retrack',
							'markAsCompleted',
							'getLastCheckpoint',
							'getSettings',
							'addReceiver',
							'removeReceiver',
						],
					},
				},
			},

			// Tracking ID
			{
				displayName: 'Tracking ID',
				name: 'trackingId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						identifierType: ['id'],
						resource: ['trackings', 'notifications', 'estimatedDelivery', 'checkpoints'],
						operation: [
							'get',
							'update',
							'delete',
							'retrack',
							'markAsCompleted',
							'getLastCheckpoint',
							'getSettings',
							'addReceiver',
							'removeReceiver',
						],
					},
				},
				description: 'The AfterShip tracking ID',
			},

			// Slug
			{
				displayName: 'Courier Slug',
				name: 'slug',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCouriers',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						identifierType: ['slugNumber'],
						resource: ['trackings', 'notifications', 'estimatedDelivery', 'checkpoints'],
						operation: [
							'get',
							'update',
							'delete',
							'retrack',
							'markAsCompleted',
							'getLastCheckpoint',
							'getBySlug',
							'getSettings',
							'addReceiver',
							'removeReceiver',
						],
					},
				},
				description: 'The courier slug (e.g., fedex, ups, dhl)',
			},

			// Tracking Number
			{
				displayName: 'Tracking Number',
				name: 'trackingNumber',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['trackings'],
						operation: ['create', 'getBySlug', 'detectCourier'],
					},
				},
				description: 'The carrier tracking number',
			},
			{
				displayName: 'Tracking Number',
				name: 'trackingNumber',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						identifierType: ['slugNumber'],
						resource: ['trackings', 'notifications', 'estimatedDelivery', 'checkpoints'],
						operation: [
							'get',
							'update',
							'delete',
							'retrack',
							'markAsCompleted',
							'getLastCheckpoint',
							'getBySlug',
							'getSettings',
							'addReceiver',
							'removeReceiver',
						],
					},
				},
				description: 'The carrier tracking number',
			},

			// Slug for getBySlug tracking
			{
				displayName: 'Courier Slug',
				name: 'slug',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCouriers',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['trackings'],
						operation: ['getBySlug'],
					},
				},
				description: 'The courier slug (e.g., fedex, ups, dhl)',
			},

			// Return All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['trackings', 'shipments', 'carriers', 'returns', 'orders'],
						operation: ['list'],
					},
				},
				description: 'Whether to return all results or only up to a given limit',
			},

			// Limit
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: {
					minValue: 1,
					maxValue: 200,
				},
				displayOptions: {
					show: {
						resource: ['trackings', 'shipments', 'carriers', 'returns', 'orders'],
						operation: ['list'],
						returnAll: [false],
					},
				},
				description: 'Max number of results to return',
			},

			// ==================== TRACKINGS SPECIFIC FIELDS ====================

			// Mark as Completed Reason
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'options',
				options: [
					{
						name: 'Delivered',
						value: 'DELIVERED',
					},
					{
						name: 'Lost',
						value: 'LOST',
					},
					{
						name: 'Returned to Sender',
						value: 'RETURNED_TO_SENDER',
					},
				],
				default: 'DELIVERED',
				displayOptions: {
					show: {
						resource: ['trackings'],
						operation: ['markAsCompleted'],
					},
				},
				description: 'Reason for marking the tracking as completed',
			},

			// Batch Create Trackings JSON
			{
				displayName: 'Trackings (JSON)',
				name: 'trackings',
				type: 'json',
				default:
					'[{"tracking_number": "123456789", "slug": "fedex"}, {"tracking_number": "987654321", "slug": "ups"}]',
				required: true,
				displayOptions: {
					show: {
						resource: ['trackings'],
						operation: ['batchCreate'],
					},
				},
				description: 'Array of tracking objects in JSON format',
			},

			// Filters for list trackings
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['trackings'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Courier Slug',
						name: 'slug',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCouriers',
						},
						default: '',
						description: 'Filter by courier',
					},
					{
						displayName: 'Tag (Status)',
						name: 'tag',
						type: 'options',
						options: DELIVERY_STATUSES.map((s) => ({
							name: s.name,
							value: s.value,
						})),
						default: '',
						description: 'Filter by delivery status',
					},
					{
						displayName: 'Keyword',
						name: 'keyword',
						type: 'string',
						default: '',
						description: 'Search keyword',
					},
					{
						displayName: 'Origin',
						name: 'origin',
						type: 'string',
						default: '',
						description: 'Origin country ISO3 code',
					},
					{
						displayName: 'Destination',
						name: 'destination',
						type: 'string',
						default: '',
						description: 'Destination country ISO3 code',
					},
					{
						displayName: 'Created After',
						name: 'createdAtMin',
						type: 'dateTime',
						default: '',
						description: 'Filter by creation date (after)',
					},
					{
						displayName: 'Created Before',
						name: 'createdAtMax',
						type: 'dateTime',
						default: '',
						description: 'Filter by creation date (before)',
					},
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'string',
						default: '',
						description: 'Comma-separated list of fields to return',
					},
				],
			},

			// Additional Fields for create tracking
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['trackings'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Courier Slug',
						name: 'slug',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCouriers',
						},
						default: '',
						description: 'Carrier slug (auto-detected if not provided)',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Title of the tracking',
					},
					{
						displayName: 'Customer Name',
						name: 'customer_name',
						type: 'string',
						default: '',
						description: 'Customer name',
					},
					{
						displayName: 'Order ID',
						name: 'order_id',
						type: 'string',
						default: '',
						description: 'Order ID',
					},
					{
						displayName: 'Order ID Path',
						name: 'order_id_path',
						type: 'string',
						default: '',
						description: 'URL to the order page',
					},
					{
						displayName: 'Order Date',
						name: 'order_date',
						type: 'dateTime',
						default: '',
						description: 'Order date',
					},
					{
						displayName: 'Emails',
						name: 'emails',
						type: 'string',
						default: '',
						description: 'Comma-separated email addresses for notifications',
					},
					{
						displayName: 'SMS Numbers',
						name: 'smses',
						type: 'string',
						default: '',
						description: 'Comma-separated phone numbers for SMS notifications',
					},
					{
						displayName: 'Note',
						name: 'note',
						type: 'string',
						default: '',
						description: 'Note for the tracking',
					},
					{
						displayName: 'Origin Country',
						name: 'origin_country_iso3',
						type: 'string',
						default: '',
						description: 'Origin country ISO3 code',
					},
					{
						displayName: 'Destination Country',
						name: 'destination_country_iso3',
						type: 'string',
						default: '',
						description: 'Destination country ISO3 code',
					},
					{
						displayName: 'Language',
						name: 'language',
						type: 'string',
						default: '',
						description: 'Language code (e.g., en)',
					},
				],
			},

			// Update Fields for update tracking
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['trackings'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Title of the tracking',
					},
					{
						displayName: 'Customer Name',
						name: 'customer_name',
						type: 'string',
						default: '',
						description: 'Customer name',
					},
					{
						displayName: 'Order ID',
						name: 'order_id',
						type: 'string',
						default: '',
						description: 'Order ID',
					},
					{
						displayName: 'Order ID Path',
						name: 'order_id_path',
						type: 'string',
						default: '',
						description: 'URL to the order page',
					},
					{
						displayName: 'Note',
						name: 'note',
						type: 'string',
						default: '',
						description: 'Note for the tracking',
					},
				],
			},

			// Additional fields for getBySlug and detectCourier
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['trackings'],
						operation: ['getBySlug', 'detectCourier'],
					},
				},
				options: [
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'string',
						default: '',
						description: 'Comma-separated list of fields to return',
					},
					{
						displayName: 'Language',
						name: 'lang',
						type: 'string',
						default: '',
						description: 'Language code',
					},
					{
						displayName: 'Tracking Postal Code',
						name: 'trackingPostalCode',
						type: 'string',
						default: '',
						description: 'Postal code for courier detection',
					},
					{
						displayName: 'Tracking Ship Date',
						name: 'trackingShipDate',
						type: 'dateTime',
						default: '',
						description: 'Ship date for courier detection',
					},
					{
						displayName: 'Tracking Account Number',
						name: 'trackingAccountNumber',
						type: 'string',
						default: '',
						description: 'Account number for courier detection',
					},
				],
			},

			// ==================== COURIERS SPECIFIC FIELDS ====================

			// Courier Slug for getBySlug
			{
				displayName: 'Courier Slug',
				name: 'slug',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['couriers'],
						operation: ['getBySlug'],
					},
				},
				description: 'The courier slug identifier (e.g., fedex, ups, dhl)',
			},

			// Tracking number for detect
			{
				displayName: 'Tracking Number',
				name: 'trackingNumber',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['couriers'],
						operation: ['detect'],
					},
				},
				description: 'The tracking number to detect courier for',
			},

			// Additional fields for courier detection
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['couriers'],
						operation: ['detect'],
					},
				},
				options: [
					{
						displayName: 'Tracking Postal Code',
						name: 'trackingPostalCode',
						type: 'string',
						default: '',
						description: 'Postal code for courier detection',
					},
					{
						displayName: 'Tracking Ship Date',
						name: 'trackingShipDate',
						type: 'dateTime',
						default: '',
						description: 'Ship date for courier detection',
					},
					{
						displayName: 'Tracking Account Number',
						name: 'trackingAccountNumber',
						type: 'string',
						default: '',
						description: 'Account number for courier detection',
					},
					{
						displayName: 'Origin Country',
						name: 'trackingOriginCountry',
						type: 'string',
						default: '',
						description: 'Origin country ISO3 code',
					},
					{
						displayName: 'Destination Country',
						name: 'trackingDestinationCountry',
						type: 'string',
						default: '',
						description: 'Destination country ISO3 code',
					},
					{
						displayName: 'Courier Slugs',
						name: 'slug',
						type: 'string',
						default: '',
						description: 'Comma-separated list of courier slugs to check',
					},
				],
			},

			// ==================== ESTIMATED DELIVERY SPECIFIC FIELDS ====================

			// Batch Get EDD JSON
			{
				displayName: 'Trackings (JSON)',
				name: 'trackings',
				type: 'json',
				default:
					'[{"slug": "fedex", "tracking_number": "123456789", "origin_address": {"country": "USA"}, "destination_address": {"country": "USA"}}]',
				required: true,
				displayOptions: {
					show: {
						resource: ['estimatedDelivery'],
						operation: ['batchGet'],
					},
				},
				description: 'Array of tracking objects with origin and destination addresses',
			},

			// ==================== NOTIFICATIONS SPECIFIC FIELDS ====================

			// Receiver Type
			{
				displayName: 'Receiver Type',
				name: 'receiverType',
				type: 'options',
				options: [
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'SMS',
						value: 'sms',
					},
				],
				default: 'email',
				displayOptions: {
					show: {
						resource: ['notifications'],
						operation: ['addReceiver', 'removeReceiver'],
					},
				},
			},

			// Receiver
			{
				displayName: 'Receiver',
				name: 'receiver',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['notifications'],
						operation: ['addReceiver', 'removeReceiver'],
					},
				},
				description: 'Email address or phone number',
			},

			// ==================== LABELS SPECIFIC FIELDS ====================

			// Shipper Account ID
			{
				displayName: 'Shipper Account ID',
				name: 'shipperAccountId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['labels'],
						operation: ['create', 'createManifest'],
					},
				},
				description: 'The shipper account ID',
			},

			// Service Type
			{
				displayName: 'Service Type',
				name: 'serviceType',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['labels'],
						operation: ['create'],
					},
				},
				description: 'Carrier service type (e.g., fedex_ground, ups_next_day_air)',
			},

			// Ship From Address
			{
				displayName: 'Ship From',
				name: 'shipFrom',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['labels', 'shipments'],
						operation: ['create', 'getRates'],
					},
				},
				options: [
					{
						displayName: 'Contact Name',
						name: 'contact_name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Company Name',
						name: 'company_name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Street 1',
						name: 'street1',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'Street 2',
						name: 'street2',
						type: 'string',
						default: '',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Postal Code',
						name: 'postal_code',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						required: true,
						description: 'Country ISO2 code',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
					},
				],
			},

			// Ship To Address
			{
				displayName: 'Ship To',
				name: 'shipTo',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['labels', 'shipments'],
						operation: ['create', 'getRates'],
					},
				},
				options: [
					{
						displayName: 'Contact Name',
						name: 'contact_name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Company Name',
						name: 'company_name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Street 1',
						name: 'street1',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'Street 2',
						name: 'street2',
						type: 'string',
						default: '',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Postal Code',
						name: 'postal_code',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						required: true,
						description: 'Country ISO2 code',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
					},
				],
			},

			// Parcel
			{
				displayName: 'Parcel',
				name: 'parcel',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['labels', 'shipments'],
						operation: ['create', 'getRates'],
					},
				},
				options: [
					{
						displayName: 'Box Type',
						name: 'box_type',
						type: 'string',
						default: '',
						description: 'Carrier-specific box type',
					},
					{
						displayName: 'Weight Value',
						name: 'weight_value',
						type: 'number',
						default: 0,
						required: true,
					},
					{
						displayName: 'Weight Unit',
						name: 'weight_unit',
						type: 'options',
						options: [
							{ name: 'Kilograms', value: 'kg' },
							{ name: 'Pounds', value: 'lb' },
							{ name: 'Ounces', value: 'oz' },
							{ name: 'Grams', value: 'g' },
						],
						default: 'kg',
					},
					{
						displayName: 'Width',
						name: 'dimension_width',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Height',
						name: 'dimension_height',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Depth',
						name: 'dimension_depth',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Dimension Unit',
						name: 'dimension_unit',
						type: 'options',
						options: [
							{ name: 'Centimeters', value: 'cm' },
							{ name: 'Inches', value: 'in' },
						],
						default: 'cm',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
					},
				],
			},

			// Label ID
			{
				displayName: 'Label ID',
				name: 'labelId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['labels'],
						operation: ['get', 'cancel'],
					},
				},
			},

			// Shipper Account IDs for getRates
			{
				displayName: 'Shipper Account IDs',
				name: 'shipperAccountIds',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['labels'],
						operation: ['getRates'],
					},
				},
				description: 'Comma-separated shipper account IDs to get rates from',
			},

			// Label IDs for manifest
			{
				displayName: 'Label IDs',
				name: 'labelIds',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['labels'],
						operation: ['createManifest'],
					},
				},
				description: 'Comma-separated label IDs to include in the manifest',
			},

			// Manifest ID
			{
				displayName: 'Manifest ID',
				name: 'manifestId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['labels'],
						operation: ['getManifest'],
					},
				},
			},

			// Additional fields for labels
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['labels'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Paper Size',
						name: 'paperSize',
						type: 'options',
						options: [
							{ name: '4x6', value: '4x6' },
							{ name: '4x8', value: '4x8' },
							{ name: 'A4', value: 'a4' },
							{ name: 'Letter', value: 'letter' },
						],
						default: '4x6',
					},
					{
						displayName: 'Return Shipment',
						name: 'returnShipment',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Is Document',
						name: 'isDocument',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Delivery Instructions',
						name: 'deliveryInstructions',
						type: 'string',
						default: '',
					},
					{
						displayName: 'References',
						name: 'references',
						type: 'string',
						default: '',
						description: 'Comma-separated reference strings',
					},
				],
			},

			// ==================== SHIPMENTS SPECIFIC FIELDS ====================

			// Shipment ID
			{
				displayName: 'Shipment ID',
				name: 'shipmentId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['shipments'],
						operation: ['get'],
					},
				},
			},

			// Filters for list shipments
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['shipments'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Created', value: 'created' },
							{ name: 'Pending', value: 'pending' },
							{ name: 'Manifested', value: 'manifested' },
							{ name: 'Failed', value: 'failed' },
							{ name: 'Voided', value: 'voided' },
						],
						default: '',
					},
					{
						displayName: 'Created After',
						name: 'createdAtMin',
						type: 'dateTime',
						default: '',
					},
					{
						displayName: 'Created Before',
						name: 'createdAtMax',
						type: 'dateTime',
						default: '',
					},
				],
			},

			// Additional fields for shipments
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['shipments'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Return Shipment',
						name: 'returnShipment',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Is Document',
						name: 'isDocument',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Delivery Instructions',
						name: 'deliveryInstructions',
						type: 'string',
						default: '',
					},
					{
						displayName: 'References',
						name: 'references',
						type: 'string',
						default: '',
						description: 'Comma-separated reference strings',
					},
				],
			},

			// ==================== CARRIERS SPECIFIC FIELDS ====================

			// Account ID
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['carriers'],
						operation: ['get', 'update', 'delete'],
					},
				},
			},

			// Carrier Slug for create
			{
				displayName: 'Carrier Slug',
				name: 'slug',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCouriers',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['carriers'],
						operation: ['create'],
					},
				},
			},

			// Description
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['carriers'],
						operation: ['create'],
					},
				},
			},

			// Credentials
			{
				displayName: 'Credentials',
				name: 'credentials',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['carriers'],
						operation: ['create'],
					},
				},
				description: 'Carrier-specific credentials as JSON',
			},

			// Address
			{
				displayName: 'Address',
				name: 'address',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['carriers'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Contact Name',
						name: 'contact_name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Company Name',
						name: 'company_name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Street 1',
						name: 'street1',
						type: 'string',
						default: '',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Postal Code',
						name: 'postal_code',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
					},
				],
			},

			// Filters for list carriers
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['carriers'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Carrier Slug',
						name: 'slug',
						type: 'string',
						default: '',
					},
				],
			},

			// Update fields for carriers
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['carriers'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Credentials',
						name: 'credentials',
						type: 'json',
						default: '{}',
					},
					{
						displayName: 'Address',
						name: 'address',
						type: 'json',
						default: '{}',
					},
				],
			},

			// ==================== RETURNS SPECIFIC FIELDS ====================

			// Return ID
			{
				displayName: 'Return ID',
				name: 'returnId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['returns'],
						operation: ['get', 'update', 'getLabels', 'createLabel'],
					},
				},
			},

			// Order ID for create return
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['returns'],
						operation: ['create'],
					},
				},
			},

			// Items for create return
			{
				displayName: 'Items',
				name: 'items',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						resource: ['returns'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'item',
						displayName: 'Item',
						values: [
							{
								displayName: 'Item ID',
								name: 'id',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
							},
							{
								displayName: 'SKU',
								name: 'sku',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Quantity',
								name: 'quantity',
								type: 'number',
								default: 1,
							},
							{
								displayName: 'Reason',
								name: 'reason',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},

			// Additional fields for create return
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['returns'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Reason',
						name: 'reason',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Order Number',
						name: 'orderNumber',
						type: 'string',
						default: '',
					},
				],
			},

			// Update fields for returns
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['returns'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Pending', value: 'pending' },
							{ name: 'Approved', value: 'approved' },
							{ name: 'Rejected', value: 'rejected' },
							{ name: 'In Transit', value: 'in_transit' },
							{ name: 'Received', value: 'received' },
							{ name: 'Completed', value: 'completed' },
							{ name: 'Cancelled', value: 'cancelled' },
						],
						default: 'pending',
					},
					{
						displayName: 'Reason',
						name: 'reason',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Refund Amount',
						name: 'refundAmount',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Refund Currency',
						name: 'refundCurrency',
						type: 'string',
						default: 'USD',
					},
				],
			},

			// Filters for list returns
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['returns'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Pending', value: 'pending' },
							{ name: 'Approved', value: 'approved' },
							{ name: 'Rejected', value: 'rejected' },
							{ name: 'In Transit', value: 'in_transit' },
							{ name: 'Received', value: 'received' },
							{ name: 'Completed', value: 'completed' },
							{ name: 'Cancelled', value: 'cancelled' },
						],
						default: '',
					},
					{
						displayName: 'Order ID',
						name: 'orderId',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Created After',
						name: 'createdAtMin',
						type: 'dateTime',
						default: '',
					},
					{
						displayName: 'Created Before',
						name: 'createdAtMax',
						type: 'dateTime',
						default: '',
					},
				],
			},

			// Carrier for create return label
			{
				displayName: 'Carrier',
				name: 'carrier',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCouriers',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['returns'],
						operation: ['createLabel'],
					},
				},
			},

			// Additional fields for create return label
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['returns'],
						operation: ['createLabel'],
					},
				},
				options: [
					{
						displayName: 'Service Type',
						name: 'serviceType',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Paper Size',
						name: 'paperSize',
						type: 'options',
						options: [
							{ name: '4x6', value: '4x6' },
							{ name: '4x8', value: '4x8' },
							{ name: 'A4', value: 'a4' },
							{ name: 'Letter', value: 'letter' },
						],
						default: '4x6',
					},
				],
			},

			// ==================== RETURN SETTINGS SPECIFIC FIELDS ====================

			// Update fields for return settings
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['returnSettings'],
						operation: ['updateSettings'],
					},
				},
				options: [
					{
						displayName: 'Return Window (Days)',
						name: 'returnWindow',
						type: 'number',
						default: 30,
					},
					{
						displayName: 'Auto Approve',
						name: 'autoApprove',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Require Photos',
						name: 'requirePhotos',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Require Reason',
						name: 'requireReason',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Notification Email',
						name: 'notificationEmail',
						type: 'string',
						default: '',
					},
				],
			},

			// Title for create return reason
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['returnSettings'],
						operation: ['createReason'],
					},
				},
				description: 'Return reason title',
			},

			// Additional fields for create return reason
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['returnSettings'],
						operation: ['createReason'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Require Photo',
						name: 'requirePhoto',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Require Note',
						name: 'requireNote',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Active',
						name: 'active',
						type: 'boolean',
						default: true,
					},
				],
			},

			// ==================== ORDERS SPECIFIC FIELDS ====================

			// Order ID
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['orders'],
						operation: ['get', 'create', 'update', 'delete'],
					},
				},
			},

			// Filters for list orders
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['orders'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Platform',
						name: 'platform',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Keyword',
						name: 'keyword',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Created After',
						name: 'createdAtMin',
						type: 'dateTime',
						default: '',
					},
					{
						displayName: 'Created Before',
						name: 'createdAtMax',
						type: 'dateTime',
						default: '',
					},
				],
			},

			// Additional fields for create order
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['orders'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Order Number',
						name: 'orderNumber',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Platform',
						name: 'platform',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Items (JSON)',
						name: 'items',
						type: 'json',
						default: '[]',
					},
					{
						displayName: 'Shipping Address (JSON)',
						name: 'shippingAddress',
						type: 'json',
						default: '{}',
					},
					{
						displayName: 'Billing Address (JSON)',
						name: 'billingAddress',
						type: 'json',
						default: '{}',
					},
				],
			},

			// Update fields for orders
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['orders'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'Order Number',
						name: 'orderNumber',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Platform',
						name: 'platform',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Items (JSON)',
						name: 'items',
						type: 'json',
						default: '[]',
					},
					{
						displayName: 'Shipping Address (JSON)',
						name: 'shippingAddress',
						type: 'json',
						default: '{}',
					},
					{
						displayName: 'Billing Address (JSON)',
						name: 'billingAddress',
						type: 'json',
						default: '{}',
					},
				],
			},

			// ==================== EXPORTS SPECIFIC FIELDS ====================

			// Export Type
			{
				displayName: 'Export Type',
				name: 'exportType',
				type: 'options',
				options: [
					{
						name: 'Trackings',
						value: 'trackings',
					},
					{
						name: 'Returns',
						value: 'returns',
					},
					{
						name: 'Orders',
						value: 'orders',
					},
				],
				default: 'trackings',
				required: true,
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['create'],
					},
				},
			},

			// Export ID
			{
				displayName: 'Export ID',
				name: 'exportId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['get', 'download'],
					},
				},
			},

			// Additional fields for create export
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [
							{ name: 'CSV', value: 'csv' },
							{ name: 'Excel', value: 'xlsx' },
						],
						default: 'csv',
					},
					{
						displayName: 'Created After',
						name: 'createdAtMin',
						type: 'dateTime',
						default: '',
					},
					{
						displayName: 'Created Before',
						name: 'createdAtMax',
						type: 'dateTime',
						default: '',
					},
					{
						displayName: 'Courier Slug',
						name: 'slug',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Tag (Status)',
						name: 'tag',
						type: 'options',
						options: DELIVERY_STATUSES.map((s) => ({
							name: s.name,
							value: s.value,
						})),
						default: '',
					},
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'string',
						default: '',
						description: 'Comma-separated list of fields to export',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getCouriers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await afterShipApiRequest.call(this, 'GET', '/couriers/all');
					const data = response.data as IDataObject;
					const couriersList = (data.couriers as IDataObject[]) || [];

					return couriersList.map((courier) => ({
						name: courier.name as string,
						value: courier.slug as string,
					}));
				} catch {
					// Fallback to popular couriers if API call fails
					return POPULAR_COURIERS.map((c) => ({
						name: c.name,
						value: c.value,
					}));
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[] = [];

				switch (resource) {
					case 'trackings':
						switch (operation) {
							case 'list':
								result = await trackings.listTrackings.call(this, i);
								break;
							case 'get':
								result = await trackings.getTracking.call(this, i);
								break;
							case 'create':
								result = await trackings.createTracking.call(this, i);
								break;
							case 'update':
								result = await trackings.updateTracking.call(this, i);
								break;
							case 'delete':
								result = await trackings.deleteTracking.call(this, i);
								break;
							case 'retrack':
								result = await trackings.retrackTracking.call(this, i);
								break;
							case 'markAsCompleted':
								result = await trackings.markAsCompleted.call(this, i);
								break;
							case 'getLastCheckpoint':
								result = await trackings.getLastCheckpoint.call(this, i);
								break;
							case 'batchCreate':
								result = await trackings.batchCreateTrackings.call(this, i);
								break;
							case 'getBySlug':
								result = await trackings.getTrackingBySlug.call(this, i);
								break;
							case 'detectCourier':
								result = await trackings.detectCourier.call(this, i);
								break;
						}
						break;

					case 'couriers':
						switch (operation) {
							case 'list':
								result = await couriers.listCouriers.call(this, i);
								break;
							case 'listAll':
								result = await couriers.listAllCouriers.call(this, i);
								break;
							case 'detect':
								result = await couriers.detectCouriers.call(this, i);
								break;
							case 'getBySlug':
								result = await couriers.getCourierBySlug.call(this, i);
								break;
						}
						break;

					case 'estimatedDelivery':
						switch (operation) {
							case 'get':
								result = await estimatedDelivery.getEstimatedDelivery.call(this, i);
								break;
							case 'batchGet':
								result = await estimatedDelivery.batchGetEstimatedDelivery.call(this, i);
								break;
						}
						break;

					case 'notifications':
						switch (operation) {
							case 'getSettings':
								result = await notifications.getNotificationSettings.call(this, i);
								break;
							case 'addReceiver':
								result = await notifications.addNotificationReceiver.call(this, i);
								break;
							case 'removeReceiver':
								result = await notifications.removeNotificationReceiver.call(this, i);
								break;
						}
						break;

					case 'labels':
						switch (operation) {
							case 'create':
								result = await labels.createLabel.call(this, i);
								break;
							case 'get':
								result = await labels.getLabel.call(this, i);
								break;
							case 'cancel':
								result = await labels.cancelLabel.call(this, i);
								break;
							case 'getRates':
								result = await labels.getRates.call(this, i);
								break;
							case 'createManifest':
								result = await labels.createManifest.call(this, i);
								break;
							case 'getManifest':
								result = await labels.getManifest.call(this, i);
								break;
						}
						break;

					case 'shipments':
						switch (operation) {
							case 'create':
								result = await shipments.createShipment.call(this, i);
								break;
							case 'get':
								result = await shipments.getShipment.call(this, i);
								break;
							case 'list':
								result = await shipments.listShipments.call(this, i);
								break;
						}
						break;

					case 'carriers':
						switch (operation) {
							case 'list':
								result = await carriers.listShipperAccounts.call(this, i);
								break;
							case 'create':
								result = await carriers.createShipperAccount.call(this, i);
								break;
							case 'get':
								result = await carriers.getShipperAccount.call(this, i);
								break;
							case 'update':
								result = await carriers.updateShipperAccount.call(this, i);
								break;
							case 'delete':
								result = await carriers.deleteShipperAccount.call(this, i);
								break;
						}
						break;

					case 'returns':
						switch (operation) {
							case 'list':
								result = await returns.listReturns.call(this, i);
								break;
							case 'get':
								result = await returns.getReturn.call(this, i);
								break;
							case 'create':
								result = await returns.createReturn.call(this, i);
								break;
							case 'update':
								result = await returns.updateReturn.call(this, i);
								break;
							case 'getLabels':
								result = await returns.getReturnLabels.call(this, i);
								break;
							case 'createLabel':
								result = await returns.createReturnLabel.call(this, i);
								break;
						}
						break;

					case 'returnSettings':
						switch (operation) {
							case 'getSettings':
								result = await returnSettings.getReturnSettings.call(this, i);
								break;
							case 'updateSettings':
								result = await returnSettings.updateReturnSettings.call(this, i);
								break;
							case 'listReasons':
								result = await returnSettings.listReturnReasons.call(this, i);
								break;
							case 'createReason':
								result = await returnSettings.createReturnReason.call(this, i);
								break;
						}
						break;

					case 'orders':
						switch (operation) {
							case 'list':
								result = await orders.listOrders.call(this, i);
								break;
							case 'get':
								result = await orders.getOrder.call(this, i);
								break;
							case 'create':
								result = await orders.createOrder.call(this, i);
								break;
							case 'update':
								result = await orders.updateOrder.call(this, i);
								break;
							case 'delete':
								result = await orders.deleteOrder.call(this, i);
								break;
						}
						break;

					case 'exports':
						switch (operation) {
							case 'create':
								result = await dataExports.createExport.call(this, i);
								break;
							case 'get':
								result = await dataExports.getExport.call(this, i);
								break;
							case 'download':
								result = await dataExports.downloadExport.call(this, i);
								break;
						}
						break;

					case 'checkpoints':
						switch (operation) {
							case 'get':
								result = await checkpoints.getCheckpoints.call(this, i);
								break;
						}
						break;
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
