# -*- coding: utf-8 -*-
"""生成按教材册划分的离线音频包清单。

收集范围：课文、单词、例句、练习/考试听力中实际存在的 MP3。
输出：data/offline-audio-packs.json
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
AUDIO_DIR = ROOT / "audio"
TEXTBOOK_DIR = ROOT / "data" / "textbooks"
EXAMPLE_DIR = ROOT / "data" / "examples"
QUESTION_DIR = ROOT / "data" / "questions"
EXTRA_DIR = ROOT / "data" / "extras"
OUTPUT = ROOT / "data" / "offline-audio-packs.json"
DATA_CACHE_NAME = "lexue-data-offline-v1"

TEXTBOOKS = {
    "gzk": {"name": "广州口语", "grades": [1, 2], "lessonPrefix": "gzk_"},
    "jk": {"name": "广州教科版", "grades": [3, 4, 5, 6], "lessonPrefix": ""},
    "hj": {"name": "广州沪教版", "grades": [7, 8, 9], "lessonPrefix": ""},
}
TERMS = {"上": ("A", "上册", "shang"), "下": ("B", "下册", "xia")}
GRADE_NAMES = {
    1: "一年级", 2: "二年级", 3: "三年级", 4: "四年级", 5: "五年级", 6: "六年级",
    7: "初一", 8: "初二", 9: "初三",
}
MISSING_REFERENCES = []
_FILE_DIGESTS = {}


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def word_key(word: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "_", (word or "").strip().lower())
    return value.strip("_")


def add_existing(target, filename: Optional[str], required=False, source=""):
    if not filename:
        return
    path = AUDIO_DIR / Path(filename).name
    if path.is_file() and path.stat().st_size > 0:
        target.add("audio/" + path.name)
    elif required:
        MISSING_REFERENCES.append("{} -> {}".format(source or "unknown", path.name))


def add_data_file(target, path: Path, required=False, source=""):
    if path.is_file() and path.stat().st_size > 0:
        target.add(path.relative_to(ROOT).as_posix())
    elif required:
        MISSING_REFERENCES.append("{} -> {}".format(source or "unknown", path.relative_to(ROOT).as_posix()))


def file_digest(relative_path):
    cached = _FILE_DIGESTS.get(relative_path)
    if cached:
        return cached
    digest = hashlib.sha256()
    with (ROOT / relative_path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    value = digest.hexdigest()
    _FILE_DIGESTS[relative_path] = value
    return value


def pack_revision(files):
    digest = hashlib.sha256()
    for relative_path in files:
        path = ROOT / relative_path
        digest.update(relative_path.encode("utf-8"))
        digest.update(str(path.stat().st_size).encode("ascii"))
        digest.update(file_digest(relative_path).encode("ascii"))
    return digest.hexdigest()[:16]


def build_packs():
    packs: dict[str, dict] = {}
    for textbook, meta in TEXTBOOKS.items():
        for grade in meta["grades"]:
            for term, (_, term_name, _) in TERMS.items():
                pack_id = f"{textbook}-g{grade}-{term}"
                packs[pack_id] = {
                    "id": pack_id,
                    "textbook": textbook,
                    "textbookName": meta["name"],
                    "grade": grade,
                    "term": term,
                    "label": f"{GRADE_NAMES[grade]}{term_name}",
                    "files": set(),
                    "dataFiles": set(),
                }

    # 课文与单词。
    for textbook, meta in TEXTBOOKS.items():
        source = load_json(TEXTBOOK_DIR / f"{textbook}.json")
        for grade in meta["grades"]:
            grade_data = (source.get("grades") or {}).get(f"grade{grade}") or {}
            for term, (term_ab, _, _) in TERMS.items():
                pack = packs[f"{textbook}-g{grade}-{term}"]
                for unit in grade_data.get(term) or []:
                    unit_id = unit.get("id")
                    lessons = unit.get("lessons") or []
                    if not lessons and unit.get("lesson"):
                        lessons = [unit.get("lesson")]
                    for index, _lesson in enumerate(lessons):
                        add_existing(
                            pack["files"],
                            f"{meta['lessonPrefix']}grade{grade}{term_ab}_{unit_id}_L{index}.mp3",
                        )
                    if len(lessons) <= 1:
                        add_existing(
                            pack["files"],
                            f"{meta['lessonPrefix']}grade{grade}{term_ab}_{unit_id}.mp3",
                        )
                    for word in unit.get("words") or []:
                        key = word_key(word.get("word") or "")
                        if key:
                            add_existing(
                                pack["files"], f"word_{key}.mp3", required=True,
                                source=f"{textbook} grade{grade}{term} word:{word.get('word')}",
                            )

    # 例句。
    for path in sorted(EXAMPLE_DIR.glob("*.json")):
        match = re.match(r"^(gzk|jk|hj)_grade(\d+)_(shang|xia)\.json$", path.name)
        if not match:
            continue
        textbook, grade_text, term_slug = match.groups()
        grade = int(grade_text)
        term = "上" if term_slug == "shang" else "下"
        pack = packs.get(f"{textbook}-g{grade}-{term}")
        if not pack:
            continue
        words = (load_json(path).get("words") or {}).values()
        for examples in words:
            for example in examples or []:
                add_existing(
                    pack["files"], example.get("audioFile"), required=bool(example.get("audioFile")),
                    source=path.name + " example",
                )

    # 每册离线学习所需数据：教材、该教材题库、当前册例句/扩展练习、考试/语法基础数据。
    common_data = [
        ROOT / "data" / "grammar" / "grammar_knowledge.json",
        ROOT / "data" / "exams" / "exam_config.json",
        ROOT / "data" / "exams" / "exam_templates.json",
        ROOT / "data" / "exams" / "real_papers" / "index.json",
    ]
    for textbook, meta in TEXTBOOKS.items():
        question_files = sorted(QUESTION_DIR.glob(textbook + "_*.json"))
        for grade in meta["grades"]:
            textbook_path = TEXTBOOK_DIR / f"{textbook}_grade{grade}.json"
            if not textbook_path.exists():
                textbook_path = TEXTBOOK_DIR / f"{textbook}.json"
            for term, (_, _, term_slug) in TERMS.items():
                pack = packs[f"{textbook}-g{grade}-{term}"]
                add_data_file(pack["dataFiles"], textbook_path, required=True, source=pack["id"] + " textbook")
                for path in question_files + common_data:
                    add_data_file(pack["dataFiles"], path)
                add_data_file(pack["dataFiles"], EXAMPLE_DIR / f"{textbook}_grade{grade}_{term_slug}.json")
                add_data_file(pack["dataFiles"], EXTRA_DIR / f"{textbook}_grade{grade}_{term_slug}_exercises.json")
                add_data_file(pack["dataFiles"], EXTRA_DIR / f"{textbook}_grade{grade}_{term_slug}_irregular_verbs.json")

    # 题库听力。文件名前缀决定教材，题目 grade/term 决定册。
    for path in sorted(QUESTION_DIR.glob("*.json")):
        textbook = next((key for key in TEXTBOOKS if path.name.startswith(key + "_")), None)
        if not textbook:
            continue
        data = load_json(path)
        if not isinstance(data, list):
            continue
        for question in data:
            if not isinstance(question, dict):
                continue
            grade = question.get("grade")
            term = question.get("term")
            pack = packs.get(f"{textbook}-g{grade}-{term}")
            if pack:
                add_existing(
                    pack["files"], question.get("audioFile"), required=bool(question.get("audioFile")),
                    source=path.name + " " + str(question.get("code") or "question"),
                )

    result = []
    for pack in packs.values():
        files = sorted(pack.pop("files"))
        data_files = sorted(pack.pop("dataFiles"))
        all_files = files + data_files
        pack["files"] = files
        pack["dataFiles"] = data_files
        pack["fileCount"] = len(files)
        pack["dataFileCount"] = len(data_files)
        pack["bytes"] = sum((ROOT / file).stat().st_size for file in files)
        pack["dataBytes"] = sum((ROOT / file).stat().st_size for file in data_files)
        pack["totalBytes"] = pack["bytes"] + pack["dataBytes"]
        pack["revision"] = pack_revision(all_files)
        result.append(pack)
    return result


def main():
    packs = build_packs()
    if MISSING_REFERENCES:
        preview = "\n".join("  - " + item for item in MISSING_REFERENCES[:30])
        raise SystemExit("发现 {} 个缺失的音频引用：\n{}".format(len(MISSING_REFERENCES), preview))
    if any(not pack["files"] for pack in packs):
        raise SystemExit("发现空离线包，拒绝生成清单")
    referenced = {file for pack in packs for file in pack["files"]}
    referenced_data = {file for pack in packs for file in pack["dataFiles"]}
    all_referenced = referenced | referenced_data
    all_audio = {"audio/" + path.name for path in AUDIO_DIR.glob("*.mp3")}
    unassigned = sorted(all_audio - referenced)
    allowed_unassigned = [
        re.compile(r"audio/grade[12][AB]_u[12]_L0\.mp3$"),
        re.compile(r"audio/jk_listening_[12][AB]_0[12]\.mp3$"),
        re.compile(r"audio/listening_(?:0[1-9]|10)\.mp3$"),
        re.compile(r"audio/listening_g[1-9]_0[1-4]\.mp3$"),
        re.compile(r"audio/word_(?:banana|cold|eye|foot|grape|hand|head|hot|pear|you)\.mp3$"),
    ]
    unexpected = [path for path in unassigned if not any(pattern.match(path) for pattern in allowed_unassigned)]
    if unexpected:
        raise SystemExit("发现未登记的 MP3：\n" + "\n".join("  - " + path for path in unexpected))
    assets = {
        path: {"bytes": (ROOT / path).stat().st_size, "revision": file_digest(path)[:16]}
        for path in sorted(all_referenced)
    }
    payload = {
        "schemaVersion": 2,
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "cacheName": "lexue-audio-offline-v1",
        "dataCacheName": DATA_CACHE_NAME,
        "packCount": len(packs),
        "fileCount": len(referenced),
        "dataFileCount": len(referenced_data),
        "bytes": sum((ROOT / file).stat().st_size for file in referenced),
        "dataBytes": sum((ROOT / file).stat().st_size for file in referenced_data),
        "assets": assets,
        "packs": packs,
    }
    serialized = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    temp = OUTPUT.with_suffix(OUTPUT.suffix + ".tmp")
    temp.write_text(serialized, encoding="utf-8")
    check = json.loads(temp.read_text(encoding="utf-8"))
    if check["packCount"] != len(check["packs"]) or check["schemaVersion"] != 2:
        temp.unlink(missing_ok=True)
        raise SystemExit("清单写入后校验失败")
    temp.replace(OUTPUT)
    print(f"[offline-audio] {len(packs)} packs, {len(referenced)} audio, {len(referenced_data)} data files")
    print(f"[offline-audio] allowlisted legacy MP3: {len(unassigned)}")
    print(f"[offline-audio] wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
