import mssql from "mssql"
import {ICredentialDataDecryptedObject} from "n8n-workflow";

export const MssqlQuery = async (credential: ICredentialDataDecryptedObject, query: string) => {

	const config = {
		server: credential.server as string,
		port: credential.port as number,
		database: credential.database as string,
		user: credential.user as string,
		password: credential.password as string,
		domain: credential.domain ? (credential.domain as string) : undefined,
		connectionTimeout: credential.connectTimeout as number,
		requestTimeout: credential.requestTimeout as number,
		options: {
			encrypt: credential.tls as boolean,
			enableArithAbort: false,
			tdsVersion: credential.tdsVersion as string,
			trustServerCertificate: credential.allowUnauthorizedCerts as boolean,
		},
	};

	const pool = new mssql.ConnectionPool(config);
	await pool.connect();

	const request = pool.request();
	return (await request.query(query)).recordset
}


