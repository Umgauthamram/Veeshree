import { z } from 'zod';
import MiniSearch from 'minisearch';

declare const ExtractorProviderSchema: z.ZodEnum<["gemini", "openai", "anthropic", "groq", "nvidia", "ollama", "lmstudio"]>;
type ExtractorProvider = z.infer<typeof ExtractorProviderSchema>;
declare const VeeshreeConfigSchema: z.ZodObject<{
    schema_version: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    extractor: z.ZodDefault<z.ZodObject<{
        provider: z.ZodDefault<z.ZodEnum<["gemini", "openai", "anthropic", "groq", "nvidia", "ollama", "lmstudio"]>>;
        model: z.ZodDefault<z.ZodString>;
        base_url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: "gemini" | "openai" | "anthropic" | "groq" | "nvidia" | "ollama" | "lmstudio";
        model: string;
        base_url?: string | undefined;
    }, {
        provider?: "gemini" | "openai" | "anthropic" | "groq" | "nvidia" | "ollama" | "lmstudio" | undefined;
        model?: string | undefined;
        base_url?: string | undefined;
    }>>;
    privacy: z.ZodDefault<z.ZodObject<{
        allow_cloud: z.ZodDefault<z.ZodBoolean>;
        max_payload_bytes: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        allow_cloud: boolean;
        max_payload_bytes: number;
    }, {
        allow_cloud?: boolean | undefined;
        max_payload_bytes?: number | undefined;
    }>>;
    context: z.ZodDefault<z.ZodObject<{
        max_tokens: z.ZodDefault<z.ZodNumber>;
        constraints_cap: z.ZodDefault<z.ZodNumber>;
        state_cap: z.ZodDefault<z.ZodNumber>;
        decisions_cap: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        max_tokens: number;
        constraints_cap: number;
        state_cap: number;
        decisions_cap: number;
    }, {
        max_tokens?: number | undefined;
        constraints_cap?: number | undefined;
        state_cap?: number | undefined;
        decisions_cap?: number | undefined;
    }>>;
    watch: z.ZodDefault<z.ZodObject<{
        debounce_seconds: z.ZodDefault<z.ZodNumber>;
        max_calls_per_hour: z.ZodDefault<z.ZodNumber>;
        auto: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        debounce_seconds: number;
        max_calls_per_hour: number;
        auto: boolean;
    }, {
        debounce_seconds?: number | undefined;
        max_calls_per_hour?: number | undefined;
        auto?: boolean | undefined;
    }>>;
    hooks: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        block_on_drift: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        block_on_drift: boolean;
    }, {
        enabled?: boolean | undefined;
        block_on_drift?: boolean | undefined;
    }>>;
    proposals: z.ZodDefault<z.ZodObject<{
        auto_apply_low_risk: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        auto_apply_low_risk: boolean;
    }, {
        auto_apply_low_risk?: boolean | undefined;
    }>>;
    gc: z.ZodDefault<z.ZodObject<{
        max_progress: z.ZodDefault<z.ZodNumber>;
        max_completed_tasks: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        max_progress: number;
        max_completed_tasks: number;
    }, {
        max_progress?: number | undefined;
        max_completed_tasks?: number | undefined;
    }>>;
    keys: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
    default_extractor: z.ZodOptional<z.ZodObject<{
        provider: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider?: string | undefined;
        model?: string | undefined;
    }, {
        provider?: string | undefined;
        model?: string | undefined;
    }>>;
    local_engine: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        port: z.ZodOptional<z.ZodNumber>;
        model: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        enabled?: boolean | undefined;
        port?: number | undefined;
    }, {
        model?: string | undefined;
        enabled?: boolean | undefined;
        port?: number | undefined;
    }>>;
    settings: z.ZodOptional<z.ZodObject<{
        max_context_tokens: z.ZodOptional<z.ZodNumber>;
        auto_sync_on_commit: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        max_context_tokens?: number | undefined;
        auto_sync_on_commit?: boolean | undefined;
    }, {
        max_context_tokens?: number | undefined;
        auto_sync_on_commit?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    watch: {
        debounce_seconds: number;
        max_calls_per_hour: number;
        auto: boolean;
    };
    proposals: {
        auto_apply_low_risk: boolean;
    };
    gc: {
        max_progress: number;
        max_completed_tasks: number;
    };
    hooks: {
        enabled: boolean;
        block_on_drift: boolean;
    };
    keys: Record<string, string>;
    schema_version: number;
    version: string;
    extractor: {
        provider: "gemini" | "openai" | "anthropic" | "groq" | "nvidia" | "ollama" | "lmstudio";
        model: string;
        base_url?: string | undefined;
    };
    privacy: {
        allow_cloud: boolean;
        max_payload_bytes: number;
    };
    context: {
        max_tokens: number;
        constraints_cap: number;
        state_cap: number;
        decisions_cap: number;
    };
    default_extractor?: {
        provider?: string | undefined;
        model?: string | undefined;
    } | undefined;
    local_engine?: {
        model?: string | undefined;
        enabled?: boolean | undefined;
        port?: number | undefined;
    } | undefined;
    settings?: {
        max_context_tokens?: number | undefined;
        auto_sync_on_commit?: boolean | undefined;
    } | undefined;
}, {
    watch?: {
        debounce_seconds?: number | undefined;
        max_calls_per_hour?: number | undefined;
        auto?: boolean | undefined;
    } | undefined;
    proposals?: {
        auto_apply_low_risk?: boolean | undefined;
    } | undefined;
    gc?: {
        max_progress?: number | undefined;
        max_completed_tasks?: number | undefined;
    } | undefined;
    hooks?: {
        enabled?: boolean | undefined;
        block_on_drift?: boolean | undefined;
    } | undefined;
    keys?: Record<string, string> | undefined;
    schema_version?: number | undefined;
    version?: string | undefined;
    extractor?: {
        provider?: "gemini" | "openai" | "anthropic" | "groq" | "nvidia" | "ollama" | "lmstudio" | undefined;
        model?: string | undefined;
        base_url?: string | undefined;
    } | undefined;
    privacy?: {
        allow_cloud?: boolean | undefined;
        max_payload_bytes?: number | undefined;
    } | undefined;
    context?: {
        max_tokens?: number | undefined;
        constraints_cap?: number | undefined;
        state_cap?: number | undefined;
        decisions_cap?: number | undefined;
    } | undefined;
    default_extractor?: {
        provider?: string | undefined;
        model?: string | undefined;
    } | undefined;
    local_engine?: {
        model?: string | undefined;
        enabled?: boolean | undefined;
        port?: number | undefined;
    } | undefined;
    settings?: {
        max_context_tokens?: number | undefined;
        auto_sync_on_commit?: boolean | undefined;
    } | undefined;
}>;
type VeeshreeConfig = z.infer<typeof VeeshreeConfigSchema>;

declare const LinkedFileEntrySchema: z.ZodUnion<[z.ZodEffects<z.ZodString, {
    path: string;
    sha256: string | undefined;
}, string>, z.ZodObject<{
    path: z.ZodString;
    sha256: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    sha256?: string | undefined;
}, {
    path: string;
    sha256?: string | undefined;
}>]>;
type LinkedFileEntry = z.infer<typeof LinkedFileEntrySchema>;
declare const DecisionFrontmatterSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["active", "superseded", "proposed"]>>;
    date: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    linked_files: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodEffects<z.ZodString, {
        path: string;
        sha256: string | undefined;
    }, string>, z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        sha256?: string | undefined;
    }, {
        path: string;
        sha256?: string | undefined;
    }>]>, "many">>;
    supersedes: z.ZodOptional<z.ZodString>;
    superseded_by: z.ZodOptional<z.ZodString>;
    generated_by: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "superseded" | "proposed";
    linked_files: ({
        path: string;
        sha256: string | undefined;
    } | {
        path: string;
        sha256?: string | undefined;
    })[];
    tags: string[];
    id?: string | undefined;
    title?: string | undefined;
    supersedes?: string | undefined;
    date?: string | undefined;
    superseded_by?: string | undefined;
    generated_by?: string | undefined;
}, {
    status?: "active" | "superseded" | "proposed" | undefined;
    id?: string | undefined;
    title?: string | undefined;
    linked_files?: (string | {
        path: string;
        sha256?: string | undefined;
    })[] | undefined;
    tags?: string[] | undefined;
    supersedes?: string | undefined;
    date?: string | undefined;
    superseded_by?: string | undefined;
    generated_by?: string | undefined;
}>;
type DecisionFrontmatter = z.infer<typeof DecisionFrontmatterSchema>;

