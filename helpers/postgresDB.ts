import pgPromise from 'pg-promise';
import {ICredentialDataDecryptedObject, IDataObject} from "n8n-workflow";


export async function initPGDB(credentials: ICredentialDataDecryptedObject) {
	const pgp = pgPromise({
		noWarnings: true,
	});
	const config: IDataObject = {
		host: credentials.host as string,
		port: credentials.port as number,
		database: credentials.database as string,
		user: credentials.user as string,
		password: credentials.password as string,
		keepAlive: true,
	};

	// config.connectionTimeoutMillis = options.connectionTimeout * 1000;
	// config.keepAliveInitialDelayMillis = options.delayClosingIdleConnection * 1000;


	if (credentials.allowUnauthorizedCerts === true) {
		config.ssl = {
			rejectUnauthorized: false,
		};
	} else {
		config.ssl = !['disable', undefined].includes(credentials.ssl as string | undefined);
		config.sslmode = (credentials.ssl as string) || 'disable';
	}

	const db = pgp(config);
	return {db, pgp};
}
