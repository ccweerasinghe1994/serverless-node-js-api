const {SSMClient, GetParameterCommand, PutParameterCommand} = require("@aws-sdk/client-ssm");

const STAGE = process.env.STAGE;
const DATABASE_URL_SSM_PARAM = `/serverless-node-js-api/${STAGE}/database-url`;
const AWS_REGION = process.env.AWS_REGION;

async function getDatabaseUrl() {
    const client = new SSMClient({region: AWS_REGION});
    const parameterData = {Name: DATABASE_URL_SSM_PARAM, WithDecryption: true};
    const command = new GetParameterCommand(parameterData);
    const response = await client.send(command);
    return response.Parameter.Value;
}

async function putDatabaseUrl(stage, databaseUrl) {
    const paramStage = stage ? stage : "dev";

    if (paramStage === 'prod') {
        return;
    }

    const databaseUrlParam = `/serverless-node-js-api/${paramStage}/database-url`;

    const client = new SSMClient({region: AWS_REGION});
    const parameterData = {
        Name: databaseUrlParam,
        WithDecryption: true,
        Value: databaseUrl,
        Type: 'SecureString',
        Overwrite: true
    };
    const command = new PutParameterCommand(parameterData);
    return await client.send(command);
}

module.exports = {getDatabaseUrl, putDatabaseUrl};
