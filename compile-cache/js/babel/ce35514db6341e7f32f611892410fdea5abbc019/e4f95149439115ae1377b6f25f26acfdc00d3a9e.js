Object.defineProperty(exports, '__esModule', {
	value: true
});
/** @babel */

var ScriptRunnerProcess = require('./script-runner-process');
var ScriptRunnerView = require('./script-runner-view');

var ChildProcess = require('child_process');
var ShellEnvironment = require('shell-environment');

var Path = require('path');
var Shellwords = require('shellwords');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var SCRIPT_RUNNER_URI = 'script-runner://';

exports['default'] = {
	config: {
		splitDirection: {
			type: 'string',
			'default': 'bottom',
			'enum': ['left', 'right', 'bottom']
		},

		scrollbackDistance: {
			type: 'number',
			'default': 555
		},

		clearBeforeExecuting: {
			type: 'boolean',
			'default': true
		},

		theme: {
			type: 'string',
			'default': 'light',
			'enum': [{ value: 'light', description: "Light" }, { value: 'dark', description: "Dark" }]
		}
	},

	commandMap: [{ scope: '^source\\.coffee', command: 'coffee' }, { scope: '^source\\.js', command: 'node' }, { scope: '^source\\.(embedded\\.)?ruby', command: 'ruby' }, { scope: '^source\\.python', command: 'python' }, { scope: '^source\\.go', command: 'go run' }, { scope: '^text\\.html\\.php', command: 'php' }, { scope: 'Shell Script (Bash)', command: 'bash' }, { path: 'spec\\.coffee$', command: 'jasmine-node --coffee' }, { path: '\\.sh$', command: 'bash' }],

	disposables: null,

	activate: function activate() {
		var _this = this;

		this.disposables = new CompositeDisposable();

		this.disposables.add(atom.workspace.addOpener(function (uri) {
			if (uri.startsWith(SCRIPT_RUNNER_URI)) {
				return new ScriptRunnerView(uri);
			}
		}));

		// register commands
		this.disposables.add(atom.commands.add('atom-workspace', {
			'script-runner:run': function scriptRunnerRun(event) {
				return _this.run();
			},
			'script-runner:shell': function scriptRunnerShell(event) {
				return _this.runShell();
			}
		}));
	},

	deactivate: function deactivate() {
		this.disposables.dispose();
	},

	runShell: function runShell() {
		var editor = atom.workspace.getActiveTextEditor();
		if (editor == null) {
			return;
		}

		var path = Path.dirname(editor.getPath());

		atom.workspace.open('script-runner://shell', {
			searchAllPanes: true
		}).then(function (view) {
			view.setTitle('Shell');

			ShellEnvironment.loginEnvironment(function (error, environment) {
				if (environment) {
					var cmd = environment['SHELL'];
					var args = Shellwords.split(cmd).concat("-l");

					ScriptRunnerProcess.spawn(view, args, path, environment);
				} else {
					throw new Error(error);
				}
			});
		});
	},

	run: function run() {
		var editor = atom.workspace.getActiveTextEditor();
		if (editor == null) {
			return;
		}

		var path = editor.getPath();
		var cmd = this.commandFor(editor);

		if (cmd == null) {
			alert('Not sure how to run: ' + path);
			return false;
		}

		atom.workspace.open('script-runner://' + path, {
			searchAllPanes: true
		}).then(function (view) {
			view.setTitle(path);

			ShellEnvironment.loginEnvironment(function (error, environment) {
				if (environment) {
					ScriptRunnerProcess.run(view, cmd, environment, editor);
				} else {
					throw new Error(error);
				}
			});
		});
	},

	scopesFor: function scopesFor(editor) {
		var selection = editor.getLastSelection();

		if (selection != null && !selection.isEmpty()) {
			var bufferPosition = selection.getBufferRange().start;
			return editor.scopeDescriptorForBufferPosition(bufferPosition).scopes.reverse();
		} else {
			return editor.getRootScopeDescriptor().scopes.reverse();
		}
	},

	commandFor: function commandFor(editor) {
		var firstRowIndex = 0;

		var selection = editor.getLastSelection();
		if (selection != null && !selection.isEmpty()) {
			firstRowIndex = selection.getBufferRowRange()[0];
		}

		// Try to extract from the shebang line:
		var firstLine = editor.lineTextForBufferRow(firstRowIndex);
		if (firstLine.match('^#!')) {
			return firstLine.substr(2);
		}

		// Try to extract matching scopes:
		var scopes = this.scopesFor(editor);
		console.log("Script Runner Scopes", scopes);

		// Lookup using the command map:
		var path = editor.getPath();
		for (var method of Array.from(this.commandMap)) {
			if (method.fileName && path != null) {
				if (path.match(method.path)) {
					return method.command;
				}
			} else if (method.scope) {
				for (var scope of scopes) {
					if (scope.match(method.scope)) {
						return method.command;
					}
				}
			}
		}
	}
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0LXJ1bm5lci9saWIvc2NyaXB0LXJ1bm5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLElBQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDL0QsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7QUFFekQsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlDLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0FBRXRELElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O2VBQ1gsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7QUFFMUIsSUFBTSxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQzs7cUJBRTlCO0FBQ2QsT0FBTSxFQUFFO0FBQ1AsZ0JBQWMsRUFBRTtBQUNmLE9BQUksRUFBRSxRQUFRO0FBQ2QsY0FBUyxRQUFRO0FBQ2pCLFdBQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztHQUNqQzs7QUFFRCxvQkFBa0IsRUFBRTtBQUNuQixPQUFJLEVBQUUsUUFBUTtBQUNkLGNBQVMsR0FBRztHQUNaOztBQUVELHNCQUFvQixFQUFFO0FBQ3JCLE9BQUksRUFBRSxTQUFTO0FBQ2YsY0FBUyxJQUFJO0dBQ2I7O0FBRUQsT0FBSyxFQUFFO0FBQ04sT0FBSSxFQUFFLFFBQVE7QUFDZCxjQUFTLE9BQU87QUFDaEIsV0FBTSxDQUNMLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFDLEVBQ3RDLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFDLENBQ3BDO0dBQ0Q7RUFDRDs7QUFFRCxXQUFVLEVBQUUsQ0FDWCxFQUFDLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFDLEVBQzlDLEVBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLEVBQ3hDLEVBQUMsS0FBSyxFQUFFLDhCQUE4QixFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUMsRUFDeEQsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBQyxFQUM5QyxFQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBQyxFQUMxQyxFQUFDLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFDLEVBQzdDLEVBQUMsS0FBSyxFQUFFLHFCQUFxQixFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUMsRUFDL0MsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixFQUFDLEVBQzFELEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLENBQ2pDOztBQUVELFlBQVcsRUFBRSxJQUFJOztBQUVqQixTQUFRLEVBQUEsb0JBQUc7OztBQUNWLE1BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztBQUU3QyxNQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDakMsT0FBSSxHQUFHLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7QUFDdEMsV0FBTyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDO0dBQ0QsQ0FBQyxDQUNGLENBQUM7OztBQUdGLE1BQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNuQyxzQkFBbUIsRUFBRSx5QkFBQSxLQUFLO1dBQUksTUFBSyxHQUFHLEVBQUU7SUFBQTtBQUN4Qyx3QkFBcUIsRUFBRSwyQkFBQSxLQUFLO1dBQUksTUFBSyxRQUFRLEVBQUU7SUFBQTtHQUMvQyxDQUFDLENBQ0YsQ0FBQztFQUNGOztBQUVELFdBQVUsRUFBQSxzQkFBRztBQUNaLE1BQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7RUFDM0I7O0FBRUQsU0FBUSxFQUFBLG9CQUFHO0FBQ1YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELE1BQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUFFLFVBQU87R0FBRTs7QUFFL0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzs7QUFFNUMsTUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDBCQUEwQjtBQUM1QyxpQkFBYyxFQUFFLElBQUk7R0FDcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUNqQixPQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUV2QixtQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFDLEtBQUssRUFBRSxXQUFXLEVBQUs7QUFDekQsUUFBSSxXQUFXLEVBQUU7QUFDaEIsU0FBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pDLFNBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVoRCx3QkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDekQsTUFBTTtBQUNOLFdBQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDdkI7SUFDRCxDQUFDLENBQUM7R0FDSCxDQUFDLENBQUM7RUFDSDs7QUFFRCxJQUFHLEVBQUEsZUFBRztBQUNMLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRCxNQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFDbkIsVUFBTztHQUNQOztBQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVwQyxNQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDaEIsUUFBSywyQkFBeUIsSUFBSSxDQUFHLENBQUM7QUFDdEMsVUFBTyxLQUFLLENBQUM7R0FDYjs7QUFFRCxNQUFJLENBQUMsU0FBUyxDQUFDLElBQUksc0JBQW9CLElBQUksRUFBSTtBQUM5QyxpQkFBYyxFQUFFLElBQUk7R0FDcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUNqQixPQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVwQixtQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFDLEtBQUssRUFBRSxXQUFXLEVBQUs7QUFDekQsUUFBSSxXQUFXLEVBQUU7QUFDaEIsd0JBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3hELE1BQU07QUFDTixXQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3ZCO0lBQ0QsQ0FBQyxDQUFDO0dBQ0gsQ0FBQyxDQUFDO0VBQ0g7O0FBRUQsVUFBUyxFQUFBLG1CQUFDLE1BQU0sRUFBRTtBQUNqQixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFNUMsTUFBSSxTQUFTLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQzlDLE9BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDeEQsVUFBTyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ2hGLE1BQU07QUFDTixVQUFPLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUN4RDtFQUNEOztBQUVELFdBQVUsRUFBQSxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsTUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDOztBQUV0QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUM1QyxNQUFJLFNBQVMsSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDOUMsZ0JBQWEsR0FBRyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNqRDs7O0FBR0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzdELE1BQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMzQixVQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDM0I7OztBQUdELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsU0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQzs7O0FBRzVDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixPQUFLLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQy9DLE9BQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ3BDLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDNUIsWUFBTyxNQUFNLENBQUMsT0FBTyxDQUFDO0tBQ3RCO0lBQ0QsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7QUFDeEIsU0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUU7QUFDekIsU0FBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUM5QixhQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUM7TUFDdEI7S0FDRDtJQUNEO0dBQ0Q7RUFDRDtDQUNEIiwiZmlsZSI6Ii9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0LXJ1bm5lci9saWIvc2NyaXB0LXJ1bm5lci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cblxuY29uc3QgU2NyaXB0UnVubmVyUHJvY2VzcyA9IHJlcXVpcmUoJy4vc2NyaXB0LXJ1bm5lci1wcm9jZXNzJyk7XG5jb25zdCBTY3JpcHRSdW5uZXJWaWV3ID0gcmVxdWlyZSgnLi9zY3JpcHQtcnVubmVyLXZpZXcnKTtcblxuY29uc3QgQ2hpbGRQcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuY29uc3QgU2hlbGxFbnZpcm9ubWVudCA9IHJlcXVpcmUoJ3NoZWxsLWVudmlyb25tZW50Jyk7XG5cbmNvbnN0IFBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBTaGVsbHdvcmRzID0gcmVxdWlyZSgnc2hlbGx3b3JkcycpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5jb25zdCBTQ1JJUFRfUlVOTkVSX1VSSSA9ICdzY3JpcHQtcnVubmVyOi8vJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRjb25maWc6IHtcblx0XHRzcGxpdERpcmVjdGlvbjoge1xuXHRcdFx0dHlwZTogJ3N0cmluZycsXG5cdFx0XHRkZWZhdWx0OiAnYm90dG9tJyxcblx0XHRcdGVudW06IFsnbGVmdCcsICdyaWdodCcsICdib3R0b20nXVxuXHRcdH0sXG5cblx0XHRzY3JvbGxiYWNrRGlzdGFuY2U6IHtcblx0XHRcdHR5cGU6ICdudW1iZXInLFxuXHRcdFx0ZGVmYXVsdDogNTU1XG5cdFx0fSxcblx0XHRcblx0XHRjbGVhckJlZm9yZUV4ZWN1dGluZzoge1xuXHRcdFx0dHlwZTogJ2Jvb2xlYW4nLFxuXHRcdFx0ZGVmYXVsdDogdHJ1ZVxuXHRcdH0sXG5cblx0XHR0aGVtZToge1xuXHRcdFx0dHlwZTogJ3N0cmluZycsXG5cdFx0XHRkZWZhdWx0OiAnbGlnaHQnLFxuXHRcdFx0ZW51bTogW1xuXHRcdFx0XHR7dmFsdWU6ICdsaWdodCcsIGRlc2NyaXB0aW9uOiBcIkxpZ2h0XCJ9LFxuXHRcdFx0XHR7dmFsdWU6ICdkYXJrJywgZGVzY3JpcHRpb246IFwiRGFya1wifVxuXHRcdFx0XVxuXHRcdH0sXG5cdH0sXG5cdFxuXHRjb21tYW5kTWFwOiBbXG5cdFx0e3Njb3BlOiAnXnNvdXJjZVxcXFwuY29mZmVlJywgY29tbWFuZDogJ2NvZmZlZSd9LFxuXHRcdHtzY29wZTogJ15zb3VyY2VcXFxcLmpzJywgY29tbWFuZDogJ25vZGUnfSxcblx0XHR7c2NvcGU6ICdec291cmNlXFxcXC4oZW1iZWRkZWRcXFxcLik/cnVieScsIGNvbW1hbmQ6ICdydWJ5J30sXG5cdFx0e3Njb3BlOiAnXnNvdXJjZVxcXFwucHl0aG9uJywgY29tbWFuZDogJ3B5dGhvbid9LFxuXHRcdHtzY29wZTogJ15zb3VyY2VcXFxcLmdvJywgY29tbWFuZDogJ2dvIHJ1bid9LFxuXHRcdHtzY29wZTogJ150ZXh0XFxcXC5odG1sXFxcXC5waHAnLCBjb21tYW5kOiAncGhwJ30sXG5cdFx0e3Njb3BlOiAnU2hlbGwgU2NyaXB0IChCYXNoKScsIGNvbW1hbmQ6ICdiYXNoJ30sXG5cdFx0e3BhdGg6ICdzcGVjXFxcXC5jb2ZmZWUkJywgY29tbWFuZDogJ2phc21pbmUtbm9kZSAtLWNvZmZlZSd9LFxuXHRcdHtwYXRoOiAnXFxcXC5zaCQnLCBjb21tYW5kOiAnYmFzaCd9LFxuXHRdLFxuXHRcblx0ZGlzcG9zYWJsZXM6IG51bGwsXG5cdFxuXHRhY3RpdmF0ZSgpIHtcblx0XHR0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblx0XHRcblx0XHR0aGlzLmRpc3Bvc2FibGVzLmFkZChcblx0XHRcdGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcigodXJpKSA9PiB7XG5cdFx0XHRcdGlmICh1cmkuc3RhcnRzV2l0aChTQ1JJUFRfUlVOTkVSX1VSSSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFNjcmlwdFJ1bm5lclZpZXcodXJpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHQpO1xuXHRcdFxuXHRcdC8vIHJlZ2lzdGVyIGNvbW1hbmRzXG5cdFx0dGhpcy5kaXNwb3NhYmxlcy5hZGQoXG5cdFx0XHRhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG5cdFx0XHRcdCdzY3JpcHQtcnVubmVyOnJ1bic6IGV2ZW50ID0+IHRoaXMucnVuKCksXG5cdFx0XHRcdCdzY3JpcHQtcnVubmVyOnNoZWxsJzogZXZlbnQgPT4gdGhpcy5ydW5TaGVsbCgpLFxuXHRcdFx0fSlcblx0XHQpO1xuXHR9LFxuXHRcblx0ZGVhY3RpdmF0ZSgpIHtcblx0XHR0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcblx0fSxcblx0XG5cdHJ1blNoZWxsKCkge1xuXHRcdGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcblx0XHRpZiAoZWRpdG9yID09IG51bGwpIHsgcmV0dXJuOyB9XG5cblx0XHRjb25zdCBwYXRoID0gUGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpO1xuXHRcdFxuXHRcdGF0b20ud29ya3NwYWNlLm9wZW4oYHNjcmlwdC1ydW5uZXI6Ly9zaGVsbGAsIHtcblx0XHRcdHNlYXJjaEFsbFBhbmVzOiB0cnVlXG5cdFx0fSkudGhlbigodmlldykgPT4ge1xuXHRcdFx0dmlldy5zZXRUaXRsZSgnU2hlbGwnKTtcblx0XHRcdFxuXHRcdFx0U2hlbGxFbnZpcm9ubWVudC5sb2dpbkVudmlyb25tZW50KChlcnJvciwgZW52aXJvbm1lbnQpID0+IHtcblx0XHRcdFx0aWYgKGVudmlyb25tZW50KSB7XG5cdFx0XHRcdFx0Y29uc3QgY21kID0gZW52aXJvbm1lbnRbJ1NIRUxMJ107XG5cdFx0XHRcdFx0Y29uc3QgYXJncyA9IFNoZWxsd29yZHMuc3BsaXQoY21kKS5jb25jYXQoXCItbFwiKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRTY3JpcHRSdW5uZXJQcm9jZXNzLnNwYXduKHZpZXcsIGFyZ3MsIHBhdGgsIGVudmlyb25tZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoZXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSxcblx0XG5cdHJ1bigpIHtcblx0XHRjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG5cdFx0aWYgKGVkaXRvciA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdFxuXHRcdGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGNtZCA9IHRoaXMuY29tbWFuZEZvcihlZGl0b3IpO1xuXHRcdFxuXHRcdGlmIChjbWQgPT0gbnVsbCkge1xuXHRcdFx0YWxlcnQoYE5vdCBzdXJlIGhvdyB0byBydW46ICR7cGF0aH1gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0XG5cdFx0YXRvbS53b3Jrc3BhY2Uub3Blbihgc2NyaXB0LXJ1bm5lcjovLyR7cGF0aH1gLCB7XG5cdFx0XHRzZWFyY2hBbGxQYW5lczogdHJ1ZVxuXHRcdH0pLnRoZW4oKHZpZXcpID0+IHtcblx0XHRcdHZpZXcuc2V0VGl0bGUocGF0aCk7XG5cdFx0XHRcblx0XHRcdFNoZWxsRW52aXJvbm1lbnQubG9naW5FbnZpcm9ubWVudCgoZXJyb3IsIGVudmlyb25tZW50KSA9PiB7XG5cdFx0XHRcdGlmIChlbnZpcm9ubWVudCkge1xuXHRcdFx0XHRcdFNjcmlwdFJ1bm5lclByb2Nlc3MucnVuKHZpZXcsIGNtZCwgZW52aXJvbm1lbnQsIGVkaXRvcik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0c2NvcGVzRm9yKGVkaXRvcikge1xuXHRcdGNvbnN0IHNlbGVjdGlvbiA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCk7XG5cdFx0XG5cdFx0aWYgKHNlbGVjdGlvbiAhPSBudWxsICYmICFzZWxlY3Rpb24uaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBidWZmZXJQb3NpdGlvbiA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0O1xuXHRcdFx0cmV0dXJuIGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbikuc2NvcGVzLnJldmVyc2UoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKCkuc2NvcGVzLnJldmVyc2UoKTtcblx0XHR9XG5cdH0sXG5cblx0Y29tbWFuZEZvcihlZGl0b3IpIHtcblx0XHR2YXIgZmlyc3RSb3dJbmRleCA9IDA7XG5cdFx0XG5cdFx0Y29uc3Qgc2VsZWN0aW9uID0gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKTtcblx0XHRpZiAoc2VsZWN0aW9uICE9IG51bGwgJiYgIXNlbGVjdGlvbi5pc0VtcHR5KCkpIHtcblx0XHRcdGZpcnN0Um93SW5kZXggPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVswXTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gVHJ5IHRvIGV4dHJhY3QgZnJvbSB0aGUgc2hlYmFuZyBsaW5lOlxuXHRcdGNvbnN0IGZpcnN0TGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhmaXJzdFJvd0luZGV4KTtcblx0XHRpZiAoZmlyc3RMaW5lLm1hdGNoKCdeIyEnKSkge1xuXHRcdFx0cmV0dXJuIGZpcnN0TGluZS5zdWJzdHIoMik7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIFRyeSB0byBleHRyYWN0IG1hdGNoaW5nIHNjb3Blczpcblx0XHRjb25zdCBzY29wZXMgPSB0aGlzLnNjb3Blc0ZvcihlZGl0b3IpO1xuXHRcdGNvbnNvbGUubG9nKFwiU2NyaXB0IFJ1bm5lciBTY29wZXNcIiwgc2NvcGVzKTtcblx0XHRcblx0XHQvLyBMb29rdXAgdXNpbmcgdGhlIGNvbW1hbmQgbWFwOlxuXHRcdGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuXHRcdGZvciAobGV0IG1ldGhvZCBvZiBBcnJheS5mcm9tKHRoaXMuY29tbWFuZE1hcCkpIHtcblx0XHRcdGlmIChtZXRob2QuZmlsZU5hbWUgJiYgcGF0aCAhPSBudWxsKSB7XG5cdFx0XHRcdGlmIChwYXRoLm1hdGNoKG1ldGhvZC5wYXRoKSkge1xuXHRcdFx0XHRcdHJldHVybiBtZXRob2QuY29tbWFuZDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChtZXRob2Quc2NvcGUpIHtcblx0XHRcdFx0Zm9yIChsZXQgc2NvcGUgb2Ygc2NvcGVzKSB7XG5cdFx0XHRcdFx0aWYgKHNjb3BlLm1hdGNoKG1ldGhvZC5zY29wZSkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBtZXRob2QuY29tbWFuZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG59O1xuIl19