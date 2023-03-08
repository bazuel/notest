// import { NTInstrumentedEvent } from '@butopen/notest-model';
// import { TestGeneratorService } from '../../src/test-generator/test-generator.service';
// import { DBConfig, PostgresDbService } from '../../src/shared/services/postgres-db.service';
// import { Project } from 'ts-morph';
// import { DbEventApiService } from '../../src/db-event-api/db-event-api.service';
//
// describe('Test generation', () => {
//   const testConfig: DBConfig = {
//     host: 'localhost',
//     user: 'postgres',
//     password: 'password',
//     database: 'testnt',
//     port: 5432
//   };
//
//   test('test on generation of tests', async () => {
//     const testRoutine: NTInstrumentedEvent[] = [];
//     const testGenerator = new TestGeneratorService(
//       new PostgresDbService(testConfig),
//       new DbEventApiService(new PostgresDbService(testConfig))
//     );
//     testRoutine.push({
//       project: 'testProject',
//       script: 'function',
//       file: 'path/testFile.ts',
//       function: 'testFunction',
//       line: 0,
//       timestamp: Date.now(),
//       type: 'input',
//       value: { test: true }
//     });
//
//     testRoutine.push({
//       project: 'testProject',
//       script: 'function',
//       file: 'path/testFile.ts',
//       function: 'testFunction',
//       line: 0,
//       timestamp: Date.now(),
//       type: 'input',
//       value: 7
//     });
//
//     testRoutine.push({
//       project: 'testProject',
//       script: 'function',
//       file: 'path/testFile.ts',
//       function: 'testFunction',
//       line: 0,
//       timestamp: Date.now(),
//       type: 'input',
//       value: 'input'
//     });
//
//     testRoutine.push({
//       project: 'testProject',
//       script: 'function',
//       file: 'path/testFile.ts',
//       function: 'testFunction',
//       line: 1,
//       timestamp: Date.now(),
//       type: 'output',
//       value: 'output'
//     });
//
//     console.log(
//       await testGenerator.generateFunctionTest(
//         testRoutine,
//         new Project({
//           tsConfigFilePath: 'tsconfig.json'
//         })
//       )
//     );
//   });
// });
