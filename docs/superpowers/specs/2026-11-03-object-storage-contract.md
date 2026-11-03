# Frozen Object Storage contract

Independent contract session `bc-8160e278-e5f1-5f64-a13d-3b79435df0a1` wrote `evals/lessons/contracts/object-storage.json` before lesson prose on 2026-11-03, without inspecting lesson source. SHA-256: `6765669d6c450c5044678045274557ffcd539c92ffc5bc1fc79aefcad37bfc80`.

Eight ordered objectives follow one Notes attachment: the key, the separate object and note writes, whole-object replacement, read and list limits, a lost response, durability versus request success, the access boundary, and where the PDF belongs. Six transfer scenarios cover those objectives. Audience, prerequisites, criteria, and critical misconceptions stay in the contract.

Implementation uses the existing dialog and styles and exposes the deck only for object-storage components. Two diagrams show the upload-then-key order and a lost response. Block storage, shared files, and data lakes keep their own topics. No store implementation or evaluator change is included.
