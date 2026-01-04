/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest } from '../../transport';

export async function createExport(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const exportType = this.getNodeParameter('exportType', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		export: {
			type: exportType,
		},
	};

	if (additionalFields.format) {
		(body.export as IDataObject).format = additionalFields.format;
	}
	if (additionalFields.createdAtMin) {
		(body.export as IDataObject).created_at_min = additionalFields.createdAtMin;
	}
	if (additionalFields.createdAtMax) {
		(body.export as IDataObject).created_at_max = additionalFields.createdAtMax;
	}
	if (additionalFields.slug) {
		(body.export as IDataObject).slug = additionalFields.slug;
	}
	if (additionalFields.tag) {
		(body.export as IDataObject).tag = additionalFields.tag;
	}
	if (additionalFields.fields) {
		(body.export as IDataObject).fields = additionalFields.fields;
	}

	const response = await afterShipApiRequest.call(this, 'POST', '/exports', body);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function getExport(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const exportId = this.getNodeParameter('exportId', index) as string;

	const response = await afterShipApiRequest.call(this, 'GET', `/exports/${exportId}`);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function downloadExport(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const exportId = this.getNodeParameter('exportId', index) as string;

	// First get the export to check status and get download URL
	const response = await afterShipApiRequest.call(this, 'GET', `/exports/${exportId}`);
	const exportData = response.data as IDataObject;

	if (exportData.status !== 'completed') {
		throw new Error(`Export is not ready for download. Current status: ${exportData.status}`);
	}

	if (!exportData.file_url) {
		throw new Error('Export file URL is not available');
	}

	// Return the export data with the download URL
	return this.helpers.returnJsonArray([
		{
			...exportData,
			message: 'Export is ready for download',
			download_url: exportData.file_url,
		},
	]);
}
