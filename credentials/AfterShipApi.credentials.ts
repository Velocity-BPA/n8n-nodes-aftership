import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AfterShipApi implements ICredentialType {
	name = 'afterShipApi';
	displayName = 'AfterShip API';
	documentationUrl = 'https://docs.aftership.com/reference/authentication';
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
			description: 'Your AfterShip API key. Generate one in your AfterShip dashboard under Settings > API.',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.aftership.com/v4',
			description: 'The base URL for AfterShip API',
		},
	];
}