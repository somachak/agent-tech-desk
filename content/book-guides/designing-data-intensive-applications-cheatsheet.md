# Designing Data-Intensive Applications — cheat sheet

*Martin Kleppmann and Chris Riccomini (Second Edition, 2026) · 679 pages · Formulaite bookshelf book 14 of 14*

**Core idea:** Write every fact once in a system of record, derive everything else from an ordered log of changes, and design for the faults that will happen anyway.

**Read when:** Open it when Formulaite's data (catalogue, supplier cache, traces, drafts, Firestore, memory) starts to matter more than the agent loop itself.

## Vocabulary

| Term | Means |
|---|---|
| System of record | The one authoritative copy of a fact; everything else is derived from it. |
| Derived data | Caches, indexes, views, models: rebuildable from the record, safe to lose. |
| Tail latency | The slow end of the response-time spread (p95, p99); one slow call slows the whole request. |
| Fault vs failure | A part misbehaving vs the whole system missing its job; tolerance stops the first becoming the second. |
| Replication lag | The delay before a follower reflects a write made on the leader. |
| Read-your-writes | A user always sees their own latest write, whatever other replicas show. |
| Last write wins | Conflict rule that keeps the newest timestamp and silently drops the other write. |
| Partition key | The field that decides which shard a record lives in. |
| Hot key | One key with far more load than the rest; it can overload a single shard. |
| Atomicity | All of a transaction's writes commit or none do; a failed one can be retried. |
| Snapshot isolation | A transaction reads the database as it was at one instant, via old versions kept around. |
| Write skew | Two transactions read the same rows, update different rows, and break a rule both checked. |
| Compare-and-set | Write only if the value or version is still what you read; otherwise retry. |
| Idempotent | Doing it twice has the same effect as doing it once; the basis of safe retries. |
| Fencing token | An ever-increasing number on each lease; storage rejects writes with an older one. |
| Linearizability | The replicated system behaves like a single copy with atomic operations; a recency guarantee. |
| Consensus | Several nodes agreeing on one value despite crashes; behind leader election and locks. |
| Change data capture | Reading a database's change log and feeding it to other systems in the same order. |
| Event sourcing | Storing every change as an immutable event and deriving current state from the log. |
| Schema evolution | Changing a data format while old and new readers and writers keep working. |

## The pattern

1. Write each fact once, in the system of record: catalogue, drawer, Glass Box trace.
2. Stamp every write with a request id and a version; retries then cannot duplicate or clobber.
3. Append events to a log with sequence numbers; never edit history.
4. Derive every other view from that log: cache, search index, memory store, evals.
5. Read your own writes from the source; accept lag everywhere else and say so.
6. When a view is wrong, delete it and replay the log with fixed code.
7. Audit by re-deriving and comparing; keep only data with a purpose and an expiry.

## Rules of thumb

| Do | Don't |
|---|---|
| Label every store as record or derived and know how each derived one is rebuilt. | Edit a cache or index by hand. |
| Measure p50, p95 and p99 of research runs from the trace. | Report an average or average percentiles across machines. |
| Back off with jitter and open a circuit when a supplier is slow. | Retry immediately in every layer. |
| Store catalogue IDs in the drawer and hydrate names on read. | Copy supplier names and prices into every drawer. |
| Keep unknown fields when reading and writing back a document. | Decode into a fixed object and drop what you did not expect. |
| Write drawer and trace in one batched commit. | Make two calls and leave an orphan on failure. |
| Guard read-modify-write with a version check or an atomic update. | Load, mutate, save. |
| Enforce 'only one' rules with a constraint or a lock on the rows you read. | Check in Python and insert. |
| Order events with a per-run sequence number. | Sort a merged trace by wall-clock time. |
| Let the index and memory store follow the drawers change stream. | Dual-write to three stores from the agent. |

## Skeletons

### Versioned drawer write (compare-and-set)

```python
def save_drawer(db, run_id, drawer, expected_version):
    ref = db.document(f"drawers/{run_id}")
    @firestore.transactional
    def txn(t):
        snap = ref.get(transaction=t)
        if snap.exists and snap.get("version") != expected_version:
            raise Conflict("drawer changed under us")
        t.set(ref, {**drawer.as_dict(), "version": expected_version + 1})
    txn(db.transaction())      # retry from a fresh read on Conflict
```

### Idempotent log consumer

```python
def apply_events(events, view, state):
    for e in events:
        if e.seq <= state.last_seq:      # already applied: skip
            continue
        view.apply(e)                    # deterministic step
        state.last_seq = e.seq           # saved with the view
    return view
```

### Append-only Glass Box log with replay

```python
import itertools, json
class Log:
    def __init__(self, path):
        self.path, self.seq = path, itertools.count()
    def append(self, kind, **meta):
        rec = {"seq": next(self.seq), "kind": kind, **meta}
        with open(self.path, "a") as f:
            f.write(json.dumps(rec) + "\n")
    def replay(self):
        for line in open(self.path):
            yield json.loads(line)
```

