var logOfConsole: { method; arguments }[] = [];

var _log = console.log,
  _warn = console.warn,
  _error = console.error;

console.log = function () {
  logOfConsole.push({ method: 'log', arguments });
  return _log.apply(console, arguments as any);
};

console.warn = function () {
  logOfConsole.push({ method: 'warn', arguments });
  return _warn.apply(console, arguments as any);
};

console.error = function () {
  logOfConsole.push({ method: 'error', arguments });
  return _error.apply(console, arguments as any);
};
