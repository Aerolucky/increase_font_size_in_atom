"use strict";

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

const path = require("path");

const vscode_1 = require("vscode");

class WorkspaceFolderPythonPathUpdaterService {
  constructor(workspaceFolder, workspaceService) {
    this.workspaceFolder = workspaceFolder;
    this.workspaceService = workspaceService;
  }

  updatePythonPath(pythonPath) {
    return __awaiter(this, void 0, void 0, function* () {
      const pythonConfig = this.workspaceService.getConfiguration('python', this.workspaceFolder);
      const pythonPathValue = pythonConfig.inspect('pythonPath');

      if (pythonPathValue && pythonPathValue.workspaceFolderValue === pythonPath) {
        return;
      }

      if (pythonPath.startsWith(this.workspaceFolder.fsPath)) {
        pythonPath = path.relative(this.workspaceFolder.fsPath, pythonPath);
      }

      yield pythonConfig.update('pythonPath', pythonPath, vscode_1.ConfigurationTarget.WorkspaceFolder);
    });
  }

}

exports.WorkspaceFolderPythonPathUpdaterService = WorkspaceFolderPythonPathUpdaterService;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvcmtzcGFjZUZvbGRlclVwZGF0ZXJTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbIl9fYXdhaXRlciIsInRoaXNBcmciLCJfYXJndW1lbnRzIiwiUCIsImdlbmVyYXRvciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZnVsZmlsbGVkIiwidmFsdWUiLCJzdGVwIiwibmV4dCIsImUiLCJyZWplY3RlZCIsInJlc3VsdCIsImRvbmUiLCJ0aGVuIiwiYXBwbHkiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJwYXRoIiwicmVxdWlyZSIsInZzY29kZV8xIiwiV29ya3NwYWNlRm9sZGVyUHl0aG9uUGF0aFVwZGF0ZXJTZXJ2aWNlIiwiY29uc3RydWN0b3IiLCJ3b3Jrc3BhY2VGb2xkZXIiLCJ3b3Jrc3BhY2VTZXJ2aWNlIiwidXBkYXRlUHl0aG9uUGF0aCIsInB5dGhvblBhdGgiLCJweXRob25Db25maWciLCJnZXRDb25maWd1cmF0aW9uIiwicHl0aG9uUGF0aFZhbHVlIiwiaW5zcGVjdCIsIndvcmtzcGFjZUZvbGRlclZhbHVlIiwic3RhcnRzV2l0aCIsImZzUGF0aCIsInJlbGF0aXZlIiwidXBkYXRlIiwiQ29uZmlndXJhdGlvblRhcmdldCIsIldvcmtzcGFjZUZvbGRlciJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQ0EsSUFBSUEsU0FBUyxHQUFJLFVBQVEsU0FBS0EsU0FBZCxJQUE0QixVQUFVQyxPQUFWLEVBQW1CQyxVQUFuQixFQUErQkMsQ0FBL0IsRUFBa0NDLFNBQWxDLEVBQTZDO0FBQ3JGLFNBQU8sS0FBS0QsQ0FBQyxLQUFLQSxDQUFDLEdBQUdFLE9BQVQsQ0FBTixFQUF5QixVQUFVQyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUN2RCxhQUFTQyxTQUFULENBQW1CQyxLQUFuQixFQUEwQjtBQUFFLFVBQUk7QUFBRUMsUUFBQUEsSUFBSSxDQUFDTixTQUFTLENBQUNPLElBQVYsQ0FBZUYsS0FBZixDQUFELENBQUo7QUFBOEIsT0FBcEMsQ0FBcUMsT0FBT0csQ0FBUCxFQUFVO0FBQUVMLFFBQUFBLE1BQU0sQ0FBQ0ssQ0FBRCxDQUFOO0FBQVk7QUFBRTs7QUFDM0YsYUFBU0MsUUFBVCxDQUFrQkosS0FBbEIsRUFBeUI7QUFBRSxVQUFJO0FBQUVDLFFBQUFBLElBQUksQ0FBQ04sU0FBUyxDQUFDLE9BQUQsQ0FBVCxDQUFtQkssS0FBbkIsQ0FBRCxDQUFKO0FBQWtDLE9BQXhDLENBQXlDLE9BQU9HLENBQVAsRUFBVTtBQUFFTCxRQUFBQSxNQUFNLENBQUNLLENBQUQsQ0FBTjtBQUFZO0FBQUU7O0FBQzlGLGFBQVNGLElBQVQsQ0FBY0ksTUFBZCxFQUFzQjtBQUFFQSxNQUFBQSxNQUFNLENBQUNDLElBQVAsR0FBY1QsT0FBTyxDQUFDUSxNQUFNLENBQUNMLEtBQVIsQ0FBckIsR0FBc0MsSUFBSU4sQ0FBSixDQUFNLFVBQVVHLE9BQVYsRUFBbUI7QUFBRUEsUUFBQUEsT0FBTyxDQUFDUSxNQUFNLENBQUNMLEtBQVIsQ0FBUDtBQUF3QixPQUFuRCxFQUFxRE8sSUFBckQsQ0FBMERSLFNBQTFELEVBQXFFSyxRQUFyRSxDQUF0QztBQUF1SDs7QUFDL0lILElBQUFBLElBQUksQ0FBQyxDQUFDTixTQUFTLEdBQUdBLFNBQVMsQ0FBQ2EsS0FBVixDQUFnQmhCLE9BQWhCLEVBQXlCQyxVQUFVLElBQUksRUFBdkMsQ0FBYixFQUF5RFMsSUFBekQsRUFBRCxDQUFKO0FBQ0gsR0FMTSxDQUFQO0FBTUgsQ0FQRDs7QUFRQU8sTUFBTSxDQUFDQyxjQUFQLENBQXNCQyxPQUF0QixFQUErQixZQUEvQixFQUE2QztBQUFFWCxFQUFBQSxLQUFLLEVBQUU7QUFBVCxDQUE3Qzs7QUFDQSxNQUFNWSxJQUFJLEdBQUdDLE9BQU8sQ0FBQyxNQUFELENBQXBCOztBQUNBLE1BQU1DLFFBQVEsR0FBR0QsT0FBTyxDQUFDLFFBQUQsQ0FBeEI7O0FBQ0EsTUFBTUUsdUNBQU4sQ0FBOEM7QUFDMUNDLEVBQUFBLFdBQVcsQ0FBQ0MsZUFBRCxFQUFrQkMsZ0JBQWxCLEVBQW9DO0FBQzNDLFNBQUtELGVBQUwsR0FBdUJBLGVBQXZCO0FBQ0EsU0FBS0MsZ0JBQUwsR0FBd0JBLGdCQUF4QjtBQUNIOztBQUNEQyxFQUFBQSxnQkFBZ0IsQ0FBQ0MsVUFBRCxFQUFhO0FBQ3pCLFdBQU83QixTQUFTLENBQUMsSUFBRCxFQUFPLEtBQUssQ0FBWixFQUFlLEtBQUssQ0FBcEIsRUFBdUIsYUFBYTtBQUNoRCxZQUFNOEIsWUFBWSxHQUFHLEtBQUtILGdCQUFMLENBQXNCSSxnQkFBdEIsQ0FBdUMsUUFBdkMsRUFBaUQsS0FBS0wsZUFBdEQsQ0FBckI7QUFDQSxZQUFNTSxlQUFlLEdBQUdGLFlBQVksQ0FBQ0csT0FBYixDQUFxQixZQUFyQixDQUF4Qjs7QUFDQSxVQUFJRCxlQUFlLElBQUlBLGVBQWUsQ0FBQ0Usb0JBQWhCLEtBQXlDTCxVQUFoRSxFQUE0RTtBQUN4RTtBQUNIOztBQUNELFVBQUlBLFVBQVUsQ0FBQ00sVUFBWCxDQUFzQixLQUFLVCxlQUFMLENBQXFCVSxNQUEzQyxDQUFKLEVBQXdEO0FBQ3BEUCxRQUFBQSxVQUFVLEdBQUdSLElBQUksQ0FBQ2dCLFFBQUwsQ0FBYyxLQUFLWCxlQUFMLENBQXFCVSxNQUFuQyxFQUEyQ1AsVUFBM0MsQ0FBYjtBQUNIOztBQUNELFlBQU1DLFlBQVksQ0FBQ1EsTUFBYixDQUFvQixZQUFwQixFQUFrQ1QsVUFBbEMsRUFBOENOLFFBQVEsQ0FBQ2dCLG1CQUFULENBQTZCQyxlQUEzRSxDQUFOO0FBQ0gsS0FWZSxDQUFoQjtBQVdIOztBQWpCeUM7O0FBbUI5Q3BCLE9BQU8sQ0FBQ0ksdUNBQVIsR0FBa0RBLHVDQUFsRCIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZShyZXN1bHQudmFsdWUpOyB9KS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCB2c2NvZGVfMSA9IHJlcXVpcmUoXCJ2c2NvZGVcIik7XG5jbGFzcyBXb3Jrc3BhY2VGb2xkZXJQeXRob25QYXRoVXBkYXRlclNlcnZpY2Uge1xuICAgIGNvbnN0cnVjdG9yKHdvcmtzcGFjZUZvbGRlciwgd29ya3NwYWNlU2VydmljZSkge1xuICAgICAgICB0aGlzLndvcmtzcGFjZUZvbGRlciA9IHdvcmtzcGFjZUZvbGRlcjtcbiAgICAgICAgdGhpcy53b3Jrc3BhY2VTZXJ2aWNlID0gd29ya3NwYWNlU2VydmljZTtcbiAgICB9XG4gICAgdXBkYXRlUHl0aG9uUGF0aChweXRob25QYXRoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBweXRob25Db25maWcgPSB0aGlzLndvcmtzcGFjZVNlcnZpY2UuZ2V0Q29uZmlndXJhdGlvbigncHl0aG9uJywgdGhpcy53b3Jrc3BhY2VGb2xkZXIpO1xuICAgICAgICAgICAgY29uc3QgcHl0aG9uUGF0aFZhbHVlID0gcHl0aG9uQ29uZmlnLmluc3BlY3QoJ3B5dGhvblBhdGgnKTtcbiAgICAgICAgICAgIGlmIChweXRob25QYXRoVmFsdWUgJiYgcHl0aG9uUGF0aFZhbHVlLndvcmtzcGFjZUZvbGRlclZhbHVlID09PSBweXRob25QYXRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHB5dGhvblBhdGguc3RhcnRzV2l0aCh0aGlzLndvcmtzcGFjZUZvbGRlci5mc1BhdGgpKSB7XG4gICAgICAgICAgICAgICAgcHl0aG9uUGF0aCA9IHBhdGgucmVsYXRpdmUodGhpcy53b3Jrc3BhY2VGb2xkZXIuZnNQYXRoLCBweXRob25QYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlpZWxkIHB5dGhvbkNvbmZpZy51cGRhdGUoJ3B5dGhvblBhdGgnLCBweXRob25QYXRoLCB2c2NvZGVfMS5Db25maWd1cmF0aW9uVGFyZ2V0LldvcmtzcGFjZUZvbGRlcik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuV29ya3NwYWNlRm9sZGVyUHl0aG9uUGF0aFVwZGF0ZXJTZXJ2aWNlID0gV29ya3NwYWNlRm9sZGVyUHl0aG9uUGF0aFVwZGF0ZXJTZXJ2aWNlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d29ya3NwYWNlRm9sZGVyVXBkYXRlclNlcnZpY2UuanMubWFwIl19