declare const ExtractionDecisionSchema: z.ZodObject<{
    title: z.ZodString;
    decision: z.ZodString;
    reason: z.ZodString;
    alternatives_considered: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    linked_files: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    status: z.ZodDefault<z.ZodEnum<["active", "superseded", "proposed"]>>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    supersedes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "superseded" | "proposed";
    title: string;
    decision: string;
    reason: string;
    alternatives_considered: string[];
    linked_files: string[];
    tags: string[];
    supersedes?: string | undefined;
}, {
    title: string;
    decision: string;
    reason: string;
    status?: "active" | "superseded" | "proposed" | undefined;
    alternatives_considered?: string[] | undefined;
    linked_files?: string[] | undefined;
    tags?: string[] | undefined;
    supersedes?: string | undefined;
}>;
declare const ExtractionTaskSchema: z.ZodObject<{
    task_name: z.ZodString;
    action: z.ZodDefault<z.ZodEnum<["add", "complete", "remove"]>>;
}, "strip", z.ZodTypeAny, {
    task_name: string;
    action: "add" | "complete" | "remove";
}, {
    task_name: string;
    action?: "add" | "complete" | "remove" | undefined;
}>;
declare const ExtractionConstraintSchema: z.ZodObject<{
    rule: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["hard", "soft"]>>;
    source: z.ZodOptional<z.ZodString>;
    accepted_by: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "hard" | "soft";
    rule: string;
    source?: string | undefined;
    accepted_by?: string | undefined;
}, {
    rule: string;
    source?: string | undefined;
    type?: "hard" | "soft" | undefined;
    accepted_by?: string | undefined;
}>;
declare const ExtractionRejectedSchema: z.ZodObject<{
    approach: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    approach: string;
}, {
    reason: string;
    approach: string;
}>;
declare const ExtractionCurrentStateSchema: z.ZodObject<{
    current_feature: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    completed_in_session: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    next_immediate_steps: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    current_feature: string;
    completed_in_session: string[];
    next_immediate_steps: string[];
}, {
    current_feature?: string | undefined;
    completed_in_session?: string[] | undefined;
    next_immediate_steps?: string[] | undefined;
}>;
declare const ExtractionDeltaSchema: z.ZodObject<{
    decisions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        decision: z.ZodString;
        reason: z.ZodString;
        alternatives_considered: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        linked_files: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        status: z.ZodDefault<z.ZodEnum<["active", "superseded", "proposed"]>>;
        tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        supersedes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "superseded" | "proposed";
        title: string;
        decision: string;
        reason: string;
        alternatives_considered: string[];
        linked_files: string[];
        tags: string[];
        supersedes?: string | undefined;
    }, {
        title: string;
        decision: string;
        reason: string;
        status?: "active" | "superseded" | "proposed" | undefined;
        alternatives_considered?: string[] | undefined;
        linked_files?: string[] | undefined;
        tags?: string[] | undefined;
        supersedes?: string | undefined;
    }>, "many">>;
    current_state: z.ZodDefault<z.ZodObject<{
        current_feature: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        completed_in_session: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        next_immediate_steps: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        current_feature: string;
        completed_in_session: string[];
        next_immediate_steps: string[];
    }, {
        current_feature?: string | undefined;
        completed_in_session?: string[] | undefined;
        next_immediate_steps?: string[] | undefined;
    }>>;
    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        task_name: z.ZodString;
        action: z.ZodDefault<z.ZodEnum<["add", "complete", "remove"]>>;
    }, "strip", z.ZodTypeAny, {
        task_name: string;
        action: "add" | "complete" | "remove";
    }, {
        task_name: string;
        action?: "add" | "complete" | "remove" | undefined;
    }>, "many">>;
    constraints: z.ZodDefault<z.ZodArray<z.ZodObject<{
        rule: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["hard", "soft"]>>;
        source: z.ZodOptional<z.ZodString>;
        accepted_by: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "hard" | "soft";
        rule: string;
        source?: string | undefined;
        accepted_by?: string | undefined;
    }, {
        rule: string;
        source?: string | undefined;
        type?: "hard" | "soft" | undefined;
        accepted_by?: string | undefined;
    }>, "many">>;
    rejected_approaches: z.ZodDefault<z.ZodArray<z.ZodObject<{
        approach: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        approach: string;
    }, {
        reason: string;
        approach: string;
    }>, "many">>;
    discoveries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    decisions: {
        status: "active" | "superseded" | "proposed";
        title: string;
        decision: string;
        reason: string;
        alternatives_considered: string[];
        linked_files: string[];
        tags: string[];
        supersedes?: string | undefined;
    }[];
    current_state: {
        current_feature: string;
        completed_in_session: string[];
        next_immediate_steps: string[];
    };
    tasks: {
        task_name: string;
        action: "add" | "complete" | "remove";
    }[];
    constraints: {
        type: "hard" | "soft";
        rule: string;
        source?: string | undefined;
        accepted_by?: string | undefined;
    }[];
    rejected_approaches: {
        reason: string;
        approach: string;
    }[];
    discoveries: string[];
}, {
    decisions?: {
        title: string;
        decision: string;
        reason: string;
        status?: "active" | "superseded" | "proposed" | undefined;
        alternatives_considered?: string[] | undefined;
        linked_files?: string[] | undefined;
        tags?: string[] | undefined;
        supersedes?: string | undefined;
    }[] | undefined;
    current_state?: {
        current_feature?: string | undefined;
        completed_in_session?: string[] | undefined;
        next_immediate_steps?: string[] | undefined;
    } | undefined;
    tasks?: {
        task_name: string;
        action?: "add" | "complete" | "remove" | undefined;
    }[] | undefined;
    constraints?: {
        rule: string;
        source?: string | undefined;
        type?: "hard" | "soft" | undefined;
        accepted_by?: string | undefined;
    }[] | undefined;
    rejected_approaches?: {
        reason: string;
        approach: string;
    }[] | undefined;
    discoveries?: string[] | undefined;
}>;
type ExtractionDelta = z.infer<typeof ExtractionDeltaSchema>;
type ExtractionDecision = z.infer<typeof ExtractionDecisionSchema>;
type ExtractionTask = z.infer<typeof ExtractionTaskSchema>;
type ExtractionConstraint = z.infer<typeof ExtractionConstraintSchema>;
type ExtractionRejected = z.infer<typeof ExtractionRejectedSchema>;
type ExtractionCurrentState = z.infer<typeof ExtractionCurrentStateSchema>;

