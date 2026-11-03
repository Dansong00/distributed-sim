# Frozen DNS contract

Independent contract session `bc-faa4bc2b-89d2-57ca-9eb5-3813149b27d3` wrote `evals/lessons/contracts/dns.json` before lesson prose on 2026-11-03, without inspecting lesson source. SHA-256: `ffe8eded698e01dff24ba596b2d595cceb7ab282fdb92f572e30ecb2861ebfd2`.

Eight ordered objectives: lookup actors, lookup versus HTTP, address records versus a CNAME, an address set, TTL reuse, lookup failure versus NXDOMAIN, planned cutover, and a stable name versus health-aware request distribution. Six whole-stack transfer scenarios cover all objectives. The audience, prerequisites, criteria, and critical misconceptions stay in the contract.

Implementation follows one Notes hostname lookup, the existing dialog and styles, and normalized DNS network components. Two diagrams explain the resolver path and two caches expiring at different times. CDN, load balancing, and API gateway components keep their own decks. No resolver, simulator, or evaluator change is included.
