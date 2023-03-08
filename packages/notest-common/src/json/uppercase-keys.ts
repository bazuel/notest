export function uppercaseKeys(obj: any) {
  //uppercase first letter of keys
  Object.keys(obj).forEach((key) => {
    if (key[0] !== key[0].toUpperCase()) {
      obj[key.charAt(0).toUpperCase() + key.slice(1)] = obj[key];
      delete obj[key];
    }
  })
}