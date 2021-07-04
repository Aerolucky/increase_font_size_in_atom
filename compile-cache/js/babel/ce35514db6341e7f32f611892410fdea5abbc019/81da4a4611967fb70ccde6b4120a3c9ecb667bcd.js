var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var PTY = require('node-pty');
var OS = require('os');
var Path = require('path');
var Shellwords = require('shellwords');
var TempWrite = require('temp-write');

var ScriptRunnerProcess = (function () {
	_createClass(ScriptRunnerProcess, null, [{
		key: 'run',
		value: function run(view, cmd, env, editor) {
			var scriptRunnerProcess = new ScriptRunnerProcess(view);

			scriptRunnerProcess.execute(cmd, env, editor);

			return scriptRunnerProcess;
		}
	}, {
		key: 'spawn',
		value: function spawn(view, args, cwd, env) {
			var scriptRunnerProcess = new ScriptRunnerProcess(view);

			scriptRunnerProcess.spawn(args, cwd, env);

			return scriptRunnerProcess;
		}
	}]);

	function ScriptRunnerProcess(view) {
		_classCallCheck(this, ScriptRunnerProcess);

		this.view = view;
		this.pty = null;

		if (atom.config.get('script-runner.clearBeforeExecuting')) {
			this.view.clear();
		}
	}

	_createClass(ScriptRunnerProcess, [{
		key: 'destroy',
		value: function destroy() {
			if (this.pty) {
				this.pty.kill('SIGTERM');
				this.pty.destroy();
			}
		}
	}, {
		key: 'kill',
		value: function kill(signal) {
			if (signal == null) {
				signal = 'SIGINT';
			}
			if (this.pty) {
				console.log("Sending", signal, "to child", this.pty, "pid", this.pty.pid);
				this.pty.kill(signal);
				if (this.view) {
					this.view.log('<Sending ' + signal + '>', 'stdin');
				}
			}
		}
	}, {
		key: 'resolvePath',
		value: function resolvePath(editor, callback) {
			if (editor.getPath()) {
				var _ret = (function () {
					var cwd = Path.dirname(editor.getPath());

					// Save the file if it has been modified:
					Promise.resolve(editor.save()).then(function () {
						callback(editor.getPath(), cwd);
					});

					return {
						v: true
					};
				})();

				if (typeof _ret === 'object') return _ret.v;
			}

			// Otherwise it was not handled:
			return false;
		}
	}, {
		key: 'resolveSelection',
		value: function resolveSelection(editor, callback) {
			var cwd = undefined;
			if (editor.getPath()) {
				cwd = Path.dirname(editor.getPath());
			} else {
				cwd = atom.project.path;
			}

			var selection = editor.getLastSelection();

			if (selection != null && !selection.isEmpty()) {
				callback(selection.getText(), cwd);
				return true;
			}

			// Otherwise it was not handled:
			return false;
		}
	}, {
		key: 'resolveBuffer',
		value: function resolveBuffer(editor, callback) {
			var cwd = undefined;
			if (editor.getPath()) {
				cwd = Path.dirname(editor.getPath());
			} else {
				cwd = atom.project.path;
			}

			callback(editor.getText(), cwd);

			return true;
		}
	}, {
		key: 'execute',
		value: function execute(cmd, env, editor) {
			var _this = this;

			// Split the incoming command so we can modify it
			var args = Shellwords.split(cmd);

			if (this.resolveSelection(editor, function (text, cwd) {
				args.push(TempWrite.sync(text));
				return _this.spawn(args, cwd, env);
			})) {
				return true;
			}

			if (this.resolvePath(editor, function (path, cwd) {
				args.push(path);
				return _this.spawn(args, cwd, env);
			})) {
				return true;
			}

			if (this.resolveBuffer(editor, function (text, cwd) {
				args.push(TempWrite.sync(text));
				return _this.spawn(args, cwd, env);
			})) {
				return true;
			}

			// something really has to go wrong for this.
			return false;
		}
	}, {
		key: 'spawn',
		value: function spawn(args, cwd, env) {
			var _this2 = this;

			// Spawn the child process:
			console.log("spawn", args[0], args.slice(1), cwd, env);

			env['TERM'] = 'xterm-256color';

			this.pty = PTY.spawn(args[0], args.slice(1), {
				cols: this.view.terminal.cols,
				rows: this.view.terminal.rows,
				cwd: cwd,
				env: env,
				name: 'xterm-color'
			});

			this.startTime = new Date();

			// Update the status (*Shellwords.join doesn't exist yet):
			//this.view.log(args.join(' ') + ' (pgid ' + this.pty.pid + ')');

			if (this.view.process) {
				this.view.process.destroy();
			}

			this.view.process = this;

			var terminal = this.view.terminal;

			this.view.on('paste', function (data) {
				// console.log('view -> pty (paste)', data.length);
				if (_this2.pty) {
					_this2.pty.write(data);
				}
			});

			terminal.on('data', function (data) {
				// console.log('view -> pty (data)', data.length);
				if (_this2.pty) {
					_this2.pty.write(data);
				}
			});

			terminal.on('resize', function (geometry) {
				if (_this2.pty) {
					// console.log('view -> pty (resize)', geometry);
					_this2.pty.resize(geometry.cols, geometry.rows);
				}
			});

			this.pty.on('exit', function () {
				// console.log('pty (exit)')
			});

			// Handle various events relating to the child process:
			this.pty.on('data', function (data) {
				// console.log('pty -> view (data)', data.length);
				terminal.write(data);
			});

			this.pty.on('error', function (what) {
				console.log('pty (error)', what);
			});

			this.pty.on('exit', function (code, signal) {
				console.log('pty (exit)', code, signal);

				_this2.pty.destroy();
				_this2.pty = null;

				_this2.endTime = new Date();
				if (_this2.view) {
					var duration = ' after ' + (_this2.endTime - _this2.startTime) / 1000 + ' seconds';
					if (signal) {
						_this2.view.log('Exited with signal ' + signal + duration);
					} else if (code && code != 0) {
						_this2.view.log('Exited with status ' + code + duration);
					}
				}
			});

			terminal.focus();
		}
	}]);

	return ScriptRunnerProcess;
})();

