export function jsonFromNameValueArray(nameValueArray: { name:string,value:string }[]): any {
  return nameValueArray.reduce((acc, nameValue) => {
    acc[nameValue.name] = nameValue.value;
    return acc;
  }, {});
}