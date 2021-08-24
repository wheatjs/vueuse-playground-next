import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ServiceKey = {
  type: process.env.SKEY_TYPE,
  project_id: process.env.SKEY_PROJECT_ID,
  private_key_id: process.env.SKEY_PRIVATE_KEY_ID,
  private_key: process.env.SKEY_PRIVATE_KEY,
  client_id: process.env.SKEY_CLIENT_ID,
  auth_uri: process.env.SKEY_AUTH_URI,
  token_uri: process.env.SKEY_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.SKEY_AUTH_PROVIDER,
  client_x509_cert_url: process.env.SKEY_CERT_URL,
  client_email: process.env.SKEY_CLIENT_EMAIL,
}

export function getServiceKey() {
  if (process.env.SKEY_TYPE)
    return ServiceKey

  const path = resolve(__dirname, '../serviceAccountKey.json')

  if (existsSync(path))
    return JSON.parse(readFileSync(path, 'utf-8'))

  throw new Error('Failed to find serviceAccountKey file or enviornment variables.')
}
