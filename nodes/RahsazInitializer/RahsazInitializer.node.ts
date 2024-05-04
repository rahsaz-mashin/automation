import {
	IExecuteFunctions,
} from 'n8n-core';
import set from 'lodash/set';

import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {initPGDB} from "../../helpers/postgresDB";


export class RahsazInitializer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rahsaz Initializer',
		name: 'rahsaz-initializer',
		icon: 'file:icon.svg',
		group: [],
		version: 1,
		description: 'RahsazInitializer Methods',
		defaults: {
			name: 'RahsazInitializer'
		},
		subtitle: '={{$parameter["source"] + " > " + $parameter["table"]}}',
		inputs: ['main'],
		outputs: ['main', 'main', 'main'],
		outputNames: ['INSERT', 'UPDATE', 'DELETE'],
		parameterPane: 'wide',
		credentials: [
			{
				name: 'postgres',
				required: true,
				displayOptions: {
					show: {}
				}
			},
		],
		properties: [
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				default: 'Click',
				options: [
					{
						name: "Click",
						value: "Click"
					},
					{
						name: "PayamGostar",
						value: "PayamGostar"
					},
				],
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Source Table',
				name: 'table',
				type: 'string',
				default: '',
				noDataExpression: false,
				required: true,
			},
			{
				displayName: 'Destination Table',
				name: '_table_',
				type: 'string',
				default: '',
				noDataExpression: false,
				required: true,
			},
			{
				displayName: 'Filter data?',
				name: 'haveFilter',
				type: 'boolean',
				required: true,
				default: false,
			},
			{
				displayName: 'Filters',
				name: 'filters',
				placeholder: 'Add condition',
				// @ts-ignore
				type: 'filter',
				default: {},
				typeOptions: {
					filter: {
						// Use the user options (below) to determine filter behavior
						caseSensitive: '={{!$parameter.filter_options.ignoreCase}}',
						typeValidation: '={{$parameter.filter_options.looseTypeValidation ? "loose" : "strict"}}',
					},
				},
				displayOptions: {
					show: {
						haveFilter: [
							true
						],
					},
				},
			},
			{
				displayName: 'Filter Options',
				name: 'filter_options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				options: [
					{
						displayName: 'Ignore Case',
						description: 'Whether to ignore letter case when evaluating conditions',
						name: 'ignoreCase',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Less Strict Type Validation',
						description: 'Whether to try casting value types based on the selected operator',
						name: 'looseTypeValidation',
						type: 'boolean',
						default: true,
					},
				],
				displayOptions: {
					show: {
						haveFilter: [
							true
						],
					},
				},
			},
			{
				displayName: 'Output Fields',
				description: 'Type fields that you want to returned from airbyte (separate by comma)',
				name: 'fields',
				type: 'string',
				default: '',
				noDataExpression: false,
				required: false,
			}
		],
	};


	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const postgresCrd = await this.getCredentials('postgres', 0);
		const source = this.getNodeParameter('source', 0) as string;
		const table = this.getNodeParameter('table', 0) as string;
		const _table_ = this.getNodeParameter('_table_', 0) as string;
		const fields = this.getNodeParameter('fields', 0) as string;
		const haveFilter = this.getNodeParameter('haveFilter', 0) as boolean;
		const items = this.getInputData()

		const keptItems: INodeExecutionData[] = [];
		const discardedItems: INodeExecutionData[] = [];
		if(haveFilter) {

			items.forEach((item, itemIndex) => {
				try {
					const options = this.getNodeParameter('filter_options', itemIndex) as {
						ignoreCase?: boolean;
						looseTypeValidation?: boolean;
					};
					let pass = false;
					try {
						pass = this.getNodeParameter('filters', itemIndex, false, {
							extractValue: true,
						}) as boolean;
					} catch (error) {
						if (!options.looseTypeValidation) {
							set(
								error,
								'description',
								"Try changing the type of comparison. Alternatively you can enable 'Less Strict Type Validation' in the options.",
							);
						}
						set(error, 'context.itemIndex', itemIndex);
						set(error, 'node', this.getNode());
						throw error;
					}

					if (item.pairedItem === undefined) {
						item.pairedItem = { item: itemIndex };
					}

					if (pass) {
						keptItems.push(item);
					} else {
						discardedItems.push(item);
					}
				} catch (error) {
					if (this.continueOnFail()) {
						discardedItems.push(item);
					} else {
						throw error;
					}
				}
			});
		}

		const {Id, _ab_cdc_deleted_at, ...others} = (haveFilter ? keptItems[0] : items[0]).json.payload as {
			Id: string,
			_ab_cdc_deleted_at: string,
			others: any
		}
		let $r = ''
		let $s = '*'
		if (source === "Click") {
			$r = `"CKName"='${table}' AND "CKId"='${Id}'`
			$s = `"PGId" as _ID_, "CKId" as ID`
		}
		if (source === "PayamGostar") {
			$r = `"PGName"='${table}' AND "PGId"='${Id}'`
			$s = `"CKId" as _ID_, "PGId" as ID`
		}

		let yfields: any = {}
		const fy = fields.split(",")
		if (!!fields) {
			for (let i = 0; i < fy.length; i++) {
				fy[i]
				// @ts-ignore
				yfields[fy[i]] = others[fy[i]]
			}
		}

		const {db} = await initPGDB(postgresCrd)
		const q = `SELECT ${$s} FROM public.ck_pg WHERE ${$r}`
		console.log(q, 'query')
		const relation: Array<any> = await db.query(q)
		const data = [{
			props: {
				source: source,
				ID: relation?.[0]?.id || Id,
				TABLE: table,
				_ID_: relation?.[0]?._id_,
				_TABLE_: _table_,
				...yfields
			}
		}]


		if (!!relation.length) {
			if (!!_ab_cdc_deleted_at) {
				// DELETE
				return [[], [], this.helpers.returnJsonArray(data)];
			} else {
				// UPDATE
				return [[], this.helpers.returnJsonArray(data), []];
			}
		} else {
			if (!!_ab_cdc_deleted_at) {
				// IGNORE
				return [[], [], []]
			} else {
				// INSERT
				return [this.helpers.returnJsonArray(data), [], []];
			}
		}
	}
}
