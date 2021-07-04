Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */
/** @jsx Etch.dom */

var Etch = require('etch');

var _require = require('atom');

var Emitter = _require.Emitter;

var ResizeObserver = require('resize-observer-polyfill');

var _require2 = require('xterm');

var Terminal = _require2.Terminal;

var fit = require('xterm/lib/addons/fit/fit');
Terminal.applyAddon(fit);

var ScriptRunnerView = (function () {
	_createClass(ScriptRunnerView, null, [{
		key: 'deserialize',
		value: function deserialize(_ref) {
			var uri = _ref.uri;
			var title = _ref.title;
			var state = _ref.state;

			var view = new ScriptRunnerView(uri, title);

			if (state) {
				view.terminal.setState(state);
			}

			return view;
		}
	}]);

	function ScriptRunnerView(uri, title) {
		var _this = this;

		_classCallCheck(this, ScriptRunnerView);

		Etch.initialize(this);
		console.log("element", this.element);

		this.uri = uri;

		this.emitter = new Emitter();

		atom.commands.add(this.element, {
			'script-runner:copy': function scriptRunnerCopy() {
				return _this.copyToClipboard();
			},
			'script-runner:paste': function scriptRunnerPaste() {
				return _this.pasteToTerminal();
			},
			'script-runner:clear': function scriptRunnerClear() {
				return _this.clear();
			},
			'script-runner:interrupt': function scriptRunnerInterrupt(event) {
				return _this.kill('SIGINT');
			},
			'script-runner:terminate': function scriptRunnerTerminate(event) {
				return _this.kill('SIGTERM');
			},
			'script-runner:kill': function scriptRunnerKill(event) {
				return _this.kill('SIGKILL');
			}
		});

		if (title == null) this.title = uri;else this.title = title;

		this.setupTerminal();

		this.resizeObserver = new ResizeObserver(function () {
			return _this.outputResized();
		});
		this.resizeObserver.observe(this.element);
	}

	_createClass(ScriptRunnerView, [{
		key: 'destroy',
		value: function destroy() {
			this.resizeObserver.disconnect();

			if (this.process) this.process.destroy();

			if (this.terminal) this.terminal.destroy();

			Etch.destroy(this);
		}
	}, {
		key: 'serialize',
		value: function serialize() {
			return {
				deserializer: 'ScriptRunnerView',
				uri: this.uri,
				title: this.title
			};
		}
	}, {
		key: 'render',
		//state: this.terminal.getState(),
		value: function render() {
			return Etch.dom('script-runner-view', { attributes: { tabindex: 0 } });
		}
	}, {
		key: 'update',
		value: function update(props, children) {
			return Etch.update(this);
		}
	}, {
		key: 'copyToClipboard',
		value: function copyToClipboard() {
			return atom.clipboard.write(this.terminal.getSelection());
		}
	}, {
		key: 'pasteToTerminal',
		value: function pasteToTerminal() {
			return this.emitter.emit('paste', atom.clipboard.read());
		}
	}, {
		key: 'getURI',
		value: function getURI() {
			return this.uri;
		}
	}, {
		key: 'getIconName',
		value: function getIconName() {
			return 'terminal';
		}
	}, {
		key: 'getTitle',
		value: function getTitle() {
			return 'Script Runner: ' + this.title;
		}
	}, {
		key: 'getDefaultLocation',
		value: function getDefaultLocation() {
			return atom.config.get('script-runner.splitDirection') || 'bottom';
		}
	}, {
		key: 'setTitle',
		value: function setTitle(title) {
			this.title = title;

			this.emitter.emit("did-change-title", this.getTitle());
		}

		// Invoked by the atom workspace to monitor the view's title:
	}, {
		key: 'onDidChangeTitle',
		value: function onDidChangeTitle(callback) {
			return this.emitter.on('did-change-title', callback);
		}
	}, {
		key: 'setTheme',
		value: function setTheme(theme) {
			this.theme = theme;
			return this.element.setAttribute('data-theme', theme);
		}
	}, {
		key: 'setupTerminal',
		value: function setupTerminal() {
			var _this2 = this;

			this.terminal = new Terminal({
				rows: 40,
				cols: 80,
				scrollback: atom.config.get('script-runner.scrollback'),
				useStyle: false,
				cursorBlink: true
			});

			this.element.addEventListener('focus', function () {
				return _this2.terminal.focus();
			});

			var style = '';
			var editor = atom.config.settings.editor;

			if (editor) {
				if (editor.fontSize) style += 'font-size:' + editor.fontSize + 'px;';
				if (editor.fontFamily) style += 'font-family:' + editor.fontFamily + ';';
				if (editor.lineHeight) style += 'line-height:' + editor.lineHeight + ';';

				this.element.setAttribute('style', style);
			}
		}
	}, {
		key: 'outputResized',
		value: function outputResized() {
			if (!this.terminal.element) {
				this.terminal.open(this.element, true);
			}

			this.terminal.fit();
		}
	}, {
		key: 'kill',
		value: function kill(signal) {
			if (this.process) this.process.kill(signal);
		}
	}, {
		key: 'focus',
		value: function focus() {
			return this.terminal.focus();
		}
	}, {
		key: 'clear',
		value: function clear() {
			return this.terminal.clear();
		}
	}, {
		key: 'on',
		value: function on(event, callback) {
			return this.emitter.on(event, callback);
		}
	}, {
		key: 'append',
		value: function append(text, className) {
			return this.terminal.write(text);
		}
	}, {
		key: 'log',
		value: function log(text) {
			return this.terminal.write(text + "\r\n");
		}
	}]);

	return ScriptRunnerView;
})();

