# Object Storage release evidence

Eight cards follow one Notes attachment: the key, separate object and note writes, whole-object replacement, read and list limits, a lost response, durability versus request success, the credential boundary, and where the PDF belongs. Only object-storage components expose this stack. The frozen contract has six transfer scenarios.

Current-source `check-release` passes. Learner `object-storage-learner-5` and reviewers `object-storage-review-a5` and `object-storage-review-b5` scored 18/20 and 18/20. Every outcome is 2/2, with no hard failures. Both gave coherence and clarity 3/4 because a few product limits land on later slides and three terms are dense. Adjacent JSON files are unchanged outputs.

A negative control that said a timeout proves the object is absent, that durability keeps overwritten bytes, and that the store enforces per-note permissions was rejected at 6/20 and 9/20, with those claims as hard failures. Rejection was semantic, not a formatting failure. This one control does not prove evaluator reliability.

Registering the diagram changed the shared dialog hash. Queues, load balancing, API gateways, DNS, and CDN were re-scored with unchanged lesson text. Caching gained two sentences the re-review required: losing cache access does not by itself decide whether requests fail, and a stale outage copy must remain reachable outside the failed cache.

```sh
npm run eval:lessons -- check-release object-storage evals/lessons/releases/object-storage
```

Raw attempts and the control: `/tmp/system-canvas-learning-archive/2026-11-03-object-storage-evidence.tar.gz`. SHA-256: `1d446079f3636dd5c446307b8f40eafac39b21d17cdb201abcc3669a359c9111`. 52 archived files. This path is local to the run.

CI checks tracked reports against current source. These checks measure content readiness, not human learning.
