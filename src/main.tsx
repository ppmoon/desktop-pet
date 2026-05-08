import React from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { App } from "./App";
import { registry } from "./core/registry";
import { createFileSearchExtension } from "./extensions/file-search";

async function bootstrap() {
  const homeDir = await invoke<string>("get_home_dir");
  registry.register(createFileSearchExtension(homeDir));
}

bootstrap().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
