/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest } from '../../transport';
import { formatAddressData, formatParcelData } from '../../transport';

export async function createLabel(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const shipperAccountId = this.getNodeParameter('shipperAccountId', index) as string;
	const serviceType = this.getNodeParameter('serviceType', index) as string;
	const shipFromData = this.getNodeParameter('shipFrom', index, {}) as IDataObject;
	const shipToData = this.getNodeParameter('shipTo', index, {}) as IDataObject;
	const parcelData = this.getNodeParameter('parcel', index, {}) as IDataObject;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		shipper_account: {
			id: shipperAccountId,
		},
		service_type: serviceType,
		shipment: {
			ship_from: formatAddressData(shipFromData),
			ship_to: formatAddressData(shipToData),
			parcels: [formatParcelData(parcelData)],
		},
	};

	if (additionalFields.paperSize) {
		body.paper_size = additionalFields.paperSize;
	}
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

	const response = await afterShipApiRequest.call(this, 'POST', '/labels', body, {}, 'shipping');

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getLabel(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const labelId = this.getNodeParameter('labelId', index) as string;

	const response = await afterShipApiRequest.call(
		this,
		'GET',
		`/labels/${labelId}`,
		{},
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function cancelLabel(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const labelId = this.getNodeParameter('labelId', index) as string;

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		`/labels/${labelId}/cancel`,
		{},
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getRates(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const shipperAccountIds = this.getNodeParameter('shipperAccountIds', index) as string;
	const shipFromData = this.getNodeParameter('shipFrom', index, {}) as IDataObject;
	const shipToData = this.getNodeParameter('shipTo', index, {}) as IDataObject;
	const parcelData = this.getNodeParameter('parcel', index, {}) as IDataObject;

	const body: IDataObject = {
		shipper_accounts: shipperAccountIds.split(',').map((id: string) => ({ id: id.trim() })),
		shipment: {
			ship_from: formatAddressData(shipFromData),
			ship_to: formatAddressData(shipToData),
			parcels: [formatParcelData(parcelData)],
		},
	};

	const response = await afterShipApiRequest.call(this, 'POST', '/rates', body, {}, 'shipping');

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function createManifest(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const shipperAccountId = this.getNodeParameter('shipperAccountId', index) as string;
	const labelIds = this.getNodeParameter('labelIds', index) as string;

	const body: IDataObject = {
		shipper_account: {
			id: shipperAccountId,
		},
		label_ids: labelIds.split(',').map((id: string) => id.trim()),
	};

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		'/manifests',
		body,
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getManifest(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const manifestId = this.getNodeParameter('manifestId', index) as string;

	const response = await afterShipApiRequest.call(
		this,
		'GET',
		`/manifests/${manifestId}`,
		{},
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}
