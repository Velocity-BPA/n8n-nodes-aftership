/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

export interface IAfterShipCredentials {
	apiKey: string;
	apiVersion: string;
	baseUrl: string;
}

export interface IAfterShipResponse {
	meta: {
		code: number;
		message?: string;
		type?: string;
	};
	data: IDataObject | IDataObject[];
}

export interface IAfterShipPaginatedResponse extends IAfterShipResponse {
	data: {
		page: number;
		limit: number;
		count: number;
		keyword?: string;
		slug?: string;
		origin?: string[];
		destination?: string[];
		tag?: string;
		fields?: string;
		created_at_min?: string;
		created_at_max?: string;
		last_updated_at?: string;
		return_to_sender?: string[];
		courier_destination_country_iso3?: string[];
		trackings: ITracking[];
	};
}

export interface ITracking {
	id: string;
	created_at: string;
	updated_at: string;
	last_updated_at: string;
	tracking_number: string;
	slug: string;
	active: boolean;
	android?: string[];
	custom_fields?: IDataObject;
	customer_name?: string;
	delivery_time?: number;
	destination_country_iso3?: string;
	destination_raw_location?: string;
	emails?: string[];
	expected_delivery?: string;
	ios?: string[];
	note?: string;
	order_id?: string;
	order_id_path?: string;
	order_date?: string;
	origin_country_iso3?: string;
	origin_raw_location?: string;
	shipment_package_count?: number;
	shipment_pickup_date?: string;
	shipment_delivery_date?: string;
	shipment_type?: string;
	shipment_weight?: number;
	shipment_weight_unit?: string;
	signed_by?: string;
	smses?: string[];
	source?: string;
	tag: string;
	subtag?: string;
	subtag_message?: string;
	title?: string;
	tracked_count?: number;
	unique_token?: string;
	checkpoints?: ICheckpoint[];
	courier_tracking_link?: string;
	courier_redirect_link?: string;
	first_attempted_at?: string;
}

export interface ICheckpoint {
	slug: string;
	city?: string;
	created_at: string;
	location?: string;
	country_name?: string;
	message: string;
	country_iso3?: string;
	tag: string;
	subtag?: string;
	subtag_message?: string;
	checkpoint_time: string;
	coordinates?: number[];
	state?: string;
	zip?: string;
	raw_tag?: string;
}

export interface ICourier {
	slug: string;
	name: string;
	phone?: string;
	other_name?: string;
	web_url?: string;
	required_fields?: string[];
	optional_fields?: string[];
	default_language?: string;
	support_languages?: string[];
	service_from_country_iso3?: string[];
}

export interface ILabel {
	id: string;
	status: string;
	created_at: string;
	updated_at: string;
	shipper_account: IShipperAccount;
	service_type: string;
	shipment: IShipment;
	files: ILabelFile;
	rate: IRate;
	tracking_numbers?: string[];
	references?: string[];
}

export interface ILabelFile {
	label: {
		paper_size: string;
		url: string;
		file_type: string;
	};
	invoice?: {
		url: string;
		file_type: string;
	};
}

export interface IRate {
	charge_weight?: {
		value: number;
		unit: string;
	};
	total_charge?: {
		amount: number;
		currency: string;
	};
	detailed_charges?: IDetailedCharge[];
}

export interface IDetailedCharge {
	type: string;
	charge: {
		amount: number;
		currency: string;
	};
}

export interface IShipperAccount {
	id: string;
	slug: string;
	description?: string;
	type?: string;
	timezone?: string;
	credentials?: IDataObject;
	address?: IAddress;
	created_at?: string;
	updated_at?: string;
}

export interface IShipment {
	id?: string;
	ship_from: IAddress;
	ship_to: IAddress;
	parcels: IParcel[];
	delivery_instructions?: string;
	references?: string[];
	return_shipment?: boolean;
	is_document?: boolean;
	invoice?: IInvoice;
}

