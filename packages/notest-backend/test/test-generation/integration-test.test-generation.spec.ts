// import { NTInstrumentedEvent } from '@notest/common';
// import { InstrumentedEventService } from '../../src/instrumented-event/instrumented-event.service';
// import { DBConfig, PostgresDbService } from '../../src/shared/services/postgres-db.service';
//
// describe('Test add event to DB and generation test', () => {
//   jest.setTimeout(10000);
//   const testConfig: DBConfig = {
//     host: 'localhost',
//     user: 'postgres',
//     password: 'password',
//     database: 'notest',
//     port: 5432
//   };
//
//   const db: PostgresDbService = new PostgresDbService();
//
//   beforeEach(() => {
//     db.query(`delete from instrumented_event`);
//   });
//
//   afterEach(() => {
//     db.query(`delete from instrumented_event`);
//   });
//   const instFunction = new InstrumentedEventService(db);
//
//   test('add events and trigger test generation of function', async () => {
//     const projectName = 'testProject';
//     const scriptType = 'function';
//     const filePath = 'src/fileTest.ts';
//     const functionName = 'functionTest';
//     const eventsToAdd = await createEvents(projectName, scriptType, filePath, functionName);
//     await saveOnDbAndTriggerGeneration(
//       projectName,
//       scriptType,
//       filePath,
//       functionName,
//       eventsToAdd
//     );
//   });
//
//   test('add events and trigger test generation of methods', async () => {
//     const projectName = 'testProject';
//     const scriptType = 'method';
//     const filePath = 'src/fileTest.ts';
//     const functionName = 'classTest.methodTest';
//     const eventsToAdd = await createEvents(projectName, scriptType, filePath, functionName);
//     await saveOnDbAndTriggerGeneration(
//       projectName,
//       scriptType,
//       filePath,
//       functionName,
//       eventsToAdd
//     );
//   });
//
//   async function createEvents(projectName, scriptType, filePath, functionName) {
//     await instFunction.generateTable();
//     const eventsToAdd: NTInstrumentedEvent[] = [];
//     for (let i = 0; i <= 2; i++) {
//       eventsToAdd.push({
//         project: projectName,
//         script: scriptType,
//         file: filePath,
//         function: functionName,
//         line: 0,
//         timestamp: i,
//         type: 'text',
//         value: { content: 'textofScript' }
//       });
//
//       eventsToAdd.push({
//         project: projectName,
//         script: scriptType,
//         file: filePath,
//         function: functionName,
//         line: 1,
//         timestamp: i,
//         type: 'input',
//         value: { content: i }
//       });
//
//       eventsToAdd.push({
//         project: projectName,
//         script: scriptType,
//         file: filePath,
//         function: functionName,
//         line: 2,
//         timestamp: i,
//         type: 'output',
//         value: { content: i + 1 }
//       });
//     }
//     return eventsToAdd;
//   }
//
//   async function saveOnDbAndTriggerGeneration(
//     projectName,
//     scriptType,
//     filePath,
//     functionName,
//     eventsToAdd
//   ) {
//     let ids = [];
//     await instFunction.bulkSave(eventsToAdd).then((id) => (ids = id));
//     console.log(ids.length);
//
//     const rawResponse = await fetch('http://localhost:3000/test-generator/generate-test', {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         projectName: projectName,
//         scriptType: scriptType,
//         filePath: filePath,
//         functionName: functionName
//       })
//     });
//     expect(rawResponse.ok).toBeTruthy();
//   }
// });
