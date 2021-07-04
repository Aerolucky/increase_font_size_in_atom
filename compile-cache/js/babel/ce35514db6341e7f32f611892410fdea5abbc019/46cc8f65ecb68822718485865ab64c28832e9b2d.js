var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var ChildProcess = require('child_process');
var Locale = require('os-locale');

var ShellEnvironment = (function () {
	// options can include `cachePeriod`, which could be null or an integral number of seconds to cache the environment for, and `command` which is a string command to execute which should output key=value environment variables, defaults to `env`.

	function ShellEnvironment(options) {
		_classCallCheck(this, ShellEnvironment);

		if (options && options.cachePeriod !== null) {
			this.cachePeriod = options.cachePeriod;
		} else {
			// Default to 1 second cache:
			this.cachePeriod = 1;
		}

		if (options && options.command) {
			this.command = options.command;
		} else {
			this.command = 'env';
		}
	}

	// Returns true if the environment cache is valid.

	_createClass(ShellEnvironment, [{
		key: 'isCacheValid',
		value: function isCacheValid() {
			// have a cache                              # and cache isn't too old
			return this.environmentCache != null && this.environmentCacheDate != null && new Date() - this.environmentCacheDate < this.cachePeriod;
		}

		// Update the environment cache.
	}, {
		key: 'setCachedEnvironment',
		value: function setCachedEnvironment(environment) {
			if (environment && this.cachePeriod) {
				this.environmentCache = environment;
				return this.environmentCacheDate = new Date();
			}
		}

		// This function fetches the login environment implements any caching behaviour.
	}, {
		key: 'getEnvironment',
		value: function getEnvironment(callback) {
			var _this = this;

			if (this.isCacheValid()) {
				callback(null, this.environmentCache);
			} else {
				this.getBestEnvironment(function (error, environment) {
					_this.setCachedEnvironment(environment);
					return callback(error, environment);
				});
			}

			return undefined;
		}

		// Get the login environment from the shell if possible, if that fails return process.env which is the next best.
	}, {
		key: 'getBestEnvironment',
		value: function getBestEnvironment(callback) {
			// On platforms that don't have a shell, we just return process.env (e.g. Windows).
			if (!process.env.SHELL) {
				callback(null, process.env);
			}

			return this.getLoginEnvironmentFromShell(function (error, environment) {
				if (!environment) {
					console.warn('ShellEnvironment.getBestEnvironment: ' + error);
					environment = Object.assign({}, process.env);
				}

				if (!environment.LANG) {
					Locale().then(function (locale) {
						environment.LANG = locale + '.UTF-8';
						console.log('ShellEnvironment.getBestEnvironment: LANG=' + environment.LANG);
						callback(error, environment);
					})['catch'](function (error) {
						callback(error, environment);
					});
				} else {
					callback(error, environment);
				}
			});
		}

		// Get the login environment by running env within a login shell, and parsing the results.
	}, {
		key: 'getLoginEnvironmentFromShell',
		value: function getLoginEnvironmentFromShell(callback) {
			// I tried using ChildProcess.execFile but there is no way to set detached and this causes the child shell to lock up. This command runs an interactive login shell and executes the export command to get a list of environment variables. We then use these to run the script:
			var child = ChildProcess.spawn(process.env.SHELL, ['-ilc', this.command + ">&3"], {
				// This is essential for interactive shells, otherwise it never finishes:
				detached: true,
				// We don't care about stdin, stderr can go out the usual way:
				stdio: ['ignore', 'ignore', process.stderr, 'pipe']
			});

			// We buffer stdout:
			var outputBuffer = '';
			child.stdio[3].on('data', function (data) {
				return outputBuffer += data;
			});

			// When the process finishes, extract the environment variables and pass them to the callback:
			child.on('close', function (code, signal) {
				if (code !== 0) {
					return callback('child process exited with non-zero status ' + code);
				} else {
					var environment = {};
					for (var definition of Array.from(outputBuffer.split('\n'))) {
						var _Array$from = Array.from(definition.trim().split('=', 2));

						var _Array$from2 = _slicedToArray(_Array$from, 2);

						var key = _Array$from2[0];
						var value = _Array$from2[1];

						if (key !== '') {
							environment[key] = value;
						}
					}
					return callback(null, environment);
				}
			});

			return child.on('error', function (error) {
				console.log('error', error);
				return callback('child process failed with ' + error);
			});
		}
	}], [{
		key: 'sharedShellEnvironment',
		value: function sharedShellEnvironment() {
			return this.shellEnvironment || (this.shellEnvironment = new ShellEnvironment());
		}

		// existing syntax, this is a static class method
	}, {
		key: 'loginEnvironment',
		value: function loginEnvironment(callback) {
			return this.sharedShellEnvironment().getEnvironment(callback);
		}
	}]);

	return ShellEnvironment;
})();

