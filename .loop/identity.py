#!/usr/bin/env python3
"""LOOP snapshot and contract identity for the Rafiq implementation checkout."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOOP_DIR = ROOT / ".loop"
SNAPSHOT_DIR = LOOP_DIR / "snapshots"
CONTRACT_DIR = LOOP_DIR / "contract"

COVERAGE = [
    "app",
    "evidence",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "index.html",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "playwright.config.ts",
    "vitest.config.ts",
    "README.md",
    "public",
]

EXCLUSIONS = [
    ".git",
    ".loop",
    "learnai-city-project-loop",
    "node_modules",
    "app/node_modules",
    "app/dist",
    "dist",
    "coverage",
    "test-results",
    "playwright-report",
    ".vite",
    "app/.vite",
]

CONTRACT_FILES = {
    "agents": "learnai-city-project-loop/AGENTS.md",
    "slices": "learnai-city-project-loop/SLICES.md",
    "build": "learnai-city-project-loop/BUILD.md",
    "loop": "learnai-city-project-loop/LOOP.md",
    "builder": "learnai-city-project-loop/BUILDER.md",
    "reviewer": "learnai-city-project-loop/REVIEWER.md",
}


def is_excluded(rel: str) -> bool:
    parts = Path(rel).parts
    if ".git" in parts or "node_modules" in parts:
        return True
    for rule in EXCLUSIONS:
        rule = rule.strip("/")
        if rel == rule or rel.startswith(rule + "/"):
            return True
    return False


def covered_paths() -> list[Path]:
    files: list[Path] = []
    for item in COVERAGE:
        path = ROOT / item
        if not path.exists():
            continue
        if path.is_file():
            rel = str(path.relative_to(ROOT))
            if not is_excluded(rel):
                files.append(path)
            continue
        for child in path.rglob("*"):
            if not child.is_file() and not child.is_symlink():
                continue
            rel = str(child.relative_to(ROOT))
            if is_excluded(rel):
                continue
            files.append(child)
    files.sort(key=lambda p: str(p.relative_to(ROOT)))
    return files


def file_type(path: Path) -> str:
    if path.is_symlink():
        return "symlink"
    mode = path.lstat().st_mode
    if stat.S_ISDIR(mode):
        return "dir"
    return "file"


def snapshot_entries(paths: list[Path]) -> list[dict]:
    entries = []
    for path in paths:
        rel = str(path.relative_to(ROOT))
        lstat = path.lstat()
        executable = bool(lstat.st_mode & (stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH))
        if path.is_symlink():
            digest = hashlib.sha256(os.readlink(path).encode("utf-8")).hexdigest()
            target = os.readlink(path)
            size = None
        else:
            data = path.read_bytes()
            digest = hashlib.sha256(data).hexdigest()
            target = None
            size = len(data)
        entries.append(
            {
                "path": rel,
                "type": file_type(path),
                "sha256": digest,
                "size": size,
                "executable": executable,
                "symlink_target": target,
            }
        )
    return entries


def manifest_digest(entries: list[dict]) -> str:
    payload = json.dumps(entries, sort_keys=True, ensure_ascii=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def section_body(text: str, heading: str, stop_headings: list[str]) -> str:
    lines = text.splitlines()
    start = None
    for i, line in enumerate(lines):
        if line.strip() == heading:
            start = i
            break
    if start is None:
        raise SystemExit(f"missing heading {heading}")
    end = len(lines)
    for i in range(start + 1, len(lines)):
        if lines[i].strip() in stop_headings or (
            lines[i].startswith("## ") and lines[i].strip() != heading
        ):
            # only stop on explicit list if provided, else any ##
            if stop_headings:
                if lines[i].strip() in stop_headings:
                    end = i
                    break
            else:
                end = i
                break
    return "\n".join(lines[start:end]).strip() + "\n"


def extract_slices_contract(text: str) -> str:
    """Product through curriculum, plus normalized slice catalog. Drop run bookkeeping."""
    drop_exact = {
        "## Run status",
        "## Release evidence",
        "## Shipped",
        "## Now",
        "## Later",
    }
    lines = text.splitlines()
    kept: list[str] = []
    skipping = False
    catalog: list[str] = []
    in_slice_area = False
    slice_buf: list[str] = []

    def flush_slice():
        nonlocal slice_buf
        body = "\n".join(slice_buf).strip()
        if body:
            catalog.append(body)
        slice_buf = []

    for i, line in enumerate(lines):
        if line.startswith("## "):
            if line.strip() in drop_exact:
                skipping = True
            if line.strip() in {"## Now", "## Later", "## Shipped"}:
                in_slice_area = True
                continue
            skipping = False
            in_slice_area = False
        if in_slice_area:
            if line.startswith("### "):
                flush_slice()
                slice_buf = [line]
            elif skipping:
                if slice_buf:
                    slice_buf.append(line)
            continue
        if skipping:
            continue
        kept.append(line)
    flush_slice()
    catalog.sort()
    return "\n".join(kept).strip() + "\n\n## Slice catalog\n\n" + "\n\n".join(catalog) + "\n"


def extract_build_contract(text: str) -> str:
    lines = text.splitlines()
    kept: list[str] = []
    for line in lines:
        if line.strip() == "## Proof":
            break
        kept.append(line)
    # Snapshot commands live in Loop state; include only those durable fields.
    capture = []
    in_loop = False
    for line in lines:
        if line.strip() == "## Loop state":
            in_loop = True
            continue
        if in_loop and line.startswith("## "):
            break
        if in_loop and (
            line.startswith("Execution mode")
            or line.startswith("Snapshot capture")
            or line.startswith("Coverage:")
            or line.startswith("Exclusions:")
        ):
            capture.append(line)
    return "\n".join(kept).strip() + "\n\n## Contracted loop capture\n" + "\n".join(capture) + "\n"


def write_contract() -> dict[str, str]:
    CONTRACT_DIR.mkdir(parents=True, exist_ok=True)
    hashes = {}
    combined = hashlib.sha256()
    for key, rel in CONTRACT_FILES.items():
        path = ROOT / rel
        raw = path.read_text(encoding="utf-8")
        if key == "slices":
            body = extract_slices_contract(raw)
        elif key == "build":
            body = extract_build_contract(raw)
        else:
            body = raw
        out = CONTRACT_DIR / f"{key}.md"
        out.write_text(body, encoding="utf-8")
        digest = hashlib.sha256(body.encode("utf-8")).hexdigest()
        hashes[key] = digest
        combined.update(f"{key}:{digest}\n".encode("utf-8"))
    hashes["contract"] = combined.hexdigest()
    (CONTRACT_DIR / "hashes.json").write_text(
        json.dumps(hashes, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return hashes


def write_snapshot(label: str) -> dict:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    paths = covered_paths()
    entries = snapshot_entries(paths)
    digest = manifest_digest(entries)
    payload = {
        "label": label,
        "root": str(ROOT),
        "digest": digest,
        "file_count": len(entries),
        "coverage": COVERAGE,
        "exclusions": EXCLUSIONS,
        "entries": entries,
    }
    path = SNAPSHOT_DIR / f"{label}.json"
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (SNAPSHOT_DIR / f"{label}.digest").write_text(digest + "\n", encoding="utf-8")
    return {"digest": digest, "file_count": len(entries), "path": str(path.relative_to(ROOT))}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["snapshot", "contract", "both"])
    parser.add_argument("--label", default="candidate")
    args = parser.parse_args()
    result = {}
    if args.command in {"contract", "both"}:
        result["contract"] = write_contract()
    if args.command in {"snapshot", "both"}:
        result["snapshot"] = write_snapshot(args.label)
    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
