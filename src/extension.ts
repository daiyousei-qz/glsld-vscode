// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from "vscode-languageclient/node";

function getBuiltinLanguageServerPath(context: vscode.ExtensionContext): string {
	if (process.platform === "win32") {
		return context.asAbsolutePath('bin/glsld-windows.exe');
	}
	else if (process.platform === "linux") {
		// FIXME: ship with linux binary
		// return context.asAbsolutePath('bin/glsld-linux');
		return "";
	}
	else {
		return "";
	}
}

function initializeLanguageClient(context: vscode.ExtensionContext): LanguageClient {

	var binaryPath = vscode.workspace.getConfiguration("glsld").get<string>("binaryPath");
	if (!binaryPath || binaryPath === '') {
		binaryPath = getBuiltinLanguageServerPath(context);
	}
	console.log(`Loading glsld from: ${binaryPath}`);

	const serverOptions: ServerOptions = {
		run: {
			command: binaryPath, transport: TransportKind.stdio,
		},
		debug: {
			command: binaryPath, transport: TransportKind.stdio,
		},
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'glsl' }],
	};

	const client = new LanguageClient(
		"glsld",
		'glsld',
		serverOptions,
		clientOptions,
		true,
	);

	return client;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const client = initializeLanguageClient(context);
	client.start();

	var subscriptions = [];
	subscriptions.push(vscode.commands.registerCommand('glsld.stopLanguageServer', () => {
		client.stop();
	}));
	subscriptions.push(vscode.commands.registerCommand('glsld.restartLanguageServer', () => {
		client.restart();
	}));

	context.subscriptions.push(...subscriptions);
}

// This method is called when your extension is deactivated
export function deactivate() {}
