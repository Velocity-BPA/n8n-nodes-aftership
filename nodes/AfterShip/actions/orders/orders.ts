/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest, afterShipApiRequestAllItems } from '../../transport';
import { formatAddressData } from '../../transport';

export async function listOrders(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};

	if (filters.status) query.status = filters.status;
	if (filters.platform) query.platform = filters.platform;
	if (filters.keyword) query.keyword = filters.keyword;
	if (filters.createdAtMin) query.created_at_min = filters.createdAtMin;
	if (filters.createdAtMax) query.created_at_max = filters.createdAtMax;

	let responseData: IDataObject[];

	if (returnAll) {
		responseData = await afterShipApiRequestAllItems.call(this, 'GET', '/orders', {}, query);
	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		query.limit = limit;
		const response = await afterShipApiRequest.call(this, 'GET', '/orders', {}, query);
		const data = response.data as IDataObject;
		responseData = (data.orders as IDataObject[]) || [data];
	}

	return this.helpers.returnJsonArray(responseData);
}

export async function getOrder(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const orderId = this.getNodeParameter('orderId', index) as string;

	const response = await afterShipApiRequest.call(this, 'GET', `/orders/${orderId}`);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function createOrder(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const orderId = this.getNodeParameter('orderId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		order: {
			order_id: orderId,
		},
	};

	if (additionalFields.orderNumber) {
		(body.order as IDataObject).order_number = additionalFields.orderNumber;
	}
	if (additionalFields.platform) {
		(body.order as IDataObject).platform = additionalFields.platform;
	}
	if (additionalFields.status) {
		(body.order as IDataObject).status = additionalFields.status;
	}
	if (additionalFields.items && Array.isArray(additionalFields.items)) {
		(body.order as IDataObject).items = additionalFields.items;
	}
	if (additionalFields.shippingAddress && typeof additionalFields.shippingAddress === 'object') {
		(body.order as IDataObject).shipping_address = formatAddressData(
			additionalFields.shippingAddress as IDataObject,
		);
	}
	if (additionalFields.billingAddress && typeof additionalFields.billingAddress === 'object') {
		(body.order as IDataObject).billing_address = formatAddressData(
			additionalFields.billingAddress as IDataObject,
		);
	}

	const response = await afterShipApiRequest.call(this, 'POST', '/orders', body);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function updateOrder(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const orderId = this.getNodeParameter('orderId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {
		order: {},
	};

	if (updateFields.orderNumber) {
		(body.order as IDataObject).order_number = updateFields.orderNumber;
	}
	if (updateFields.platform) {
		(body.order as IDataObject).platform = updateFields.platform;
	}
	if (updateFields.status) {
		(body.order as IDataObject).status = updateFields.status;
	}
	if (updateFields.items && Array.isArray(updateFields.items)) {
		(body.order as IDataObject).items = updateFields.items;
	}
	if (updateFields.shippingAddress && typeof updateFields.shippingAddress === 'object') {
		(body.order as IDataObject).shipping_address = formatAddressData(
			updateFields.shippingAddress as IDataObject,
		);
	}
	if (updateFields.billingAddress && typeof updateFields.billingAddress === 'object') {
		(body.order as IDataObject).billing_address = formatAddressData(
			updateFields.billingAddress as IDataObject,
		);
	}

	const response = await afterShipApiRequest.call(this, 'PUT', `/orders/${orderId}`, body);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function deleteOrder(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const orderId = this.getNodeParameter('orderId', index) as string;

	const response = await afterShipApiRequest.call(this, 'DELETE', `/orders/${orderId}`);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}
