import path from "node:path";
import type { Plugin } from "vite";

/** Keep Astro's generated MDX/image import maps fresh in every Vite environment. */
export default function contentImportsHmr(): Plugin {
  return {
    name: "content-imports-hmr",
    apply: "serve",
    configureServer(server) {
      const imports = new Set(
        ["content-modules.mjs", "content-assets.mjs"].map(file =>
          path.resolve(server.config.root, ".astro", file)
        )
      );
      server.watcher.add([...imports]);

      const refresh = (file: string) => {
        if (!imports.has(path.resolve(file))) return;

        // Astro 6 uses separate SSR and prerender environments. A file update can
        // refresh the content store while leaving an SSR import map cached.
        // Invalidate its importers too, so render(entry) sees the new MDX file.
        for (const environment of Object.values(server.environments)) {
          const modules = environment.moduleGraph.getModulesByFile(file);
          if (!modules) continue;
          for (const module of modules) {
            environment.moduleGraph.invalidateModule(
              module,
              new Set(),
              Date.now(),
              true
            );
          }
          // Also clear ModuleRunner's evaluated-module cache. Invalidating only
          // the transform graph leaves already evaluated import maps in memory.
          if (environment.name !== "client") {
            environment.hot.send({ type: "full-reload", path: "*" });
          }
        }
        server.environments.client.hot.send({ type: "full-reload", path: "*" });
      };

      const onEvent = (event: string, file: string) => {
        if (["add", "change", "unlink"].includes(event)) refresh(file);
      };
      server.watcher.on("all", onEvent);
      server.httpServer?.once("close", () => {
        server.watcher.off("all", onEvent);
      });
    },
  };
}
