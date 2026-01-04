/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AfterShipApi implements ICredentialType {
	name = 'afterShipApi';
	displayName = 'AfterShip API';
	documentationUrl = 'https://www.aftership.com/docs/tracking/api-overview';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your AfterShip API Key. Get it from AfterShip Dashboard > Settings > API Keys.',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'options',
			options: [
				{
					name: '2025-01 (Latest)',
					value: '2025-01',
				},
				{
					name: '2024-10',
					value: '2024-10',
				},
				{
					name: '2024-07',
					value: '2024-07',
				},
				{
					name: '2024-04',
					value: '2024-04',
				},
			],
			default: '2025-01',
			description: 'The AfterShip API version to use',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.aftership.com',
			description: 'AfterShip API base URL',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'as-api-key': '={{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/tracking/{{$credentials.apiVersion}}/couriers',
			method: 'GET',
		},
	};
}
