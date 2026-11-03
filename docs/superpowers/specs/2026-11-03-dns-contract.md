# Frozen DNS contract

Independent author `/root/dns_contract` wrote `evals/lessons/contracts/dns.json` before prose, without inspecting lesson source. SHA-256: `5a32447dc5f68465c06e1d92f5fbf4f22ab9dbee156c443d0c5c5e47c55f00b1`. Structural card, question and objective-order validation passed before authoring.

Eight ordered objectives cover name discovery, recursive resolution/delegation, records/aliases, TTL changes, negative answers, steering/failover, availability/diagnosis and DNSSEC versus HTTPS. Six transfer scenarios assess all objectives. The .example hierarchy is explicitly illustrative. Audience, prerequisites, detailed criteria and misconceptions live in the contract rather than a duplicate specification here.

Implementation reuses the existing lesson display/styles, with resolver and cache-transition diagrams. Only normalized DNS technology on network components receives the deck. No DNS server, simulator or new infrastructure is implemented.