declare const ProposalSourceSchema: z.ZodEnum<["watch", "capture", "mcp", "manual", "cli", "test"]>;
type ProposalSource = z.infer<typeof ProposalSourceSchema>;
declare const ProposalStatusSchema: z.ZodEnum<["pending", "accepted", "rejected"]>;
type ProposalStatus = z.infer<typeof ProposalStatusSchema>;
declare const ProposalRiskSchema: z.ZodEnum<["low", "high"]>;
type ProposalRisk = z.infer<typeof ProposalRiskSchema>;
declare const ProposalSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    source: z.ZodEnum<["watch", "capture", "mcp", "manual", "cli", "test"]>;
    agent: z.ZodOptional<z.ZodString>;
    delta: z.ZodObject<{
        decisions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            decision: z.ZodString;
            reason: z.ZodString;
            alternatives_considered: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            linked_files: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            status: z.ZodDefault<z.ZodEnum<["active", "superseded", "proposed"]>>;
            tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            supersedes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "active" | "superseded" | "proposed";
            title: string;
            decision: string;
            reason: string;
            alternatives_considered: string[];
            linked_files: string[];
            tags: string[];
            supersedes?: string | undefined;
        }, {
            title: string;
            decision: string;
            reason: string;
            status?: "active" | "superseded" | "proposed" | undefined;
            alternatives_considered?: string[] | undefined;
            linked_files?: string[] | undefined;
            tags?: string[] | undefined;
            supersedes?: string | undefined;
        }>, "many">>;
        current_state: z.ZodDefault<z.ZodObject<{
            current_feature: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            completed_in_session: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            next_immediate_steps: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            current_feature: string;
            completed_in_session: string[];
            next_immediate_steps: string[];
        }, {
            current_feature?: string | undefined;
            completed_in_session?: string[] | undefined;
            next_immediate_steps?: string[] | undefined;
        }>>;
        tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
            task_name: z.ZodString;
            action: z.ZodDefault<z.ZodEnum<["add", "complete", "remove"]>>;
        }, "strip", z.ZodTypeAny, {
            task_name: string;
            action: "add" | "complete" | "remove";
        }, {
            task_name: string;
            action?: "add" | "complete" | "remove" | undefined;
        }>, "many">>;
        constraints: z.ZodDefault<z.ZodArray<z.ZodObject<{
            rule: z.ZodString;
            type: z.ZodDefault<z.ZodEnum<["hard", "soft"]>>;
            source: z.ZodOptional<z.ZodString>;
            accepted_by: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "hard" | "soft";
            rule: string;
            source?: string | undefined;
            accepted_by?: string | undefined;
        }, {
            rule: string;
            source?: string | undefined;
            type?: "hard" | "soft" | undefined;
            accepted_by?: string | undefined;
        }>, "many">>;
        rejected_approaches: z.ZodDefault<z.ZodArray<z.ZodObject<{
            approach: z.ZodString;
            reason: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            reason: string;
            approach: string;
        }, {
            reason: string;
            approach: string;
        }>, "many">>;
        discoveries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        decisions: {
            status: "active" | "superseded" | "proposed";
            title: string;
            decision: string;
            reason: string;
            alternatives_considered: string[];
            linked_files: string[];
            tags: string[];
            supersedes?: string | undefined;
        }[];
        current_state: {
            current_feature: string;
            completed_in_session: string[];
            next_immediate_steps: string[];
        };
        tasks: {
            task_name: string;
            action: "add" | "complete" | "remove";
        }[];
        constraints: {
            type: "hard" | "soft";
            rule: string;
            source?: string | undefined;
            accepted_by?: string | undefined;
        }[];
        rejected_approaches: {
            reason: string;
            approach: string;
        }[];
        discoveries: string[];
    }, {
        decisions?: {
            title: string;
            decision: string;
            reason: string;
            status?: "active" | "superseded" | "proposed" | undefined;
            alternatives_considered?: string[] | undefined;
            linked_files?: string[] | undefined;
            tags?: string[] | undefined;
            supersedes?: string | undefined;
        }[] | undefined;
        current_state?: {
            current_feature?: string | undefined;
            completed_in_session?: string[] | undefined;
            next_immediate_steps?: string[] | undefined;
        } | undefined;
        tasks?: {
            task_name: string;
            action?: "add" | "complete" | "remove" | undefined;
        }[] | undefined;
        constraints?: {
            rule: string;
            source?: string | undefined;
            type?: "hard" | "soft" | undefined;
            accepted_by?: string | undefined;
        }[] | undefined;
        rejected_approaches?: {
            reason: string;
            approach: string;
        }[] | undefined;
        discoveries?: string[] | undefined;
    }>;
    risk: z.ZodEnum<["low", "high"]>;
    flags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodDefault<z.ZodEnum<["pending", "accepted", "rejected"]>>;
    reviewed_at: z.ZodOptional<z.ZodString>;
    reviewed_by: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "accepted" | "rejected";
    id: string;
    created_at: string;
    source: "watch" | "capture" | "mcp" | "manual" | "cli" | "test";
    delta: {
        decisions: {
            status: "active" | "superseded" | "proposed";
            title: string;
            decision: string;
            reason: string;
            alternatives_considered: string[];
            linked_files: string[];
            tags: string[];
            supersedes?: string | undefined;
        }[];
        current_state: {
            current_feature: string;
            completed_in_session: string[];
            next_immediate_steps: string[];
        };
        tasks: {
            task_name: string;
            action: "add" | "complete" | "remove";
        }[];
        constraints: {
            type: "hard" | "soft";
            rule: string;
            source?: string | undefined;
            accepted_by?: string | undefined;
        }[];
        rejected_approaches: {
            reason: string;
            approach: string;
        }[];
        discoveries: string[];
    };
    risk: "low" | "high";
    flags: string[];
    agent?: string | undefined;
    reviewed_at?: string | undefined;
    reviewed_by?: string | undefined;
}, {
    id: string;
    created_at: string;
    source: "watch" | "capture" | "mcp" | "manual" | "cli" | "test";
    delta: {
        decisions?: {
            title: string;
            decision: string;
            reason: string;
            status?: "active" | "superseded" | "proposed" | undefined;
            alternatives_considered?: string[] | undefined;
            linked_files?: string[] | undefined;
            tags?: string[] | undefined;
            supersedes?: string | undefined;
        }[] | undefined;
        current_state?: {
            current_feature?: string | undefined;
            completed_in_session?: string[] | undefined;
            next_immediate_steps?: string[] | undefined;
        } | undefined;
        tasks?: {
            task_name: string;
            action?: "add" | "complete" | "remove" | undefined;
        }[] | undefined;
        constraints?: {
            rule: string;
            source?: string | undefined;
            type?: "hard" | "soft" | undefined;
            accepted_by?: string | undefined;
        }[] | undefined;
        rejected_approaches?: {
            reason: string;
            approach: string;
        }[] | undefined;
        discoveries?: string[] | undefined;
    };
    risk: "low" | "high";
    status?: "pending" | "accepted" | "rejected" | undefined;
    agent?: string | undefined;
    flags?: string[] | undefined;
    reviewed_at?: string | undefined;
    reviewed_by?: string | undefined;
}>;
type Proposal = z.infer<typeof ProposalSchema>;

interface ScannedProjectInfo {
    name: string;
    projectType: string;
    purpose: string;
    domainEntities: string[];
    apiEndpoints: string[];
    frameworks: string[];
    languages: string[];
    databases: string[];
    infrastructure: string[];
    recentCommits: string[];
    activeBranch?: string;
    activeFeatureFocus?: string;
}
interface IndexDocument {
    id: string;
    path: string;
    title: string;
    type: "decision" | "state" | "tasks" | "constraints" | "rejected" | "discoveries" | "archived_decision" | "other";
    status: "active" | "superseded" | "proposed";
    tags: string[];
    linked_files: string[];
    linked_hashes: Record<string, string>;
    stale: boolean;
    content: string;
    last_modified: string;
}
interface VeeshreeIndexData {
    last_updated: string;
    documents: IndexDocument[];
}
interface ContextAssembleOptions {
    request?: string;
    maxTokens?: number;
    includeTasks?: boolean;
}
interface ContextAssembleResult {
    prompt: string;
    totalEstimatedTokens: number;
    includedSections: {
        systemRules: number;
        constraints: number;
        currentState: number;
        tasks: number;
        decisionsCount: number;
        decisionsTokens: number;
    };
    staleWarnings: string[];
}
interface ModelRuntimeInfo {
    name: string;
    provider: "ollama" | "lmstudio" | "gemini" | "openai" | "anthropic" | "groq" | "nvidia";
    status: "available" | "unavailable" | "missing_key";
    endpoint?: string;
    models: string[];
    latencyMs?: number;
}

declare const MEMORY_DIR_REL: string;
declare const DECISIONS_DIR_REL: string;
declare const ARCHIVE_DIR_REL: string;
declare const ARCHIVE_DECISIONS_DIR_REL: string;
declare const VEE_DIR_REL = ".vee";
declare const CONFIG_FILE_REL: string;
declare const INDEX_FILE_REL: string;
declare const PROPOSALS_DIR_REL: string;
declare const SNAPSHOTS_DIR_REL: string;
declare const LOGS_DIR_REL: string;
declare const WATCH_LOG_FILE_REL: string;
declare const WATCH_PID_FILE_REL: string;
declare const WATCH_STATE_FILE_REL: string;
declare const LOCK_FILE_REL: string;
declare const BACKUP_03X_DIR_REL: string;
declare const CURRENT_STATE_FILE_REL: string;
declare const TASKS_FILE_REL: string;
declare const CONSTRAINTS_FILE_REL: string;
declare const REJECTED_FILE_REL: string;
declare const DISCOVERIES_FILE_REL: string;
declare const COMPLETED_TASKS_FILE_REL: string;
declare const DEFAULT_MODELS: {
    readonly gemini: "gemini-2.0-flash";
    readonly openai: "gpt-4o-mini";
    readonly anthropic: "claude-3-5-sonnet-latest";
    readonly groq: "llama-3.3-70b-versatile";
    readonly nvidia: "meta/llama-3.1-70b-instruct";
    readonly ollama: "llama3.2";
    readonly lmstudio: "default";
};
declare const DEFAULT_MAX_PAYLOAD_BYTES = 24576;
declare const DEFAULT_MAX_CONTEXT_TOKENS = 2000;
declare const DEFAULT_CONSTRAINTS_CAP = 400;
declare const DEFAULT_STATE_CAP = 450;
declare const DEFAULT_DECISIONS_CAP = 800;
declare const DEFAULT_TASKS_CAP = 250;
declare const DEFAULT_GC_MAX_PROGRESS = 5;
declare const DEFAULT_GC_MAX_COMPLETED_TASKS = 20;
declare const LOCK_STALE_MS = 60000;

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";
interface LoggerConfig {
    quiet: boolean;
    json: boolean;
    level: LogLevel;
}
declare class Logger {
    private config;
    setQuiet(quiet: boolean): void;
    setJson(json: boolean): void;
    setLevel(level: LogLevel): void;
    isQuiet(): boolean;
    isJson(): boolean;
    debug(msg: string, meta?: unknown): void;
    info(msg: string, meta?: unknown): void;
    success(msg: string, meta?: unknown): void;
    warn(msg: string, meta?: unknown): void;
    error(msg: string, meta?: unknown): void;
    log(msg: string): void;
    title(msg: string): void;
    dim(msg: string): string;
    bold(msg: string): string;
    cyan(msg: string): string;
    yellow(msg: string): string;
    red(msg: string): string;
    green(msg: string): string;
    magenta(msg: string): string;
}
declare const logger: Logger;