export interface IAddress {
	contact_name?: string;
	company_name?: string;
	street1: string;
	street2?: string;
	street3?: string;
	city: string;
	state?: string;
	postal_code: string;
	country: string;
	phone?: string;
	email?: string;
	type?: string;
}

export interface IParcel {
	box_type?: string;
	dimension?: {
		width: number;
		height: number;
		depth: number;
		unit: string;
	};
	weight: {
		value: number;
		unit: string;
	};
	items?: IParcelItem[];
	description?: string;
}

export interface IParcelItem {
	description: string;
	origin_country: string;
	quantity: number;
	price: {
		amount: number;
		currency: string;
	};
	weight: {
		value: number;
		unit: string;
	};
	sku?: string;
	hs_code?: string;
}

export interface IInvoice {
	number?: string;
	date?: string;
}

export interface IReturn {
	id: string;
	order_id: string;
	order_number?: string;
	status: string;
	created_at: string;
	updated_at: string;
	items: IReturnItem[];
	reason?: string;
	notes?: string;
	refund_amount?: number;
	refund_currency?: string;
	labels?: IReturnLabel[];
}

export interface IReturnItem {
	id: string;
	title: string;
	sku?: string;
	quantity: number;
	price?: number;
	currency?: string;
	reason?: string;
}

export interface IReturnLabel {
	id: string;
	tracking_number: string;
	carrier: string;
	label_url?: string;
	created_at: string;
}

export interface IOrder {
	id: string;
	order_id: string;
	order_number?: string;
	platform?: string;
	status?: string;
	created_at: string;
	updated_at: string;
	items?: IOrderItem[];
	shipping_address?: IAddress;
	billing_address?: IAddress;
	trackings?: ITracking[];
}

export interface IOrderItem {
	id: string;
	title: string;
	sku?: string;
	quantity: number;
	price?: number;
	currency?: string;
}

export interface IEstimatedDelivery {
	tracking_id: string;
	tracking_number: string;
	slug: string;
	estimated_delivery_date?: string;
	estimated_delivery_date_min?: string;
	estimated_delivery_date_max?: string;
	confidence_code?: number;
	confidence_score?: number;
}

export interface INotificationSettings {
	tracking_id: string;
	emails: string[];
	smses: string[];
}

export interface IExport {
	id: string;
	status: string;
	created_at: string;
	updated_at: string;
	file_url?: string;
	format: string;
	filters?: IDataObject;
}

export interface IWebhookPayload {
	event: string;
	event_id: string;
	is_tracking_first_tag: boolean;
	msg: ITracking;
	ts: number;
}

export type AfterShipResource =
	| 'trackings'
	| 'couriers'
	| 'estimatedDelivery'
	| 'notifications'
	| 'labels'
	| 'shipments'
	| 'carriers'
	| 'returns'
	| 'returnSettings'
	| 'orders'
	| 'exports'
	| 'checkpoints';

export type TrackingsOperation =
	| 'list'
	| 'get'
	| 'create'
	| 'update'
	| 'delete'
	| 'retrack'
	| 'markAsCompleted'
	| 'getLastCheckpoint'
	| 'batchCreate'
	| 'getBySlug'
	| 'detectCourier';

export type CouriersOperation = 'list' | 'listAll' | 'detect' | 'getBySlug';

export type EstimatedDeliveryOperation = 'get' | 'batchGet';

export type NotificationsOperation = 'getSettings' | 'addReceiver' | 'removeReceiver';

export type LabelsOperation = 'create' | 'get' | 'cancel' | 'getRates' | 'createManifest' | 'getManifest';

export type ShipmentsOperation = 'create' | 'get' | 'list';

export type CarriersOperation = 'list' | 'create' | 'get' | 'update' | 'delete';

export type ReturnsOperation = 'list' | 'get' | 'create' | 'update' | 'getLabels' | 'createLabel';

export type ReturnSettingsOperation = 'get' | 'update' | 'listReasons' | 'createReason';

export type OrdersOperation = 'list' | 'get' | 'create' | 'update' | 'delete';

export type ExportsOperation = 'create' | 'get' | 'download';

export type CheckpointsOperation = 'get';
