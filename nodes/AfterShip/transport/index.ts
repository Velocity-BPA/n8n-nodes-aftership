/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import type { IAfterShipCredentials, IAfterShipResponse } from '../utils/types';
import { API_ENDPOINTS } from '../constants/constants';

export type AfterShipContext =
	| IExecuteFunctions
	| ILoadOptionsFunctions
	| IHookFunctions
	| IWebhookFunctions;

export async function afterShipApiRequest(
	this: AfterShipContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	apiType: 'tracking' | 'shipping' | 'returns' = 'tracking',
): Promise<IAfterShipResponse> {
	const credentials = (await this.getCredentials('afterShipApi')) as IAfterShipCredentials;

	let basePath: string;
	switch (apiType) {
		case 'shipping':
			basePath = API_ENDPOINTS.SHIPPING;
			break;
		case 'returns':
			basePath = `${API_ENDPOINTS.RETURNS}/${credentials.apiVersion}`;
			break;
		case 'tracking':
		default:
			basePath = `${API_ENDPOINTS.TRACKING}/${credentials.apiVersion}`;
			break;
	}

	const options: IHttpRequestOptions = {
		method,
		url: `${credentials.baseUrl}${basePath}${endpoint}`,
		headers: {
			'as-api-key': credentials.apiKey,
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.httpRequest(options);
		return response as IAfterShipResponse;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: getErrorMessage(error as JsonObject),
		});
	}
}

export async function afterShipApiRequestAllItems(
	this: AfterShipContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	apiType: 'tracking' | 'shipping' | 'returns' = 'tracking',
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let page = 1;
	const limit = query.limit ? Number(query.limit) : 100;

	let hasMore = true;

	while (hasMore) {
		query.page = page;
		query.limit = limit;

		const response = await afterShipApiRequest.call(this, method, endpoint, body, query, apiType);

		if (Array.isArray(response.data)) {
			returnData.push(...response.data);
			hasMore = response.data.length === limit;
		} else if (response.data && typeof response.data === 'object') {
			const data = response.data as IDataObject;
			if (data.trackings && Array.isArray(data.trackings)) {
				returnData.push(...(data.trackings as IDataObject[]));
				hasMore = (data.trackings as IDataObject[]).length === limit;
			} else if (data.returns && Array.isArray(data.returns)) {
				returnData.push(...(data.returns as IDataObject[]));
				hasMore = (data.returns as IDataObject[]).length === limit;
			} else if (data.orders && Array.isArray(data.orders)) {
				returnData.push(...(data.orders as IDataObject[]));
				hasMore = (data.orders as IDataObject[]).length === limit;
			} else {
				returnData.push(data);
				hasMore = false;
			}
		} else {
			hasMore = false;
		}

		page++;

		// Safety check to prevent infinite loops
		if (page > 1000) {
			break;
		}
	}

	return returnData;
}

function getErrorMessage(error: JsonObject): string {
	if (error.meta && typeof error.meta === 'object') {
		const meta = error.meta as JsonObject;
		if (meta.message) {
			return meta.message as string;
		}
		if (meta.code) {
			return `AfterShip API Error: ${meta.code}`;
		}
	}

	if (error.message) {
		return error.message as string;
	}

	return 'An unknown error occurred';
}

export function buildTrackingIdentifier(
	trackingId?: string,
	slug?: string,
	trackingNumber?: string,
): string {
	if (trackingId) {
		return `/${trackingId}`;
	}

	if (slug && trackingNumber) {
		return `/${slug}/${trackingNumber}`;
	}

	throw new Error('Either trackingId or both slug and trackingNumber must be provided');
}

export function formatTrackingData(data: IDataObject): IDataObject {
	const formatted: IDataObject = {};

	const allowedFields = [
		'tracking_number',
		'slug',
		'title',
		'emails',
		'smses',
		'customer_name',
		'order_id',
		'order_id_path',
		'order_date',
		'origin_country_iso3',
		'origin_state',
		'origin_city',
		'origin_postal_code',
		'origin_raw_location',
		'destination_country_iso3',
		'destination_state',
		'destination_city',
		'destination_postal_code',
		'destination_raw_location',
		'note',
		'language',
		'custom_fields',
		'analytics',
		'shipment_type',
		'shipment_weight',
		'shipment_weight_unit',
		'shipment_package_count',
		'shipment_pickup_date',
		'shipment_delivery_date',
	];

	for (const field of allowedFields) {
		if (data[field] !== undefined && data[field] !== '') {
			formatted[field] = data[field];
		}
	}

	return formatted;
}

export function formatAddressData(data: IDataObject, prefix: string = ''): IDataObject {
	const formatted: IDataObject = {};

	const addressFields = [
		'contact_name',
		'company_name',
		'street1',
		'street2',
		'street3',
		'city',
		'state',
		'postal_code',
		'country',
		'phone',
		'email',
		'type',
	];

	for (const field of addressFields) {
		const key = prefix ? `${prefix}_${field}` : field;
		if (data[key] !== undefined && data[key] !== '') {
			formatted[field] = data[key];
		}
	}

	return formatted;
}

export function formatParcelData(data: IDataObject): IDataObject {
	const parcel: IDataObject = {};

	if (data.box_type) {
		parcel.box_type = data.box_type;
	}

	if (data.weight_value) {
		parcel.weight = {
			value: Number(data.weight_value),
			unit: data.weight_unit || 'kg',
		};
	}

	if (data.dimension_width || data.dimension_height || data.dimension_depth) {
		parcel.dimension = {
			width: Number(data.dimension_width) || 0,
			height: Number(data.dimension_height) || 0,
			depth: Number(data.dimension_depth) || 0,
			unit: data.dimension_unit || 'cm',
		};
	}

	if (data.description) {
		parcel.description = data.description;
	}

	return parcel;
}

export function parseWebhookBody(body: IDataObject): IDataObject {
	// Handle different webhook payload formats
	if (body.msg && typeof body.msg === 'object') {
		return body;
	}

	// Try to parse stringified JSON
	if (typeof body === 'string') {
		try {
			return JSON.parse(body);
		} catch {
			return body as unknown as IDataObject;
		}
	}

	return body;
}
