"use babel";

// Public: GrammarUtils.R - a module which assist the creation of R temporary files
Object.defineProperty(exports, "__esModule", {
  value: true
});
var GrammarUtilsR = {
  // Public: Create a temporary file with the provided R code
  //
  // * `code`    A {String} containing some R code
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    return module.parent.exports.createTempFileWithCode(code);
  }
};
exports["default"] = GrammarUtilsR;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ncmFtbWFyLXV0aWxzL1IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFHWCxJQUFNLGFBQWEsR0FBRzs7Ozs7O0FBTXBCLHdCQUFzQixFQUFBLGdDQUFDLElBQUksRUFBRTtBQUMzQixXQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFBO0dBQzFEO0NBQ0YsQ0FBQTtxQkFDYyxhQUFhIiwiZmlsZSI6Ii9ob21lL21pa2UvLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ncmFtbWFyLXV0aWxzL1IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbi8vIFB1YmxpYzogR3JhbW1hclV0aWxzLlIgLSBhIG1vZHVsZSB3aGljaCBhc3Npc3QgdGhlIGNyZWF0aW9uIG9mIFIgdGVtcG9yYXJ5IGZpbGVzXG5jb25zdCBHcmFtbWFyVXRpbHNSID0ge1xuICAvLyBQdWJsaWM6IENyZWF0ZSBhIHRlbXBvcmFyeSBmaWxlIHdpdGggdGhlIHByb3ZpZGVkIFIgY29kZVxuICAvL1xuICAvLyAqIGBjb2RlYCAgICBBIHtTdHJpbmd9IGNvbnRhaW5pbmcgc29tZSBSIGNvZGVcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUge1N0cmluZ30gZmlsZXBhdGggb2YgdGhlIG5ldyBmaWxlXG4gIGNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSkge1xuICAgIHJldHVybiBtb2R1bGUucGFyZW50LmV4cG9ydHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICB9LFxufVxuZXhwb3J0IGRlZmF1bHQgR3JhbW1hclV0aWxzUlxuIl19