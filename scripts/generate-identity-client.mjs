import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = resolve(root, process.argv[2] ?? 'backend/docs/contracts/identity.openapi.yaml');
const spec = JSON.parse(readFileSync(input, 'utf8'));
function type(schema = {}) {
  if (schema.$ref) return `Schemas[${JSON.stringify(schema.$ref.split('/').at(-1))}]`;
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.enum) return schema.enum.map(value => JSON.stringify(value)).join(' | ');
  if (schema.anyOf || schema.oneOf) return (schema.anyOf ?? schema.oneOf).map(type).join(' | ');
  if (Array.isArray(schema.type)) return schema.type.map(value => type({ ...schema, type: value })).join(' | ');
  if (schema.type === 'null') return 'null';
  if (schema.type === 'array') return `Array<${type(schema.items)}>`;
  if (schema.type === 'object' || schema.properties) {
    const required = new Set(schema.required ?? []);
    const fields = Object.entries(schema.properties ?? {}).map(([key, value]) => `${JSON.stringify(key)}${required.has(key) ? '' : '?'}: ${type(value)};`);
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') fields.push(`[key: string]: ${type(schema.additionalProperties)};`);
    return fields.length ? `{ ${fields.join(' ')} }` : 'Record<string, unknown>';
  }
  return ({ string: 'string', integer: 'number', number: 'number', boolean: 'boolean' })[schema.type] ?? 'unknown';
}
const schemas = Object.entries(spec.components.schemas).map(([name, schema]) => `  ${JSON.stringify(name)}: ${type(schema)};`);
const operations = [];
const metadata = {};
for (const [path, item] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    if (!operation.operationId) continue;
    const body = operation.requestBody?.content?.['application/json']?.schema;
    const responses = Object.entries(operation.responses).filter(([status]) => /^2\d\d$/.test(status));
    const response = responses.map(([, value]) => value.content?.['application/json']?.schema).map(value => value ? type(value) : 'void').join(' | ') || 'void';
    const parameters = [...(item.parameters ?? []), ...(operation.parameters ?? [])].filter(value => value.in === 'path');
    const pathType = parameters.length ? `{ ${parameters.map(value => `${JSON.stringify(value.name)}: string`).join('; ')} }` : 'Record<string, never>';
    operations.push(`  ${JSON.stringify(operation.operationId)}: { body: ${body ? type(body) : 'undefined'}; response: ${response}; path: ${pathType} };`);
    metadata[operation.operationId] = { method: method.toUpperCase(), path };
  }
}
const output = resolve(root, process.argv[3] ?? 'frontend/generated/identity.ts');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `// Generated from backend/docs/contracts/identity.openapi.yaml. Run npm run generate:identity.\nexport type Schemas = {\n${schemas.join('\n')}\n};\nexport type IdentityOperations = {\n${operations.join('\n')}\n};\nexport const identityOperations = ${JSON.stringify(metadata, null, 2)} as const;\n`);
console.log(`Identity client: ${operations.length} operations, ${schemas.length} schemas generated.`);
