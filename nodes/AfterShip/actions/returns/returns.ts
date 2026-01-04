/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest, afterShipApiRequestAllItems } from '../../transport';

export async function listReturns(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};

	if (filters.status) query.status = filters.status;
	if (filters.orderId) query.order_id = filters.orderId;
	if (filters.createdAtMin) query.created_at_min = filters.createdAtMin;
	if (filters.createdAtMax) query.created_at_max = filters.createdAtMax;

	let responseData: IDataObject[];

	if (returnAll) {
		responseData = await afterShipApiRequestAllItems.call(
			this,
			'GET',
			'/returns',
			{},
			query,
			'returns',
		);
	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		query.limit = limit;
		const response = await afterShipApiRequest.call(this, 'GET', '/returns', {}, query, 'returns');
		const data = response.data as IDataObject;
		responseData = (data.returns as IDataObject[]) || [data];
	}

	return this.helpers.returnJsonArray(responseData);
}

export async function getReturn(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnId = this.getNodeParameter('returnId', index) as string;

	const response = await afterShipApiRequest.call(
		this,
		'GET',
		`/returns/${returnId}`,
		{},
		{},
		'returns',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function createReturn(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const orderId = this.getNodeParameter('orderId', index) as string;
	const items = this.getNodeParameter('items', index, []) as IDataObject[];
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		return: {
			order_id: orderId,
			items: items.map((item) => ({
				id: item.id || item.itemId,
				title: item.title,
				sku: item.sku,
				quantity: item.quantity,
				reason: item.reason,
			})),
		},
	};

	if (additionalFields.reason) {
		(body.return as IDataObject).reason = additionalFields.reason;
	}
	if (additionalFields.notes) {
		(body.return as IDataObject).notes = additionalFields.notes;
	}
	if (additionalFields.orderNumber) {
		(body.return as IDataObject).order_number = additionalFields.orderNumber;
	}

	const response = await afterShipApiRequest.call(this, 'POST', '/returns', body, {}, 'returns');

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function updateReturn(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnId = this.getNodeParameter('returnId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {
		return: {},
	};

	if (updateFields.status) {
		(body.return as IDataObject).status = updateFields.status;
	}
	if (updateFields.reason) {
		(body.return as IDataObject).reason = updateFields.reason;
	}
	if (updateFields.notes) {
		(body.return as IDataObject).notes = updateFields.notes;
	}
	if (updateFields.refundAmount) {
		(body.return as IDataObject).refund_amount = updateFields.refundAmount;
	}
	if (updateFields.refundCurrency) {
		(body.return as IDataObject).refund_currency = updateFields.refundCurrency;
	}

	const response = await afterShipApiRequest.call(
		this,
		'PATCH',
		`/returns/${returnId}`,
		body,
		{},
		'returns',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getReturnLabels(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnId = this.getNodeParameter('returnId', index) as string;

	const response = await afterShipApiRequest.call(
		this,
		'GET',
		`/returns/${returnId}/labels`,
		{},
		{},
		'returns',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function createReturnLabel(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnId = this.getNodeParameter('returnId', index) as string;
	const carrier = this.getNodeParameter('carrier', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		label: {
			carrier,
		},
	};

	if (additionalFields.serviceType) {
		(body.label as IDataObject).service_type = additionalFields.serviceType;
	}
	if (additionalFields.paperSize) {
		(body.label as IDataObject).paper_size = additionalFields.paperSize;
	}

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		`/returns/${returnId}/labels`,
		body,
		{},
		'returns',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}
