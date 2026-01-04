/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest, afterShipApiRequestAllItems } from '../../transport';
import { formatAddressData } from '../../transport';

export async function listShipperAccounts(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const query: IDataObject = {};

	if (filters.slug) query.slug = filters.slug;

	let responseData: IDataObject[];

	if (returnAll) {
		responseData = await afterShipApiRequestAllItems.call(
			this,
			'GET',
			'/shipper-accounts',
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
			'/shipper-accounts',
			{},
			query,
			'shipping',
		);
		const data = response.data as IDataObject;
		responseData = (data.shipper_accounts as IDataObject[]) || [data];
	}

	return this.helpers.returnJsonArray(responseData);
}

export async function createShipperAccount(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const slug = this.getNodeParameter('slug', index) as string;
	const description = this.getNodeParameter('description', index, '') as string;
	const credentialsData = this.getNodeParameter('credentials', index, {}) as IDataObject;
	const addressData = this.getNodeParameter('address', index, {}) as IDataObject;

	const body: IDataObject = {
		shipper_account: {
			slug,
		},
	};

	if (description) {
		(body.shipper_account as IDataObject).description = description;
	}

	if (Object.keys(credentialsData).length > 0) {
		(body.shipper_account as IDataObject).credentials = credentialsData;
	}

	if (Object.keys(addressData).length > 0) {
		(body.shipper_account as IDataObject).address = formatAddressData(addressData);
	}

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		'/shipper-accounts',
		body,
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getShipperAccount(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const accountId = this.getNodeParameter('accountId', index) as string;

	const response = await afterShipApiRequest.call(
		this,
		'GET',
		`/shipper-accounts/${accountId}`,
		{},
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function updateShipperAccount(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const accountId = this.getNodeParameter('accountId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {
		shipper_account: {},
	};

	if (updateFields.description) {
		(body.shipper_account as IDataObject).description = updateFields.description;
	}

	if (updateFields.credentials && typeof updateFields.credentials === 'object') {
		(body.shipper_account as IDataObject).credentials = updateFields.credentials;
	}

	if (updateFields.address && typeof updateFields.address === 'object') {
		(body.shipper_account as IDataObject).address = formatAddressData(
			updateFields.address as IDataObject,
		);
	}

	const response = await afterShipApiRequest.call(
		this,
		'PATCH',
		`/shipper-accounts/${accountId}`,
		body,
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function deleteShipperAccount(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const accountId = this.getNodeParameter('accountId', index) as string;

	const response = await afterShipApiRequest.call(
		this,
		'DELETE',
		`/shipper-accounts/${accountId}`,
		{},
		{},
		'shipping',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}