type VeeErrorCode = "ERR_DRIFT_DETECTED" | "ERR_INVALID_ARGS" | "ERR_NOT_INITIALIZED" | "ERR_CONFIG_INVALID" | "ERR_AUTH_REQUIRED" | "ERR_CLOUD_CONSENT_REQUIRED" | "ERR_PAYLOAD_TOO_LARGE" | "ERR_PROVIDER_FAILURE" | "ERR_PROPOSAL_NOT_FOUND" | "ERR_PROPOSAL_HIGH_RISK" | "ERR_LOCK_TIMEOUT" | "ERR_FILE_NOT_FOUND" | "ERR_MIGRATION_FAILED" | "ERR_MCP_ERROR" | "ERR_SECURITY_VIOLATION" | "ERR_UNKNOWN";
declare class VeeError extends Error {
    readonly code: VeeErrorCode;
    readonly exitCode: number;
    readonly details?: unknown;
    constructor(message: string, code?: VeeErrorCode, exitCode?: number, details?: unknown);
}

/**
 * Normalizes a file path to POSIX style (forward slashes)
 */
declare function normalizePosix(p: string): string;
/**
 * Validates and normalizes a relative file path, rejecting absolute paths and directory traversal
 */
declare function sanitizeRelativePath(relPath: string): string;
/**
 * Normalizes file content for consistent SHA-256 hashing across platforms:
 * strips UTF-8 BOM, normalizes CRLF and CR to LF
 */
declare function normalizeContent(content: string): string;

declare function isValidModelName(model: string): boolean;
/**
 * Validates a model name against command injection attempts
 */
declare function validateModelName(model: string): string;
/**
 * Executes a binary safely using argument arrays (no shell interpretation)
 */
declare function runCommandSafe(file: string, args: string[], options?: {
    cwd?: string;
    encoding?: BufferEncoding;
    timeout?: number;
}): string;
/**
 * Executes a binary safely with inherited stdio
 */
declare function runCommandInteractive(file: string, args: string[], options?: {
    cwd?: string;
}): void;

declare function getDefaultConfig(): VeeshreeConfig;
declare function getGlobalConfigPath(): string;
declare function getProjectConfigPath(rootDir?: string): string;
/**
 * Loads configuration with precedence:
 * 1. Environment variables
 * 2. Project local .vee/config.json
 * 3. Global ~/.veeshree/config.json
 * 4. Defaults
 */
declare function loadConfig(targetDir?: string): VeeshreeConfig;
declare function saveConfig(config: VeeshreeConfig, targetDir?: string, isGlobal?: boolean): void;
/**
 * Retrieves nested config property by dot-notation path (e.g. 'privacy.allow_cloud')
 */
declare function getConfigProperty(config: Record<string, any>, keyPath: string): any;
/**
 * Sets nested config property by dot-notation path
 */
declare function setConfigProperty(config: Record<string, any>, keyPath: string, value: any): void;

/**
 * Enhanced Local Heuristic Scanner
 * Automatically detects:
 * 1. Project Purpose / Idea from README and package descriptions
 * 2. Domain Entities from Prisma schemas, Python models, or TypeScript interfaces
 * 3. API Endpoints from Next.js, Express, FastAPI, Flask routes
 * 4. Active feature focus from Git branch name and recent commit history
 * 5. Languages, Frameworks, Databases, and Infrastructure
 */
declare function scanRepository(targetDir?: string): ScannedProjectInfo;

declare function generateCurrentStateTemplate(info: ScannedProjectInfo): string;
declare function generateTasksTemplate(): string;
declare function generateConstraintsTemplate(): string;
declare function generateRejectedTemplate(): string;
declare function generateDiscoveriesTemplate(): string;
declare function generateDecisionStubTemplate(title: string, category: string, detectedTech?: string): string;

/**
 * Calculates normalized SHA-256 hash of a file on disk
 */
declare function calculateFileHash(filePath: string): string | null;
/**
 * Recursively find all .md files in a directory
 */
declare function findMarkdownFiles(dir: string): string[];
/**
 * Parses a markdown memory file into an IndexDocument using safe YAML frontmatter
 */
declare function parseMemoryFile(filePath: string, rootDir: string, previousIndex?: VeeshreeIndexData): IndexDocument;
/**
 * Builds and updates the index cache for the workspace
 */
declare function buildIndex(rootDir?: string): VeeshreeIndexData;
/**
 * Creates and initializes MiniSearch instance loaded with indexed documents
 */
declare function createSearchEngine(documents: IndexDocument[]): MiniSearch<IndexDocument>;
/**
 * Loads index cache from disk or rebuilds if missing
 */
declare function loadOrBuildIndex(rootDir?: string): VeeshreeIndexData;

/**
 * Pluggable token estimator with 10% safety margin heuristic.
 * ~3.8 characters per token * 1.10 safety factor.
 */
declare function estimateTokens(text: string): number;
/**
 * Truncates text so its estimated token count fits within maxTokens.
 */
declare function truncateToTokens(text: string, maxTokens: number): string;

interface ContextBuildOptions {
    request?: string;
    maxTokens?: number;
    includeTasks?: boolean;
    format?: "markdown" | "json" | "xml";
}
interface TierUsage {
    tier: string;
    tokens: number;
    cap: number;
    truncated: boolean;
    notes?: string;
}
interface ContextBuildResult {
    content: string;
    totalTokens: number;
    maxTokens: number;
    tiers: TierUsage[];
    staleWarnings: string[];
    overflowNotice?: string;
    prompt: string;
    totalEstimatedTokens: number;
    includedSections: {
        systemRules: number;
        constraints: number;
        currentState: number;
        tasks: number;
        decisionsCount: number;
        decisionsTokens: number;
    };
}
/**
 * Builds token-budgeted prompt context obeying per-tier caps and total ceiling.
 */
declare function buildContext(rootDir?: string, options?: ContextBuildOptions): ContextBuildResult;

/**
 * Formats a clear terminal summary of tier budgeting and token allocations for vee context --explain
 */
declare function explainContextBudget(result: ContextBuildResult): string;

/**
 * Builds the pre-formatted system prompt payload strictly obeying the token budget
 * Backward-compatible function for Phase 2 tests and commands.
 */
declare function assembleContext(rootDir?: string, options?: ContextAssembleOptions): ContextAssembleResult;

type KeyProvider = "gemini" | "groq" | "nvidia" | "openai" | "anthropic";
declare const SUPPORTED_KEY_PROVIDERS: KeyProvider[];
declare function maskKey(key: string): string;
declare function getGlobalCredentialsDir(): string;
declare function getGlobalCredentialsPath(): string;
/**
 * Loads credentials, repairing permissions to 0600 (SEC-3)
 */
declare function loadGlobalCredentials(): Record<string, string>;
/**
 * Saves credentials with mode 0600 in mode 0700 directory atomically (SEC-3)
 */
