// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const { ESLint } = require("eslint");

// Create an instance of ESLint with the configuration passed to the function
function createESLintInstance(overrideConfig) {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig,
    fix: true,
  });
}

// Lint the specified files and return the error results
async function lint(eslint, filePaths) {
  const results = await eslint.lintFiles(filePaths);
  return results;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "itt-eslint-ts" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "itt-eslint-ts.analyzeCode",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from itt-eslint-ts!");

      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const text = document.getText();

        // The ESLint configuration. Alternatively, you could load the configuration
        // from an eslint.config.js file or just use the default config.
        const overrideConfig = {
          languageOptions: {
            ecmaVersion: 2018,
            sourceType: "commonjs",
          },
          rules: {
            "no-console": "error",
            "no-unused-vars": "warn",
          },
        };

        const eslint = createESLintInstance(overrideConfig);

        try {
        //   const results = await lint(eslint, [document.uri.fsPath]);

		//   outputLintingResults(results);
          const results = await eslint.lintText(text, { filePath: document.uri.fsPath });
          const diagnostics: vscode.Diagnostic[] = [];

          results.forEach(result => {
              result.messages.forEach(message => {
                  const range = new vscode.Range(
                      new vscode.Position(message.line - 1, message.column - 1),
                      new vscode.Position(message.endLine ? message.endLine - 1 : message.line - 1, message.endColumn ? message.endColumn - 1 : message.column)
                  );

                  const diagnostic = new vscode.Diagnostic(
                      range,
                      message.message,
                      vscode.DiagnosticSeverity.Error
                  );

                  diagnostics.push(diagnostic);
              });
          });

          const diagnosticCollection = vscode.languages.createDiagnosticCollection('eslint');
          diagnosticCollection.set(document.uri, diagnostics);

          vscode.window.showInformationMessage("Code analysis complete!");
        } catch (error) {
          vscode.window.showErrorMessage(`Error analyzing code: ${error}`);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