module.exports = ShellEnvironment;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0LXJ1bm5lci9ub2RlX21vZHVsZXMvc2hlbGwtZW52aXJvbm1lbnQvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBRUEsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7SUFFOUIsZ0JBQWdCOzs7QUFFVixVQUZOLGdCQUFnQixDQUVULE9BQU8sRUFBRTt3QkFGaEIsZ0JBQWdCOztBQUdwQixNQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRTtBQUM1QyxPQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7R0FDdkMsTUFBTTs7QUFFTixPQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztHQUNyQjs7QUFFRCxNQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQy9CLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztHQUMvQixNQUFNO0FBQ04sT0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7R0FDckI7RUFDRDs7OztjQWZJLGdCQUFnQjs7U0FrQlQsd0JBQUc7O0FBRWQsVUFBTyxBQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLElBQU0sSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQUFBQyxJQUFLLEFBQUMsSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUksSUFBSSxDQUFDLFdBQVcsQUFBQyxDQUFDO0dBQy9JOzs7OztTQUdtQiw4QkFBQyxXQUFXLEVBQUU7QUFDakMsT0FBSSxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNwQyxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO0FBQ3BDLFdBQU8sSUFB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QUcsRUFBRSxDQUFDLENBQUMsQ0FBQzs7OztVQUF6RCxHQUFHO1VBQUUsS0FBSzs7QUFDakIsVUFBSSxHQUFHLEtBQUssRUFBRSxFQUFFO0FBQUUsa0JBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7T0FBRTtNQUM3QztBQUNELFlBQU8sUUFBUSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztLQUNuQztJQUNELENBQUMsQ0FBQzs7QUFFSCxVQUFPLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ3hDLFdBQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzVCLFdBQU8sUUFBUSxnQ0FBOEIsS0FBSyxDQUFHLENBQUM7SUFDdEQsQ0FBQyxDQUFDO0dBQ0g7OztTQUU0QixrQ0FBRztBQUMvQixVQUFPLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFBLEFBQUMsQ0FBQztHQUNqRjs7Ozs7U0FHc0IsMEJBQUMsUUFBUSxFQUFFO0FBQ2pDLFVBQU8sSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzlEOzs7UUFqSEksZ0JBQWdCOzs7QUFvSHRCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUEiLCJmaWxlIjoiL2hvbWUvbWlrZS8uYXRvbS9wYWNrYWdlcy9zY3JpcHQtcnVubmVyL25vZGVfbW9kdWxlcy9zaGVsbC1lbnZpcm9ubWVudC9saWIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG5cbmNvbnN0IENoaWxkUHJvY2VzcyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbmNvbnN0IExvY2FsZSA9IHJlcXVpcmUoJ29zLWxvY2FsZScpO1xuXG5jbGFzcyBTaGVsbEVudmlyb25tZW50IHtcblx0Ly8gb3B0aW9ucyBjYW4gaW5jbHVkZSBgY2FjaGVQZXJpb2RgLCB3aGljaCBjb3VsZCBiZSBudWxsIG9yIGFuIGludGVncmFsIG51bWJlciBvZiBzZWNvbmRzIHRvIGNhY2hlIHRoZSBlbnZpcm9ubWVudCBmb3IsIGFuZCBgY29tbWFuZGAgd2hpY2ggaXMgYSBzdHJpbmcgY29tbWFuZCB0byBleGVjdXRlIHdoaWNoIHNob3VsZCBvdXRwdXQga2V5PXZhbHVlIGVudmlyb25tZW50IHZhcmlhYmxlcywgZGVmYXVsdHMgdG8gYGVudmAuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcblx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNhY2hlUGVyaW9kICE9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmNhY2hlUGVyaW9kID0gb3B0aW9ucy5jYWNoZVBlcmlvZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gRGVmYXVsdCB0byAxIHNlY29uZCBjYWNoZTpcblx0XHRcdHRoaXMuY2FjaGVQZXJpb2QgPSAxO1xuXHRcdH1cblx0XHRcblx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLmNvbW1hbmQpIHtcblx0XHRcdHRoaXMuY29tbWFuZCA9IG9wdGlvbnMuY29tbWFuZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jb21tYW5kID0gJ2Vudic7XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGNhY2hlIGlzIHZhbGlkLlxuXHRpc0NhY2hlVmFsaWQoKSB7XG5cdFx0Ly8gaGF2ZSBhIGNhY2hlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBhbmQgY2FjaGUgaXNuJ3QgdG9vIG9sZFxuXHRcdHJldHVybiAodGhpcy5lbnZpcm9ubWVudENhY2hlICE9IG51bGwpICYmICh0aGlzLmVudmlyb25tZW50Q2FjaGVEYXRlICE9IG51bGwpICYmICgobmV3IERhdGUoKSAtIHRoaXMuZW52aXJvbm1lbnRDYWNoZURhdGUpIDwgdGhpcy5jYWNoZVBlcmlvZCk7XG5cdH1cblx0XG5cdC8vIFVwZGF0ZSB0aGUgZW52aXJvbm1lbnQgY2FjaGUuXG5cdHNldENhY2hlZEVudmlyb25tZW50KGVudmlyb25tZW50KSB7XG5cdFx0aWYgKGVudmlyb25tZW50ICYmIHRoaXMuY2FjaGVQZXJpb2QpIHtcblx0XHRcdHRoaXMuZW52aXJvbm1lbnRDYWNoZSA9IGVudmlyb25tZW50O1xuXHRcdFx0cmV0dXJuIHRoaXMuZW52aXJvbm1lbnRDYWNoZURhdGUgPSBuZXcgRGF0ZSgpO1xuXHRcdH1cblx0fVxuXHRcblx0Ly8gVGhpcyBmdW5jdGlvbiBmZXRjaGVzIHRoZSBsb2dpbiBlbnZpcm9ubWVudCBpbXBsZW1lbnRzIGFueSBjYWNoaW5nIGJlaGF2aW91ci5cblx0Z2V0RW52aXJvbm1lbnQoY2FsbGJhY2spIHtcblx0XHRpZiAodGhpcy5pc0NhY2hlVmFsaWQoKSkge1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgdGhpcy5lbnZpcm9ubWVudENhY2hlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5nZXRCZXN0RW52aXJvbm1lbnQoKGVycm9yLCBlbnZpcm9ubWVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLnNldENhY2hlZEVudmlyb25tZW50KGVudmlyb25tZW50KTtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVycm9yLCBlbnZpcm9ubWVudCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRcblx0Ly8gR2V0IHRoZSBsb2dpbiBlbnZpcm9ubWVudCBmcm9tIHRoZSBzaGVsbCBpZiBwb3NzaWJsZSwgaWYgdGhhdCBmYWlscyByZXR1cm4gcHJvY2Vzcy5lbnYgd2hpY2ggaXMgdGhlIG5leHQgYmVzdC5cblx0Z2V0QmVzdEVudmlyb25tZW50KGNhbGxiYWNrKSB7XG5cdFx0Ly8gT24gcGxhdGZvcm1zIHRoYXQgZG9uJ3QgaGF2ZSBhIHNoZWxsLCB3ZSBqdXN0IHJldHVybiBwcm9jZXNzLmVudiAoZS5nLiBXaW5kb3dzKS5cblx0XHRpZiAoIXByb2Nlc3MuZW52LlNIRUxMKSB7XG5cdFx0XHRjYWxsYmFjayhudWxsLCBwcm9jZXNzLmVudik7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiB0aGlzLmdldExvZ2luRW52aXJvbm1lbnRGcm9tU2hlbGwoZnVuY3Rpb24oZXJyb3IsIGVudmlyb25tZW50KSB7XG5cdFx0XHRpZiAoIWVudmlyb25tZW50KSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgU2hlbGxFbnZpcm9ubWVudC5nZXRCZXN0RW52aXJvbm1lbnQ6ICR7ZXJyb3J9YCk7XG5cdFx0XHRcdGVudmlyb25tZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoIWVudmlyb25tZW50LkxBTkcpIHtcblx0XHRcdFx0TG9jYWxlKCkudGhlbigobG9jYWxlKSA9PiB7XG5cdFx0XHRcdFx0ZW52aXJvbm1lbnQuTEFORyA9IGAke2xvY2FsZX0uVVRGLThgXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFNoZWxsRW52aXJvbm1lbnQuZ2V0QmVzdEVudmlyb25tZW50OiBMQU5HPSR7ZW52aXJvbm1lbnQuTEFOR31gKVxuXHRcdFx0XHRcdGNhbGxiYWNrKGVycm9yLCBlbnZpcm9ubWVudCk7XG5cdFx0XHRcdH0pLmNhdGNoKChlcnJvcikgPT4ge1xuXHRcdFx0XHRcdGNhbGxiYWNrKGVycm9yLCBlbnZpcm9ubWVudCk7XG5cdFx0XHRcdH0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjYWxsYmFjayhlcnJvciwgZW52aXJvbm1lbnQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdFxuXHQvLyBHZXQgdGhlIGxvZ2luIGVudmlyb25tZW50IGJ5IHJ1bm5pbmcgZW52IHdpdGhpbiBhIGxvZ2luIHNoZWxsLCBhbmQgcGFyc2luZyB0aGUgcmVzdWx0cy5cblx0Z2V0TG9naW5FbnZpcm9ubWVudEZyb21TaGVsbChjYWxsYmFjaykge1xuXHRcdC8vIEkgdHJpZWQgdXNpbmcgQ2hpbGRQcm9jZXNzLmV4ZWNGaWxlIGJ1dCB0aGVyZSBpcyBubyB3YXkgdG8gc2V0IGRldGFjaGVkIGFuZCB0aGlzIGNhdXNlcyB0aGUgY2hpbGQgc2hlbGwgdG8gbG9jayB1cC4gVGhpcyBjb21tYW5kIHJ1bnMgYW4gaW50ZXJhY3RpdmUgbG9naW4gc2hlbGwgYW5kIGV4ZWN1dGVzIHRoZSBleHBvcnQgY29tbWFuZCB0byBnZXQgYSBsaXN0IG9mIGVudmlyb25tZW50IHZhcmlhYmxlcy4gV2UgdGhlbiB1c2UgdGhlc2UgdG8gcnVuIHRoZSBzY3JpcHQ6XG5cdFx0Y29uc3QgY2hpbGQgPSBDaGlsZFByb2Nlc3Muc3Bhd24ocHJvY2Vzcy5lbnYuU0hFTEwsIFsnLWlsYycsIHRoaXMuY29tbWFuZCArIFwiPiYzXCJdLCB7XG5cdFx0XHQvLyBUaGlzIGlzIGVzc2VudGlhbCBmb3IgaW50ZXJhY3RpdmUgc2hlbGxzLCBvdGhlcndpc2UgaXQgbmV2ZXIgZmluaXNoZXM6XG5cdFx0XHRkZXRhY2hlZDogdHJ1ZSxcblx0XHRcdC8vIFdlIGRvbid0IGNhcmUgYWJvdXQgc3RkaW4sIHN0ZGVyciBjYW4gZ28gb3V0IHRoZSB1c3VhbCB3YXk6XG5cdFx0XHRzdGRpbzogWydpZ25vcmUnLCAnaWdub3JlJywgcHJvY2Vzcy5zdGRlcnIsICdwaXBlJ11cblx0XHR9KTtcblx0XHRcblx0XHQvLyBXZSBidWZmZXIgc3Rkb3V0OlxuXHRcdGxldCBvdXRwdXRCdWZmZXIgPSAnJztcblx0XHRjaGlsZC5zdGRpb1szXS5vbignZGF0YScsIGRhdGEgPT4gb3V0cHV0QnVmZmVyICs9IGRhdGEpO1xuXHRcdFxuXHRcdC8vIFdoZW4gdGhlIHByb2Nlc3MgZmluaXNoZXMsIGV4dHJhY3QgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBhbmQgcGFzcyB0aGVtIHRvIHRoZSBjYWxsYmFjazpcblx0XHRjaGlsZC5vbignY2xvc2UnLCBmdW5jdGlvbihjb2RlLCBzaWduYWwpIHtcblx0XHRcdGlmIChjb2RlICE9PSAwKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhgY2hpbGQgcHJvY2VzcyBleGl0ZWQgd2l0aCBub24temVybyBzdGF0dXMgJHtjb2RlfWApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZW52aXJvbm1lbnQgPSB7fTtcblx0XHRcdFx0Zm9yIChsZXQgZGVmaW5pdGlvbiBvZiBBcnJheS5mcm9tKG91dHB1dEJ1ZmZlci5zcGxpdCgnXFxuJykpKSB7XG5cdFx0XHRcdFx0Y29uc3QgW2tleSwgdmFsdWVdID0gQXJyYXkuZnJvbShkZWZpbml0aW9uLnRyaW0oKS5zcGxpdCgnPScsIDIpKTtcblx0XHRcdFx0XHRpZiAoa2V5ICE9PSAnJykgeyBlbnZpcm9ubWVudFtrZXldID0gdmFsdWU7IH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgZW52aXJvbm1lbnQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFxuXHRcdHJldHVybiBjaGlsZC5vbignZXJyb3InLCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0Y29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3IpO1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKGBjaGlsZCBwcm9jZXNzIGZhaWxlZCB3aXRoICR7ZXJyb3J9YCk7XG5cdFx0fSk7XG5cdH1cblx0XG5cdHN0YXRpYyBzaGFyZWRTaGVsbEVudmlyb25tZW50KCkge1xuXHRcdHJldHVybiB0aGlzLnNoZWxsRW52aXJvbm1lbnQgfHwgKHRoaXMuc2hlbGxFbnZpcm9ubWVudCA9IG5ldyBTaGVsbEVudmlyb25tZW50KCkpO1xuXHR9XG5cdFxuXHQvLyBleGlzdGluZyBzeW50YXgsIHRoaXMgaXMgYSBzdGF0aWMgY2xhc3MgbWV0aG9kXG5cdHN0YXRpYyBsb2dpbkVudmlyb25tZW50KGNhbGxiYWNrKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2hhcmVkU2hlbGxFbnZpcm9ubWVudCgpLmdldEVudmlyb25tZW50KGNhbGxiYWNrKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoZWxsRW52aXJvbm1lbnQiXX0=