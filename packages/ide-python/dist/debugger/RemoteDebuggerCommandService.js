"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeRemoteDebugCommands = observeRemoteDebugCommands;
exports.observeAttachDebugTargets = observeAttachDebugTargets;

var _http = _interopRequireDefault(require("http"));

var _net = _interopRequireDefault(require("net"));

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

var _log4js = require("log4js");

var _promise = require("@atom-ide-community/nuclide-commons/promise");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let isServerSetup = false;
const debugRequests = new _rxjsCompatUmdMin.Subject();
const attachReady = new Map();
const DEBUGGER_REGISTRY_PORT = 9615;

function observeRemoteDebugCommands() {
  let setupStep;

  if (!isServerSetup) {
    setupStep = _rxjsCompatUmdMin.Observable.fromPromise(setupServer()).ignoreElements();
  } else {
    setupStep = _rxjsCompatUmdMin.Observable.empty();
  }

  return setupStep.concat(debugRequests).publish();
}

function observeAttachDebugTargets() {
  // Validate attach-ready values with the processes with used ports (ready to attach).
  // Note: we can't use process ids because we could be debugging processes inside containers
  // where the process ids don't map to the host running this code.
  return _rxjsCompatUmdMin.Observable.interval(3000).startWith(0).switchMap(() => Promise.all(Array.from(attachReady.values()).map(async target => {
    if (!(await isPortUsed(target.port))) {
      attachReady.delete(target.port);
    }
  }))).map(() => Array.from(attachReady.values())).publish();
}

function isPortUsed(port) {
  const tryConnectPromise = new Promise((resolve, reject) => {
    const client = new _net.default.Socket();
    client.once("connect", () => {
      cleanUp();
      resolve(true);
    }).once("error", err => {
      cleanUp();
      resolve(err.code !== "ECONNREFUSED");
    });

    function cleanUp() {
      client.removeAllListeners("connect");
      client.removeAllListeners("error");
      client.end();
      client.destroy();
      client.unref();
    }

    client.connect({
      port,
      host: "127.0.0.1"
    });
  }); // Trying to connect can take multiple seconds, then times out (if the server is busy).
  // Hence, we need to fallback to `true`.

  const connectTimeoutPromise = (0, _promise.sleep)(1000).then(() => true);
  return Promise.race([tryConnectPromise, connectTimeoutPromise]);
}

function setupServer() {
  return new Promise((resolve, reject) => {
    _http.default.createServer((req, res) => {
      if (req.method !== "POST") {
        res.writeHead(500, {
          "Content-Type": "text/html"
        });
        res.end("Invalid request");
      } else {
        let body = "";
        req.on("data", data => {
          body += data;
        });
        req.on("end", () => {
          handleJsonRequest(JSON.parse(body), res);
        });
      }
    }).on("error", reject).listen(DEBUGGER_REGISTRY_PORT, () => {
      isServerSetup = true;
      resolve();
    });
  });
}

