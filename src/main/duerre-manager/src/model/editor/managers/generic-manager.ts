import type { ELifecycle } from "../e-lifecycle";
import type { EditorOrchestrator } from "../editor-orchestrator";
import type { EManager } from "./emanager";

export abstract class GenericManager implements ELifecycle {

    constructor(
        protected readonly editor: EditorOrchestrator,
        public readonly emanager: EManager
    ) { }

    public abstract setup(): void;
    public abstract clear(): void;
    public abstract destroy(): void;
}