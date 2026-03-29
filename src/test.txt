import * as fs from 'fs';
import * as path from 'path';

// 👉 adjust path if needed
import { PROTO_PATHS } from '../proto/paths';

const OUTPUT_ROOT = path.resolve(__dirname, '../services');
const PROTO_GEN_ROOT = path.resolve(__dirname, '../../gen');

// ---------- helpers ----------

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toKebab(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function cleanDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

// ---------- core parsing ----------

function extractMethods(filePath: string, serviceName: string): string[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  const regex = new RegExp(
    `export interface ${serviceName}Client {([\\s\\S]*?)}`,
    'm'
  );

  const match = content.match(regex);
  if (!match) {
    console.warn(`⚠️ Service ${serviceName}Client not found in ${filePath}`);
    return [];
  }

  const body = match[1];

  const methodRegex = /(\w+)\(request:/g;

  const methods: string[] = [];
  let m;

  while ((m = methodRegex.exec(body))) {
    methods.push(m[1]);
  }

  return methods;
}

// ---------- generators ----------

function generateControllerMethod(name: string, http: any, requestType: string) {
  const decorator = createHttpDecorator(http);
  const params = mapParameters(http.path, http.body, requestType);

  return `
  ${decorator}
  @ApiOperation({ summary: '${name}' })
  async ${name}(${params}) {
    return firstValueFrom(this.client.${name}(${params.includes('@Body()') ? 'body' : '{}'}));
  }`;
}
 function resolveClientImport(serviceKey: string) {
  return `../../../gen/${serviceKey}`;
}

export async function generateController(serviceKey: string, serviceName: string, protoPath: string) {
  const methods = await extractHttpOptions(protoPath, serviceName);
   console.log(methods) 
  const methodStrings = Object.entries(methods).map(([name, http]) => {
    // requestType can be read from ts-proto
    const requestType = `${name}Request`; // improve by mapping ts-proto AST
    return generateControllerMethod(name, http, requestType);
  });

  const className = `${serviceName.replace('Service', '')}Controller`;

  return `
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ${serviceName}Client } from '${resolveClientImport(serviceKey)}';
import { firstValueFrom } from 'rxjs';

@ApiTags('${serviceKey}-${serviceName}')
@Controller('${serviceKey}/${serviceName.replace('Service', '').toLowerCase()}')
export class ${className} {
  constructor(@Inject('${serviceName}') private readonly client: ${serviceName}Client) {}

${methodStrings.join('\n')}
}
`;
}
/*
function generateController(
  serviceKey: string,
  config: any,
  service: string,
  controllerName: string,
  methods: string[]
) {
  const className = `${capitalize(controllerName)}Controller`;

  return `import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ${service}Client } from '../../../gen/${serviceKey}';
import { firstValueFrom } from 'rxjs';

@Controller('v1/${controllerName}')
export class ${className} {
  constructor(
    @Inject('${config.service}')
    private readonly client: ${service}Client,
  ) {}

${methods
  .map(
    (m) => `
  @Post('${toKebab(m)}')
  async ${m}(@Body() body: any) {
    return firstValueFrom(this.client.${m}(body));
  }`
  )
  .join('\n')}
}
`;
}
*/
import * as pb from 'protobufjs';
import { join } from 'path';

async function loadProto(protoPath: string) {
  const root = new pb.Root();

  const protoDirs = [
    join(__dirname, '../../proto'),                    // your protos
    join(__dirname, '../../node_modules/google-proto-files'), // google protos
    join(__dirname, '../../node_modules/google-proto-files/google/api/annotations.proto'),
    join(__dirname, '../../node_modules/google-proto-files/google/api/http.proto'),
  ];

  // Override resolvePath to support imports
  root.resolvePath = (origin, target) => {
    // if target is absolute, use it directly
    if (path.isAbsolute(target) && fs.existsSync(target)) {
      return target;
    }

    // try all include dirs
    for (const dir of protoDirs) {
      const fullPath = path.resolve(dir, target);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    // fallback: maybe relative to origin
    if (origin && !path.isAbsolute(target)) {
      const relative = path.resolve(path.dirname(origin), target);
      if (fs.existsSync(relative)) return relative;
    }

    throw new Error(`Cannot find proto file: ${target}`);
  };


  await root.load(protoPath);
  root.resolveAll();
  return root;
}


export async function extractHttpOptions(protoPath: string, serviceName: string) {

  const root = await loadProto(protoPath);
  const service = root.lookupService(serviceName);

  const result: Record<string, any> = {};

  service.methodsArray.forEach((method) => {
   
    const methodOptions = method.options || {};

    // detect verb
    if (methodOptions['(google.api.http).get']) {
      result[method.name] = { method: 'GET', path: methodOptions['(google.api.http).get'] };
    } else if (methodOptions['(google.api.http).post']) {
      result[method.name] = { method: 'POST', path: methodOptions['(google.api.http).post'], body: methodOptions['(google.api.http).post'] };
    } else if (methodOptions['(google.api.http).patch']) {
      result[method.name] = { method: 'PATCH', path: methodOptions['(google.api.http).patch'], body: methodOptions['(google.api.http).patch'] };
    } else if (methodOptions['(google.api.http).delete']) {
      result[method.name] = { method: 'DELETE', path: methodOptions['(google.api.http).delete'] };
    } else {
      result[method.name] = { method: 'POST', path: `/${method.name}` };
    }
  });

  return result;
}

function createHttpDecorator(http: { method: string; path: string }) {
  switch (http.method) {
    case 'GET':
      return `@Get('${http.path}')`;
    case 'POST':
      return `@Post('${http.path}')`;
    case 'PATCH':
      return `@Patch('${http.path}')`;
    case 'DELETE':
      return `@Delete('${http.path}')`;
    default:
      return `@Post('${http.path}')`;
  }
}

function mapParameters(path: string, bodyField: string | undefined, requestType: string) {
  const params: string[] = [];
  const paramMatches = path.match(/{(\w+)}/g);

  if (paramMatches) {
    paramMatches.forEach((p) => {
      const name = p.replace(/[{}]/g, '');
      params.push(`@Param('${name}') ${name}: string`);
    });
  }

  if (bodyField !== undefined) {
    params.push(`@Body() body: ${requestType}`);
  }

  return params.join(', ');
}

function generateModule(serviceKey: string, config: any) {
  const className = `${capitalize(serviceKey)}Module`;
  const importControllers = config.serviceName.map((s: string) => {
    const file = s.replace(/Service$/, '').toLowerCase();
    return `import { ${capitalize(file)}Controller } from './${file}.controller';`;
  }).join('\n');
  
  const controllerName = config.serviceName.map((s: string) => {
    const file = s.replace(/Service$/, '').toLowerCase();
    return `${capitalize(file)}Controller`;
  }).join(',');
return `import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
${importControllers};

@Module({
  imports: [
    ClientsModule.register([
      {
        name: '${serviceKey}',
        transport: Transport.GRPC,
        options: {
          package: '${config.version}',
          protoPath: ${config.file},
          url: ${config.host}:${config.port},
        },
      },
    ]),
  ],
  controllers: [${controllerName}],
})
export class ${className} {}
`;
}

function generateRootModule(serviceKeys: string[]) {
  const imports = serviceKeys
    .map(
      (s) =>
        `import { ${capitalize(s)}Module } from './${s}/${s}.module';`
    )
    .join('\n');

  const modules = serviceKeys
    .map((s) => `${capitalize(s)}Module`)
    .join(',\n    ');

  return `import { Module } from '@nestjs/common';
${imports}

@Module({
  imports: [
    ${modules}
  ],
})
export class GatewayModule {}
`;
}

// ---------- main ----------

async function generateService(serviceKey: string, config: any) {
  const serviceDir = path.join(OUTPUT_ROOT, serviceKey);
  ensureDir(serviceDir);

  const protoGenFile = path.join(PROTO_GEN_ROOT, `${serviceKey}.ts`);
  config.serviceName.forEach(async (s: string) => {
    const methods = extractMethods(protoGenFile, s);
      if (!methods.length) {
            console.warn(`⚠️ No methods found for ${serviceKey}`);
        }
        const controllerName = s.replace(/Service$/, '').toLowerCase();
        const controller = await generateController(serviceKey, s, config.file);
          fs.writeFileSync(
                path.join(serviceDir, `${controllerName}.controller.ts`),
                controller
            );
  });  
  
  const module = generateModule(serviceKey, config);

  fs.writeFileSync(
    path.join(serviceDir, `${serviceKey}.module.ts`),
    module
  );

  console.log(`✅ Generated ${serviceKey}`);
}

async function main() {
  console.log('🚀 Generating gateway...');

  cleanDir(OUTPUT_ROOT);

  const serviceKeys = Object.keys(PROTO_PATHS);

  for (const [key, config] of Object.entries(PROTO_PATHS)) {
    await generateService(key, config);
  }

  const rootModule = generateRootModule(serviceKeys);

  fs.writeFileSync(
    path.join(OUTPUT_ROOT, 'gateway.module.ts'),
    rootModule
  );

  console.log('🎉 Gateway generation complete');
}

main();