function handleJsonRequest(body, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  const {
    domain,
    command,
    type
  } = body;
  let success = false;

  if (domain !== "debug" || type !== "python") {
    res.end(JSON.stringify({
      success
    }));
    return;
  }

  if (command === "enable-attach") {
    const port = Number(body.port);
    const {
      options
    } = body;
    const target = {
      port,
      id: options.id,
      localRoot: options.localRoot,
      remoteRoot: options.remoteRoot,
      debugOptions: options.debugOptions
    };
    attachReady.set(port, target);
    (0, _log4js.getLogger)().info("Remote debug target is ready to attach", target);
    success = true;
  } else if (command === "attach") {
    const port = Number(body.port);
    (0, _log4js.getLogger)().info("Remote debug target attach request", body);
    const target = attachReady.get(port);

    if (target != null) {
      debugRequests.next({
        type,
        command,
        target
      });
      success = true;
    }
  }

  res.end(JSON.stringify({
    success
  }));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlbW90ZURlYnVnZ2VyQ29tbWFuZFNlcnZpY2UuanMiXSwibmFtZXMiOlsiaXNTZXJ2ZXJTZXR1cCIsImRlYnVnUmVxdWVzdHMiLCJTdWJqZWN0IiwiYXR0YWNoUmVhZHkiLCJNYXAiLCJERUJVR0dFUl9SRUdJU1RSWV9QT1JUIiwib2JzZXJ2ZVJlbW90ZURlYnVnQ29tbWFuZHMiLCJzZXR1cFN0ZXAiLCJPYnNlcnZhYmxlIiwiZnJvbVByb21pc2UiLCJzZXR1cFNlcnZlciIsImlnbm9yZUVsZW1lbnRzIiwiZW1wdHkiLCJjb25jYXQiLCJwdWJsaXNoIiwib2JzZXJ2ZUF0dGFjaERlYnVnVGFyZ2V0cyIsImludGVydmFsIiwic3RhcnRXaXRoIiwic3dpdGNoTWFwIiwiUHJvbWlzZSIsImFsbCIsIkFycmF5IiwiZnJvbSIsInZhbHVlcyIsIm1hcCIsInRhcmdldCIsImlzUG9ydFVzZWQiLCJwb3J0IiwiZGVsZXRlIiwidHJ5Q29ubmVjdFByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiY2xpZW50IiwibmV0IiwiU29ja2V0Iiwib25jZSIsImNsZWFuVXAiLCJlcnIiLCJjb2RlIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwiZW5kIiwiZGVzdHJveSIsInVucmVmIiwiY29ubmVjdCIsImhvc3QiLCJjb25uZWN0VGltZW91dFByb21pc2UiLCJ0aGVuIiwicmFjZSIsImh0dHAiLCJjcmVhdGVTZXJ2ZXIiLCJyZXEiLCJyZXMiLCJtZXRob2QiLCJ3cml0ZUhlYWQiLCJib2R5Iiwib24iLCJkYXRhIiwiaGFuZGxlSnNvblJlcXVlc3QiLCJKU09OIiwicGFyc2UiLCJsaXN0ZW4iLCJkb21haW4iLCJjb21tYW5kIiwidHlwZSIsInN1Y2Nlc3MiLCJzdHJpbmdpZnkiLCJOdW1iZXIiLCJvcHRpb25zIiwiaWQiLCJsb2NhbFJvb3QiLCJyZW1vdGVSb290IiwiZGVidWdPcHRpb25zIiwic2V0IiwiaW5mbyIsImdldCIsIm5leHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FB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T0FGaUI7QUFHakJyQyxRQUFBQTtBQUhpQixPQUFuQjtBQUtBdUMsTUFBQUEsT0FBTyxHQUFHLElBQVY7QUFDRDtBQUNGOztBQUNEYixFQUFBQSxHQUFHLENBQUNYLEdBQUosQ0FBUWtCLElBQUksQ0FBQ08sU0FBTCxDQUFlO0FBQUVELElBQUFBO0FBQUYsR0FBZixDQUFSO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbm5lY3RhYmxlT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzLWNvbXBhdC9idW5kbGVzL3J4anMtY29tcGF0LnVtZC5taW4uanNcIlxuXG5pbXBvcnQgaHR0cCBmcm9tIFwiaHR0cFwiXG5pbXBvcnQgbmV0IGZyb20gXCJuZXRcIlxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gXCJyeGpzLWNvbXBhdC9idW5kbGVzL3J4anMtY29tcGF0LnVtZC5taW4uanNcIlxuaW1wb3J0IHsgZ2V0TG9nZ2VyIH0gZnJvbSBcImxvZzRqc1wiXG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gXCJAYXRvbS1pZGUtY29tbXVuaXR5L251Y2xpZGUtY29tbW9ucy9wcm9taXNlXCJcblxubGV0IGlzU2VydmVyU2V0dXAgPSBmYWxzZVxuXG5leHBvcnQgdHlwZSBSZW1vdGVEZWJ1Z0NvbW1hbmRSZXF1ZXN0ID0ge1xuICB0eXBlOiBcInB5dGhvblwiLFxuICBjb21tYW5kOiBcImF0dGFjaFwiLFxuICB0YXJnZXQ6IFB5dGhvbkRlYnVnZ2VyQXR0YWNoVGFyZ2V0LFxufVxuXG5leHBvcnQgdHlwZSBQeXRob25EZWJ1Z2dlckF0dGFjaFRhcmdldCA9IHtcbiAgcG9ydDogbnVtYmVyLFxuICBsb2NhbFJvb3Q6ID9zdHJpbmcsXG4gIHJlbW90ZVJvb3Q6ID9zdHJpbmcsXG4gIGRlYnVnT3B0aW9uczogP0FycmF5PHN0cmluZz4sXG4gIGlkOiA/c3RyaW5nLFxufVxuXG5jb25zdCBkZWJ1Z1JlcXVlc3RzOiBTdWJqZWN0PFJlbW90ZURlYnVnQ29tbWFuZFJlcXVlc3Q+ID0gbmV3IFN1YmplY3QoKVxuY29uc3QgYXR0YWNoUmVhZHk6IE1hcDxudW1iZXIsIFB5dGhvbkRlYnVnZ2VyQXR0YWNoVGFyZ2V0PiA9IG5ldyBNYXAoKVxuY29uc3QgREVCVUdHRVJfUkVHSVNUUllfUE9SVCA9IDk2MTVcblxuZXhwb3J0IGZ1bmN0aW9uIG9ic2VydmVSZW1vdGVEZWJ1Z0NvbW1hbmRzKCk6IENvbm5lY3RhYmxlT2JzZXJ2YWJsZTxSZW1vdGVEZWJ1Z0NvbW1hbmRSZXF1ZXN0PiB7XG4gIGxldCBzZXR1cFN0ZXBcbiAgaWYgKCFpc1NlcnZlclNldHVwKSB7XG4gICAgc2V0dXBTdGVwID0gT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShzZXR1cFNlcnZlcigpKS5pZ25vcmVFbGVtZW50cygpXG4gIH0gZWxzZSB7XG4gICAgc2V0dXBTdGVwID0gT2JzZXJ2YWJsZS5lbXB0eSgpXG4gIH1cbiAgcmV0dXJuIHNldHVwU3RlcC5jb25jYXQoZGVidWdSZXF1ZXN0cykucHVibGlzaCgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlQXR0YWNoRGVidWdUYXJnZXRzKCk6IENvbm5lY3RhYmxlT2JzZXJ2YWJsZTxBcnJheTxQeXRob25EZWJ1Z2dlckF0dGFjaFRhcmdldD4+IHtcbiAgLy8gVmFsaWRhdGUgYXR0YWNoLXJlYWR5IHZhbHVlcyB3aXRoIHRoZSBwcm9jZXNzZXMgd2l0aCB1c2VkIHBvcnRzIChyZWFkeSB0byBhdHRhY2gpLlxuICAvLyBOb3RlOiB3ZSBjYW4ndCB1c2UgcHJvY2VzcyBpZHMgYmVjYXVzZSB3ZSBjb3VsZCBiZSBkZWJ1Z2dpbmcgcHJvY2Vzc2VzIGluc2lkZSBjb250YWluZXJzXG4gIC8vIHdoZXJlIHRoZSBwcm9jZXNzIGlkcyBkb24ndCBtYXAgdG8gdGhlIGhvc3QgcnVubmluZyB0aGlzIGNvZGUuXG4gIHJldHVybiBPYnNlcnZhYmxlLmludGVydmFsKDMwMDApXG4gICAgLnN0YXJ0V2l0aCgwKVxuICAgIC5zd2l0Y2hNYXAoKCkgPT5cbiAgICAgIFByb21pc2UuYWxsKFxuICAgICAgICBBcnJheS5mcm9tKGF0dGFjaFJlYWR5LnZhbHVlcygpKS5tYXAoYXN5bmMgKHRhcmdldCkgPT4ge1xuICAgICAgICAgIGlmICghKGF3YWl0IGlzUG9ydFVzZWQodGFyZ2V0LnBvcnQpKSkge1xuICAgICAgICAgICAgYXR0YWNoUmVhZHkuZGVsZXRlKHRhcmdldC5wb3J0KVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIClcbiAgICApXG4gICAgLm1hcCgoKSA9PiBBcnJheS5mcm9tKGF0dGFjaFJlYWR5LnZhbHVlcygpKSlcbiAgICAucHVibGlzaCgpXG59XG5cbmZ1bmN0aW9uIGlzUG9ydFVzZWQocG9ydDogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHRyeUNvbm5lY3RQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBuZXQuU29ja2V0KClcbiAgICBjbGllbnRcbiAgICAgIC5vbmNlKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIGNsZWFuVXAoKVxuICAgICAgICByZXNvbHZlKHRydWUpXG4gICAgICB9KVxuICAgICAgLm9uY2UoXCJlcnJvclwiLCAoZXJyKSA9PiB7XG4gICAgICAgIGNsZWFuVXAoKVxuICAgICAgICByZXNvbHZlKGVyci5jb2RlICE9PSBcIkVDT05OUkVGVVNFRFwiKVxuICAgICAgfSlcblxuICAgIGZ1bmN0aW9uIGNsZWFuVXAoKSB7XG4gICAgICBjbGllbnQucmVtb3ZlQWxsTGlzdGVuZXJzKFwiY29ubmVjdFwiKVxuICAgICAgY2xpZW50LnJlbW92ZUFsbExpc3RlbmVycyhcImVycm9yXCIpXG4gICAgICBjbGllbnQuZW5kKClcbiAgICAgIGNsaWVudC5kZXN0cm95KClcbiAgICAgIGNsaWVudC51bnJlZigpXG4gICAgfVxuXG4gICAgY2xpZW50LmNvbm5lY3QoeyBwb3J0LCBob3N0OiBcIjEyNy4wLjAuMVwiIH0pXG4gIH0pXG4gIC8vIFRyeWluZyB0byBjb25uZWN0IGNhbiB0YWtlIG11bHRpcGxlIHNlY29uZHMsIHRoZW4gdGltZXMgb3V0IChpZiB0aGUgc2VydmVyIGlzIGJ1c3kpLlxuICAvLyBIZW5jZSwgd2UgbmVlZCB0byBmYWxsYmFjayB0byBgdHJ1ZWAuXG4gIGNvbnN0IGNvbm5lY3RUaW1lb3V0UHJvbWlzZSA9IHNsZWVwKDEwMDApLnRoZW4oKCkgPT4gdHJ1ZSlcbiAgcmV0dXJuIFByb21pc2UucmFjZShbdHJ5Q29ubmVjdFByb21pc2UsIGNvbm5lY3RUaW1lb3V0UHJvbWlzZV0pXG59XG5cbmZ1bmN0aW9uIHNldHVwU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGh0dHBcbiAgICAgIC5jcmVhdGVTZXJ2ZXIoKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSBcIlBPU1RcIikge1xuICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9odG1sXCIgfSlcbiAgICAgICAgICByZXMuZW5kKFwiSW52YWxpZCByZXF1ZXN0XCIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGJvZHkgPSBcIlwiXG4gICAgICAgICAgcmVxLm9uKFwiZGF0YVwiLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgYm9keSArPSBkYXRhXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXEub24oXCJlbmRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlSnNvblJlcXVlc3QoSlNPTi5wYXJzZShib2R5KSwgcmVzKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAub24oXCJlcnJvclwiLCByZWplY3QpXG4gICAgICAubGlzdGVuKChERUJVR0dFUl9SRUdJU1RSWV9QT1JUOiBhbnkpLCAoKSA9PiB7XG4gICAgICAgIGlzU2VydmVyU2V0dXAgPSB0cnVlXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gaGFuZGxlSnNvblJlcXVlc3QoYm9keSwgcmVzKSB7XG4gIHJlcy53cml0ZUhlYWQoMjAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0pXG4gIGNvbnN0IHsgZG9tYWluLCBjb21tYW5kLCB0eXBlIH0gPSBib2R5XG4gIGxldCBzdWNjZXNzID0gZmFsc2VcbiAgaWYgKGRvbWFpbiAhPT0gXCJkZWJ1Z1wiIHx8IHR5cGUgIT09IFwicHl0aG9uXCIpIHtcbiAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzcyB9KSlcbiAgICByZXR1cm5cbiAgfVxuICBpZiAoY29tbWFuZCA9PT0gXCJlbmFibGUtYXR0YWNoXCIpIHtcbiAgICBjb25zdCBwb3J0ID0gTnVtYmVyKGJvZHkucG9ydClcbiAgICBjb25zdCB7IG9wdGlvbnMgfSA9IGJvZHlcbiAgICBjb25zdCB0YXJnZXQgPSB7XG4gICAgICBwb3J0LFxuICAgICAgaWQ6IG9wdGlvbnMuaWQsXG4gICAgICBsb2NhbFJvb3Q6IG9wdGlvbnMubG9jYWxSb290LFxuICAgICAgcmVtb3RlUm9vdDogb3B0aW9ucy5yZW1vdGVSb290LFxuICAgICAgZGVidWdPcHRpb25zOiBvcHRpb25zLmRlYnVnT3B0aW9ucyxcbiAgICB9XG4gICAgYXR0YWNoUmVhZHkuc2V0KHBvcnQsIHRhcmdldClcbiAgICBnZXRMb2dnZXIoKS5pbmZvKFwiUmVtb3RlIGRlYnVnIHRhcmdldCBpcyByZWFkeSB0byBhdHRhY2hcIiwgdGFyZ2V0KVxuICAgIHN1Y2Nlc3MgPSB0cnVlXG4gIH0gZWxzZSBpZiAoY29tbWFuZCA9PT0gXCJhdHRhY2hcIikge1xuICAgIGNvbnN0IHBvcnQgPSBOdW1iZXIoYm9keS5wb3J0KVxuICAgIGdldExvZ2dlcigpLmluZm8oXCJSZW1vdGUgZGVidWcgdGFyZ2V0IGF0dGFjaCByZXF1ZXN0XCIsIGJvZHkpXG4gICAgY29uc3QgdGFyZ2V0ID0gYXR0YWNoUmVhZHkuZ2V0KHBvcnQpXG4gICAgaWYgKHRhcmdldCAhPSBudWxsKSB7XG4gICAgICBkZWJ1Z1JlcXVlc3RzLm5leHQoe1xuICAgICAgICB0eXBlLFxuICAgICAgICBjb21tYW5kLFxuICAgICAgICB0YXJnZXQsXG4gICAgICB9KVxuICAgICAgc3VjY2VzcyA9IHRydWVcbiAgICB9XG4gIH1cbiAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3MgfSkpXG59XG4iXX0=