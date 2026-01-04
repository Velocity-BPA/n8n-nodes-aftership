/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest, buildTrackingIdentifier } from '../../transport';

export async function getNotificationSettings(
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
		`/notifications${endpoint}`,
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function addNotificationReceiver(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;
	const receiverType = this.getNodeParameter('receiverType', index) as string;
	const receiver = this.getNodeParameter('receiver', index) as string;

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
		notification: {},
	};

	if (receiverType === 'email') {
		(body.notification as IDataObject).emails = [receiver];
	} else {
		(body.notification as IDataObject).smses = [receiver];
	}

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		`/notifications${endpoint}/add`,
		body,
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}

export async function removeNotificationReceiver(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;
	const receiverType = this.getNodeParameter('receiverType', index) as string;
	const receiver = this.getNodeParameter('receiver', index) as string;

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
		notification: {},
	};

	if (receiverType === 'email') {
		(body.notification as IDataObject).emails = [receiver];
	} else {
		(body.notification as IDataObject).smses = [receiver];
	}

	const response = await afterShipApiRequest.call(
		this,
		'POST',
		`/notifications${endpoint}/remove`,
		body,
	);

	return this.helpers.returnJsonArray(response.data as IDataObject);
}
