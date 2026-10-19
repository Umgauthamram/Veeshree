import { z } from 'zod';

declare const VEESHREE_VERSION: string;

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

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";
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

type VeeErrorCode = "ERR_DRIFT_DETECTED" | "ERR_INVALID_ARGS" | "ERR_NOT_INITIALIZED" | "ERR_CONFIG_INVALID" | "ERR_AUTH_REQUIRED" | "ERR_CLOUD_CONSENT_REQUIRED" | "ERR_PAYLOAD_TOO_LARGE" | "ERR_PROVIDER_FAILURE" | "ERR_PROPOSAL_NOT_FOUND" | "ERR_PROPOSAL_HIGH_RISK" | "ERR_PROPOSAL_LIMIT" | "ERR_LOCK_TIMEOUT" | "ERR_FILE_NOT_FOUND" | "ERR_MIGRATION_FAILED" | "ERR_MCP_ERROR" | "ERR_SECURITY_VIOLATION" | "ERR_UNKNOWN";
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
 * Calculates SHA-256 hash of a file after normalizing line endings (LF) and stripping UTF-8 BOM.
 * This guarantees cross-platform consistency between Windows (CRLF), macOS and Linux (LF).
 */
declare function calculateNormalizedFileHash(filePath: string): string | null;

declare function getGlobalConfigPath(): string;
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

type FileDriftStatus = "ok" | "drifted" | "missing" | "invalid_path";
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

/**
 * Builds and updates the index cache for the workspace
 */
declare function buildIndex(rootDir?: string): VeeshreeIndexData;
/**
 * Loads index cache from disk or rebuilds if missing
 */
declare function loadOrBuildIndex(rootDir?: string): VeeshreeIndexData;

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
 * Creates a new Proposal and writes it to .vee/proposals/<id>.json
 */
declare function createProposal(sourceOrDelta: ProposalSource | ExtractionDelta, deltaOrRootDir?: ExtractionDelta | string, agentOrRootDir?: string, rootDirArg?: string): Proposal;
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
 * Filters a raw git diff, removing any file chunks whose target paths match the denylist or .veeignore
 */
declare function filterDiffByDenylist(rawDiff: string, rootDir?: string): string;

/**
 * Redacts secrets from text content
 */
declare function redactContent(content: string): string;
/**
 * Truncates diff payload by hunk so it does not exceed maxBytes
 */
declare function capDiffPayload(diff: string, maxBytes?: number): string;

interface HooksStatus {
    isGitRepo: boolean;
    hooksDir: string;
    installed: boolean;
    preCommitInstalled: boolean;
    postCheckoutInstalled: boolean;
    postMergeInstalled: boolean;
}
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

interface MemoryExportBundle {
    manifest: {
        format: "veeshree-memory-export";
        version: string;
        exported_at: string;
    };
    files: Array<{
        path: string;
        content: string;
    }>;
}
declare function exportMemoryToArchive(rootDir?: string, format?: "json" | "md"): MemoryExportBundle;
declare function importMemoryFromArchive(rootDir: string | undefined, bundle: MemoryExportBundle): {
    restoredFiles: string[];
};

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

/**
 * Starts the Veeshree MCP Server over stdio
 */
declare function startMcpServer(rootDir?: string): Promise<void>;

type McpClientType = "claude" | "cursor" | "vscode" | "gemini" | "claude-code";
interface InstallMcpOptions {
    noInstall?: boolean;
    root?: string;
}
/**
 * Installs Veeshree MCP server definition into client configuration file
 */
declare function installMcpClientConfig(client: McpClientType, rootDir?: string, options?: InstallMcpOptions): {
    configPath: string;
    client: string;
    backupPath?: string;
};
/**
 * Generates client configuration object without writing to disk
 */
declare function generateClientConfig(client: McpClientType, rootDir?: string, options?: InstallMcpOptions): {
    targetPath: string;
    content: string;
};

export { AnthropicExtractor, type ContextAssembleOptions, type ContextAssembleResult, type DecisionFrontmatter, DecisionFrontmatterSchema, EXTRACTION_SYSTEM_PROMPT, type ExtractionConstraint, ExtractionConstraintSchema, type ExtractionCurrentState, ExtractionCurrentStateSchema, type ExtractionDecision, ExtractionDecisionSchema, type ExtractionDelta, ExtractionDeltaSchema, type ExtractionRejected, ExtractionRejectedSchema, type ExtractionTask, ExtractionTaskSchema, type Extractor, type ExtractorProvider, ExtractorProviderSchema, GeminiExtractor, type IndexDocument, type LinkedFileEntry, LinkedFileEntrySchema, LmStudioExtractor, type LogLevel, type ModelRuntimeInfo, OllamaExtractor, OpenAIExtractor, type Proposal, type ProposalRisk, ProposalRiskSchema, ProposalSchema, type ProposalSource, ProposalSourceSchema, type ProposalStatus, ProposalStatusSchema, type ProviderCallOptions, type ReconcileResult, type ResolvedEngine, type ScannedProjectInfo, VEESHREE_VERSION, VeeError, type VeeErrorCode, type VeeshreeConfig, VeeshreeConfigSchema, type VeeshreeIndexData, type WorkspaceDriftReport, acceptProposal, buildContext, buildIndex, calculateNormalizedFileHash, capDiffPayload, checkWorkspaceDrift, cleanJsonText, createMemorySnapshot, createProposal, estimateTokens, explainContextBudget, exportMemoryToArchive, filterDiffByDenylist, generateClientConfig, getGlobalConfigPath, getHooksStatus, getProposal, importMemoryFromArchive, installAgentRules, installGitHooks, installMcpClientConfig, isDenylistedFile, listProposals, listSnapshots, loadConfig, loadOrBuildIndex, logger, normalizePosix, reconcileExtractionSafe, redactContent, rejectProposal, resolveEngine, restoreSnapshot, sanitizeRelativePath, saveConfig, searchMemory, startMcpServer, truncateToTokens, uninstallAgentRules, uninstallGitHooks, updateAgentRules, validateExtractionJson };
