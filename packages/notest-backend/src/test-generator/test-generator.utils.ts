// import { NTInstrumentedEvent } from '@notest/common';
//
// const objectHash = require('object-hash');
//
// export function makeTitle(inputs: NTInstrumentedEvent[], output: NTInstrumentedEvent) {
//   let title = inputs
//     .map((elem) => {
//       if (typeof elem.event_value == 'object') {
//         return objectHash(elem.event_value);
//       } else {
//         return elem.event_value;
//       }
//     })
//     .join('-');
//   if (typeof output.event_value == 'object') {
//     title += '-' + objectHash(output.event_value);
//   } else {
//     title += '-' + output.event_value;
//   }
//   return title;
// }
//
// export function giveParamsAndExpected(inputs: NTInstrumentedEvent[], output: NTInstrumentedEvent) {
//   let params = '';
//   inputs.forEach((input) => {
//     switch (typeof input.event_value) {
//       case 'string': {
//         params += `,'${input.event_value}'`;
//         break;
//       }
//       case 'object': {
//         params += `,${JSON.stringify(input.event_value)}`;
//         break;
//       }
//       default: {
//         params += `,${input.event_value}`;
//       }
//     }
//   });
//   params = params.substring(1);
//
//   let returnValue;
//   switch (typeof output.event_value) {
//     case 'string': {
//       returnValue = `'${output.event_value}'`;
//       break;
//     }
//     case 'object': {
//       returnValue = `${JSON.stringify(output.event_value)}`;
//       break;
//     }
//     default: {
//       returnValue = `${output.event_value}`;
//     }
//   }
//
//   return { params, returnValue };
// }
//
// export function getMockStatements(variables: NTInstrumentedEvent[]) {
//   let text = '';
//   variables.forEach((variable) => {
//     if (variable.other.asyncF) {
//       text += `${variable.other.service}.${
//         variable.other.method
//       }.mockReturnValue(Promise.resolve(${JSON.stringify(variable.event_value)}))\n`;
//     } else {
//       text += `${variable.other.service}.${variable.other.method}.mockReturnValue(${JSON.stringify(
//         variable.event_value
//       )})\n`;
//     }
//   });
//   return text;
// }
