/**
 * [Velocity BPA Licensing Notice]
 *
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 *
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 *
 * For licensing information, visit https://velobpa.com/licensing
 * or contact licensing@velobpa.com.
 */

import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

import * as crypto from 'crypto';

export class AfterShipTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AfterShip Trigger',
		name: 'afterShipTrigger',
		icon: 'file:aftership.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Receive webhooks from AfterShip for tracking status updates',
		defaults: {
			name: 'AfterShip Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'afterShipApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				required: true,
				default: 'trackingUpdate',
				options: [
					{
						name: 'All Events',
						value: 'all',
						description: 'Receive all webhook events',
					},
					{
						name: 'Attempt Failed',
						value: 'attemptFail',
						description: 'Delivery attempt failed',
					},
					{
						name: 'Available for Pickup',
						value: 'availableForPickup',
						description: 'Package is ready for pickup',
					},
					{
						name: 'Delivered',
						value: 'delivered',
						description: 'Package was successfully delivered',
					},
					{
						name: 'Exception',
						value: 'exception',
						description: 'Delivery exception occurred',
					},
					{
						name: 'Expired',
						value: 'expired',
						description: 'Tracking has expired',
					},
					{
						name: 'In Transit',
						value: 'inTransit',
						description: 'Package is in transit',
					},
					{
						name: 'Info Received',
						value: 'infoReceived',
						description: 'Carrier received shipment info',
					},
					{
						name: 'Out for Delivery',
						value: 'outForDelivery',
						description: 'Package is out for delivery',
					},
					{
						name: 'Pending',
						value: 'pending',
						description: 'Tracking created, awaiting carrier scan',
					},
					{
						name: 'Return to Sender',
						value: 'returnToSender',
						description: 'Package is being returned to sender',
					},
					{
						name: 'Tracking Update',
						value: 'trackingUpdate',
						description: 'Any tracking status change',
					},
				],
			},
			{
				displayName: 'Webhook Secret',
				name: 'webhookSecret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Optional webhook secret for HMAC-SHA256 signature verification. Get this from AfterShip webhook settings.',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Filter by Courier',
						name: 'courierSlug',
						type: 'string',
						default: '',
						description: 'Only trigger for specific courier (e.g., fedex, ups, usps)',
					},
					{
						displayName: 'Filter by Custom Fields',
						name: 'customFieldsFilter',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								displayName: 'Custom Field',
								name: 'customField',
								values: [
									{
										displayName: 'Field Name',
										name: 'name',
										type: 'string',
										default: '',
									},
									{
										displayName: 'Field Value',
										name: 'value',
										type: 'string',
										default: '',
									},
								],
							},
						],
					},
					{
						displayName: 'Include Raw Payload',
						name: 'includeRawPayload',
						type: 'boolean',
						default: false,
						description: 'Whether to include the raw webhook payload in the output',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// AfterShip webhooks are configured in the dashboard, not via API
				// We just return true to indicate the webhook endpoint is ready
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// AfterShip webhooks must be configured manually in the dashboard
				// The webhook URL should be set to the n8n webhook URL
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Webhook deletion is handled manually in AfterShip dashboard
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const event = this.getNodeParameter('event') as string;
		const webhookSecret = this.getNodeParameter('webhookSecret', '') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		const body = req.body as IDataObject;

		// Verify HMAC-SHA256 signature if secret is provided
		if (webhookSecret) {
			const signature = req.headers['aftership-hmac-sha256'] as string;
			if (signature) {
				const rawBody = JSON.stringify(body);
				const computedSignature = crypto
					.createHmac('sha256', webhookSecret)
					.update(rawBody)
					.digest('base64');

				if (signature !== computedSignature) {
					// Signature mismatch - reject the webhook
					return {
						webhookResponse: {
							status: 401,
							body: { error: 'Invalid signature' },
						},
					};
				}
			}
		}

		// Extract the message/tracking data
		const message = body.msg as IDataObject;
		if (!message) {
			return {
				webhookResponse: {
					status: 400,
					body: { error: 'Invalid payload: missing msg field' },
				},
			};
		}

		// Get the tracking status tag
		const tag = (message.tag as string)?.toLowerCase() || '';

		// Map AfterShip tags to our event names
		const tagToEvent: Record<string, string> = {
			pending: 'pending',
			inforeceived: 'infoReceived',
			intransit: 'inTransit',
			outfordelivery: 'outForDelivery',
			attemptfail: 'attemptFail',
			delivered: 'delivered',
			availableforpickup: 'availableForPickup',
			exception: 'exception',
			expired: 'expired',
			returntosender: 'returnToSender',
		};

		const eventFromTag = tagToEvent[tag] || 'trackingUpdate';

		// Filter by event type
		if (event !== 'all' && event !== 'trackingUpdate' && event !== eventFromTag) {
			// Event doesn't match filter - acknowledge but don't trigger
			return {
				webhookResponse: {
					status: 200,
					body: { received: true, filtered: true },
				},
			};
		}

		// Filter by courier slug
		if (options.courierSlug) {
			const trackingSlug = (message.slug as string)?.toLowerCase() || '';
			if (trackingSlug !== (options.courierSlug as string).toLowerCase()) {
				return {
					webhookResponse: {
						status: 200,
						body: { received: true, filtered: true },
					},
				};
			}
		}

		// Filter by custom fields
		if (options.customFieldsFilter) {
			const customFields = message.custom_fields as IDataObject;
			const filterFields = (options.customFieldsFilter as IDataObject)?.customField as IDataObject[];

			if (filterFields && filterFields.length > 0 && customFields) {
				const matches = filterFields.every((field) => {
					const fieldName = field.name as string;
					const fieldValue = field.value as string;
					return customFields[fieldName] === fieldValue;
				});

				if (!matches) {
					return {
						webhookResponse: {
							status: 200,
							body: { received: true, filtered: true },
						},
					};
				}
			}
		}

		// Build output data
		const outputData: IDataObject = {
			event: eventFromTag,
			eventTime: body.ts as string,
			tracking: {
				id: message.id,
				trackingNumber: message.tracking_number,
				slug: message.slug,
				title: message.title,
				tag: message.tag,
				subtag: message.subtag,
				subtagMessage: message.subtag_message,
				originCountry: message.origin_country_iso3,
				destinationCountry: message.destination_country_iso3,
				expectedDelivery: message.expected_delivery,
				signedBy: message.signed_by,
				shipmentType: message.shipment_type,
			},
			courier: {
				slug: message.slug,
				name: message.courier_destination_country_iso3,
				trackingUrl: message.courier_tracking_link,
			},
			checkpoints: message.checkpoints || [],
			customFields: message.custom_fields || {},
			orderInfo: {
				orderId: message.order_id,
				orderNumber: message.order_number,
				orderPath: message.order_id_path,
			},
		};

		// Include raw payload if requested
		if (options.includeRawPayload) {
			outputData.rawPayload = body;
		}

		return {
			workflowData: [this.helpers.returnJsonArray([outputData])],
		};
	}
}
