/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest } from '../../transport';

export async function listCouriers(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const response = await afterShipApiRequest.call(this, 'GET', '/couriers');

	const data = response.data as IDataObject;
	const couriers = (data.couriers as IDataObject[]) || [];

	return this.helpers.returnJsonArray(couriers);
}

export async function listAllCouriers(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const response = await afterShipApiRequest.call(this, 'GET', '/couriers/all');

	const data = response.data as IDataObject;
	const couriers = (data.couriers as IDataObject[]) || [];

	return this.helpers.returnJsonArray(couriers);
}

export async function detectCouriers(
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
	if (additionalFields.trackingOriginCountry) {
		(body.tracking as IDataObject).tracking_origin_country = additionalFields.trackingOriginCountry;
	}
	if (additionalFields.trackingDestinationCountry) {
		(body.tracking as IDataObject).tracking_destination_country =
			additionalFields.trackingDestinationCountry;
	}
	if (additionalFields.slug) {
		(body.tracking as IDataObject).slug = additionalFields.slug;
	}

	const response = await afterShipApiRequest.call(this, 'POST', '/couriers/detect', body);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getCourierBySlug(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const slug = this.getNodeParameter('slug', index) as string;

	const response = await afterShipApiRequest.call(this, 'GET', '/couriers/all');

	const data = response.data as IDataObject;
	const couriers = (data.couriers as IDataObject[]) || [];

	const courier = couriers.find((c) => c.slug === slug);

	if (!courier) {
		throw new Error(`Courier with slug "${slug}" not found`);
	}

	return this.helpers.returnJsonArray([courier]);
}
