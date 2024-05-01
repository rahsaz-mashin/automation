import sql from "mssql"
import {ICredentialDataDecryptedObject} from "n8n-workflow";

export const MssqlQuery = async (credential: ICredentialDataDecryptedObject, query: string) => {
	const sqlConfig = {
		server: credential.server as string,
		user: credential.user as string,
		password: credential.password as string,
		database: credential.database as string,
		port: credential.port as number,
		pool: {
			max: 10,
			min: 0,
			idleTimeoutMillis: 30000
		},
		options: {
			encrypt: true,
			trustServerCertificate: true
		}
	}
	await sql.connect(sqlConfig)
	return (await sql.query(query)).recordset
}