declare function saveGlobalCredentials(credentials: Record<string, string>): void;
declare function setApiKey(provider: KeyProvider, key: string, rootDir?: string, isGlobal?: boolean): void;
declare function removeApiKey(provider: KeyProvider, rootDir?: string, isGlobal?: boolean): void;
declare function getApiKey(provider: KeyProvider, rootDir?: string): string | undefined;
interface KeyInfo {
    configured: boolean;
    masked: string;
    source: string;
    isGlobal: boolean;
    insecureWarning?: string;
}
declare function listApiKeys(rootDir?: string): Record<string, KeyInfo>;

declare function detectAvailableModels(rootDir?: string): Promise<ModelRuntimeInfo[]>;

/**
 * Extracts structured memory updates from content using resolved AI engine
 */
declare function extractMemoryFromContent(content: string, rootDir?: string, customProvider?: string, customModel?: string): Promise<ExtractionDelta>;

interface ReconcileOptions {
    source?: string;
    acceptedBy?: string;
    createSnapshot?: boolean;
}
interface ReconcileResult {
    newDecisions: string[];
    updatedFiles: string[];
}
/**
 * Reconciles an accepted extraction delta into docs/memory markdown files.
 * Uses atomic writes, process locking, section-aware editing, and pre-apply snapshots.
 */
declare function reconcileExtractionSafe(delta: ExtractionDelta, rootDir?: string, options?: ReconcileOptions): Promise<ReconcileResult>;

/**
 * Reconciles an extracted delta into the /docs/memory/ markdown files.
 * Synchronous API for backwards compatibility.
 */
declare function reconcileExtraction(delta: ExtractionDelta, rootDir?: string, options?: {
    source?: string;
    acceptedBy?: string;
}): {
    newDecisions: string[];
    updatedFiles: string[];
};

interface GCResult {
    archivedTasksCount: number;
    supersededDecisionsCount: number;
    relocatedDecisions: string[];
}
interface GCOptions {
    dryRun?: boolean;
}
/**
 * Runs State Garbage Collection & Archival:
 * 1. Archives excess rolling progress items in current-state.md (>5 items) to archive/completed-tasks.md
 * 2. Archives completed tasks (- [x]) from tasks.md to archive/completed-tasks.md, keeping tasks.md clean
 * 3. Moves decisions with status: "superseded" from decisions/ to archive/decisions/
 * 4. Re-indexes memory so index.json reflects the clean state
 */
declare function runGarbageCollection(rootDir?: string, options?: GCOptions): GCResult;

interface SearchResultItem {
    id: string;
    title: string;
    path: string;
    type: string;
    status: string;
    tags: string[];
    snippet: string;
    score: number;
}
declare function searchMemory(query: string, options?: {
    includeArchived?: boolean;
}, rootDir?: string): SearchResultItem[];

interface ParsedMarkdown<T = Record<string, unknown>> {
    data: T;
    content: string;
}
/**
 * Safely parses YAML frontmatter using the 'yaml' package (no gray-matter vulnerability).
 */
declare function parseMarkdownFrontmatter<T = Record<string, unknown>>(raw: string): ParsedMarkdown<T>;
/**
 * Specifically parses and validates ADR frontmatter with Zod
 */
declare function parseDecisionFrontmatter(raw: string): ParsedMarkdown<DecisionFrontmatter>;
/**
 * Serializes data and markdown body into frontmatter format
 */
declare function stringifyMarkdownFrontmatter(data: Record<string, unknown>, content: string): string;

/**
 * Writes data to a file atomically using a temporary file and atomic rename.
 * Guarantees no partial or corrupted writes if interrupted.
 */
declare function writeAtomic(filePath: string, data: string | Buffer, options?: {
    mode?: number;
    encoding?: BufferEncoding;
}): void;

interface LockHandle {
    release: () => void;
}
/**
 * Acquires a process lock at .vee/lock using exclusive file creation.
 * If the lock is older than LOCK_STALE_MS (60s), it is considered stale and broken.
 */
declare function acquireLock(rootDir?: string, timeoutMs?: number): LockHandle;
/**
 * Executes a function holding the memory lock
 */
declare function withLock<T>(rootDir: string, fn: () => Promise<T> | T): Promise<T>;

interface MarkdownSection {
    level: number;
    headerText: string;
    headerLine: string;
    body: string;
}
/**
 * Parses markdown into structured heading sections
 */
declare function parseSections(markdown: string): MarkdownSection[];
/**
 * Re-assembles markdown from sections
 */
declare function serializeSections(sections: MarkdownSection[]): string;
/**
 * Safe replacement that treats replacement strings with $&, $1, etc. as purely literal text.
 */
declare function safeLiteralReplace(source: string, targetPattern: RegExp | string, literalReplacement: string): string;
/**
 * Normalizes title into a kebab-case slug.
 * Returns 'decision' if the slug would otherwise be empty (e.g. non-Latin characters).
 */
declare function slugifyTitle(title: string): string;
/**
 * Finds next 4-digit ADR prefix (e.g. 0001, 0002) by checking existing files in decisions and archive/decisions.
 */
declare function getNextAdrNumber(rootDir: string): string;
/**
 * Replaces or updates the body of a named section without affecting other sections.
 */
declare function updateSectionBody(markdown: string, sectionMatcher: string | ((headerText: string, headerLine: string) => boolean), updater: string | ((existingBody: string) => string)): string;
/**
 * Normalizes a task line for comparison
 */
declare function normalizeTaskName(task: string): string;

/**
 * Calculates SHA-256 hash of a file after normalizing line endings (LF) and stripping UTF-8 BOM.
 * This guarantees cross-platform consistency between Windows (CRLF), macOS and Linux (LF).
 */
declare function calculateNormalizedFileHash(filePath: string): string | null;

type FileDriftStatus = "ok" | "drifted" | "missing";
interface LinkedFileDrift {
    path: string;
    baselineHash?: string;
    currentHash?: string;
    status: FileDriftStatus;
}
interface AdrDriftRecord {
    id: string;
    title: string;
    path: string;
    status: "active" | "superseded" | "proposed";
    files: LinkedFileDrift[];
    isDrifted: boolean;
}
interface WorkspaceDriftReport {
    timestamp: string;
    records: AdrDriftRecord[];
    totalRecords: number;
    driftedRecordsCount: number;
    hasDrift: boolean;
}
/**
 * Checks live drift status by comparing disk code hashes with committed baseline hashes in ADR frontmatter.
 * Never relies on a local gitignored cache to detect drift!
 */
declare function checkWorkspaceDrift(rootDir?: string, specificId?: string): WorkspaceDriftReport;

interface BaselineAcceptResult {
    updatedAdrs: string[];
    totalUpdatedFiles: number;
}
/**
 * Explicitly updates and commits baseline SHA-256 hashes in ADR frontmatter
 */
declare function acceptBaselines(target: string, rootDir?: string): BaselineAcceptResult;

/**
 * Scans an extraction delta for security risks and compliance with Proposal Queue rules:
 * - Any constraint is scored high risk
 * - Any ADR updating/superseding an existing ADR is scored high risk
 * - Any payload containing shell execution, command injection, instruction overrides or check disablement is scored high risk
 */
declare function scoreProposalRisk(delta: ExtractionDelta): {
    risk: ProposalRisk;
    flags: string[];
};
declare function assessDeltaRisk(delta: ExtractionDelta): {
    isHighRisk: boolean;
    reasons: string[];
};

/**
 * Creates a new Proposal and writes it to .vee/proposals/<id>.json
 */
declare function createProposal(sourceOrDelta: ProposalSource | ExtractionDelta, deltaOrRootDir?: ExtractionDelta | string, agentOrRootDir?: string, rootDirArg?: string): Proposal;
/**
 * Saves a Proposal to disk atomically
 */
declare function saveProposal(proposal: Proposal, rootDir?: string): void;
/**
 * Reads a single Proposal by id
 */
declare function getProposal(id: string, rootDir?: string): Proposal | null;
/**
 * Lists proposals, optionally filtered by status
 */
declare function listProposals(rootDir?: string, statusFilter?: ProposalStatus): Proposal[];
/**
 * Accepts a proposal:
 * - applies delta into docs/memory
 * - marks proposal as accepted
 * - runs automatic maintenance (gc & index)
 */
declare function acceptProposal(id: string, reviewerOrRootDir?: string, rootDirArg?: string): Promise<{
    proposal: Proposal;
    reconcileResult: ReconcileResult;
    success: boolean;
}>;
/**
 * Rejects a proposal
 */
declare function rejectProposal(id: string, reviewerOrRootDir?: string, rootDirArg?: string): {
    proposal: Proposal;
    success: boolean;
};

