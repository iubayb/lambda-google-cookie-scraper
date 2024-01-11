import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient();

async function getSecret(SecretId: string): Promise<string> {
    try {
        const command = new GetSecretValueCommand({ SecretId });
        const response = await client.send(command);
        if (response && response.SecretString) {
            return response.SecretString;
        } else {
            throw new Error(`Secret not found: ${SecretId}`);
        }
    } catch (error) {
        console.error(`Error retrieving secret: ${SecretId}`, error);
        throw error;
    }
}

export default getSecret;
