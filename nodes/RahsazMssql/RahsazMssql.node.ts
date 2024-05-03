import {IRecordSet} from 'mssql';
import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {IDatabase} from 'pg-promise';
import {IClient} from 'pg-promise/typescript/pg-subset';
import {MssqlQuery} from "../../helpers/mssqlQuery";
import {initPGDB} from "../../helpers/postgresDB";


export class RahsazMssql implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rahsaz MSSQL',
		name: 'rahsaz-mssql',
		icon: 'file:icon.svg',
		group: [],
		version: 1,
		description: 'RahsazMSSQL Methods',
		defaults: {
			name: 'RahsazMssql'
		},
		subtitle: '={{$parameter["operation"] + " > " + $parameter["resource"]}}',
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'microsoftSql',
				required: true,
				displayOptions: {
					show: {}
				}
			},
			{
				name: 'postgres',
				required: true,
				displayOptions: {
					show: {
					}
				}
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get',
					},
					{
						name: 'Create',
						value: 'create',
						action: 'Create',
					},
					{
						name: 'Update',
						value: 'update',
						action: 'Update',
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete',
					},
				],
				default: 'get',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Table',
				name: 'resource',
				type: 'string',
				default: '',
				noDataExpression: false,
				required: true,
				description: 'Enter name of the table in database'
			},

			// =========================================> Fields
			{
				displayName: 'ID',
				name: 'Id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'get',
							'update',
							'delete'
						],
					},
				},
				default: '',
			},
			{
				displayName: 'Have Relation?',
				name: 'haveRelation',
				type: 'boolean',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'get'
						],
					},
				},
				default: false,
			},
			{
				displayName: 'Relations',
				name: 'relations',
				type: 'fixedCollection',
				required: true,
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'relations_data',
						displayName: 'Relation',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Table',
								name: 'table',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Table Query Column',
								description: 'That column that you query with',
								name: 'tField',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Table Select Column',
								description: 'That column that you want in output, separate by comma(,)',
								name: 'oField',
								type: 'string',
								default: '',
								required: true,
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: [
							'get'
						],
						haveRelation: [
							true
						]
					},
				},
				default: {},
			},
			{
				displayName: 'Have Dependencies?',
				name: 'haveDependency',
				type: 'boolean',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'get'
						],
					},
				},
				default: false,
			},
			{
				displayName: 'Dependencies',
				name: 'dependencies',
				type: 'fixedCollection',
				required: true,
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'dependencies_data',
						displayName: 'Dependencies',
						values: [
							{
								displayName: 'Table',
								name: 'table',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Field',
								name: 'field',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Force',
								name: 'force',
								type: 'boolean',
								default: true,
								required: true,
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: [
							'get'
						],
						haveDependency: [
							true
						]
					},
				},
				default: {},
			},
			{
				displayName: 'Guid?',
				name: 'haveGuid',
				type: 'boolean',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'create'
						],
					},
				},
				default: false,
			},
			{
				displayName: 'Merge?',
				name: 'merge',
				type: 'boolean',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'get',
							'create',
							'update',
							'delete'
						],
					},
				},
				default: true,
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'fixedCollection',
				required: true,
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'fields_data',
						displayName: 'Fields',
						values: [
							{
								displayName: 'Column',
								name: 'column',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								required: true,
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: [
							'create',
							'update'
						]
					},
				},
				default: {},
			},
		],
	};


	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let Q = []
		let responseData: IRecordSet<any>;
		const returnData: any[] = [];
		const microsoftSqlCrd = await this.getCredentials('microsoftSql', 0);
		const postgresCrd = await this.getCredentials('postgres', 0);
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const merge = this.getNodeParameter('merge', 0) as boolean;

		// for (let i = 0; i < items.length; i++) {
		let i = 0
		let props: {
			source: string,
			ID: string,
			TABLE: string,
			_ID_: string,
			_TABLE_: string
		} = items[0].json.props as any
		let T = resource

		if (!!T) {
			if (operation === 'get') {
				const ID = this.getNodeParameter('Id', i) as string;
				if (this.getNodeParameter('haveRelation', i) as boolean) {
					const r = this.getNodeParameter('relations', i) as { relations_data: Array<any> }
					let fields = [`${T}.*`]
					r['relations_data'].map(({table, oField}: { table: string, oField: string }) => {
						oField.split(",").map((o) => {
							fields.push(`${table}.${o} as ${table}${o}`)
						})
					})
					Q.push(`SELECT ${fields.join(",")} FROM ${T}`)
					r['relations_data'].map(({field, table, tField}) => {
						Q.push(`INNER JOIN ${table} ON ${T}.${field} = ${table}.${tField}`)
					})
					Q.push(`WHERE ${T}.Id='${ID}'`)
				} else {
					Q.push(`SELECT * FROM ${T} WHERE Id='${ID}'`)
				}
			}
			if (operation === 'create') {
				const f = this.getNodeParameter('fields', i) as { fields_data: Array<any> }
				const P: { [key: string]: string } = {}
				f.fields_data.map(({column, value}) => {
					P[column] = value
				})
				if (this.getNodeParameter('haveGuid', i) as boolean) {
					Q.push(`DECLARE @op TABLE (Guid uniqueidentifier);`)
					Q.push(`INSERT INTO ${T} (${Object.keys(P).join(", ")}) OUTPUT inserted.Id INTO @op VALUES(${Object.keys(P).map((s) => (P[s]==='NEWID()' ? "NEWID()" :"'" + P[s] + "'")).join(", ")});`)
					Q.push(`SELECT Guid AS _ID_ FROM @op;`)
				} else {
					Q.push(`INSERT INTO ${T} (${Object.keys(P).join(", ")}) VALUES(${Object.keys(P).map((s) => "'" + P[s] + "'").join(", ")});`)
					Q.push(`SELECT SCOPE_IDENTITY() AS _ID_;`)
				}
			}
			if (operation === 'update') {
				const f = this.getNodeParameter('fields', i) as { fields_data: Array<any> }
				const P: { [key: string]: string } = {}
				f.fields_data.map(({column, value}) => {
					P[column] = value
				})
				const ID = this.getNodeParameter('Id', i) as string;
				Q.push(`UPDATE ${T} SET ${Object.keys(P).map((s) => s + "='" + P[s] + "'").join(", ")} WHERE Id='${ID}';`)
			}
			if (operation === 'delete') {
				const ID = this.getNodeParameter('Id', i) as string;
				Q.push(`DELETE FROM ${T} WHERE Id='${ID}';`)
			}

			responseData = await MssqlQuery(microsoftSqlCrd, Q.join("\n"))

			if (operation === 'get' && (!responseData || !responseData.length)) {
				return [[]];
			}


			// ==========================================> haveDependency
			if (operation === 'get' && this.getNodeParameter('haveDependency', i) as boolean && !!responseData && !!responseData.length) {
				const dp = this.getNodeParameter('dependencies', i) as { dependencies_data: Array<any> }
				responseData = await getDependencies(dp, postgresCrd, props, responseData)
			}


			returnData.push(responseData as any);

		}
		// }
		// console.log(returnData, returnData[0][0], "---")
		if (merge) return [
			this.helpers.returnJsonArray(
				returnData?.[0]
					?
					returnData[0].map((v: any) => (
						(operation === 'create' ? {props: {...props, ...v}} : {...v, props})
					))
					:
					{props}
			)
		];
		return [this.helpers.returnJsonArray(returnData?.[0])];
	}


}


