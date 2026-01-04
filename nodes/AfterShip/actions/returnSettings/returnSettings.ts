/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest } from '../../transport';

export async function getReturnSettings(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const response = await afterShipApiRequest.call(
		this,
		'GET',
		'/settings',
		{},
		{},
		'returns',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function updateReturnSettings(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {
		settings: {},
	};

	if (updateFields.returnWindow) {
		(body.settings as IDataObject).return_window = updateFields.returnWindow;
	}
	if (updateFields.autoApprove !== undefined) {
		(body.settings as IDataObject).auto_approve = updateFields.autoApprove;
	}
	if (updateFields.requirePhotos !== undefined) {
		(body.settings as IDataObject).require_photos = updateFields.requirePhotos;
	}
	if (updateFields.requireReason !== undefined) {
		(body.settings as IDataObject).require_reason = updateFields.requireReason;
	}
	if (updateFields.notificationEmail) {
		(body.settings as IDataObject).notification_email = updateFields.notificationEmail;
	}

	const response = await afterShipApiRequest.call(
		this,
		'PATCH',
		'/settings',
		body,
		{},
		'returns',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function listReturnReasons(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const response = await afterShipApiRequest.call(
		this,
		'GET',
		'/reasons',
		{},
		{},
		'returns',
	);

	const data = response.data as IDataObject;
	const reasons = (data.reasons as IDataObject[]) || [data];

	return this.helpers.returnJsonArray(reasons);
}

export async function createReturnReason(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const title = this.getNodeParameter('title', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		reason: {
			title,
		},
	};

	if (additionalFields.description) {
		(body.reason as IDataObject).description = additionalFields.description;
	}
	if (additionalFields.requirePhoto !== undefined) {
		(body.reason as IDataObject).require_photo = additionalFields.requirePhoto;
	}
	if (additionalFields.requireNote !== undefined) {
		(body.reason as IDataObject).require_note = additionalFields.requireNote;
	}
	if (additionalFields.active !== undefined) {
		(body.reason as IDataObject).active = additionalFields.active;
	}

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		'/reasons',
		body,
		{},
		'returns',
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}
