import {
	IExecuteFunctions,
} from 'n8n-core';

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
				displayName: 'Output Fields',
				description: 'Type fields that you want to returned from airbyte (separate by comma)',
				name: 'fields',
				type: 'string',
				default: '',
				noDataExpression: false,
				required: true,
			},
		],
	};


	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const postgresCrd = await this.getCredentials('postgres', 0);
		const items = this.getInputData();
		const source = this.getNodeParameter('source', 0) as string;
		const table = this.getNodeParameter('table', 0) as string;
		const _table_ = this.getNodeParameter('_table_', 0) as string;
		const fields = this.getNodeParameter('fields', 0) as string;

		const {Id, _ab_cdc_deleted_at, ...others} = items[0].json.payload as { Id: string, _ab_cdc_deleted_at: string, others: any }
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
		for (let i = 0; i < fy.length; i++) {
			fy[i]
			// @ts-ignore
			yfields[fy[i]] = others[fy[i]]
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
