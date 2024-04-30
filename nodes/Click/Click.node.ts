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


export class Click implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Click (RahsazMashin)',
		name: 'rahsaz-automation-click',
		icon: 'file:icon.png',
		group: [],
		version: 1,
		description: 'Automation methods for Click',
		defaults: {
			name: 'Click',
			color: '#1d4ed8'
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
						name: 'Branch',
						value: 'branch',
					},
					{
						name: 'Depot',
						value: 'depot',
					},
					{
						name: 'Item Group',
						value: 'item-group',
					},
					{
						name: 'Item',
						value: 'item',
					},
					{
						name: 'Buyer',
						value: 'buyer',
					},
				],
				default: 'branch',
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
							'branch',
						],
					},
				},
				options: [
					{
						name: 'Get branch',
						value: 'get',
						description: 'Get a branch',
						action: 'Get a branch',
					},
					{
						name: 'Create branch',
						value: 'create',
						description: 'Create a branch',
						action: 'Create a branch',
					},
					{
						name: 'Update branch',
						value: 'update',
						description: 'Update a branch',
						action: 'Update a branch',
					},
					{
						name: 'Delete branch',
						value: 'delete',
						description: 'Delete a branch',
						action: 'Delete a branch',
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
							'depot',
						],
					},
				},
				options: [
					{
						name: 'Get depot',
						value: 'get',
						description: 'Get a depot',
						action: 'Get a depot',
					},
					{
						name: 'Create depot',
						value: 'create',
						description: 'Create a depot',
						action: 'Create a depot',
					},
					{
						name: 'Update depot',
						value: 'update',
						description: 'Update a depot',
						action: 'Update a depot',
					},
					{
						name: 'Delete depot',
						value: 'delete',
						description: 'Delete a depot',
						action: 'Delete a depot',
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
							'item-group',
						],
					},
				},
				options: [
					{
						name: 'Get item group',
						value: 'get',
						description: 'Get a item group',
						action: 'Get a item group',
					},
					{
						name: 'Create item group',
						value: 'create',
						description: 'Create an item group',
						action: 'Create an item group',
					},
					{
						name: 'Update item group',
						value: 'update',
						description: 'Update an item group',
						action: 'Update an item group',
					},
					{
						name: 'Delete item group',
						value: 'delete',
						description: 'Delete an item group',
						action: 'Delete an item group',
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
							'item',
						],
					},
				},
				options: [
					{
						name: 'Get item',
						value: 'get',
						description: 'Get a item',
						action: 'Get a item',
					},
					{
						name: 'Create item',
						value: 'create',
						description: 'Create an item',
						action: 'Create an item',
					},
					{
						name: 'Update item',
						value: 'update',
						description: 'Update an item',
						action: 'Update an item',
					},
					{
						name: 'Delete item',
						value: 'delete',
						description: 'Delete an item',
						action: 'Delete an item',
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
							'buyer',
						],
					},
				},
				options: [
					{
						name: 'Get buyer',
						value: 'get',
						description: 'Get a buyer',
						action: 'Get a buyer',
					},
					{
						name: 'Create buyer',
						value: 'create',
						description: 'Create a buyer',
						action: 'Create a buyer',
					},
					{
						name: 'Update buyer',
						value: 'update',
						description: 'Update a buyer',
						action: 'Update a buyer',
					},
					{
						name: 'Delete buyer',
						value: 'delete',
						description: 'Delete a buyer',
						action: 'Delete a buyer',
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
