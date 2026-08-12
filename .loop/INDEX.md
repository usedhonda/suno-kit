# Loop Index

| Slug | Kind | Goal | Gate | Run mode |
| --- | --- | --- | --- | --- |
| `release-readiness` | closed | Keep knowledge and CLI release surfaces consistent | `check-consistency.sh` then `suno-cli npm test` | Manual tick (recommended), cap 4 |
| `suno-cli-release-candidate` | closed | Prepare the unreleased post-v0.3.0 CLI for human-authorized public release | build, tests, artifact, public contract, consistency | Manual tick, cap 4 |
| `suno-current-feature-sync` | closed | Research and repair verified current Suno feature drift across guidance and CLI | evidence matrix plus applicable tests and consistency gate | Manual tick (recommended), cap 4 |

Launch:

```text
.loop/release-readiness.md の手順に従って1 iterationだけ進めて。state は .loop/release-readiness-state.md を読んで更新して。完了なら FINAL、続行なら ITERATING で終えて。
```

```text
.loop/suno-cli-release-candidate.md の手順に従って1 iterationだけ進めて。state は .loop/suno-cli-release-candidate-state.md を読んで更新して。公開候補が整ったら FINAL、未完なら ITERATING で終えて。tag、push、npm publish、live create、browser mint はしない。
```

```text
.loop/suno-current-feature-sync.md の手順に従って1 iterationだけ進めて。state は .loop/suno-current-feature-sync-state.md を読んで更新して。証拠が揃った差分だけ修正・検証し、全候補が処理済みなら FINAL、残れば ITERATING で終えて。live create、browser mint、認証操作、tag、push、npm publish はしない。
```
