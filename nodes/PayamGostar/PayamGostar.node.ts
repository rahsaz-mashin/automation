import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';


export class PayamGostar implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PayamGostar (RahsazMashin)',
		name: 'rahsaz-automation-payamgostar',
		icon: 'file:icon.png',
		group: [],
		version: 1,
		description: 'Automation methods for PayamGostar',
		defaults: {
			name: 'PayamGostar',
			color: '#e76629'
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Inventory Group',
						value: 'inventory-group',
					},
					{
						name: 'Inventory',
						value: 'inventory',
					},
					{
						name: 'Product Group',
						value: 'product-group',
					},
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Identity',
						value: 'identity',
					},
				],
				default: 'inventory-group',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'inventory-group',
						],
					},
				},
				options: [
					{
						name: 'Get inventory group',
						value: 'get',
						description: 'Get a inventory group',
						action: 'Get a inventory group',
					},
					{
						name: 'Create inventory group',
						value: 'create',
						description: 'Create a inventory group',
						action: 'Create a inventory group',
					},
					{
						name: 'Update inventory group',
						value: 'update',
						description: 'Update a inventory group',
						action: 'Update a inventory group',
					},
					{
						name: 'Delete inventory group',
						value: 'delete',
						description: 'Delete a inventory group',
						action: 'Delete a inventory group',
					},
				],
				default: 'get',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'inventory',
						],
					},
				},
				options: [
					{
						name: 'Get inventory',
						value: 'get',
						description: 'Get a inventory',
						action: 'Get a inventory',
					},
					{
						name: 'Create inventory',
						value: 'create',
						description: 'Create a inventory',
						action: 'Create a inventory',
					},
					{
						name: 'Update inventory',
						value: 'update',
						description: 'Update a inventory',
						action: 'Update a inventory',
					},
					{
						name: 'Delete inventory',
						value: 'delete',
						description: 'Delete a inventory',
						action: 'Delete a inventory',
					},
				],
				default: 'get',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'product-group',
						],
					},
				},
				options: [
					{
						name: 'Get product group',
						value: 'get',
						description: 'Get a product group',
						action: 'Get a product group',
					},
					{
						name: 'Create product group',
						value: 'create',
						description: 'Create an product group',
						action: 'Create an product group',
					},
					{
						name: 'Update product group',
						value: 'update',
						description: 'Update an product group',
						action: 'Update an product group',
					},
					{
						name: 'Delete product group',
						value: 'delete',
						description: 'Delete an product group',
						action: 'Delete an product group',
					},
				],
				default: 'get',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'product',
						],
					},
				},
				options: [
					{
						name: 'Get product',
						value: 'get',
						description: 'Get a product',
						action: 'Get a product',
					},
					{
						name: 'Create product',
						value: 'create',
						description: 'Create an product',
						action: 'Create an product',
					},
					{
						name: 'Update product',
						value: 'update',
						description: 'Update an product',
						action: 'Update an product',
					},
					{
						name: 'Delete product',
						value: 'delete',
						description: 'Delete an product',
						action: 'Delete an product',
					},
				],
				default: 'get',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'identity',
						],
					},
				},
				options: [
					{
						name: 'Get identity',
						value: 'get',
						description: 'Get a identity',
						action: 'Get a identity',
					},
					{
						name: 'Create identity',
						value: 'create',
						description: 'Create a identity',
						action: 'Create a identity',
					},
					{
						name: 'Update identity',
						value: 'update',
						description: 'Update a identity',
						action: 'Update a identity',
					},
					{
						name: 'Delete identity',
						value: 'delete',
						description: 'Delete a identity',
						action: 'Delete a identity',
					},
				],
				default: 'get',
				noDataExpression: true,
				required: true,
			},
			// =========================================>
			// =========================================> Fields
			// =========================================>
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'branch',
						],
					},
				},
				default: '',
				placeholder: 'name@email.com',
			},



			// {
			// 	displayName: 'Additional Fields',
			// 	name: 'additionalFields',
			// 	type: 'collection',
			// 	placeholder: 'Add Field',
			// 	default: {},
			// 	displayOptions: {
			// 		show: {
			// 			resource: [
			// 				'contact',
			// 			],
			// 			operation: [
			// 				'create',
			// 			],
			// 		},
			// 	},
			// 	options: [
			// 		{
			// 			displayName: 'First Name',
			// 			name: 'firstName',
			// 			type: 'string',
			// 			default: '',
			// 		},
			// 		{
			// 			displayName: 'Last Name',
			// 			name: 'lastName',
			// 			type: 'string',
			// 			default: '',
			// 		},
			// 	],
			// },
		],
	};

	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Handle data coming from previous nodes
		const items = this.getInputData();
		let responseData;
		const returnData = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// For each item, make an API call to create a contact
		for (let i = 0; i < items.length; i++) {
			if (resource === 'contact') {
				if (operation === 'create') {
					// Get email input
					const email = this.getNodeParameter('email', i) as string;
					// Get additional fields input
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					const data: IDataObject = {
						email,
					};

					Object.assign(data, additionalFields);

					// Make HTTP request according to https://sendgrid.com/docs/api-reference/
					const options: OptionsWithUri = {
						headers: {
							'Accept': 'application/json',
						},
						method: 'PUT',
						body: {
							contacts: [
								data,
							],
						},
						uri: `https://api.sendgrid.com/v3/marketing/contacts`,
						json: true,
					};
					responseData = await this.helpers.requestWithAuthentication.call(this, 'friendGridApi', options);
					returnData.push(responseData);
				}
			}
		}
		// Map data to n8n data structure
		return [this.helpers.returnJsonArray(returnData)];
	}
}
