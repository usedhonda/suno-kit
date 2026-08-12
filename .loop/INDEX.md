# Loop Index

| Slug | Kind | Goal | Gate | Run mode |
| --- | --- | --- | --- | --- |
| `release-readiness` | closed | Keep knowledge and CLI release surfaces consistent | `check-consistency.sh` then `suno-cli npm test` | Manual tick (recommended), cap 4 |

Launch:

```text
.loop/release-readiness.md の手順に従って1 iterationだけ進めて。state は .loop/release-readiness-state.md を読んで更新して。完了なら FINAL、続行なら ITERATING で終えて。
```
