/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest, afterShipApiRequestAllItems } from '../../transport';
import { formatAddressData, formatParcelData } from '../../transport';

export async function createShipment(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const shipFromData = this.getNodeParameter('shipFrom', index, {}) as IDataObject;
	const shipToData = this.getNodeParameter('shipTo', index, {}) as IDataObject;
	const parcelData = this.getNodeParameter('parcel', index, {}) as IDataObject;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		shipment: {
			ship_from: formatAddressData(shipFromData),
			ship_to: formatAddressData(shipToData),
			parcels: [formatParcelData(parcelData)],
		},
	};

	if (additionalFields.returnShipment !== undefined) {
		(body.shipment as IDataObject).return_shipment = additionalFields.returnShipment;
	}
	if (additionalFields.isDocument !== undefined) {
		(body.shipment as IDataObject).is_document = additionalFields.isDocument;
	}
	if (additionalFields.deliveryInstructions) {
		(body.shipment as IDataObject).delivery_instructions = additionalFields.deliveryInstructions;
	}
	if (additionalFields.references) {
		(body.shipment as IDataObject).references = additionalFields.references;
	}

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		'/shipments',
		body,
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getShipment(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const shipmentId = this.getNodeParameter('shipmentId', index) as string;

	const response = await afterShipApiRequest.call(
		this,
		'GET',
		`/shipments/${shipmentId}`,
		{},
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function listShipments(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};

	if (filters.status) query.status = filters.status;
	if (filters.createdAtMin) query.created_at_min = filters.createdAtMin;
	if (filters.createdAtMax) query.created_at_max = filters.createdAtMax;

	let responseData: IDataObject[];

	if (returnAll) {
		responseData = await afterShipApiRequestAllItems.call(
			this,
			'GET',
			'/shipments',
			{},
			query,
			'shipping',
		);
	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		query.limit = limit;
		const response = await afterShipApiRequest.call(
			this,
			'GET',
			'/shipments',
			{},
			query,
			'shipping',
		);
		const data = response.data as IDataObject;
		responseData = (data.shipments as IDataObject[]) || [data];
	}

	return this.helpers.returnJsonArray(responseData);
}
