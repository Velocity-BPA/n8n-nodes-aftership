/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	afterShipApiRequest,
	afterShipApiRequestAllItems,
	buildTrackingIdentifier,
	formatTrackingData,
} from '../../transport';

export async function listTrackings(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};

	if (filters.slug) query.slug = filters.slug;
	if (filters.tag) query.tag = filters.tag;
	if (filters.keyword) query.keyword = filters.keyword;
	if (filters.origin) query.origin = filters.origin;
	if (filters.destination) query.destination = filters.destination;
	if (filters.createdAtMin) query.created_at_min = filters.createdAtMin;
	if (filters.createdAtMax) query.created_at_max = filters.createdAtMax;
	if (filters.fields) query.fields = filters.fields;

	let responseData: IDataObject[];

	if (returnAll) {
		responseData = await afterShipApiRequestAllItems.call(this, 'GET', '/trackings', {}, query);
	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		query.limit = limit;
		const response = await afterShipApiRequest.call(this, 'GET', '/trackings', {}, query);
		const data = response.data as IDataObject;
		responseData = (data.trackings as IDataObject[]) || [];
	}

	return this.helpers.returnJsonArray(responseData);
}

export async function getTracking(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;

	let endpoint: string;

	if (identifierType === 'id') {
		const trackingId = this.getNodeParameter('trackingId', index) as string;
		endpoint = buildTrackingIdentifier(trackingId);
	} else {
		const slug = this.getNodeParameter('slug', index) as string;
		const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
		endpoint = buildTrackingIdentifier(undefined, slug, trackingNumber);
	}

	const response = await afterShipApiRequest.call(this, 'GET', `/trackings${endpoint}`);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function createTracking(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		tracking: formatTrackingData({
			tracking_number: trackingNumber,
			...additionalFields,
		}),
	};

	const response = await afterShipApiRequest.call(this, 'POST', '/trackings', body);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function updateTracking(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	let endpoint: string;

	if (identifierType === 'id') {
		const trackingId = this.getNodeParameter('trackingId', index) as string;
		endpoint = buildTrackingIdentifier(trackingId);
	} else {
		const slug = this.getNodeParameter('slug', index) as string;
		const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
		endpoint = buildTrackingIdentifier(undefined, slug, trackingNumber);
	}

	const body: IDataObject = {
		tracking: formatTrackingData(updateFields),
	};

	const response = await afterShipApiRequest.call(this, 'PUT', `/trackings${endpoint}`, body);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function deleteTracking(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;

	let endpoint: string;

	if (identifierType === 'id') {
		const trackingId = this.getNodeParameter('trackingId', index) as string;
		endpoint = buildTrackingIdentifier(trackingId);
	} else {
		const slug = this.getNodeParameter('slug', index) as string;
		const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
		endpoint = buildTrackingIdentifier(undefined, slug, trackingNumber);
	}

	const response = await afterShipApiRequest.call(this, 'DELETE', `/trackings${endpoint}`);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function retrackTracking(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;

	let endpoint: string;

	if (identifierType === 'id') {
		const trackingId = this.getNodeParameter('trackingId', index) as string;
		endpoint = buildTrackingIdentifier(trackingId);
	} else {
		const slug = this.getNodeParameter('slug', index) as string;
		const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
		endpoint = buildTrackingIdentifier(undefined, slug, trackingNumber);
	}

	const response = await afterShipApiRequest.call(this, 'POST', `/trackings${endpoint}/retrack`);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function markAsCompleted(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;
	const reason = this.getNodeParameter('reason', index) as string;

	let endpoint: string;

	if (identifierType === 'id') {
		const trackingId = this.getNodeParameter('trackingId', index) as string;
		endpoint = buildTrackingIdentifier(trackingId);
	} else {
		const slug = this.getNodeParameter('slug', index) as string;
		const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
		endpoint = buildTrackingIdentifier(undefined, slug, trackingNumber);
	}

	const body: IDataObject = {
		reason,
	};

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		`/trackings${endpoint}/mark-as-completed`,
		body,
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getLastCheckpoint(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;

	let endpoint: string;

	if (identifierType === 'id') {
		const trackingId = this.getNodeParameter('trackingId', index) as string;
		endpoint = buildTrackingIdentifier(trackingId);
	} else {
		const slug = this.getNodeParameter('slug', index) as string;
		const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
		endpoint = buildTrackingIdentifier(undefined, slug, trackingNumber);
	}

	const response = await afterShipApiRequest.call(this, 'GET', `/last_checkpoint${endpoint}`);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function batchCreateTrackings(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const trackingsJson = this.getNodeParameter('trackings', index) as string;

	let trackings: IDataObject[];
	try {
		trackings = JSON.parse(trackingsJson);
	} catch {
		throw new Error('Invalid JSON format for trackings');
	}

	const body: IDataObject = {
		trackings: trackings.map((t) => formatTrackingData(t)),
	};

	const response = await afterShipApiRequest.call(this, 'POST', '/trackings/batch', body);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getTrackingBySlug(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const slug = this.getNodeParameter('slug', index) as string;
	const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const query: IDataObject = {};

	if (additionalFields.fields) {
		query.fields = additionalFields.fields;
	}
	if (additionalFields.lang) {
		query.lang = additionalFields.lang;
	}

	const endpoint = `/${slug}/${trackingNumber}`;
	const response = await afterShipApiRequest.call(this, 'GET', `/trackings${endpoint}`, {}, query);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function detectCourier(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const trackingNumber = this.getNodeParameter('trackingNumber', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		tracking: {
			tracking_number: trackingNumber,
		},
	};

	if (additionalFields.trackingPostalCode) {
		(body.tracking as IDataObject).tracking_postal_code = additionalFields.trackingPostalCode;
	}
	if (additionalFields.trackingShipDate) {
		(body.tracking as IDataObject).tracking_ship_date = additionalFields.trackingShipDate;
	}
	if (additionalFields.trackingAccountNumber) {
		(body.tracking as IDataObject).tracking_account_number = additionalFields.trackingAccountNumber;
	}
	if (additionalFields.slug) {
		(body.tracking as IDataObject).slug = additionalFields.slug;
	}

	const response = await afterShipApiRequest.call(this, 'POST', '/couriers/detect', body);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}
