# Claude Instructions: code-review-graph MCP Tools

> **Quota impact**: Using file-scanning (Read/Grep/Glob) instead of the graph
> costs **~27× more tokens** on this codebase. Graph tools return structural
> answers in <200 tokens that would otherwise require reading 5,000+ token files.
> You MUST prefer graph tools over file I/O in every situation listed below.

---

## 1. Mandatory First Step for Every Task

Before reading ANY file or running ANY grep, call:

```
get_minimal_context_tool(task="<what you are doing>")
```

This single call (~100 tokens) gives you: graph stats, risk score, top
communities, top execution flows, and suggested next tools. Treat it as your
orientation step — it prevents redundant exploration.

---

## 2. Tool Selection Rules (follow strictly)

| Task | ✅ Use this graph tool | ❌ Never do this |
|------|----------------------|-----------------|
| Find a function / class | `semantic_search_nodes` | `grep_search` across the repo |
| Understand a file's contents | `query_graph(file_summary)` | `view_file` cold |
| Trace who calls a function | `query_graph(callers_of)` | Manually grep for the name |
| Trace what a function calls | `query_graph(callees_of)` | Read the whole function file |
| Find imports / dependents | `query_graph(imports_of / importers_of)` | Grep for import statements |
| Review changed code | `detect_changes` → `get_review_context` | `view_file` every changed file |
| Assess blast radius | `get_impact_radius` | Manually trace dependency chains |
| Understand execution paths | `get_affected_flows` | Read call stack files one by one |
| Codebase architecture | `get_architecture_overview` + `list_communities` | List every directory |
| Rename / refactor | `refactor_tool(mode=rename)` | Grep-and-replace manually |
| Find dead code | `refactor_tool(mode=dead_code)` | Read all files looking for unused symbols |
| Find large functions | `find_large_functions_tool` | Count lines manually |

---

## 3. Quota-Saving Workflows

### Reviewing a PR / diff
```
1. detect_changes(base="HEAD~1")          # risk-scored summary, ~300 tokens
2. get_review_context(include_source=True) # targeted snippets only, ~500 tokens
# Total: ~800 tokens instead of reading every changed file (~20,000+ tokens)
```

### Exploring an unfamiliar module
```
1. semantic_search_nodes(query="<module keyword>")  # locate the node, ~100 tokens
2. query_graph(pattern="file_summary", target="<file>") # all symbols in file, ~200 tokens
3. query_graph(pattern="callers_of",  target="<fn>")   # who depends on it, ~150 tokens
# Total: ~450 tokens instead of view_file + grep (~3,000+ tokens)
```

### Debugging an unexpected behavior
```
1. get_minimal_context_tool(task="debug <symptom>")
2. semantic_search_nodes(query="<suspect function>")
3. query_graph(pattern="callees_of", target="<suspect>")
4. get_affected_flows(changed_files=["<file>"])
# Read source files ONLY for the 1-2 specific functions pinpointed above
```

### Planning a refactor
```
1. get_architecture_overview()
2. list_communities()
3. get_hub_nodes_tool()          # highest blast-radius nodes
4. refactor_tool(mode=suggest)   # community-driven suggestions
5. refactor_tool(mode=dead_code) # cleanup opportunities
```

---

## 4. When File I/O Is Acceptable

Only fall back to `view_file` / `grep_search` / `list_dir` when:

- The graph search returns **zero results** for your query.
- You need to read the **exact implementation body** of a specific function
  already pinpointed by the graph (read only that function, not the whole file).
- You need to **write or edit** code (obviously requires file access).
- The task is about **config files, .env, JSON, or non-code assets** that the
  graph does not index.

Even then, prefer targeted reads: use `StartLine`/`EndLine` on `view_file`
rather than reading entire files.

---

## 5. Key Principles

1. **Graph first, files second** — the graph gives structural answers;
   files give implementation details. Get structural context before reading code.
2. **`get_minimal_context_tool` is free** — call it at the start of every
   non-trivial task. It costs ~100 tokens and saves thousands.
3. **One graph query replaces many file reads** — `callers_of` in one call
   replaces grepping 50 files for a function name.
4. **`detect_changes` > reading diffs** — it gives risk scores, affected flows,
   and test-coverage gaps; raw diffs give none of that.
5. **Use `detail_level="minimal"`** on `list_communities` / `list_flows`
   when you only need names and counts, not full metadata.

---

## 6. MCP Server Name

The MCP server is registered as **`code-review-graph`**.
All tools above are prefixed with this server name in the tool call.

---

## 7. Graph Health Check

If tools return empty results or errors:

```
list_graph_stats_tool()   # check if graph is built
```

If the graph is missing or stale, the project setup script will rebuild it:

```powershell
& "c:\Users\Akshat\.gemini\antigravity\setup-crg.ps1" -ProjectPath "c:\Users\Akshat\Downloads\Velox"
```
