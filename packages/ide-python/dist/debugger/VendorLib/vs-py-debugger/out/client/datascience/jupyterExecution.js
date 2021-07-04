// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var __param = void 0 && (void 0).__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};

var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const inversify_1 = require("inversify");

const types_1 = require("../common/process/types");

const types_2 = require("../common/types");

const contracts_1 = require("../interpreter/contracts");

let JupyterExecution = class JupyterExecution {
  constructor(executionFactory, condaService, interpreterService, logger) {
    this.executionFactory = executionFactory;
    this.condaService = condaService;
    this.interpreterService = interpreterService;
    this.logger = logger;

    this.execModuleObservable = (args, options) => __awaiter(this, void 0, void 0, function* () {
      const newOptions = Object.assign({}, options);
      newOptions.env = yield this.fixupCondaEnv(newOptions.env);
      const pythonService = yield this.executionFactory.create({});
      return pythonService.execModuleObservable('jupyter', args, newOptions);
    });

    this.execModule = (args, options) => __awaiter(this, void 0, void 0, function* () {
      const newOptions = Object.assign({}, options);
      newOptions.env = yield this.fixupCondaEnv(newOptions.env);
      const pythonService = yield this.executionFactory.create({});
      return pythonService.execModule('jupyter', args, newOptions);
    });

    this.isNotebookSupported = () => __awaiter(this, void 0, void 0, function* () {
      // Spawn jupyter notebook --version and see if it returns something
      try {
        const result = yield this.execModule(['notebook', '--version'], {
          throwOnStdErr: true,
          encoding: 'utf8'
        });
        return !result.stderr;
      } catch (err) {
        this.logger.logWarning(err);
        return false;
      }
    });

    this.isImportSupported = () => __awaiter(this, void 0, void 0, function* () {
      // Spawn jupyter nbconvert --version and see if it returns something
      try {
        const result = yield this.execModule(['nbconvert', '--version'], {
          throwOnStdErr: true,
          encoding: 'utf8'
        });
        return !result.stderr;
      } catch (err) {
        this.logger.logWarning(err);
        return false;
      }
    });
    /**
     * Conda needs specific paths and env vars set to be happy. Call this function to fix up
     * (or created if not present) our environment to run jupyter
     */
    // Base Node.js SpawnOptions uses any for environment, so use that here as well
    // tslint:disable-next-line:no-any


    this.fixupCondaEnv = inputEnv => __awaiter(this, void 0, void 0, function* () {
      if (!inputEnv) {
        inputEnv = process.env;
      }

      const interpreter = yield this.interpreterService.getActiveInterpreter();

      if (interpreter && interpreter.type === contracts_1.InterpreterType.Conda) {
        return this.condaService.getActivatedCondaEnvironment(interpreter, inputEnv);
      }

      return inputEnv;
    });
  }

};
JupyterExecution = __decorate([inversify_1.injectable(), __param(0, inversify_1.inject(types_1.IPythonExecutionFactory)), __param(1, inversify_1.inject(contracts_1.ICondaService)), __param(2, inversify_1.inject(contracts_1.IInterpreterService)), __param(3, inversify_1.inject(types_2.ILogger))], JupyterExecution);
exports.JupyterExecution = JupyterExecution;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImp1cHl0ZXJFeGVjdXRpb24uanMiXSwibmFtZXMiOlsiX19kZWNvcmF0ZSIsImRlY29yYXRvcnMiLCJ0YXJnZXQiLCJrZXkiLCJkZXNjIiwiYyIsImFyZ3VtZW50cyIsImxlbmd0aCIsInIiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJkIiwiUmVmbGVjdCIsImRlY29yYXRlIiwiaSIsImRlZmluZVByb3BlcnR5IiwiX19wYXJhbSIsInBhcmFtSW5kZXgiLCJkZWNvcmF0b3IiLCJfX2F3YWl0ZXIiLCJ0aGlzQXJnIiwiX2FyZ3VtZW50cyIsIlAiLCJnZW5lcmF0b3IiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZ1bGZpbGxlZCIsInZhbHVlIiwic3RlcCIsIm5leHQiLCJlIiwicmVqZWN0ZWQiLCJyZXN1bHQiLCJkb25lIiwidGhlbiIsImFwcGx5IiwiZXhwb3J0cyIsImludmVyc2lmeV8xIiwicmVxdWlyZSIsInR5cGVzXzEiLCJ0eXBlc18yIiwiY29udHJhY3RzXzEiLCJKdXB5dGVyRXhlY3V0aW9uIiwiY29uc3RydWN0b3IiLCJleGVjdXRpb25GYWN0b3J5IiwiY29uZGFTZXJ2aWNlIiwiaW50ZXJwcmV0ZXJTZXJ2aWNlIiwibG9nZ2VyIiwiZXhlY01vZHVsZU9ic2VydmFibGUiLCJhcmdzIiwib3B0aW9ucyIsIm5ld09wdGlvbnMiLCJhc3NpZ24iLCJlbnYiLCJmaXh1cENvbmRhRW52IiwicHl0aG9uU2VydmljZSIsImNyZWF0ZSIsImV4ZWNNb2R1bGUiLCJpc05vdGVib29rU3VwcG9ydGVkIiwidGhyb3dPblN0ZEVyciIsImVuY29kaW5nIiwic3RkZXJyIiwiZXJyIiwibG9nV2FybmluZyIsImlzSW1wb3J0U3VwcG9ydGVkIiwiaW5wdXRFbnYiLCJwcm9jZXNzIiwiaW50ZXJwcmV0ZXIiLCJnZXRBY3RpdmVJbnRlcnByZXRlciIsInR5cGUiLCJJbnRlcnByZXRlclR5cGUiLCJDb25kYSIsImdldEFjdGl2YXRlZENvbmRhRW52aXJvbm1lbnQiLCJpbmplY3RhYmxlIiwiaW5qZWN0IiwiSVB5dGhvbkV4ZWN1dGlvbkZhY3RvcnkiLCJJQ29uZGFTZXJ2aWNlIiwiSUludGVycHJldGVyU2VydmljZSIsIklMb2dnZXIiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTs7QUFDQSxJQUFJQSxVQUFVLEdBQUksVUFBUSxTQUFLQSxVQUFkLElBQTZCLFVBQVVDLFVBQVYsRUFBc0JDLE1BQXRCLEVBQThCQyxHQUE5QixFQUFtQ0MsSUFBbkMsRUFBeUM7QUFDbkYsTUFBSUMsQ0FBQyxHQUFHQyxTQUFTLENBQUNDLE1BQWxCO0FBQUEsTUFBMEJDLENBQUMsR0FBR0gsQ0FBQyxHQUFHLENBQUosR0FBUUgsTUFBUixHQUFpQkUsSUFBSSxLQUFLLElBQVQsR0FBZ0JBLElBQUksR0FBR0ssTUFBTSxDQUFDQyx3QkFBUCxDQUFnQ1IsTUFBaEMsRUFBd0NDLEdBQXhDLENBQXZCLEdBQXNFQyxJQUFySDtBQUFBLE1BQTJITyxDQUEzSDtBQUNBLE1BQUksT0FBT0MsT0FBUCxLQUFtQixRQUFuQixJQUErQixPQUFPQSxPQUFPLENBQUNDLFFBQWYsS0FBNEIsVUFBL0QsRUFBMkVMLENBQUMsR0FBR0ksT0FBTyxDQUFDQyxRQUFSLENBQWlCWixVQUFqQixFQUE2QkMsTUFBN0IsRUFBcUNDLEdBQXJDLEVBQTBDQyxJQUExQyxDQUFKLENBQTNFLEtBQ0ssS0FBSyxJQUFJVSxDQUFDLEdBQUdiLFVBQVUsQ0FBQ00sTUFBWCxHQUFvQixDQUFqQyxFQUFvQ08sQ0FBQyxJQUFJLENBQXpDLEVBQTRDQSxDQUFDLEVBQTdDLEVBQWlELElBQUlILENBQUMsR0FBR1YsVUFBVSxDQUFDYSxDQUFELENBQWxCLEVBQXVCTixDQUFDLEdBQUcsQ0FBQ0gsQ0FBQyxHQUFHLENBQUosR0FBUU0sQ0FBQyxDQUFDSCxDQUFELENBQVQsR0FBZUgsQ0FBQyxHQUFHLENBQUosR0FBUU0sQ0FBQyxDQUFDVCxNQUFELEVBQVNDLEdBQVQsRUFBY0ssQ0FBZCxDQUFULEdBQTRC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O0FBQ1hBLFFBQUFBLFFBQVEsR0FBR0MsT0FBTyxDQUFDYixHQUFuQjtBQUNIOztBQUNELFlBQU1jLFdBQVcsR0FBRyxNQUFNLEtBQUtyQixrQkFBTCxDQUF3QnNCLG9CQUF4QixFQUExQjs7QUFDQSxVQUFJRCxXQUFXLElBQUlBLFdBQVcsQ0FBQ0UsSUFBWixLQUFxQjVCLFdBQVcsQ0FBQzZCLGVBQVosQ0FBNEJDLEtBQXBFLEVBQTJFO0FBQ3ZFLGVBQU8sS0FBSzFCLFlBQUwsQ0FBa0IyQiw0QkFBbEIsQ0FBK0NMLFdBQS9DLEVBQTRERixRQUE1RCxDQUFQO0FBQ0g7O0FBQ0QsYUFBT0EsUUFBUDtBQUNILEtBVDJDLENBQTVDO0FBVUg7O0FBeER5QyxDQUE5QztBQTBEQXZCLGdCQUFnQixHQUFHM0MsVUFBVSxDQUFDLENBQzFCc0MsV0FBVyxDQUFDb0MsVUFBWixFQUQwQixFQUUxQjFELE9BQU8sQ0FBQyxDQUFELEVBQUlzQixXQUFXLENBQUNxQyxNQUFaLENBQW1CbkMsT0FBTyxDQUFDb0MsdUJBQTNCLENBQUosQ0FGbUIsRUFHMUI1RCxPQUFPLENBQUMsQ0FBRCxFQUFJc0IsV0FBVyxDQUFDcUMsTUFBWixDQUFtQmpDLFdBQVcsQ0FBQ21DLGFBQS9CLENBQUosQ0FIbUIsRUFJMUI3RCxPQUFPLENBQUMsQ0FBRCxFQUFJc0IsV0FBVyxDQUFDcUMsTUFBWixDQUFtQmpDLFdBQVcsQ0FBQ29DLG1CQUEvQixDQUFKLENBSm1CLEVBSzFCOUQsT0FBTyxDQUFDLENBQUQsRUFBSXNCLFdBQVcsQ0FBQ3FDLE1BQVosQ0FBbUJsQyxPQUFPLENBQUNzQyxPQUEzQixDQUFKLENBTG1CLENBQUQsRUFNMUJwQyxnQkFOMEIsQ0FBN0I7QUFPQU4sT0FBTyxDQUFDTSxnQkFBUixHQUEyQkEsZ0JBQTNCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4ndXNlIHN0cmljdCc7XG52YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19wYXJhbSA9ICh0aGlzICYmIHRoaXMuX19wYXJhbSkgfHwgZnVuY3Rpb24gKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxufTtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUocmVzdWx0LnZhbHVlKTsgfSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgaW52ZXJzaWZ5XzEgPSByZXF1aXJlKFwiaW52ZXJzaWZ5XCIpO1xuY29uc3QgdHlwZXNfMSA9IHJlcXVpcmUoXCIuLi9jb21tb24vcHJvY2Vzcy90eXBlc1wiKTtcbmNvbnN0IHR5cGVzXzIgPSByZXF1aXJlKFwiLi4vY29tbW9uL3R5cGVzXCIpO1xuY29uc3QgY29udHJhY3RzXzEgPSByZXF1aXJlKFwiLi4vaW50ZXJwcmV0ZXIvY29udHJhY3RzXCIpO1xubGV0IEp1cHl0ZXJFeGVjdXRpb24gPSBjbGFzcyBKdXB5dGVyRXhlY3V0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihleGVjdXRpb25GYWN0b3J5LCBjb25kYVNlcnZpY2UsIGludGVycHJldGVyU2VydmljZSwgbG9nZ2VyKSB7XG4gICAgICAgIHRoaXMuZXhlY3V0aW9uRmFjdG9yeSA9IGV4ZWN1dGlvbkZhY3Rvcnk7XG4gICAgICAgIHRoaXMuY29uZGFTZXJ2aWNlID0gY29uZGFTZXJ2aWNlO1xuICAgICAgICB0aGlzLmludGVycHJldGVyU2VydmljZSA9IGludGVycHJldGVyU2VydmljZTtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBsb2dnZXI7XG4gICAgICAgIHRoaXMuZXhlY01vZHVsZU9ic2VydmFibGUgPSAoYXJncywgb3B0aW9ucykgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgbmV3T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMpO1xuICAgICAgICAgICAgbmV3T3B0aW9ucy5lbnYgPSB5aWVsZCB0aGlzLmZpeHVwQ29uZGFFbnYobmV3T3B0aW9ucy5lbnYpO1xuICAgICAgICAgICAgY29uc3QgcHl0aG9uU2VydmljZSA9IHlpZWxkIHRoaXMuZXhlY3V0aW9uRmFjdG9yeS5jcmVhdGUoe30pO1xuICAgICAgICAgICAgcmV0dXJuIHB5dGhvblNlcnZpY2UuZXhlY01vZHVsZU9ic2VydmFibGUoJ2p1cHl0ZXInLCBhcmdzLCBuZXdPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZXhlY01vZHVsZSA9IChhcmdzLCBvcHRpb25zKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBuZXdPcHRpb25zLmVudiA9IHlpZWxkIHRoaXMuZml4dXBDb25kYUVudihuZXdPcHRpb25zLmVudik7XG4gICAgICAgICAgICBjb25zdCBweXRob25TZXJ2aWNlID0geWllbGQgdGhpcy5leGVjdXRpb25GYWN0b3J5LmNyZWF0ZSh7fSk7XG4gICAgICAgICAgICByZXR1cm4gcHl0aG9uU2VydmljZS5leGVjTW9kdWxlKCdqdXB5dGVyJywgYXJncywgbmV3T3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmlzTm90ZWJvb2tTdXBwb3J0ZWQgPSAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyBTcGF3biBqdXB5dGVyIG5vdGVib29rIC0tdmVyc2lvbiBhbmQgc2VlIGlmIGl0IHJldHVybnMgc29tZXRoaW5nXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHlpZWxkIHRoaXMuZXhlY01vZHVsZShbJ25vdGVib29rJywgJy0tdmVyc2lvbiddLCB7IHRocm93T25TdGRFcnI6IHRydWUsIGVuY29kaW5nOiAndXRmOCcgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghcmVzdWx0LnN0ZGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIubG9nV2FybmluZyhlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaXNJbXBvcnRTdXBwb3J0ZWQgPSAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyBTcGF3biBqdXB5dGVyIG5iY29udmVydCAtLXZlcnNpb24gYW5kIHNlZSBpZiBpdCByZXR1cm5zIHNvbWV0aGluZ1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB5aWVsZCB0aGlzLmV4ZWNNb2R1bGUoWyduYmNvbnZlcnQnLCAnLS12ZXJzaW9uJ10sIHsgdGhyb3dPblN0ZEVycjogdHJ1ZSwgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCFyZXN1bHQuc3RkZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2dXYXJuaW5nKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbmRhIG5lZWRzIHNwZWNpZmljIHBhdGhzIGFuZCBlbnYgdmFycyBzZXQgdG8gYmUgaGFwcHkuIENhbGwgdGhpcyBmdW5jdGlvbiB0byBmaXggdXBcbiAgICAgICAgICogKG9yIGNyZWF0ZWQgaWYgbm90IHByZXNlbnQpIG91ciBlbnZpcm9ubWVudCB0byBydW4ganVweXRlclxuICAgICAgICAgKi9cbiAgICAgICAgLy8gQmFzZSBOb2RlLmpzIFNwYXduT3B0aW9ucyB1c2VzIGFueSBmb3IgZW52aXJvbm1lbnQsIHNvIHVzZSB0aGF0IGhlcmUgYXMgd2VsbFxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgIHRoaXMuZml4dXBDb25kYUVudiA9IChpbnB1dEVudikgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgaWYgKCFpbnB1dEVudikge1xuICAgICAgICAgICAgICAgIGlucHV0RW52ID0gcHJvY2Vzcy5lbnY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpbnRlcnByZXRlciA9IHlpZWxkIHRoaXMuaW50ZXJwcmV0ZXJTZXJ2aWNlLmdldEFjdGl2ZUludGVycHJldGVyKCk7XG4gICAgICAgICAgICBpZiAoaW50ZXJwcmV0ZXIgJiYgaW50ZXJwcmV0ZXIudHlwZSA9PT0gY29udHJhY3RzXzEuSW50ZXJwcmV0ZXJUeXBlLkNvbmRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGFTZXJ2aWNlLmdldEFjdGl2YXRlZENvbmRhRW52aXJvbm1lbnQoaW50ZXJwcmV0ZXIsIGlucHV0RW52KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbnB1dEVudjtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbkp1cHl0ZXJFeGVjdXRpb24gPSBfX2RlY29yYXRlKFtcbiAgICBpbnZlcnNpZnlfMS5pbmplY3RhYmxlKCksXG4gICAgX19wYXJhbSgwLCBpbnZlcnNpZnlfMS5pbmplY3QodHlwZXNfMS5JUHl0aG9uRXhlY3V0aW9uRmFjdG9yeSkpLFxuICAgIF9fcGFyYW0oMSwgaW52ZXJzaWZ5XzEuaW5qZWN0KGNvbnRyYWN0c18xLklDb25kYVNlcnZpY2UpKSxcbiAgICBfX3BhcmFtKDIsIGludmVyc2lmeV8xLmluamVjdChjb250cmFjdHNfMS5JSW50ZXJwcmV0ZXJTZXJ2aWNlKSksXG4gICAgX19wYXJhbSgzLCBpbnZlcnNpZnlfMS5pbmplY3QodHlwZXNfMi5JTG9nZ2VyKSlcbl0sIEp1cHl0ZXJFeGVjdXRpb24pO1xuZXhwb3J0cy5KdXB5dGVyRXhlY3V0aW9uID0gSnVweXRlckV4ZWN1dGlvbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWp1cHl0ZXJFeGVjdXRpb24uanMubWFwIl19