exports['default'] = ScriptRunnerView;
;

atom.deserializers.add(ScriptRunnerView);
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0LXJ1bm5lci9saWIvc2NyaXB0LXJ1bm5lci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBR0EsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNYLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTFCLE9BQU8sWUFBUCxPQUFPOztBQUNkLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOztnQkFFeEMsT0FBTyxDQUFDLE9BQU8sQ0FBQzs7SUFBNUIsUUFBUSxhQUFSLFFBQVE7O0FBQ2YsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDaEQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFSixnQkFBZ0I7Y0FBaEIsZ0JBQWdCOztTQUNsQixxQkFBQyxJQUFtQixFQUFFO09BQXBCLEdBQUcsR0FBSixJQUFtQixDQUFsQixHQUFHO09BQUUsS0FBSyxHQUFYLElBQW1CLENBQWIsS0FBSztPQUFFLEtBQUssR0FBbEIsSUFBbUIsQ0FBTixLQUFLOztBQUNwQyxPQUFNLElBQUksR0FBRyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFOUMsT0FBSSxLQUFLLEVBQUU7QUFDVixRQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5Qjs7QUFFRCxVQUFPLElBQUksQ0FBQztHQUNaOzs7QUFFVSxVQVhTLGdCQUFnQixDQVd4QixHQUFHLEVBQUUsS0FBSyxFQUFFOzs7d0JBWEosZ0JBQWdCOztBQVluQyxNQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLFNBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFckMsTUFBSSxDQUFD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LEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0LXJ1bm5lci9saWIvc2NyaXB0LXJ1bm5lci12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuLyoqIEBqc3ggRXRjaC5kb20gKi9cblxuY29uc3QgRXRjaCA9IHJlcXVpcmUoJ2V0Y2gnKTtcbmNvbnN0IHtFbWl0dGVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFJlc2l6ZU9ic2VydmVyID0gcmVxdWlyZSgncmVzaXplLW9ic2VydmVyLXBvbHlmaWxsJyk7XG5cbmNvbnN0IHtUZXJtaW5hbH0gPSByZXF1aXJlKCd4dGVybScpO1xuY29uc3QgZml0ID0gcmVxdWlyZSgneHRlcm0vbGliL2FkZG9ucy9maXQvZml0Jyk7XG5UZXJtaW5hbC5hcHBseUFkZG9uKGZpdCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmlwdFJ1bm5lclZpZXcge1xuXHRzdGF0aWMgZGVzZXJpYWxpemUoe3VyaSwgdGl0bGUsIHN0YXRlfSkge1xuXHRcdGNvbnN0IHZpZXcgPSBuZXcgU2NyaXB0UnVubmVyVmlldyh1cmksIHRpdGxlKTtcblx0XHRcblx0XHRpZiAoc3RhdGUpIHtcblx0XHRcdHZpZXcudGVybWluYWwuc2V0U3RhdGUoc3RhdGUpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gdmlldztcblx0fVxuXHRcblx0Y29uc3RydWN0b3IodXJpLCB0aXRsZSkge1xuXHRcdEV0Y2guaW5pdGlhbGl6ZSh0aGlzKTtcblx0XHRjb25zb2xlLmxvZyhcImVsZW1lbnRcIiwgdGhpcy5lbGVtZW50KTtcblx0XHRcblx0XHR0aGlzLnVyaSA9IHVyaTtcblx0XHRcblx0XHR0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcjtcblx0XHRcblx0XHRhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcblx0XHRcdCdzY3JpcHQtcnVubmVyOmNvcHknOiAoKSA9PiB0aGlzLmNvcHlUb0NsaXBib2FyZCgpLFxuXHRcdFx0J3NjcmlwdC1ydW5uZXI6cGFzdGUnOiAoKSA9PiB0aGlzLnBhc3RlVG9UZXJtaW5hbCgpLFxuXHRcdFx0J3NjcmlwdC1ydW5uZXI6Y2xlYXInOiAoKSA9PiB0aGlzLmNsZWFyKCksXG5cdFx0XHQnc2NyaXB0LXJ1bm5lcjppbnRlcnJ1cHQnOiBldmVudCA9PiB0aGlzLmtpbGwoJ1NJR0lOVCcpLFxuXHRcdFx0J3NjcmlwdC1ydW5uZXI6dGVybWluYXRlJzogZXZlbnQgPT4gdGhpcy5raWxsKCdTSUdURVJNJyksXG5cdFx0XHQnc2NyaXB0LXJ1bm5lcjpraWxsJzogZXZlbnQgPT4gdGhpcy5raWxsKCdTSUdLSUxMJyksXG5cdFx0fSk7XG5cdFx0XG5cdFx0aWYgKHRpdGxlID09IG51bGwpXG5cdFx0XHR0aGlzLnRpdGxlID0gdXJpO1xuXHRcdGVsc2Vcblx0XHRcdHRoaXMudGl0bGUgPSB0aXRsZTtcblx0XHRcblx0XHR0aGlzLnNldHVwVGVybWluYWwoKTtcblx0XHRcblx0XHR0aGlzLnJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHRoaXMub3V0cHV0UmVzaXplZCgpKTtcblx0XHR0aGlzLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcy5lbGVtZW50KTtcblx0fVxuXHRcblx0ZGVzdHJveSgpIHtcblx0XHR0aGlzLnJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcblx0XHRcblx0XHRpZiAodGhpcy5wcm9jZXNzKVxuXHRcdFx0dGhpcy5wcm9jZXNzLmRlc3Ryb3koKTtcblx0XHRcblx0XHRpZiAodGhpcy50ZXJtaW5hbClcblx0XHRcdHRoaXMudGVybWluYWwuZGVzdHJveSgpO1xuXHRcdFxuXHRcdEV0Y2guZGVzdHJveSh0aGlzKTtcblx0fVxuXG5cdHNlcmlhbGl6ZSgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGVzZXJpYWxpemVyOiAnU2NyaXB0UnVubmVyVmlldycsXG5cdFx0XHR1cmk6IHRoaXMudXJpLFxuXHRcdFx0dGl0bGU6IHRoaXMudGl0bGUsXG5cdFx0XHQvL3N0YXRlOiB0aGlzLnRlcm1pbmFsLmdldFN0YXRlKCksXG5cdFx0fTtcblx0fVxuXHRcblx0cmVuZGVyKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8c2NyaXB0LXJ1bm5lci12aWV3IGF0dHJpYnV0ZXM9e3t0YWJpbmRleDogMH19IC8+XG5cdFx0KTtcblx0fVxuXG5cdHVwZGF0ZShwcm9wcywgY2hpbGRyZW4pIHtcblx0XHRyZXR1cm4gRXRjaC51cGRhdGUodGhpcyk7XG5cdH1cblx0XG5cdGNvcHlUb0NsaXBib2FyZCgpIHtcblx0XHRyZXR1cm4gYXRvbS5jbGlwYm9hcmQud3JpdGUodGhpcy50ZXJtaW5hbC5nZXRTZWxlY3Rpb24oKSk7XG5cdH1cblxuXHRwYXN0ZVRvVGVybWluYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZW1pdHRlci5lbWl0KCdwYXN0ZScsIGF0b20uY2xpcGJvYXJkLnJlYWQoKSk7XG5cdH1cblxuXHRnZXRVUkkoKSB7XG5cdFx0cmV0dXJuIHRoaXMudXJpO1xuXHR9XG5cblx0Z2V0SWNvbk5hbWUoKSB7XG5cdFx0cmV0dXJuICd0ZXJtaW5hbCc7XG5cdH1cblxuXHRnZXRUaXRsZSgpIHtcblx0XHRyZXR1cm4gYFNjcmlwdCBSdW5uZXI6ICR7dGhpcy50aXRsZX1gO1xuXHR9XG5cblx0Z2V0RGVmYXVsdExvY2F0aW9uKCkge1xuXHRcdHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ3NjcmlwdC1ydW5uZXIuc3BsaXREaXJlY3Rpb24nKSB8fCAnYm90dG9tJztcblx0fVxuXHRcblx0c2V0VGl0bGUodGl0bGUpIHtcblx0XHR0aGlzLnRpdGxlID0gdGl0bGU7XG5cdFx0XG5cdFx0dGhpcy5lbWl0dGVyLmVtaXQoXCJkaWQtY2hhbmdlLXRpdGxlXCIsIHRoaXMuZ2V0VGl0bGUoKSk7XG5cdH1cblx0XG5cdC8vIEludm9rZWQgYnkgdGhlIGF0b20gd29ya3NwYWNlIHRvIG1vbml0b3IgdGhlIHZpZXcncyB0aXRsZTpcblx0b25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjaykge1xuXHRcdHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcblx0fVxuXHRcblx0c2V0VGhlbWUodGhlbWUpIHtcblx0XHR0aGlzLnRoZW1lID0gdGhlbWU7XG5cdFx0cmV0dXJuIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGhlbWUnLCB0aGVtZSk7XG5cdH1cblxuXHRzZXR1cFRlcm1pbmFsKCkge1xuXHRcdHRoaXMudGVybWluYWwgPSBuZXcgVGVybWluYWwoe1xuXHRcdFx0cm93czogNDAsXG5cdFx0XHRjb2xzOiA4MCxcblx0XHRcdHNjcm9sbGJhY2s6IGF0b20uY29uZmlnLmdldCgnc2NyaXB0LXJ1bm5lci5zY3JvbGxiYWNrJyksXG5cdFx0XHR1c2VTdHlsZTogZmFsc2UsXG5cdFx0XHRjdXJzb3JCbGluazogdHJ1ZVxuXHRcdH0pO1xuXHRcdFxuXHRcdHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHRoaXMudGVybWluYWwuZm9jdXMoKSk7XG5cdFx0XG5cdFx0dmFyIHN0eWxlID0gJyc7XG5cdFx0Y29uc3QgZWRpdG9yID0gYXRvbS5jb25maWcuc2V0dGluZ3MuZWRpdG9yO1xuXHRcdFxuXHRcdGlmIChlZGl0b3IpIHtcblx0XHRcdGlmIChlZGl0b3IuZm9udFNpemUpXG5cdFx0XHRcdHN0eWxlICs9ICdmb250LXNpemU6JyArIGVkaXRvci5mb250U2l6ZSArICdweDsnO1xuXHRcdFx0aWYgKGVkaXRvci5mb250RmFtaWx5KVxuXHRcdFx0XHRzdHlsZSArPSAnZm9udC1mYW1pbHk6JyArIGVkaXRvci5mb250RmFtaWx5ICsgJzsnO1xuXHRcdFx0aWYgKGVkaXRvci5saW5lSGVpZ2h0KVxuXHRcdFx0XHRzdHlsZSArPSAnbGluZS1oZWlnaHQ6JyArIGVkaXRvci5saW5lSGVpZ2h0ICsgJzsnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIHN0eWxlKTtcblx0XHR9XG5cdH1cblxuXHRvdXRwdXRSZXNpemVkKCkge1xuXHRcdGlmICghdGhpcy50ZXJtaW5hbC5lbGVtZW50KSB7XG5cdFx0XHR0aGlzLnRlcm1pbmFsLm9wZW4odGhpcy5lbGVtZW50LCB0cnVlKTtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy50ZXJtaW5hbC5maXQoKTtcblx0fVxuXG5cdGtpbGwoc2lnbmFsKSB7XG5cdFx0aWYgKHRoaXMucHJvY2Vzcylcblx0XHRcdHRoaXMucHJvY2Vzcy5raWxsKHNpZ25hbCk7XG5cdH1cblxuXHRmb2N1cygpIHtcblx0XHRyZXR1cm4gdGhpcy50ZXJtaW5hbC5mb2N1cygpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMudGVybWluYWwuY2xlYXIoKTtcblx0fVxuXG5cdG9uKGV2ZW50LCBjYWxsYmFjaykge1xuXHRcdHJldHVybiB0aGlzLmVtaXR0ZXIub24oZXZlbnQsIGNhbGxiYWNrKTtcblx0fVxuXG5cdGFwcGVuZCh0ZXh0LCBjbGFzc05hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy50ZXJtaW5hbC53cml0ZSh0ZXh0KTtcblx0fVxuXG5cdGxvZyh0ZXh0KSB7XG5cdFx0cmV0dXJuIHRoaXMudGVybWluYWwud3JpdGUodGV4dCArIFwiXFxyXFxuXCIpO1xuXHR9XG59O1xuXG5hdG9tLmRlc2VyaWFsaXplcnMuYWRkKFNjcmlwdFJ1bm5lclZpZXcpO1xuIl19