import { Injectable } from '@nestjs/common';
import { BLSessionEvent } from '@notest/common';
import { SessionGenerator } from '@notest/backend-shared';

@Injectable()
export class TestGeneratorService {
  private sessionGenerator: SessionGenerator;

  constructor() {
    this.sessionGenerator = new SessionGenerator();
  }

  // async getRoutines(request: {
  //   projectName: string;
  //   scriptType: string;
  //   filePath: string;
  //   functionName: string;
  // }) {
  //   const variables: NTInstrumentedEvent[] =
  //     await this.instrumentedEventService.getAllRoutinesFromDb(request);
  //   const routines: { routine: NTInstrumentedEvent[] }[] = [];
  //   const routineBuffer: NTInstrumentedEvent[] = [];
  //   for (const variable of variables) {
  //     if (variable.event_type == 'text') {
  //       const routine = routineBuffer.splice(0);
  //       if (routine.length) {
  //         routines.push({ routine: routine });
  //       }
  //     }
  //     routineBuffer.push(variable);
  //   }
  //   routines.push({ routine: routineBuffer.splice(0) });
  //   if (variables.length) {
  //     return {
  //       scriptType: variables[0].script_type,
  //       scriptData: routines
  //     };
  //   } else {
  //     return {
  //       scriptType: '',
  //       scriptData: routines
  //     };
  //   }
  // }
  //
  // async generateFunctionTest(routine: NTInstrumentedEvent[], project: Project) {
  //   const projectName = routine[0].project_name;
  //   const fileName = routine[0].filepath;
  //   const functionName = routine[0].script_name;
  //   const pathFile = routine[0].filepath.replace('\\', '/').split('/').slice(0, -1).join('/');
  //   const destinationPath =
  //     './generated/test-' +
  //     projectName +
  //     '-' +
  //     fileName.replace(/\//g, '-') +
  //     '-' +
  //     functionName +
  //     '.spec.ts';
  //   let testFile = project.getSourceFile(destinationPath);
  //   if (!testFile) {
  //     testFile = project.createSourceFile(destinationPath);
  //   }
  //
  //   const inputs = routine.filter((element) => element.event_type == 'input');
  //   const output = routine.filter((element) => element.event_type == 'output')[0];
  //   if (output) {
  //     const testTitle = makeTitle(inputs, output);
  //     const importStatement = `import {${functionName}} from '../../${routine[0].filepath.slice(
  //       0,
  //       -3
  //     )}'`;
  //     const { params, returnValue } = giveParamsAndExpected(inputs, output);
  //
  //     let testFunction = `test("${testTitle}", async () => {\n`;
  //     testFunction += ` expect(${functionName}(${params})).toBe(${returnValue})\n})`;
  //
  //     testFile.insertStatements(0, importStatement);
  //     testFile.addStatements(testFunction);
  //     testFile.organizeImports();
  //     project.saveSync();
  //
  //     console.log('created test for function: ' + functionName + ' at: ' + destinationPath);
  //
  //     return testFile.getText();
  //   } else {
  //     return null;
  //   }
  // }
  //
  // async generateMethodTest(routine: NTInstrumentedEvent[], project: Project) {
  //   const projectName = routine[0].project_name;
  //   const fileName = routine[0].filepath;
  //   const className = routine[0].script_name.split('.')[0];
  //   const methodName = routine[0].script_name.split('.')[1];
  //   const pathFile = routine[0].filepath.replace('\\', '/').split('/').slice(0, -1).join('/');
  //   const destinationPath =
  //     './generated/test-' +
  //     projectName +
  //     '-' +
  //     fileName.replace(/\//g, '-') +
  //     '-' +
  //     className +
  //     '-' +
  //     methodName +
  //     '.spec.ts';
  //   let testFile = project.getSourceFile(destinationPath);
  //   if (!testFile) {
  //     testFile = project.createSourceFile(destinationPath);
  //     testFile.insertStatements(0, 'import {createMockProxy} from "./mock.instrumenter-shared";');
  //   }
  //   const context = routine.filter((element) => element.event_type == 'text')[0];
  //   const inputs = routine.filter((element) => element.event_type == 'input');
  //   const variables = routine
  //     .filter((element) => element.event_type == 'variable')
  //     .filter((element) => element.other != null)
  //     .filter((variable) => variable.other.service != '');
  //   const output = routine.filter((element) => element.event_type == 'output')[0];
  //
  //   if (output) {
  //     const testTitle = makeTitle(inputs, output);
  //     const { params, returnValue } = giveParamsAndExpected(inputs, output);
  //     let classParams = '';
  //
  //     if (context.other != null) {
  //       classParams = context.other.parameters.map((params) => params.name).join(',');
  //     }
  //
  //     const importStatement = `import {${className}} from '../../${routine[0].filepath.slice(
  //       0,
  //       -3
  //     )}';\n`;
  //
  //     let testFunction = `test('${testTitle}', async () => {\n`;
  //     if (context.other != null) {
  //       context.other.parameters.forEach(
  //         (param) => (testFunction += `const ${param.name} = createMockProxy<any>()\n`)
  //       );
  //     }
  //
  //     testFunction += getMockStatements(variables);
  //
  //     testFunction += `expect(await new ${className}(${classParams}).${methodName}(${params})).toStrictEqual(${returnValue})\n})`;
  //
  //     testFile.insertStatements(0, importStatement);
  //     testFile.addStatements(testFunction);
  //     testFile.organizeImports();
  //     project.saveSync();
  //
  //     console.log('created test for method: ' + className + '.' + methodName);
  //   }
  // }

  async generateSessionTest(session: BLSessionEvent[]) {
    return this.sessionGenerator.run(session, { mode: 'remote' });
  }
}