;

module.exports = ScriptRunnerProcess;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0LXJ1bm5lci9saWIvc2NyaXB0LXJ1bm5lci1wcm9jZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O0lBRWxDLG1CQUFtQjtjQUFuQixtQkFBbUI7O1NBQ2QsYUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFDbEMsT0FBTSxtQkFBbUIsR0FBRyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUxRCxzQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFOUMsVUFBTyxtQkFBbUIsQ0FBQztHQUMzQjs7O1NBRVcsZUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDbEMsT0FBTSxtQkFBbUIsR0FBRyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUxRCxzQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFMUMsVUFBTyxtQkFBbUIsQ0FBQztHQUMzQjs7O0FBRVUsVUFqQk4sbUJBQW1CLENBaUJaLElBQUksRUFBRTt3QkFqQmIsbUJBQW1COztBQWtCdkIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJ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Q0FBRyxDQUFDO01BQ3pELE1BQU0sSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtBQUM3QixhQUFLLElBQUksQ0FBQyxHQUFHLHlCQUF1QixJQUFJLEdBQUcsUUFBUSxDQUFHLENBQUM7TUFDdkQ7S0FDRDtJQUNELENBQUMsQ0FBQzs7QUFFSCxXQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7R0FDakI7OztRQW5NSSxtQkFBbUI7OztBQW9NeEIsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDIiwiZmlsZSI6Ii9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0LXJ1bm5lci9saWIvc2NyaXB0LXJ1bm5lci1wcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5jb25zdCBQVFkgPSByZXF1aXJlKCdub2RlLXB0eScpO1xuY29uc3QgT1MgPSByZXF1aXJlKCdvcycpO1xuY29uc3QgUGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IFNoZWxsd29yZHMgPSByZXF1aXJlKCdzaGVsbHdvcmRzJyk7XG5jb25zdCBUZW1wV3JpdGUgPSByZXF1aXJlKCd0ZW1wLXdyaXRlJyk7XG5cbmNsYXNzIFNjcmlwdFJ1bm5lclByb2Nlc3Mge1xuXHRzdGF0aWMgcnVuKHZpZXcsIGNtZCwgZW52LCBlZGl0b3IpIHtcblx0XHRjb25zdCBzY3JpcHRSdW5uZXJQcm9jZXNzID0gbmV3IFNjcmlwdFJ1bm5lclByb2Nlc3Modmlldyk7XG5cdFx0XG5cdFx0c2NyaXB0UnVubmVyUHJvY2Vzcy5leGVjdXRlKGNtZCwgZW52LCBlZGl0b3IpO1xuXHRcdFxuXHRcdHJldHVybiBzY3JpcHRSdW5uZXJQcm9jZXNzO1xuXHR9XG5cdFxuXHRzdGF0aWMgc3Bhd24odmlldywgYXJncywgY3dkLCBlbnYpIHtcblx0XHRjb25zdCBzY3JpcHRSdW5uZXJQcm9jZXNzID0gbmV3IFNjcmlwdFJ1bm5lclByb2Nlc3Modmlldyk7XG5cdFx0XG5cdFx0c2NyaXB0UnVubmVyUHJvY2Vzcy5zcGF3bihhcmdzLCBjd2QsIGVudik7XG5cdFx0XG5cdFx0cmV0dXJuIHNjcmlwdFJ1bm5lclByb2Nlc3M7XG5cdH1cblx0XG5cdGNvbnN0cnVjdG9yKHZpZXcpIHtcblx0XHR0aGlzLnZpZXcgPSB2aWV3O1xuXHRcdHRoaXMucHR5ID0gbnVsbDtcblx0XHRcblx0XHRpZiAoYXRvbS5jb25maWcuZ2V0KCdzY3JpcHQtcnVubmVyLmNsZWFyQmVmb3JlRXhlY3V0aW5nJykpIHtcblx0XHRcdHRoaXMudmlldy5jbGVhcigpO1xuXHRcdH1cblx0fVxuXHRcblx0ZGVzdHJveSgpIHtcblx0XHRpZiAodGhpcy5wdHkpIHtcblx0XHRcdHRoaXMucHR5LmtpbGwoJ1NJR1RFUk0nKVxuXHRcdFx0dGhpcy5wdHkuZGVzdHJveSgpO1xuXHRcdH1cblx0fVxuXHRcblx0a2lsbChzaWduYWwpIHtcblx0XHRpZiAoc2lnbmFsID09IG51bGwpIHsgc2lnbmFsID0gJ1NJR0lOVCc7IH1cblx0XHRpZiAodGhpcy5wdHkpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiU2VuZGluZ1wiLCBzaWduYWwsIFwidG8gY2hpbGRcIiwgdGhpcy5wdHksIFwicGlkXCIsIHRoaXMucHR5LnBpZCk7XG5cdFx0XHR0aGlzLnB0eS5raWxsKHNpZ25hbCk7XG5cdFx0XHRpZiAodGhpcy52aWV3KSB7XG5cdFx0XHRcdHRoaXMudmlldy5sb2coYDxTZW5kaW5nICR7c2lnbmFsfT5gLCAnc3RkaW4nKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdHJlc29sdmVQYXRoKGVkaXRvciwgY2FsbGJhY2spIHtcblx0XHRpZiAoZWRpdG9yLmdldFBhdGgoKSkge1xuXHRcdFx0Y29uc3QgY3dkID0gUGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpO1xuXHRcdFx0XG5cdFx0XHQvLyBTYXZlIHRoZSBmaWxlIGlmIGl0IGhhcyBiZWVuIG1vZGlmaWVkOlxuXHRcdFx0UHJvbWlzZS5yZXNvbHZlKGVkaXRvci5zYXZlKCkpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRjYWxsYmFjayhlZGl0b3IuZ2V0UGF0aCgpLCBjd2QpO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRcblx0XHQvLyBPdGhlcndpc2UgaXQgd2FzIG5vdCBoYW5kbGVkOlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0cmVzb2x2ZVNlbGVjdGlvbihlZGl0b3IsIGNhbGxiYWNrKSB7XG5cdFx0bGV0IGN3ZDtcblx0XHRpZiAoZWRpdG9yLmdldFBhdGgoKSkge1xuXHRcdFx0Y3dkID0gUGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjd2QgPSBhdG9tLnByb2plY3QucGF0aDtcblx0XHR9XG5cdFx0XG5cdFx0Y29uc3Qgc2VsZWN0aW9uID0gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKTtcblx0XHRcblx0XHRpZiAoc2VsZWN0aW9uICE9IG51bGwgJiYgIXNlbGVjdGlvbi5pc0VtcHR5KCkpIHtcblx0XHRcdGNhbGxiYWNrKHNlbGVjdGlvbi5nZXRUZXh0KCksIGN3ZCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gT3RoZXJ3aXNlIGl0IHdhcyBub3QgaGFuZGxlZDpcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdHJlc29sdmVCdWZmZXIoZWRpdG9yLCBjYWxsYmFjaykge1xuXHRcdGxldCBjd2Q7XG5cdFx0aWYgKGVkaXRvci5nZXRQYXRoKCkpIHtcblx0XHRcdGN3ZCA9IFBhdGguZGlybmFtZShlZGl0b3IuZ2V0UGF0aCgpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y3dkID0gYXRvbS5wcm9qZWN0LnBhdGg7XG5cdFx0fVxuXHRcdFxuXHRcdGNhbGxiYWNrKGVkaXRvci5nZXRUZXh0KCksIGN3ZCk7XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0XG5cdGV4ZWN1dGUoY21kLCBlbnYsIGVkaXRvcikge1xuXHRcdC8vIFNwbGl0IHRoZSBpbmNvbWluZyBjb21tYW5kIHNvIHdlIGNhbiBtb2RpZnkgaXRcblx0XHRjb25zdCBhcmdzID0gU2hlbGx3b3Jkcy5zcGxpdChjbWQpO1xuXHRcdFxuXHRcdGlmICh0aGlzLnJlc29sdmVTZWxlY3Rpb24oZWRpdG9yLCAodGV4dCwgY3dkKSA9PiB7XG5cdFx0XHRhcmdzLnB1c2goVGVtcFdyaXRlLnN5bmModGV4dCkpO1xuXHRcdFx0cmV0dXJuIHRoaXMuc3Bhd24oYXJncywgY3dkLCBlbnYpO1xuXHRcdH0pKSB7IHJldHVybiB0cnVlOyB9XG5cdFx0XG5cdFx0aWYgKHRoaXMucmVzb2x2ZVBhdGgoZWRpdG9yLCAocGF0aCwgY3dkKSA9PiB7XG5cdFx0XHRhcmdzLnB1c2gocGF0aCk7XG5cdFx0XHRyZXR1cm4gdGhpcy5zcGF3bihhcmdzLCBjd2QsIGVudik7XG5cdFx0fSkpIHsgcmV0dXJuIHRydWU7IH1cblx0XHRcblx0XHRpZiAodGhpcy5yZXNvbHZlQnVmZmVyKGVkaXRvciwgKHRleHQsIGN3ZCkgPT4ge1xuXHRcdFx0YXJncy5wdXNoKFRlbXBXcml0ZS5zeW5jKHRleHQpKTtcblx0XHRcdHJldHVybiB0aGlzLnNwYXduKGFyZ3MsIGN3ZCwgZW52KTtcblx0XHR9KSkgeyByZXR1cm4gdHJ1ZTsgfVxuXHRcdFxuXHRcdC8vIHNvbWV0aGluZyByZWFsbHkgaGFzIHRvIGdvIHdyb25nIGZvciB0aGlzLlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0c3Bhd24oYXJncywgY3dkLCBlbnYpIHtcblx0XHQvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzczpcblx0XHRjb25zb2xlLmxvZyhcInNwYXduXCIsIGFyZ3NbMF0sIGFyZ3Muc2xpY2UoMSksIGN3ZCwgZW52KTtcblx0XHRcblx0XHRlbnZbJ1RFUk0nXSA9ICd4dGVybS0yNTZjb2xvcic7XG5cdFx0XG5cdFx0dGhpcy5wdHkgPSBQVFkuc3Bhd24oYXJnc1swXSwgYXJncy5zbGljZSgxKSwge1xuXHRcdFx0Y29sczogdGhpcy52aWV3LnRlcm1pbmFsLmNvbHMsXG5cdFx0XHRyb3dzOiB0aGlzLnZpZXcudGVybWluYWwucm93cyxcblx0XHRcdGN3ZDogY3dkLFxuXHRcdFx0ZW52OiBlbnYsXG5cdFx0XHRuYW1lOiAneHRlcm0tY29sb3InLFxuXHRcdH0pO1xuXHRcdFxuXHRcdHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGU7XG5cdFx0XG5cdFx0Ly8gVXBkYXRlIHRoZSBzdGF0dXMgKCpTaGVsbHdvcmRzLmpvaW4gZG9lc24ndCBleGlzdCB5ZXQpOlxuXHRcdC8vdGhpcy52aWV3LmxvZyhhcmdzLmpvaW4oJyAnKSArICcgKHBnaWQgJyArIHRoaXMucHR5LnBpZCArICcpJyk7XG5cdFx0XG5cdFx0aWYgKHRoaXMudmlldy5wcm9jZXNzKSB7XG5cdFx0XHR0aGlzLnZpZXcucHJvY2Vzcy5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMudmlldy5wcm9jZXNzID0gdGhpcztcblx0XHRcblx0XHRjb25zdCB7dGVybWluYWx9ID0gdGhpcy52aWV3O1xuXHRcdFxuXHRcdHRoaXMudmlldy5vbigncGFzdGUnLCBkYXRhID0+IHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCd2aWV3IC0+IHB0eSAocGFzdGUpJywgZGF0YS5sZW5ndGgpO1xuXHRcdFx0aWYgKHRoaXMucHR5KSB7XG5cdFx0XHRcdHRoaXMucHR5LndyaXRlKGRhdGEpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFxuXHRcdHRlcm1pbmFsLm9uKCdkYXRhJywgZGF0YSA9PiB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygndmlldyAtPiBwdHkgKGRhdGEpJywgZGF0YS5sZW5ndGgpO1xuXHRcdFx0aWYgKHRoaXMucHR5KSB7XG5cdFx0XHRcdHRoaXMucHR5LndyaXRlKGRhdGEpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFxuXHRcdHRlcm1pbmFsLm9uKCdyZXNpemUnLCBnZW9tZXRyeSA9PiB7XG5cdFx0XHRpZiAodGhpcy5wdHkpIHtcblx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ3ZpZXcgLT4gcHR5IChyZXNpemUpJywgZ2VvbWV0cnkpO1xuXHRcdFx0XHR0aGlzLnB0eS5yZXNpemUoZ2VvbWV0cnkuY29scywgZ2VvbWV0cnkucm93cyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0XG5cdFx0dGhpcy5wdHkub24oJ2V4aXQnLCAoKSA9PiB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygncHR5IChleGl0KScpXG5cdFx0fSk7XG5cdFx0XG5cdFx0Ly8gSGFuZGxlIHZhcmlvdXMgZXZlbnRzIHJlbGF0aW5nIHRvIHRoZSBjaGlsZCBwcm9jZXNzOlxuXHRcdHRoaXMucHR5Lm9uKCdkYXRhJywgZGF0YSA9PiB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygncHR5IC0+IHZpZXcgKGRhdGEpJywgZGF0YS5sZW5ndGgpO1xuXHRcdFx0dGVybWluYWwud3JpdGUoZGF0YSk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0dGhpcy5wdHkub24oJ2Vycm9yJywgd2hhdCA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygncHR5IChlcnJvciknLCB3aGF0KTtcblx0XHR9KTtcblx0XHRcblx0XHR0aGlzLnB0eS5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCdwdHkgKGV4aXQpJywgY29kZSwgc2lnbmFsKVxuXHRcdFx0XG5cdFx0XHR0aGlzLnB0eS5kZXN0cm95KCk7XG5cdFx0XHR0aGlzLnB0eSA9IG51bGw7XG5cdFx0XHRcblx0XHRcdHRoaXMuZW5kVGltZSA9IG5ldyBEYXRlO1xuXHRcdFx0aWYgKHRoaXMudmlldykge1xuXHRcdFx0XHRjb25zdCBkdXJhdGlvbiA9IGAgYWZ0ZXIgJHsodGhpcy5lbmRUaW1lIC0gdGhpcy5zdGFydFRpbWUpIC8gMTAwMH0gc2Vjb25kc2A7XG5cdFx0XHRcdGlmIChzaWduYWwpIHtcblx0XHRcdFx0XHR0aGlzLnZpZXcubG9nKGBFeGl0ZWQgd2l0aCBzaWduYWwgJHtzaWduYWx9JHtkdXJhdGlvbn1gKTtcblx0XHRcdFx0fSBlbHNlIGlmIChjb2RlICYmIGNvZGUgIT0gMCkge1xuXHRcdFx0XHRcdHRoaXMudmlldy5sb2coYEV4aXRlZCB3aXRoIHN0YXR1cyAke2NvZGV9JHtkdXJhdGlvbn1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFxuXHRcdHRlcm1pbmFsLmZvY3VzKCk7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2NyaXB0UnVubmVyUHJvY2VzcztcbiJdfQ==