interface RedactionPattern {
    name: string;
    regex: RegExp;
    replacement: string;
}
declare const SECRET_PATTERNS: RedactionPattern[];
/**
 * Redacts known sensitive patterns and high-entropy secret assignments
 */
declare function redactSecrets(content: string): string;

/**
 * Parses simple ignore rules from .gitignore or .veeignore
 */
declare function parseIgnoreFile(filePath: string): string[];
/**
 * Checks if a relative or absolute file path matches the privacy denylist:
 * - .env*
 * - *.pem, *.key, id_rsa*
 * - lockfiles
 * - binaries
 * - .gitignore or .veeignore patterns
 */
declare function isDenylistedFile(filePath: string, rootDir?: string): boolean;

/**
 * Redacts secrets from text content
 */
declare function redactContent(content: string): string;
/**
 * Truncates diff payload by hunk so it does not exceed maxBytes
 */
declare function capDiffPayload(diff: string, maxBytes?: number): string;
/**
 * Verifies cloud consent for external LLM calls.
 * If privacy.allow_cloud is false:
 * - Prompts if in interactive TTY
 * - Throws VeeError with instructions if non-interactive
 */
declare function assertCloudConsent(config: VeeshreeConfig, onConsentGranted?: () => void): Promise<void>;

declare const redactSensitiveText: typeof redactContent;
declare const isDenyListedPath: typeof isDenylistedFile;

interface HooksStatus {
    isGitRepo: boolean;
    hooksDir: string;
    installed: boolean;
    preCommitInstalled: boolean;
    postCheckoutInstalled: boolean;
    postMergeInstalled: boolean;
}
/**
 * Resolves Git hooks directory respecting core.hooksPath and Husky
 */
declare function resolveGitHooksDir(rootDir?: string): string | null;
/**
 * Installs or updates Veeshree marker blocks in pre-commit, post-checkout, and post-merge hooks
 */
declare function installGitHooks(rootDir?: string, options?: {
    blockOnDrift?: boolean;
}): string[];
/**
 * Removes Veeshree marker blocks from git hooks
 */
declare function uninstallGitHooks(rootDir?: string): string[];
/**
 * Inspects Git hook status
 */
declare function getHooksStatus(rootDir?: string): HooksStatus;

declare const RULE_START_MARKER = "<!-- veeshree:start -->";
declare const RULE_END_MARKER = "<!-- veeshree:end -->";
declare function generateVeeshreeAgentRuleBlock(): string;

interface AgentRuleTarget {
    name: string;
    relPath: string;
}
declare const KNOWN_AGENT_TARGETS: AgentRuleTarget[];
/**
 * Installs or appends marker block into agent rule files without overwriting existing content.
 */
declare function installAgentRules(rootDir?: string, selectedAgentNames?: string[]): string[];
/**
 * Removes only Veeshree marker blocks from agent rule files.
 */
declare function uninstallAgentRules(rootDir?: string, selectedAgentNames?: string[]): string[];
/**
 * Refreshes all existing agent rule marker blocks
 */
declare function updateAgentRules(rootDir?: string): string[];
/**
 * Injects Veeshree agent rule marker block into a single file idempotently.
 * Returns true if modified, false if already present.
 */
declare function injectAgentRuleBlock(filePath: string): boolean;
/**
 * Removes Veeshree agent rule marker block from a single file.
 */
declare function removeAgentRuleBlock(filePath: string): boolean;

interface WatchState {
    lastDiffFingerprint: string;
    callsThisHour: number;
    hourWindowStart: number;
    lastProcessedAt?: string;
}
/**
 * Loads watch state from .vee/watch-state.json
 */
declare function loadWatchState(rootDir?: string): WatchState;
/**
 * Saves watch state to .vee/watch-state.json
 */
declare function saveWatchState(state: WatchState, rootDir?: string): void;
/**
 * Calculates SHA-256 fingerprint of a diff string
 */
declare function computeDiffFingerprint(diff: string): string;
/**
 * Verifies if rate limit of max calls per hour is reached
 */
declare function canMakeWatchCall(maxCallsPerHour: number, state: WatchState): boolean;
/**
 * Checks if a diff has changed since last processed
 */
declare function shouldProcessDiff(diff: string, rootDir?: string): {
    shouldProcess: boolean;
    fingerprint: string;
};
/**
 * Updates last processed diff fingerprint in .vee/watch-state.json
 */
declare function updateDiffFingerprint(diff: string, rootDir?: string): void;

interface WatcherOptions {
    debounceSeconds?: number;
    provider?: string;
    model?: string;
    auto?: boolean;
    onExtracted?: (summary: string) => void;
}
/**
 * Appends a log line to .vee/logs/watch.log
 */
declare function writeWatchLog(rootDir: string, level: string, message: string): void;
/**
 * Ambient background file watcher that observes code modifications,
 * captures Git diffs when changes settle, and saves proposals.
 */
declare function startMemoryWatcher(rootDir?: string, options?: WatcherOptions): Promise<{
    stop: () => void;
}>;

interface DaemonStatus {
    running: boolean;
    pid?: number;
    logPath: string;
}
/**
 * Returns the current daemon status
 */
declare function getDaemonStatus(rootDir?: string): DaemonStatus;
/**
 * Starts the watcher in background daemon mode
 */
declare function startDaemon(rootDir?: string, options?: {
    debounce?: string;
    provider?: string;
    model?: string;
    auto?: boolean;
}): {
    pid: number;
    logPath: string;
};
/**
 * Stops the running watcher daemon
 */
declare function stopDaemon(rootDir?: string): {
    stopped: boolean;
    pid?: number;
};

interface SnapshotMeta {
    id: string;
    timestamp: string;
    description: string;
    path: string;
}
/**
 * Creates a pre-apply backup snapshot of docs/memory to support vee undo
 */
declare function createMemorySnapshot(rootDir?: string, description?: string): SnapshotMeta;
/**
 * Lists available snapshots in chronological order (newest first)
 */
declare function listSnapshots(rootDir?: string): SnapshotMeta[];
/**
 * Restores memory from the Nth recent snapshot (1 = most recent)
 */
declare function restoreSnapshot(step?: number, rootDir?: string): {
    restoredId: string;
    timestamp: string;
};
/**
 * Restores memory snapshot by snapshot ID, or step 1 if not specified
 */
declare function restoreMemorySnapshot(rootDir?: string, snapshotId?: string): boolean;

interface ProviderCallOptions {
    apiKey?: string;
    baseUrl?: string;
    timeoutMs?: number;
}
interface Extractor {
    readonly name: string;
    readonly isLocal: boolean;
    extract(payload: string, model: string, options?: ProviderCallOptions): Promise<ExtractionDelta>;
}

declare const EXTRACTION_SYSTEM_PROMPT = "You are Veeshree's background memory extraction engine.\nAnalyze the provided conversation transcript, coding log, or Git diff.\nExtract structural memory updates strictly conforming to this JSON schema:\n{\n  \"decisions\": [\n    {\n      \"title\": \"Short title of architectural choice\",\n      \"decision\": \"Concrete implementation decided upon\",\n      \"reason\": \"Why this choice was made\",\n      \"alternatives_considered\": [\"Alternative 1\", \"Alternative 2\"],\n      \"linked_files\": [\"src/path/to/file.ts\"],\n      \"status\": \"active\"\n    }\n  ],\n  \"current_state\": {\n    \"current_feature\": \"Active feature name or focus\",\n    \"completed_in_session\": [\"Accomplished milestone 1\"],\n    \"next_immediate_steps\": [\"Next task to work on\"]\n  },\n  \"tasks\": [\n    { \"task_name\": \"Name of task\", \"action\": \"add\" | \"complete\" | \"remove\" }\n  ],\n  \"constraints\": [\n    { \"rule\": \"Constraint or security rule established\", \"type\": \"hard\" | \"soft\" }\n  ],\n  \"rejected_approaches\": [\n    { \"approach\": \"Rejected technology or design\", \"reason\": \"Why it was discarded\" }\n  ],\n  \"discoveries\": [\"Key behavior or technical finding\"]\n}\n\nOutput ONLY valid raw JSON with no Markdown backticks or commentary.";
/**
 * Strips markdown codeblocks and cleans json string
 */
declare function cleanJsonText(raw: string): string;
/**
 * Validates and parses raw JSON string into a verified ExtractionDelta
 */
declare function validateExtractionJson(rawText: string): ExtractionDelta;

declare class GeminiExtractor implements Extractor {
    readonly name = "gemini";
    readonly isLocal = false;
    extract(payload: string, model: string, options?: ProviderCallOptions): Promise<ExtractionDelta>;
}

