/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest, buildTrackingIdentifier } from '../../transport';

export async function getEstimatedDelivery(
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

	const response = await afterShipApiRequest.call(
		this,
		'GET',
		`/estimated-delivery-date${endpoint}`,
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function batchGetEstimatedDelivery(
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
		estimated_delivery_dates: trackings.map((t) => ({
			slug: t.slug,
			tracking_number: t.tracking_number || t.trackingNumber,
			origin_address: t.origin_address || t.originAddress,
			destination_address: t.destination_address || t.destinationAddress,
			pickup_time: t.pickup_time || t.pickupTime,
			weight: t.weight,
		})),
	};

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		'/estimated-delivery-date/predict-batch',
		body,
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}
