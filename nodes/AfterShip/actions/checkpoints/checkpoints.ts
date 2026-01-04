/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { afterShipApiRequest, buildTrackingIdentifier } from '../../transport';

export async function getCheckpoints(
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

	const response = await afterShipApiRequest.call(this, 'GET', `/trackings${endpoint}`);

	const data = response.data as IDataObject;
	const tracking = (data.tracking as IDataObject) || data;
	const checkpoints = (tracking.checkpoints as IDataObject[]) || [];

	return this.helpers.returnJsonArray(checkpoints);
}