// @ts-ignore
const getDependencies = async (dp, postgresCrd, props, responseData) => {
	return new Promise<IRecordSet<any>>(async (resolve, reject) => {
		const {db} = await initPGDB(postgresCrd)
		let dependencies: any = {}
		for (let i = 0; i < dp['dependencies_data'].length; i++) {
			const {table, field, force} = dp['dependencies_data'][i]

			let $r = ''
			let $s = '*'
			if (props.source === "Click") {
				$r = `"CKName"='${table}' AND "CKId"='${responseData?.[0]?.[field]}'`
				$s = `"PGId" as _ID_`
			}
			if (props.source === "PayamGostar") {
				$r = `"PGName"='${table}' AND "PGId"='${responseData?.[0]?.[field]}'`
				$s = `"CKId" as _ID_`
			}
			const q = `SELECT ${$s} FROM public.ck_pg WHERE ${$r}`
			dependencies[field] = await getDependencyValue(db, q, field, force)
		}
		responseData[0] = {...responseData[0], dependencies}
		return resolve(responseData)
	})
}


const getDependencyValue = async (db: IDatabase<{}, IClient>, q: string, field: string, isForce: boolean): Promise<string | null> => {
	let value: string | null = null
	const dpnc: Array<any> = await db.query(q)
	if (!!dpnc?.length) {
		value = dpnc[0]['_id_']
	} else {
		console.log(field, "Can't Find")
		if (isForce) {
			console.log(field, "Force to Find, wait and run again")
			value = await new Promise<string | null>((resolve, reject) => {
				setTimeout(async () => {
					value = await getDependencyValue(db, q, field, isForce)
					return resolve(value)
				}, 10000)
			})
		}
	}
	return value
}