declare class OpenAIExtractor implements Extractor {
    readonly name: string;
    readonly isLocal = false;
    private defaultBaseUrl;
    constructor(name?: string, defaultBaseUrl?: string);
    extract(payload: string, model: string, options?: ProviderCallOptions): Promise<ExtractionDelta>;
}

declare class AnthropicExtractor implements Extractor {
    readonly name = "anthropic";
    readonly isLocal = false;
    extract(payload: string, model: string, options?: ProviderCallOptions): Promise<ExtractionDelta>;
}

declare class OllamaExtractor implements Extractor {
    readonly name = "ollama";
    readonly isLocal = true;
    extract(payload: string, modelName: string, options?: ProviderCallOptions): Promise<ExtractionDelta>;
    private selectNonEmbeddingModel;
}

declare class LmStudioExtractor implements Extractor {
    readonly name = "lmstudio";
    readonly isLocal = true;
    extract(payload: string, model: string, options?: ProviderCallOptions): Promise<ExtractionDelta>;
}

interface ResolvedEngine {
    extractor: Extractor;
    provider: string;
    model: string;
    apiKey?: string;
    baseUrl?: string;
}
declare function resolveEngine(rootDir?: string, customProvider?: string, customModel?: string): Promise<ResolvedEngine>;

declare const MCP_TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            task: {
                type: string;
                description: string;
            };
            max_tokens: {
                type: string;
                description: string;
            };
            query?: undefined;
            include_archived?: undefined;
            id?: undefined;
            status?: undefined;
            title?: undefined;
            decision?: undefined;
            reason?: undefined;
            alternatives?: undefined;
            linked_files?: undefined;
            rule?: undefined;
            type?: undefined;
            name?: undefined;
            action?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
            include_archived: {
                type: string;
                description: string;
            };
            task?: undefined;
            max_tokens?: undefined;
            id?: undefined;
            status?: undefined;
            title?: undefined;
            decision?: undefined;
            reason?: undefined;
            alternatives?: undefined;
            linked_files?: undefined;
            rule?: undefined;
            type?: undefined;
            name?: undefined;
            action?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            id: {
                type: string;
                description: string;
            };
            task?: undefined;
            max_tokens?: undefined;
            query?: undefined;
            include_archived?: undefined;
            status?: undefined;
            title?: undefined;
            decision?: undefined;
            reason?: undefined;
            alternatives?: undefined;
            linked_files?: undefined;
            rule?: undefined;
            type?: undefined;
            name?: undefined;
            action?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            task?: undefined;
            max_tokens?: undefined;
            query?: undefined;
            include_archived?: undefined;
            id?: undefined;
            title?: undefined;
            decision?: undefined;
            reason?: undefined;
            alternatives?: undefined;
            linked_files?: undefined;
            rule?: undefined;
            type?: undefined;
            name?: undefined;
            action?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            id: {
                type: string;
                description: string;
            };
            task?: undefined;
            max_tokens?: undefined;
            query?: undefined;
            include_archived?: undefined;
            status?: undefined;
            title?: undefined;
            decision?: undefined;
            reason?: undefined;
            alternatives?: undefined;
            linked_files?: undefined;
            rule?: undefined;
            type?: undefined;
            name?: undefined;
            action?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            title: {
                type: string;
                description: string;
            };
            decision: {
                type: string;
                description: string;
            };
            reason: {
                type: string;
                description: string;
            };
            alternatives: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            linked_files: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            task?: undefined;
            max_tokens?: undefined;
            query?: undefined;
            include_archived?: undefined;
            id?: undefined;
            status?: undefined;
            rule?: undefined;
            type?: undefined;
            name?: undefined;
            action?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            rule: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
            task?: undefined;
            max_tokens?: undefined;
            query?: undefined;
            include_archived?: undefined;
            id?: undefined;
            status?: undefined;
            title?: undefined;
            decision?: undefined;
            reason?: undefined;
            alternatives?: undefined;
            linked_files?: undefined;
            name?: undefined;
            action?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            name: {
                type: string;
                description: string;
            };
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            task?: undefined;
            max_tokens?: undefined;
            query?: undefined;
            include_archived?: undefined;
            id?: undefined;
            status?: undefined;
            title?: undefined;
            decision?: undefined;
            reason?: undefined;
            alternatives?: undefined;
            linked_files?: undefined;
            rule?: undefined;
            type?: undefined;
        };
        required: string[];
    };
})[];
/**
 * Executes an MCP tool call and returns a stringified result
 */
declare function handleMcpToolCall(name: string, args?: Record<string, unknown>, rootDir?: string): Promise<string>;

/**
 * Starts the Veeshree MCP Server over stdio
 */
declare function startMcpServer(rootDir?: string): Promise<void>;

type McpClientType = "claude" | "cursor" | "vscode" | "gemini";
/**
 * Resolves the configuration file path for a specified MCP client
 */
declare function resolveClientConfigPath(client: McpClientType, rootDir?: string): string;
/**
 * Installs Veeshree MCP server definition into client configuration file
 */
declare function installMcpClientConfig(client: McpClientType, rootDir?: string): {
    configPath: string;
    client: string;
};
/**
 * Generates client configuration object without writing to disk
 */
declare function generateClientConfig(client: McpClientType, rootDir?: string): {
    targetPath: string;
    content: string;
};

interface ModeratorReport {
    isExistingProject: boolean;
    projectAge: "fresh" | "active" | "mature";
    languages: string[];
    frameworks: string[];
    databases: string[];
    installedRules: string[];
    seededFiles: string[];
    gitIgnoreUpdated?: boolean;
}

interface InitOptions {
    force?: boolean;
    dryRun?: boolean;
    agents?: string;
}
declare function initializeVeeshree(targetDir?: string, options?: InitOptions): ModeratorReport;

interface MigrateOptions {
    dryRun?: boolean;
}
interface MigrateResult {
    success: boolean;
    adrsUpdated: number;
}
declare function handleMigrateCommand(options?: MigrateOptions | string, rootDirArg?: string): Promise<MigrateResult>;

interface SyncOptions {
    accept?: string;
    json?: boolean;
    quiet?: boolean;
    dryRun?: boolean;
}
declare function syncVeeshree(rootDir?: string, options?: SyncOptions): {
    report: WorkspaceDriftReport;
    acceptedCount?: number;
    exitCode: number;
};

interface ContextCommandOptions {
    maxTokens?: string | number;
    tasks?: boolean;
    json?: boolean;
    raw?: boolean;
    explain?: boolean;
    format?: "markdown" | "json" | "xml";
}
declare function generateContext(request?: string, options?: ContextCommandOptions, rootDir?: string): ContextBuildResult;

interface KeysCommandOptions {
    local?: boolean;
    global?: boolean;
}
declare function handleKeysCommand(action: string, provider?: string, key?: string, options?: KeysCommandOptions, rootDir?: string): void;

declare function handleModelsCommand(rootDir?: string): Promise<void>;
declare function handleModelsUseCommand(provider: string, model: string, rootDir?: string): void;
declare function handleModelsPullCommand(modelName: string): void;

interface CaptureOptions {
    file?: string;
    diff?: boolean;
    provider?: string;
    model?: string;
    auto?: boolean;
    dryRun?: boolean;
    showPayload?: boolean;
}
declare function handleCaptureCommand(options: CaptureOptions, rootDir?: string): Promise<{
    proposal?: Proposal;
    payload?: string;
    autoApplied?: boolean;
}>;

interface StatusOptions {
    check?: boolean;
    json?: boolean;
    quiet?: boolean;
}
interface StatusResult {
    currentFocus: string;
    completedTasks: number;
    totalTasks: number;
    activeDecisionsCount: number;
    supersededDecisionsCount: number;
    driftReport: WorkspaceDriftReport;
    pendingProposalsCount: number;
    exitCode: number;
}
declare function handleStatusCommand(options?: StatusOptions, rootDir?: string): StatusResult;

declare function handleSearchCommand(query: string, options?: {
    archived?: boolean;
    json?: boolean;
}, rootDir?: string): SearchResultItem[];

interface DecisionsOptions {
    all?: boolean;
    status?: string;
    subcommand?: "list" | "new" | "show" | "supersede" | "link";
    title?: string;
    id?: string;
    targetFile?: string;
}
declare function handleDecisionsCommand(options?: DecisionsOptions, rootDir?: string): void;

