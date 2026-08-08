# Canonical migration history

Audit date: 2026-08-08
Remote project inspected read-only: `oykaionlcmaokoswcmql`

This directory mirrors the 14 entries in `supabase_migrations.schema_migrations`.
Each SQL file is the statement stored by the remote history, with only a final LF
added as normal file formatting. No migration repair or remote write was used.

## Remote-to-Git map

The status describes the state found before this reconciliation:

- **A**: equivalent object/effect existed in Git under another version or grouping;
- **B**: existed only in remote migration history;
- **C**: existed only in the former Git migration history;
- **D**: the SQL had a functional divergence, not just a version/name difference.

| Remote version | Remote name | Former Git equivalent | Status | Recommended action |
|---|---|---|---|---|
| 20260807162421 | lovable_00_extensions | `20260804211555_180f562a-ea3b-4517-b252-47768dc55539.sql` (extension portion) | A | Keep the exact remote version and SQL. |
| 20260807162452 | lovable_01_types | `20260804211555_180f562a-ea3b-4517-b252-47768dc55539.sql` (enum portion) | A | Keep the exact remote version and SQL. |
| 20260807162534 | lovable_02_tables | `20260804211555_...`, `20260804221516_...`, `20260805000000_...` (table portions) | A | Keep the squashed remote table definition. |
| 20260807162723 | lovable_03a_keys_checks | `20260804211555_...`, `20260804221516_...`, `20260804221949_...`, `20260804222145_...`, `20260805000000_...`, `20260805010000_...` | A | Keep the exact remote keys/checks block. |
| 20260807162745 | lovable_03b_fks_indexes | `20260804211555_...`, `20260804221516_...`, `20260805000000_...` | A | Keep the exact remote FK/index block. |
| 20260807162851 | lovable_04_functions_rpc | `20260804211555_...`, `20260804211619_...`, `20260804211643_...`, `20260804221516_...`, `20260804223100_...`, `20260805020000_...` | A/D | Keep the remote functions block; it deliberately excludes the former hard-coded email auto-promotion in `handle_new_user`. |
| 20260807162922 | lovable_05_triggers | `20260804211555_...`, `20260804221516_...`, `20260804223100_...`, `20260805000000_...` | A | Keep the normalized remote trigger set (one `product_items` update trigger). |
| 20260807163012 | lovable_06_rls_policies | `20260804211555_...`, `20260804221516_...`, `20260804224000_...`, `20260805000000_...` | A | Keep the final remote policy set; temporary integration/webhook client policies remain absent. |
| 20260807163335 | temporary_seed_bergamo_items | none | B | Preserve exact history; the helper is removed by the next migration. |
| 20260807163419 | remove_temporary_seed_rpc | none | B | Preserve exact history and removal. |
| 20260807171024 | temporary_seed_transport_table | none | B | Preserve exact history; the table is removed by the next migration. |
| 20260807171306 | remove_temporary_seed_transport_table | none | B | Preserve exact history and removal. |
| 20260807174541 | harden_authorization_helpers | `20260807180000_harden_authorization_helpers.sql` | A | Keep remote version; SQL effects are equal, former file differed only in formatting/comments. |
| 20260807203913 | add_my_post_auth_destination | `20260807210000_add_my_post_auth_destination.sql` | A | Keep remote version; SQL is equal apart from final LF. |

## Former Git-only migrations

| Former Git migration | Status | Disposition |
|---|---|---|
| `20260804222626_d83be737-e55a-489e-8880-e3f83f66e82a.sql` | C | Removed from canonical history; it temporarily added `hottok`. |
| `20260804223000_remove-hottok-column.sql` | C | Removed with its paired transient add; canonical tables never create the column. |
| `20260805000100_seed-bergamo-prompts.sql` | C | Removed from schema migration history. The 90 prompts are operational data already imported remotely, not a registered remote migration. |

The former `20260804211555_...` also contained a real **D** divergence: its
`handle_new_user` promoted one hard-coded email to `super_admin`. The canonical
remote function creates only `profile` plus the default `member` role. Its
configuration/product DML also was not part of the registered remote migration
history and is therefore not represented as schema migration SQL.

## Disposable reconstruction

The 14 canonical migrations were applied in order to an in-memory PostgreSQL
instance with minimal local `auth.users`, `auth.uid()` and `auth.role()` stubs.
All 14 applied successfully. Final structural inventory matched the remote:

| Object class | Rebuilt | Remote |
|---|---:|---:|
| public tables | 17 | 17 |
| columns | 183 | 183 |
| constraints | 65 | 65 |
| indexes | 41 | 41 |
| public functions | 11 | 11 |
| triggers (`public` + `on_auth_user_created`) | 13 | 13 |
| public RLS policies | 24 | 24 |

The table, function, trigger and enum name sets matched; all 17 reconstructed
tables had RLS enabled. The temporary seed function and transport table were
absent at the end. This verifies schema reproducibility, not operational data
seeding.

## Safety decision

`migration repair` is not required and must not be run for this reconciliation.
The Git filenames and SQL now match the already-applied remote history, so no
remote metadata or schema change is needed.
