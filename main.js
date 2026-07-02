import * as Framework from "./Framework/framework.js";
import { dotnet } from './_framework/dotnet.js'

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

setModuleImports('main.js', Framework);

const exports = await getAssemblyExports("FintaneMGFramework.Web");
const runtime = globalThis.getDotnetRuntime(0);

if (!runtime) {
    throw new Error("Dotnet runtime instance could not be found.");
}

Framework.initialize(exports, runtime);

await dotnet.run();