declare function handleGcCommand(options?: {
    dryRun?: boolean;
}, rootDir?: string): GCResult;

interface DoctorCheckItem {
    category: string;
    name: string;
    status: "ok" | "warn" | "fail";
    message: string;
    remedy?: string;
    fixed?: boolean;
}
interface DoctorResult {
    checks: DoctorCheckItem[];
    hasFailures: boolean;
    hasWarnings: boolean;
    fixedCount: number;
}
declare function handleDoctorCommand(options?: {
    fix?: boolean;
}, rootDir?: string): Promise<DoctorResult>;

declare function handleReviewCommand(rootDir?: string): Proposal[];

interface AcceptOptions {
    allLow?: boolean;
    dryRun?: boolean;
}
declare function handleAcceptCommand(targetId?: string, options?: AcceptOptions, rootDir?: string): Promise<string[]>;

declare function handleRejectCommand(id: string, rootDir?: string): void;

declare function handleProposalsCommand(options?: {
    json?: boolean;
    status?: string;
}, rootDir?: string): Proposal[];

declare function handleUndoCommand(stepStr?: string, rootDir?: string): void;

declare function handleExportCommand(options?: {
    format?: "json" | "md";
}, rootDir?: string): void;

declare function handleImportCommand(filePath: string, rootDir?: string): void;

declare function handleMcpCommand(action?: string, options?: {
    client?: string;
}, rootDir?: string): Promise<void>;

declare function handleHooksCommand(action?: "install" | "uninstall" | "status", rootDir?: string): void;

declare function handleRulesCommand(action?: "update" | "uninstall" | "list", options?: {
    agents?: string;
}, rootDir?: string): void;

declare function handleCiCommand(action?: "init", rootDir?: string): void;

declare function handleConfigCommand(action?: "get" | "set" | "list" | "path", key?: string, value?: string, options?: {
    global?: boolean;
}, rootDir?: string): void;

declare function handleCompletionCommand(shell?: string): void;

export { ARCHIVE_DECISIONS_DIR_REL, ARCHIVE_DIR_REL, type AcceptOptions, type AdrDriftRecord, type AgentRuleTarget, AnthropicExtractor, BACKUP_03X_DIR_REL, type BaselineAcceptResult, COMPLETED_TASKS_FILE_REL, CONFIG_FILE_REL, CONSTRAINTS_FILE_REL, CURRENT_STATE_FILE_REL, type CaptureOptions, type ContextAssembleOptions, type ContextAssembleResult, type ContextCommandOptions, DECISIONS_DIR_REL, DEFAULT_CONSTRAINTS_CAP, DEFAULT_DECISIONS_CAP, DEFAULT_GC_MAX_COMPLETED_TASKS, DEFAULT_GC_MAX_PROGRESS, DEFAULT_MAX_CONTEXT_TOKENS, DEFAULT_MAX_PAYLOAD_BYTES, DEFAULT_MODELS, DEFAULT_STATE_CAP, DEFAULT_TASKS_CAP, DISCOVERIES_FILE_REL, type DaemonStatus, type DecisionFrontmatter, DecisionFrontmatterSchema, type DecisionsOptions, type DoctorCheckItem, type DoctorResult, EXTRACTION_SYSTEM_PROMPT, type ExtractionConstraint, ExtractionConstraintSchema, type ExtractionCurrentState, ExtractionCurrentStateSchema, type ExtractionDecision, ExtractionDecisionSchema, type ExtractionDelta, ExtractionDeltaSchema, type ExtractionRejected, ExtractionRejectedSchema, type ExtractionTask, ExtractionTaskSchema, type Extractor, type ExtractorProvider, ExtractorProviderSchema, type FileDriftStatus, type GCOptions, type GCResult, GeminiExtractor, type HooksStatus, INDEX_FILE_REL, type IndexDocument, type InitOptions, KNOWN_AGENT_TARGETS, type KeyInfo, type KeyProvider, type KeysCommandOptions, LOCK_FILE_REL, LOCK_STALE_MS, LOGS_DIR_REL, type LinkedFileDrift, type LinkedFileEntry, LinkedFileEntrySchema, LmStudioExtractor, type LockHandle, type LogLevel, type LoggerConfig, MCP_TOOLS, MEMORY_DIR_REL, type MarkdownSection, type McpClientType, type MigrateOptions, type MigrateResult, type ModelRuntimeInfo, OllamaExtractor, OpenAIExtractor, PROPOSALS_DIR_REL, type ParsedMarkdown, type Proposal, type ProposalRisk, ProposalRiskSchema, ProposalSchema, type ProposalSource, ProposalSourceSchema, type ProposalStatus, ProposalStatusSchema, type ProviderCallOptions, REJECTED_FILE_REL, RULE_END_MARKER, RULE_START_MARKER, type RedactionPattern, type ResolvedEngine, SECRET_PATTERNS, SNAPSHOTS_DIR_REL, SUPPORTED_KEY_PROVIDERS, type ScannedProjectInfo, type SearchResultItem, type SnapshotMeta, type StatusOptions, type StatusResult, type SyncOptions, TASKS_FILE_REL, VEE_DIR_REL, VeeError, type VeeErrorCode, type VeeshreeConfig, VeeshreeConfigSchema, type VeeshreeIndexData, WATCH_LOG_FILE_REL, WATCH_PID_FILE_REL, WATCH_STATE_FILE_REL, type WatchState, type WatcherOptions, type WorkspaceDriftReport, acceptBaselines, acceptProposal, acquireLock, assembleContext, assertCloudConsent, assessDeltaRisk, buildContext, buildIndex, calculateFileHash, calculateNormalizedFileHash, canMakeWatchCall, capDiffPayload, checkWorkspaceDrift, cleanJsonText, computeDiffFingerprint, createMemorySnapshot, createProposal, createSearchEngine, detectAvailableModels, estimateTokens, explainContextBudget, extractMemoryFromContent, findMarkdownFiles, generateClientConfig, generateConstraintsTemplate, generateContext, generateCurrentStateTemplate, generateDecisionStubTemplate, generateDiscoveriesTemplate, generateRejectedTemplate, generateTasksTemplate, generateVeeshreeAgentRuleBlock, getApiKey, getConfigProperty, getDaemonStatus, getDefaultConfig, getGlobalConfigPath, getGlobalCredentialsDir, getGlobalCredentialsPath, getHooksStatus, getNextAdrNumber, getProjectConfigPath, getProposal, handleAcceptCommand, handleCaptureCommand, handleCiCommand, handleCompletionCommand, handleConfigCommand, handleDecisionsCommand, handleDoctorCommand, handleExportCommand, handleGcCommand, handleHooksCommand, handleImportCommand, handleKeysCommand, handleMcpCommand, handleMcpToolCall, handleMigrateCommand, handleModelsCommand, handleModelsPullCommand, handleModelsUseCommand, handleProposalsCommand, handleRejectCommand, handleReviewCommand, handleRulesCommand, handleSearchCommand, handleStatusCommand, handleUndoCommand, initializeVeeshree, injectAgentRuleBlock, installAgentRules, installGitHooks, installMcpClientConfig, isDenyListedPath, isDenylistedFile, isValidModelName, listApiKeys, listProposals, listSnapshots, loadConfig, loadGlobalCredentials, loadOrBuildIndex, loadWatchState, logger, maskKey, normalizeContent, normalizePosix, normalizeTaskName, parseDecisionFrontmatter, parseIgnoreFile, parseMarkdownFrontmatter, parseMemoryFile, parseSections, reconcileExtraction, reconcileExtractionSafe, redactContent, redactSecrets, redactSensitiveText, rejectProposal, removeAgentRuleBlock, removeApiKey, resolveClientConfigPath, resolveEngine, resolveGitHooksDir, restoreMemorySnapshot, restoreSnapshot, runCommandInteractive, runCommandSafe, runGarbageCollection, safeLiteralReplace, sanitizeRelativePath, saveConfig, saveGlobalCredentials, saveProposal, saveWatchState, scanRepository, scoreProposalRisk, searchMemory, serializeSections, setApiKey, setConfigProperty, shouldProcessDiff, slugifyTitle, startDaemon, startMcpServer, startMemoryWatcher, stopDaemon, stringifyMarkdownFrontmatter, syncVeeshree, truncateToTokens, uninstallAgentRules, uninstallGitHooks, updateAgentRules, updateDiffFingerprint, updateSectionBody, validateExtractionJson, validateModelName, withLock, writeAtomic, writeWatchLog };