### Fault-injecting supplier reader

```python
class FlakyPages:
    def __init__(self, seed, p=0.3):
        self.rng, self.p = random.Random(seed), p
    def read(self, url):
        if self.rng.random() < self.p:
            raise TimeoutError(url)
        return real_read(url)

for seed in range(100):
    r = run_agent("Glycerin", pages=FlakyPages(seed))
    assert r.drawer is None or gate(r.drawer).passed
```

## Decisions

| When | Use | Not |
|---|---|---|
| Data fits one machine and one team | a single-node database, normalised, with transactions | sharding or a multi-leader setup |
| A record is read whole and rarely joined | a document per drawer with catalogue IDs inside | shredding it across many tables |
| The user must see what they just saved | a read from the leader or a version check after write | a cache or lagging replica |
| Two devices edit the same draft offline | per-field merge or version history | last write wins |
| Two runs may update the same record | compare-and-set on a version number | load, mutate, save |
| A rule spans several rows | a database constraint, serializable isolation or a lock on the rows read | a check in application code |
| Several stores must reflect one change | one leader plus change data capture | dual writes from the app |
| A view can be wrong or stale | rebuild it from the event log | patching rows by hand |

## Before you ship

- [ ] Every store in Formulaite is labelled system of record or derived, with a rebuild path for each derived one.
- [ ] Every research run carries a request id that is the document id for drawer, trace and memory writes.
- [ ] Every drawer document has a version, and writes go through a compare-and-set transaction.
- [ ] Glass Box events carry a sequence number and an event timestamp, and the log is append-only.
- [ ] The search index and memory store follow the drawers change stream; the agent writes to one place.
- [ ] The gate's 'only one' rules are enforced by a constraint or transaction, not only in Python.
- [ ] Supplier reads use timeouts, jittered backoff and a circuit breaker; non-idempotent tools are never auto-retried.
- [ ] Memory items have source, user_id and expires_at, and 'forget me' is one per-user delete.

## Build ladder

**Rung 1 · Catalogue as source of truth, everything else derived** (~1 hour) — A labelled data map of the lab where the catalogue is the system of record, the supplier-page cache is rebuildable, and every Glass Box event carries a version and a timestamp.
  1. Run the offline agent for Glycerin and list every file it reads or writes.
  2. Mark each file as system of record or derived data in a comment at the top of formulaite_tools.py.
  3. Delete the supplier-page cache and rerun; confirm the drawer comes out the same.
  4. Add schema_version and written_at fields to every Event in glassbox.py.
  5. Time ten runs and write down the p50 and p95 run time.

**Rung 2 · Safe concurrent drawer writes in Firestore** (~half a day) — A drawer store where two research runs on the same ingredient cannot silently overwrite each other, and the UI always sees the drawer it just saved.
  1. Give every research run a request_id in agent.py and log it in the first Glass Box event.
  2. Store each drawer with a version number and write only if the stored version is unchanged.
  3. Start two agents on Glycerin at once and watch one of them re-read and retry.
  4. After each write, read the drawer back from the same client and assert the version matches.
  5. Choose a partition key for per-user data and write down why it is not the INCI name.

**Rung 3 · Derived views and audits from a Glass Box change log** (~2 days) — An append-only event log with sequence numbers that feeds the drawer view, the search index and the memory store through idempotent consumers, plus a nightly job that rebuilds and audits them.
  1. Write every Glass Box event to an append-only log with a per-run sequence number.
  2. Build one consumer that derives the drawer view and one that fills the memory store from the log.
  3. Deliver the same event twice and inject a supplier timeout; confirm both consumers stay correct.
  4. Add a nightly batch that rebuilds ingredient embeddings from the log into a new versioned folder.
  5. Add an audit job that recomputes each drawer from its trace and alerts on any difference.

## You're done when

- Point at each Formulaite data store and say which one is the system of record, which are derived, and how each derived one is rebuilt.
- Run two research agents on the same ingredient at once and show that the drawer store rejects the stale write instead of losing an update.
- Replay a Glass Box change log into a fresh drawer view and memory store, deliver one event twice, and show both views end up correct.

*Source: `books-md/designing-data-intensive-applications.md` · chapters: 1 Trade-Offs in Data Systems Architecture, 2 Defining Nonfunctional Requirements, 3 Data Models and Query Languages, 4 Storage and Retrieval, 5 Encoding and Evolution, 6 Replication, 7 Sharding, 8 Transactions, 9 The Trouble with Distributed Systems, 10 Consistency and Consensus, 11 Batch Processing, 12 Stream Processing, 13 A Philosophy of Streaming Systems, 14 Doing the Right Thing*
