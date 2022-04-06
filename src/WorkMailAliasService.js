import AWS from 'aws-sdk';

class WorkMailAliasService {
	constructor() {
		this.ENTITY_ID = '608ee6ad-fb6e-4ea9-8be9-12116c0b0c54';
		this.ORG_ID = 'm-b613ff945d9e4aa58cba045dbefdffe8';
		this.client = new AWS.WorkMail({
			region: 'eu-west-1',
			credentials: {
				accessKeyId: process.env.WORKMAIL_ACCESS_KEY,
				secretAccessKey: process.env.WORKMAIL_ACCESS_SECRET,
			},
		});
	}

	async listAliases() {
		const resp = await this.client
			.listAliases({
				EntityId: this.ENTITY_ID,
				OrganizationId: this.ORG_ID,
			})
			.promise();

		return resp.Aliases;
	}

	async addAlias(alias) {
		await this.client
			.createAlias({
				EntityId: this.ENTITY_ID,
				OrganizationId: this.ORG_ID,
				Alias: alias,
			})
			.promise();

		return await this.listAliases();
	}
}

export { WorkMailAliasService };
