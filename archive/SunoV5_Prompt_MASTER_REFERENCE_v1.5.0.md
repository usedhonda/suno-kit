# 【凍結アーカイブ】Suno V5/V5.5 プロンプト裏マニュアル v1.5.0

> **このファイルは凍結された過去資料です。更新しません。**
> 現行の資料は リポジトリルートの `SunoV5_Prompt_MASTER_REFERENCE.md` と
> `skills/suno/knowledge/` 配下のナレッジ層を参照してください。

## 出自

| 項目 | 値 |
|---|---|
| 取得元 | `SunoV5_Prompt_MASTER_REFERENCE.md` の 35-1491 行 |
| 取得元コミット | `fb54dcc`（2026-04-01、当該ファイルを最後に変更したコミット） |
| アーカイブ作成日 | 2026-09-11 |
| 収録範囲 | §1 基礎編 / §2 応用テクニック編 / §3 コミュニティ発見テクニック集 / §4 V5.5 音声条件付けワークフロー / §5 Deep Research 統合ログ / 引用文献 1-81 |

## ⚠️ これは「原文そのまま」ではありません

§1・§2 は Deep Research の原文を基にしていますが、**2026-03 に `[V5.5]` 追記が挿入されています**。
挿入箇所（**取得元ファイルの行番号**）: L94-102 / L223-227 / L262-266 / L285-294 / L346-354 / L408 / L569。

したがって本ファイルの正確な性格は「**Deep Research 原文 + 2026-03 の V5.5 追記**」です。
これを単に「原文」と呼ぶと出典の偽装になるため、ここに明記します。

## ⚠️ 記述対象の世代は、もう生成に使えません

Suno は **2026-09-09 に v6 より前の全モデルを退役**させました。

> All models prior to v6 have been retired, but your songs will still be in your library
> and remain unchanged.
> — Suno 公式 v6 FAQ

本ファイルが扱う V5 / V5.5 の挙動・スライダー値・メタタグは、**当時の観測記録**です。
新規生成の手引きとしては使えません。V5.5 期に作った曲を読み解くため、
および「何が変わったか」を追うための資料として残しています。

現行世代の書き方は以下を参照:

- `skills/suno/knowledge/suno_v6_reference.md` — V6 の確定事項と、Suno が公開していない事項
- `skills/suno/knowledge/v55_to_v6_migration.md` — V5.5 の各ルールの keep / modify / demote / retire 判定
- `skills/suno/knowledge/suno_v55_reference.md` — V5.5 期のリファレンス（同じく記録として保持）

## 引用文献について

引用番号 1-81 は**振り直していません**。本文中の引用マーカーが約247個あり、
振り直すとすべて無効になるためです。

なお 8件（**19, 24, 26, 30, 37, 41, 43, 44**）は引用文献表に定義されているものの、
本文から一度も参照されていない孤児エントリです。削除せずそのまま残しています。

引用の大半は Reddit スレッド、Medium 記事、V5 期のベンダーブログです。
**これらは V5 期の主張を支える出典であり、V6 の主張の根拠にはなりません。**

---
---

## V5.5 アップデート要点 (2026-03-26)

Suno V5.5 は V5 の基盤を維持しつつ、以下の主要機能を追加・改善した。本マニュアルの V5 向け情報はすべて引き続き有効であり、V5.5 固有の補足は各セクションに `[V5.5]` タグで追記している。

| 機能 | 概要 | 対象プラン |
|------|------|-----------|
| **Voices** | 自分の声をアップロードして楽曲に使用可能。15秒〜4分のオーディオ、本人確認（verification）が必要。Audio Influence スライダーで適用度を調整。 | Pro / Premier |
| **Custom Models** | V5.5 ベースで自分の楽曲を学習させたカスタムモデルを作成（最大3モデル、最低6曲が必要）。プライベート専用、共有不可。 | Pro / Premier |
| **My Taste** | ユーザーの好みを学習し、Magic Wand が Style フィールドを自動補完する。 | 全プラン |
| **Style Personas** | V5 の Personas 機能は Voices メニュー内に統合・進化。引き続き利用可能。 | Pro / Premier |
| **音質向上** | より表現力豊かで人間らしいボーカル、全体的なオーディオ品質の改善。 | 全プラン |
| **Cover/Sample/Inspo** | 音声条件付けモードの使い分けワークフロー。Coverの逸脱時はSample全尺、メロディ固定にはInspo複数テイク。 | Pro / Premier |

---

## 1. 基礎編（裏マニュアル1 原文）



### **Suno V5 プロンプト作成の裏マニュアル：プロデューサーレベルの制御とワークフロー**

#### **I. Suno V5 プロンプト設計の基礎：V4.5からの脱却と新パラダイム**

Suno V5モデルは、オーディオ生成技術において大きな進化を遂げており、従来のバージョン、特にV4.5以前と比較して、音質（Audio Quality）とボーカルのリアリティ（Vocals）が飛躍的に向上しています [1]。V5は、「スタジオレベル」と形容されるフルレンジのバランスと最小限のグリッチを備えたクリアなミックスを提供します [1]。ボーカルは、呼吸やビブラートを含む「本物の人間らしい」発声に近づいており、プロの歌手に近い表現を可能にしています [1]。

##### **1\. V5モデルの特性と「V5パラドックス」の理解**

V5の高度な性能は、そのモデルがセクションレベルの制御により強固に追従し、長尺の曲を生成する際にもスタイルドリフト（一貫性の喪失）が大幅に減少した点に現れています [1]。しかし、この技術的洗練は、プロンプト設計における新たな課題も生み出しました。

V5の課題の一つは、特定のコミュニティの報告によれば、プロンプトが具体的でない場合、生成結果が「ジェネリックで退屈」になりやすいという点です [4]。これは、モデルがメインストリームの高品質な音楽データに強く訓練されているため、曖昧な指示（例：「Pop Song」）に対しては、最も安全で、無難な（すなわち、クリシェ的で汎用的な）ポップ構造を選びがちになる傾向に起因します [4]。

この「V5パラドックス」を克服するためには、単にジャンルをタグ付けするのではなく、「どのようにミックスされ、どのように演奏されるか」という**プロダクション指示書**を作成する義務がユーザーに生じます。高品質な出力を得るためには、年代、サブジャンル、影響元、そして具体的な音響特性を組み合わせた、極めて詳細な指示が必須となります [4]。

##### **2\. プロンプト構成の「四本柱」再定義（The Four Pillars）**

効果的なV5プロンプトの構成は、従来の基本要素をさらに高い粒度で記述する必要があります [5]。

Table 1: スタイルプロンプト設計の「四本柱」チェックリスト

| 柱（Pillar） | 要素（必須度：高） | 裏マニュアルの推奨事項（例：英語プロンプト） | 出典 |
| :---- | :---- | :---- | :---- |
| 1\. ジャンル & スタイル | 具体的サブジャンル、年代、融合 | "90s Alt-Rock with Britpop undertones," "Gospel Trap with Persona," "Dark synthwave" | [7] |
| 2\. ムード & 感情 | 楽曲全体の雰囲気、トーン | "Melancholic mood," "Uplifting and anthemic," "high tension" | [5] |
| 3\. 楽器 & プロダクション | 主要な楽器、音響特性（重要） | "Pulsing 808 bass," "Analog pad, spatial depth, tape saturation" | [7] |
| 4\. ボーカル設定 | 声質、性別、歌い方、エフェクト | "Sultry female vocals, whispery delivery," "Robotic male vocals" | [5] |

##### **3\. スタイルプロンプトの「解剖学」とプロデューサーレベルの表現**

###### **A. 理想的な4部構成テンプレートの適用**

プロデューサーレベルの制御を実現するために、スタイルプロンプトは以下の4つのセクションに明確に分割し、モデルに与える情報を構造化することが推奨されます [9]。

1. **Genre:** 具体的でニッチなサブジャンル（例：「Tech House / Trance」） [9]  
2. **Exclude:** 望まない要素（ネガティブプロンプト）。（例：「Vocals, Trap, Dubstep」） [9]  
3. **Instruments:** 主要な楽器とボーカル処理。（例：「soft female vocals; supersaw leads; pounding percussion」） [9]  
4. **Tags:** BPM、ムード、ドロップの種類、その他の付加情報。（例：「136 BPM; extended build; euphoric peak」） [9]

このテンプレートを使用することで、モデルの解釈のブレを最小限に抑え、特定の音楽的目標に焦点を当てた出力を得ることが可能になります [9]。

> **[V5.5] Style フィールドのベストプラクティス**
>
> V5.5 では、Style フィールドは**短いカンマ区切りの名詞句タグ**で記述するのが最も効果的。散文的な長文よりもタグ列挙が高いコンプライアンスを示す。
>
> - **重要な語を前方に配置**（ジャンル → BPM → キー → ムード → ボーカル → 楽器の順）
> - **120文字以内**に収めると最も安定した結果が得られる
> - 例: `city pop, 90 BPM, C major, night drive, female vocal, Rhodes, warm tape`
>
> なお「Lyrics = What（何を歌うか）、Style = How（どう鳴らすか）」の二層制御コンセプトは V5.5 でも引き続き有効。

###### **B. 核心技術：プロダクション品質タグ（ソニック形容詞）の活用**

V5のモデルは、従来のV4.5よりも音響的な詳細記述、すなわち「ソニック形容詞」に非常に強く反応することが確認されています [10]。これは、音の最終的なミキシングと音色を定義するための指示であり、V5の「スタジオ品質」を最大限に引き出すために不可欠です [1]。

例えば、単に「synth」と記述する代わりに、**音色/質感**を指示する「analog pad」や「reverb-drenched pluck」、「spectral keys」といった具体的なタグを使用します [10]。また、Lo-Fiやヴィンテージ感を強調するために、「tape saturation」や「vinyl hiss」、「lo-fi texture」といったテクスチャタグも有効です [3]。

さらに、**ミキシングと空間処理**に関するタグも重要です。V5は音の配置（空間深度）をより正確に処理できるため、「clarity (明瞭さ)」、「separation (分離度)」、「spatial depth (空間の深さ)」、「warmth (暖かさ)」、「punch (迫力)」、「stereo width (ステレオ幅)」、「analog glue compression (アナログコンプ感)」といった専門用語を組み込むことで、生成されたトラックのミキシング品質をプロレベルに近づけることができます [7]。

###### **C. 裏技：アンカーリング戦略による一貫性のロックイン**

V5で一貫性の高いVibe（雰囲気）を維持する実用的なハックとして、「アンカーリング戦略」が知られています。これは、曲の根幹となるクリティカルなスタイルやムードの用語（例：「cinematic」「emotional」）を、スタイルプロンプトの**最初と最後**の両方に配置するというものです [1]。

モデルの解釈メカニズムにおいて、プロンプトの先頭と末尾に繰り返されたキューは、そのキーワードの重みを増す効果があり、特に長い生成チェーンにおけるスタイルドリフト（一貫性の喪失）を防ぐための強力な手段として機能します [1]。

###### **D. ジャンル融合の最適化**

V5では、ジャンル融合（Fusion Genres）の安定性が大幅に向上しました [3]。V4.5では不安定になりがちだった複数のジャンルの組み合わせも、V5では「2つのジャンルペア」に限定することで、安定した音楽的で予測可能な結果が得られます [3]。例えば、「Pop \+ EDM」や「Gospel \+ Trap」、「Jazz \+ Hip Hop」といった組み合わせが推奨されます [3]。しかし、3つ以上のジャンルを重ねると、再び不安定化するリスクが高まります [3]。

#### **III. カスタム歌詞とメタタグによる構造制御の完全マニュアル**

V5における高度な楽曲制御は、Custom Lyrics入力フィールド内で使用されるメタタグ（\`\`）によって実現される「二層制御構造」に基づいています [3]。Style Promptが「音の素材とミキシング」を指示するのに対し、Custom Lyrics内のメタタグは「構成、パフォーマンス、タイミング」を直接制御します [3]。

##### **1\. メタタグの役割とV5での強化点**

V5では、メタタグがStudio機能（Remake, Rewrite, Extend）と連携した際の信頼性が大きく向上しています。特に、長尺の曲を生成する際や、特定のセクションを編集する際に、タグによる指示がより確実に尊重されます [3]。

Table 2: V4.5とV5におけるメタタグ処理挙動の比較

| 挙動 | V4.5（過去の挙動） | V5（現在の強化挙動） | 出典 |
| :---- | :---- | :---- | :---- |
| プロンプト構造化 | タグは使用可能だが、コールバックは無視されがち | **Studioがタグを尊重し、コールバックが確実に機能** | [3] |
| 感情タグ | 時折曖昧になる | **より明確な感情マッピング** | [3] |
| ジャンル融合 | [3]つ以上のスタイルで不安定化 | **2つのジャンルペアは安定し、音楽的** | [3] |
| 拡張（Extend）チェーン | 30～60秒後にスタイルドリフトが発生しやすい | **ファ less drift across multi-minute chains** | [3] |
| セクション置換 (Replace) | コーラス/ブリッジに限定 | **スムーズなトランジションでセクション全体を置換可能** | [3] |
| Personas | セクション間で一貫性がない | **曲全体で一貫したトーンメモリ** | [3] |

この比較からわかるのは、V5のモデルアーキテクチャがセクション単位での文脈（コンテキスト）を深く理解するようになったことです [3]。これにより、ユーザーは曲全体ではなく、問題のある特定のセクション（例：退屈なブリッジ）に対してのみタグを変更し、Remakeアクションを適用することで、効率的に楽曲を修正できます [2]。

##### **2\. 構造タグとダイナミック・インストラクションの埋め込み（Producer Hack）**

構造タグは、楽曲の基本構造をAIに強制します。これには、一般的な\[Intro\], \[Verse\], \[Chorus\], , \`\[Outro\]\`に加えて、EDMやダイナミックなジャンルで使用される\`\[Pre-Chorus\]\`, , , が含まれます [15]。

さらに、V5では、歌詞内に時間指定や具体的な楽器指示を埋め込む「ダイナミック・インストラクション」が強力な裏技として機能します [1]。これにより、特定のセクションの特定の瞬間に音楽的なハイライト（ソロやブレイク）を強制することができます。

* **ダイナミック・インストラクションの例:**  
  * \`\` (ブリッジで15秒間のアコーディオンソロを強制) [1]。  
  * \`\` (歪んだベースのドロップを強制) [1]。

##### **3\. ボーカル制御の精度向上タグリスト**

V5のボーカルは非常にリアルになったため、声のトーン、エフェクト、感情を細かく指定することで、その表現力を最大限に引き出すことができます [11]。

Table 3: V5対応：高度なボーカル・インストゥルメンタル表現タグ

| カテゴリ | タグ例 (English Prompt) | 目的とV5での効果 | 出典 |
| :---- | :---- | :---- | :---- |
| **構造制御 (動的)** | , , \`\` | EDMやロックにおけるエネルギーの変化を強制 [15] | [15] |
| **ボーカルスタイル** | \[raspy lead vocal\], \[whispery delivery\], \[anthemic chorus\] | 歌唱者の声質、表現方法を指定 [3] | [3] |
| **ボーカルエフェクト** | \[autotuned delivery\], \[stacked harmonies\], \[vocoder\], \[granular vocals\] | ポストプロダクション効果を指定 [10] | [10] |
| **楽器表現** | \[808 sub bass\], \[60s jangly guitar rhythm\], \[pedal steel guitar\] | ジャンル固有の楽器と奏法を指定 [15] | [15] |
| **テクスチャ/ループ** | , | ヴィンテージ感を付与し、クロスフェードの安定化を促す [3] | [3] |

#### **IV. 高度な応用技術とマルチ・ワークフロー**

##### **1\. 裏技：複数ボーカル生成の非線形ワークフロー**

Suno V5は、現時点では、一つの生成リクエストで複数の声色やペルソナを同時に生成させようとすると失敗します [20]。複数のボーカル（例：デュエット、ラッパーの交代）を成功させるためには、Studio機能を使った「セグメント化された非線形ワークフロー」が必須となります [20]。

このプロセスでは、まず**Voice 1**のスタイルで最初のセクション（コーラスまたはヴァース）を生成し、これをベースステムとします [20]。Voice 1のセクションをExtendやReplace Sectionで完成させた後、**Voice 2**のセクションを生成する際に、AIに対して「声が変わった」という強い信号を送る必要があります [20]。

* **セグメント化とシンコペーション変化の強制:** Voice 2の導入部を生成する直前で、編集画面の開始点を**正確に前のVoice 1の最後の音の直後**に設定し、新しいプロンプトで以下の変化を強制します [20]。  
  1. **ボーカルタグ:** \`\`など、性別やスタイルを明記する [20]。  
  2. **シンコペーション/音節数の変化:** Voice 1がゆっくりとした4音節/行で歌っている場合、Voice 2のパートを意図的に速い10音節/行に設定します。V5は音節数の変化をスタイルの切り替え（例：歌からラップへ）として認識しやすくなります [20]。

このように、人間がDAWで行うように、セクションごとに音源を切り替え（Extendの開始点の精密な設定）、AIに対して「ここで別の人が歌い始める」という強い信号を送ることで、複数ボーカルの共存を実現します [20]。

##### **2\. BPMとキー制御の限界とDAW補正の必要性**

BPM（テンポ）やキー（調性）の指定（例: 120 BPM, A minor [7]）は、V5でも依然として厳密な再現性に欠け、「気まぐれ」な挙動を示すことがコミュニティで報告されています [22]。特にExtend機能を使用して曲を長くした場合、テンポがドリフトしやすいという問題があります [22]。

* **BPM固定のハックと限界:**  
  1. グローバルプロンプト（Style of Music）と、各セクションノート（カスタム歌詞の上部）の両方にBPMを明記する [25]。  
  2. Studioでタイミングがブレたセクションに対して、BPM/キーを再記述し、Remakeを適用して修正を試みる [25]。

V5は音楽生成ツールとして優れていますが、テンポやハーモニーといった音楽の基礎理論の厳密な再現性には限界があるという事実を受け入れる必要があります [22]。したがって、プロレベルの音楽制作者は、Sunoの出力を「アイデアのたたき台」または「素材」とみなし、Studioでの微調整と、DAWでの精密な時間軸・周波数補正を前提とした**ハイブリッドワークフロー**を組むことが、商業的な品質を保証するために不可欠です [25]。

##### **3\. 発音と音節の強制：ホモグラフ問題へのフォネティック・スペル修正**

V5は多言語と英語の発音が向上しましたが、英語の**ホモグラフ**（同綴異義語：例 read \[reed/red\] や live \[liv/laiv\]）の誤読が発生する可能性があります [2]。

この問題への解決策は、AIに発音させたい音に合わせたフォネティック・スペル（音声的なつづり）を歌詞に記述することです [2]。

* **フォネティック修正の例:**  
  * "live" (コンサートの意図) → "lyve" [2]。  
  * "bass" (楽器の意図) → "basss" or "bahss" [2]。  
  * "tear" (泣くの意図) → "teer" [2]。

また、非英語のプロンプトでは、シンプルに保ち（例：「Emotional ballad in Spanish, piano and strings」）、歌詞は完全な文章で記述して構文を維持し、1つのセクション内では言語を統一することが推奨されます [2]。

#### **V. Suno Studioとプロフェッショナルなワークフロー**

V5 Studioの強化された編集機能は、プロンプトの不確実性を埋め、楽曲を完成させるためのプロトコルを提供します [2]。

##### **1\. Creative Control Slidersの操作術：セクション別最適設定**

V5では、以下の3つのスライダーを調整して、セクションごとの出力を微調整します [2]。特に、セクションをRemakeまたはRewriteする際に、これらの設定を戦略的に調整することが重要です [25]。

Table 4: V5 Studioワークフロー：セクション別スライダー推奨設定

| セクション | Weirdness (多様性) | Style Influence (忠実度) | 目的 | 出典 |
| :---- | :---- | :---- | :---- | :---- |
| Chorus（コーラス） | 35–45% (一貫性重視) | 70–85% (スタイル固定) | フックの安定とキャッチーさの確保 | [25] |
| Verse（ヴァース） | 40–55% (適度な変化) | 55–70% (スタイル維持) | 安定しつつもボーカルに集中させる | [25] |
| Bridge（ブリッジ） | 55–70% (高め) | 45–60% (低め) | 構成の転換、実験的なテクスチャの探求 | [25] |
| Audio Influence (Upload時) | N/A | 60–75% (リード) / 20–40% (テクスチャ) | 外部オーディオの影響度を制御 | [25] |

「Weirdness」スライダーは、一貫性が必要なコーラスでは低く保ち [25]、「Style Influence」スライダーは、プロンプトへの忠実度を維持するために高く設定します [25]。一方、ブリッジでは、構成的な転換を促すため、「Weirdness」を上げて新しいアイデアを探索することが効果的です [25]。

> **[V5.5] スライダーに関するコミュニティ発見**
>
> - **Weirdness + Style Influence を両方高く設定**すると、歌詞内のタグ（セクションタグ、ボーカル割り当て等）への追従性が向上する。タグベースの構造制御を重視する場合は両スライダーを高めに。
> - **Style Influence 70%以上**でタグ形式の Style プロンプトへのコンプライアンスが改善する。
> - **Audio Influence**: Voices 機能でカスタムボイスを使用する場合は **25%起点で+5%刻み**で調整。75%超はアーティファクト・発音崩れのリスクあり。詳細はセクション4-E参照。

##### **2\. アレンジャーの視点：楽器の重なりを防ぐヒューリスティクス**

V5は音の質は高いものの、アレンジが過剰になり「Muddy Mix（濁ったミックス）」が発生しやすいという問題があります [2]。プロの音楽制作の観点から、各セクションの楽器構成を意図的にシンプルに保つヒューリスティクス（経験則）を適用することが推奨されます [25]。

* **Verse（ヴァース）:** 中音域の楽器を最大2〜3つに制限し、ボーカルを妨げるリード楽器を排除します [25]。  
* **Pre-Chorus（プリコーラス）:** ライザーやタムフィルなど、エネルギーを持ち上げる要素を1つだけ追加します [25]。  
* **Chorus（コーラス）:** [1]つのフックとなる楽器とクリアなリードボーカルを中心に、他のパートはサポート役に徹します [25]。  
* **ネガティブプロンプトの活用:** 意図的に「no lead guitar in chorus」や「minimal low-mid pads in verse」といったネガティブな指示を埋め込むことで、パートの多すぎるアレンジを未然に防止します [25]。

##### **3\. ハイブリッドワークフロー：外部オーディオの統合**

Pro/Premierユーザーが利用可能なオーディオアップロード機能は [27]、既存のボーカルや演奏（WAVファイル）をAI生成と組み合わせるハイブリッドワークフローを可能にします [2]。

* **アップロードのベストプラクティス:**  
  * クリーンな44.1 kHz WAVを使用し、タイミングが安定していることを確認する [25]。  
  * アップロードの役割（"featured vocal/riff" or "ambient texture"）とBPM/キーを明確に記述する [25]。  
  * **Audio Influenceスライダーの制御:** アップロードを主役にしたい場合は60〜75%に、背景のテクスチャとして使いたい場合は20〜40%に設定します [25]。アップロードがミックスを支配しすぎた場合は、このスライダーを下げて「texture」としてマークすることで対応します [25]。

##### **4\. 構成破綻・テンポドリフトの修正：Studioでの最小範囲Remake戦略**

生成された曲に欠陥（フックの不一致、セクションのスキップ、タイミングのずれ）がある場合、全体を再生成するのではなく、Studio機能を用いて最小限の範囲で修正することが、クレジット効率と創造的制御の観点から最も優れています [2]。

例えば、フックが一貫しない場合、Weirdnessが高すぎるのが原因である可能性が高いです。この場合、該当するChorusセクションをRemakeし、Weirdnessを下げ、Style Influenceを上げるという局所的な戦略を適用します [25]。また、トランジションが硬い場合は、Extend機能でセクションを1〜2小節残し、プロンプトに「soft transition / no hard stop」を追加することで、スムーズな切り替わりを促します [25]。

#### **VI. トラブルシューティングとネガティブプロンプトの応用戦略**

##### **1\. ネガティブプロンプトの二重戦略**

SunoのCustom Modeで利用できる「Exclude Styles（除外スタイル）」ボックスは、特定のジャンルや楽器を確実に排除する機能ですが [28]、真の制御はこれをStyle Prompt内のネガティブフレーズと組み合わせる「二重戦略」によって達成されます [25]。

* **戦略 1: Exclude Styles（フィルター）:** ジャンルや楽器レベルの大きな要素を排除するために使用します。例えば、「electronic」（アコースティックを目指す場合）や「drums」（インストゥルメンタルでパーカッションのみを使用したい場合）などが有効です [29]。特にMetalやTrapで意図しない「flute」が入るケースなど、特定の楽器の混入を防ぐのに役立ちます [31]。  
* **戦略 2: Style Prompt内ネガティブフレーズ（バランス補正）:** ミックスやプロダクションレベルの微細な指示を行うために使用します。例として、「no lead guitar in chorus」や「minimal low-mid pads in verse」、「natural vocal tone; avoid heavy processing」といった指示をStyle Promptに埋め込むことで、音の濁りや意図しないリード楽器の出現を防ぐことができます [25]。

> **[V5.5] Exclude フィールドのベストプラクティス**
>
> - Exclude は **2〜5 項目**に絞る。多すぎると逆効果になる場合がある。
> - Style フィールド内での "no X" 記述は**裏目に出る**ことがある（"no flute" と書くと "flute" が強調されてしまう）。否定はExclude フィールドに集約する。
> - コミュニティ報告: Exclude を**すべて削除**すると、出力品質が劇的に向上するケースがある。思い通りの結果が得られない場合、Exclude を空にして試す価値あり。

##### **2\. V5の「癖」への対処法**

V5はR\&Bやポップミュージックの構造にバイアスを持つ傾向があり、プロンプトに関わらず意図しない要素（ハミング、コーラス、特定の楽器）が出現することがあります [23]。

* **意図しない要素の排除:** 「Exclude Styles」で「choir」や「female humming」を明示的に排除します [23]。また、Weirdnessスライダーを低く設定することで、モデルがトレーニングデータ外の創造的な逸脱をするのを防ぎます [25]。  
* **ボーカル性別の強制:** Style Promptで「Vocals: Male」と指定しても、Exclude Stylesで「female vocals」を排除しても、V5が無視するケースが報告されています [23]。この場合、複数の試行を重ねるか、Custom Lyrics内でより具体的なトーンタグ（例：「Deep male baritone, raw delivery」）を繰り返し使用して、AIを誘導する必要があります [11]。

##### **3\. 歌詞が歌われない、セクションがスキップされる問題の解決**

V5が歌詞を無視したり、特定のセクション（BridgeやOutro）をスキップしたりする問題が発生することがあります [32]。

* **原因と修正:**  
  * **複雑なプロンプトやメタタグ:** 過度に複雑なプロンプトや実験的なメタタグはAIを混乱させる可能性があります。プロンプトを簡素化し、必須要素のみに絞ります [33]。  
  * **競合する指示:** Style PromptとCustom Lyrics内の指示が矛盾していないか確認します [33]。  
  * **構造タグの誤用:** 構造タグ\[Verse\], \[Chorus\]は、歌詞の行や音節数を考慮して配置する必要があります。コーラスとヴァースの音節数を意図的に変えることで、AIがセクションの違いを認識しやすくなります [21]。  
  * **バグへの対処:** Style Promptが歌詞として歌われてしまうバグが発生した場合は、\[ \]内が歌詞と接触していないか、または長すぎる指示になっていないかを確認し、新しい行で区切るなどの対策を試みます [34]。

##### **4\. [V5.5] 「コマンドテキストが歌われる」問題への対策**

Lyrics フィールドに指示文や命令文（例: "Write a verse about love" や "ここからサビにしてください"）を入れると、Suno はそのテキストをそのまま歌詞として歌ってしまう。これは V5/V5.5 共通の仕様であり、バグではない。

* **絶対禁止**: Lyrics フィールドに命令文・説明文を書かないこと。「Write a verse about...」「次にコーラスを...」等はすべて歌われる。
* **解決策**: 構造タグ `[Verse]`, `[Chorus]`, `[Bridge]` 等を使い、セクションの指示はタグ内に収める。
* **[V5.5] アノテーションタグ形式**: セクションごとの品質ヒントを付与する場合は、タグ内に注釈を追加する。
  * 例: `[CHORUS - Explosive, thick harmony]`
  * 例: `[Verse 2 - Whispered, intimate]`
  * この注釈部分は歌われず、生成の方向性ガイドとして機能する。

#### **VII. 商用利用権と著作権の法的側面（日本市場における留意点）**

プロのクリエイターがSuno V5を商用利用する上で最も重要なのは、法的側面の理解です。

##### **1\. プラン別利用権の差異**

Sunoの利用規約に基づき、楽曲の権利はプランによって明確に区別されます [35]。

| プラン | 楽曲の所有権 | 商用利用権 | 制限事項 |
| :---- | :---- | :---- | :---- |
| **Basic (無料)** | Sunoが所有 | 非商用利用のみ | 収益化不可。無料期間に作成した楽曲は、後から有料プランに変更しても商用利用権は付与されない [36]。 |
| **Pro / Premier (有料)** | ユーザーが所有 | 商用利用ライセンスを付与 | ユーザーは曲の販売、ストリーミング配信（Spotifyなど）、収益化が可能 [35]。 |

有料プランの購読者は、Sunoから商業利用ライセンスを付与され、「曲を所有する」ことになります。これにより、第三者の商業活動を妨げられることなく、ストリーミングサービスへの配信や収益化が可能です [35]。

##### **2\. AI生成音楽の著作権：現行法と法的保護戦略**

有料プランの購入は「商業活動の許可証」ではありますが、「著作権の保証書」ではありません [35]。AI生成物に対する著作権法は地域によって異なり、現在も法整備が進んでいる途上にあります [36]。多くの法的な解釈では、著作権は人間の創作活動に与えられる権利であり、純粋なAIの生成部分が自動的に著作権保護の対象となるか否かは曖昧です [35]。

この法的曖昧さに対処し、法的保護の可能性を最大化するためには、クリエイターが「創造的制御」を最大限に行使していることを証明するワークフローが重要となります [38]。

* **法的保護戦略としてのプロンプト技術:** ユーザーがプロンプト、歌詞、構造、アップロードした音源を通じて「創作意図」と「制御」を強く示した作品は、純粋なAI任せの作品よりも法的に保護される可能性が高まります [38]。高度なプロンプト技術（カスタム歌詞、ハイブリッドアップロード、Studio編集）は、単なる音質向上だけでなく、**法的に保護されやすい要素を意図的に組み込む**ための重要な戦略と位置づけられます [38]。  
* **ステム利用のプロトコル:** V5のマルチステム（最大12ステム）エクスポート機能は、最終的な商業品質を達成するために不可欠です [2]。ステムをDAWに持ち込み、外部のプロセッサ（EQ, コンプレッサー, リミッター）を使用してマスタリングを行うことで、Sunoの出力では実現できない最終的なラウドネスと音響調整を行います [25]。これにより、楽曲は商業的な品質基準を満たし、最終的な制作プロセスにおける人間の介入と制御の度合いを明確に示すことができます [25]。

##### **3\. リリースに向けた最終的な品質管理とデリバラブル**

商用リリースを念頭に置く場合、以下のデリバラブル（納品物）のセットを準備する必要があります [25]。

* フルミックス WAV (Full mix WAV) [25]  
* インストゥルメンタル (Instrumental) [25]  
* アカペラ (A cappella) [25]  
* パフォーマンス/TVミックス（リードアドリブなし） [25]  
* マルチステム (Multi-stems): DAWでのマスタリング/編集に必要。 [25]

最終的な品質管理（QC）として、コーラスの一貫性、低音量およびモノラル再生での聴取可能性、およびトランジションのスムーズさを確認することが、プロフェッショナルな仕上げとして求められます [25]。

#### **結論と推奨事項**

Suno V5は、AI音楽制作を「アイデア生成」の段階から「プロフェッショナルなプロダクション」の段階へと引き上げました。しかし、その高性能を引き出すためには、ユーザーはもはや単なる「ユーザー」ではなく、「プロダクションの指揮者」としての役割を担う必要があります [2]。

本マニュアルで詳述した高度なプロンプト技術は、V5モデルの**汎用的なバイアス**を打ち破り [6]、意図した通りのユニークで一貫性のある楽曲を生成するための必須戦略です。

##### **アクション可能な推奨事項**

1. **プロンプトの構造化:** スタイルプロンプトは必ず「Genre, Exclude, Instruments, Tags」の4部構成テンプレートを採用し [9]、\*\*ソニック形容詞（例: spatial depth, tape saturation）\*\*を組み込んで、ミキシング品質を直接指示すること [7]。  
2. **一貫性の確保:** クリティカルなスタイル要素をプロンプトの最初と最後に繰り返す**アンカーリング戦略**を適用し [1]、長尺生成時のスタイルドリフトを最小限に抑えること [3]。  
3. **セクション制御の徹底:** Custom Lyrics内のメタタグを構造制御の主軸とし、\`\`のような**ダイナミック・インストラクション**を駆使して、曲のハイライトを強制すること [1]。  
4. **ハイブリッドワークフローの導入:** BPM/キーの厳密な制御が困難なため [22]、商業利用を目指す作品については、StudioでのRemake戦略に加えて、ステムをDAWに持ち込み、テンポ補正や最終マスタリングを人間が行う**ハイブリッドワークフロー**を前提とすること [25]。  
5. **リスク管理:** 複数ボーカルの生成には、セグメント化とシンコペーション変化の強制による**非線形ワークフロー**を採用し [20]、誤読されやすい英語のホモグラフには**フォネティック・スペル修正**を施すこと [2]。これにより、生成プロセスにおける創造的制御の度合いを高め、法的保護の可能性を最大化すること [38]。

##### **[V5.5] 推奨プロダクションワークフロー: Extend / Replace Section 活用**

V5.5 では、長い曲を一発で生成するよりも、段階的に構築する方が安定した結果を得られる。

1. **短い曲（2分程度）をまず生成**する。コーラスやメインフックを含むコアセクションに集中。
2. **Extend** で前後にセクションを追加し、フル尺に伸ばす。
3. **Replace Section** で特定パートのみを差し替え・修正する。

この「短く生成 → Extend で拡張 → Replace で修正」のサイクルが、一発で長尺を狙うよりも遥かに安定し、クレジット効率も良い。


## 2. 応用テクニック編（裏マニュアル2 原文）

### 2-A. Double-Layer構造補遺

#### Suno V5 ダブルレイヤー運用ルール（YAML正／歌詞ミラー）



###### 1A. Styleフィールド運用（Suno専用・最大1000文字）

###### Styleサンプル：J‑Pop × Smooth Jazz（ユーザー提示要素の反映）
以下の要素から**1000文字以内のStyle**へ整形する例です。

**Given bullets**
- Genre: A blend of J-Pop’s catchy melodies and Smooth Jazz’s mellow grooves, combining upbeat rhythms with sophisticated harmonic textures  
- Mood: Balanced, introspective, warm, subtly energetic  
- Vocal: Female Solo with clear, expressive articulation and nuanced emotional delivery  
- Instrumentation: Centered on Piano, Rhodes electric piano for smooth, warm tones, and String Quartet providing rich harmonic layers and gentle dynamic swells  

**Style（英語・約700–900 chars）**
J‑Pop meets Smooth Jazz: upbeat yet unhurried, with catchy top‑line hooks riding a mellow pocket. Piano and Rhodes set a warm, silky bed; a string quartet adds lush harmonic layers, gentle swells, and elegant counter‑lines. Keep the groove tight and lightly syncopated; favor soft attack, controlled dynamics, and tasteful space between phrases. Female solo vocal—clear, expressive, and emotionally nuanced—leads with articulate diction; use subtle breaths, light vibrato, and occasional close‑harmony doubles for lift. Choruses should bloom with a polished sheen while staying graceful, never brash; intros remain concise, transitions smooth and musical. Harmony leans on extended tones and color voicings (9ths/11ths), resolving with sophistication rather than spectacle. Mix vision: clean and intimate front‑center vocal, Rhodes and piano in a balanced stereo field, strings supportive not overpowering, rounded low‑end, airy high‑end without glare. Avoid aggressive distorted guitars or EDM supersaws; keep reverbs short to medium with natural room feel. Overall vibe: balanced, introspective, warm—subtly energetic and inviting.

**ワンライナー変換ルール（Bullet → Style）**
- `Genre` → 冒頭の1文で「○○ meets ○○」＋テンポ感・ノリを明示  
- `Mood` → 形容詞を3–5語で**トーン宣言**（balanced/warm等）を本文に散らす  
- `Vocal` → 声質・表現・テクニック（articulate, light vibrato, doubles）を具体語で  
- `Instrumentation` → 土台（Piano/Rhodes）＋彩り（Strings）の**役割**を動詞で記述  
- 最後に **Mix vision / Avoid** を1–2文で締める（1000字内）


**Sunoは「Style」欄を別入力として受け付けます。** 本ガイドのYAMLは「設計図」ですが、**実際の生成では「Style」が最も強く効く**場面が多いため、以下の方針で運用します。

- **Styleは別枠提出**：YAMLの`project / groove / mix / mood / references / vocal tone要旨`を要約・拡張して**Styleに書く**。  
- **歌詞は歌詞、Styleは指示文**：歌詞欄には歌詞＋短いタグのみ。Styleに**詳細な文言（英語推奨）**を記述。  
- **長さ目安**：**600–900文字（最大1000文字）**。過度に短いと効果が薄く、冗長だと要点が希釈。

###### Styleに含めるべき内容（推奨順）
1) **Genre / Substyle / Era vibe**（例: UK acid‑jazz, 90s club funk）  
2) **Groove & Tempo feel**（tight pocket, half‑time drops, syncopated ghost notes）  
3) **Instrumentation & arrangement**（Rhodes 7/9/11, finger bass, short horn tags, sax feature）  
4) **Vocal concept**（F1: slim‑husky agile lead / M1: soft baritone harmonies, call‑and‑response）  
5) **Hook & structure cues**（big stacked choruses, short intro, 12s sax solo in bridge）  
6) **Mix vision**（clean, wide image, short room, crisp transients, lead‑forward）  
7) **Hard constraints / avoid**（no distorted guitars, no EDM supersaw, restrained reverb tails）  
8) **Reference vibe（固有名を避けつつ比喩）**（e.g., “90s London acid‑jazz club energy”）

###### 書き方の原則
- **宣言口調で簡潔に**：長い段落より**箇条書き or 短文列挙**が効く。
- **否定指定は短く強く**：Avoidは**3点以内**。
- **”歌われ得る文”は入れない**：歌詞側に回す。
- **数値は控えめ**：諸秒数はYAMLや歌詞タグのCUE参照に任せ、Styleでは**抽象的に**。
- **[V5.5] タグ列挙形式を優先**：短いカンマ区切りの名詞句タグ（120文字以内）が最も高いコンプライアンスを示す。重要語を前方に配置（ジャンル → BPM → キー → ムード）。散文スタイルも有効だが、タグ形式の方が安定。

###### Styleテンプレ（英語・約700–900 chars）
```
UK acid-jazz / club funk with a tight pocket; brisk but unhurried feel. Rhodes 7/9/11 voicings, melodic finger bass, dry tight drums with syncopated ghost notes, short horn tags, and tasteful sax feature. Female lead is slim-husky, agile phrasing with airy top; male baritone supports with low harmonies and occasional doubles for call-and-response. Keep intros short and impactful; build into big, stacked choruses that feel uplifting and clean. Bridge introduces a brief halftime pocket and features a concise sax solo (~12s), then return with heightened ad-libs and a strong final hook. Mix vision: clean and wide image, crisp transients, minimal room, lead-forward vocals, balanced horn presence, and punchy but controlled low end. Avoid distorted guitars, EDM-style supersaws, and long cavernous reverbs. Overall vibe: modern polish with a '90s London acid-jazz club energy—danceable, musical, and sophisticated.
```

###### Style出力の運用ルール
- **提出物は常に二本立て**：
  - **Style**（上のテンプレに準拠し、最大1000文字で濃密記述）
  - **Lyrics**（本ガイドのタグ設計に従う）
- YAMLの`cues/roles/rules`は**Styleにコピペしない**（DRY）。必要要旨のみ要約。
- A/B比較では**Styleのみ差し替え**て効果検証可能にする（seed固定）。

###### 1B. META+Lyricsダブルエントリー実装テンプレ

Suno v5のCustomモードは`Style Prompt`と`Custom Lyrics`を別個に解析し、両方で同じ制御情報を与えることでIntelligent Arrangement EngineとPersistent Memory（声質・編成の記憶）が安定して発火します [39][40]。以下のテンプレートは、**Style＝ミックス指示**・**Lyrics＝構造と歌詞**を分離しつつ、Lyrics側の冒頭にMETAブロックを置いて二重化する最終形です。

```
# META (hints; do not sing)
version: v5
meta:
  tempo: 92
  key: "F# major"
  signature: "4/4"
  form: "riff-like refrain hook, verse→pre→chorus→post-chorus; instrumental break"
  vibe: "90s UK acid-jazz / funk-pop; tight pocket; Rhodes/clav; syncopated drums"
language: "Japanese"
vocals:
  parts:
    - { id: F, name: "Female Lead", gender: female, tone: ["airy","smooth","supportive"] }
    - { id: M, name: "Male Harmony", gender: male, tone: ["warm","rhythmic","confident"] }
  rules:
    - "syncopated 16th-note phrasing; refrain syllables lock to kick/clav groove"
sections:
  - { name: Refrain, vocals: { lead: M, harmony: { F: "soft oo/ah pads; double last bar" } } }
  - { name: Verse [1], vocals: { lead: M, harmony: { F: "low oohs; sparse" } } }
  - { name: Pre-Chorus, vocals: { lead: M, harmony: { F: "rising thirds" } } }
  - { name: Chorus, vocals: { lead: M, harmony: { F: "stacked highs on hook" } } }
  - { name: Post-Chorus, vocals: { lead: M, harmony: { F: "echoing ad-libs" } } }
negative:
  - "no distorted guitars"
  - "no EDM supersaws"
notes:
  - "keep bass/clav pocket steady; refrain syllables sit on downbeats"
=== LYRICS START (do not sing tags) ===
[Refrain]
ダンダダン ダンダダン ダンダダン ダンダダン ダンダダン
ダンダダン ダンダダン ダンダダン ダンダダン ダンダダン
...
=== LYRICS END ===

# Style
- BPM: 92
- Key: F# major
- Genre: 90s UK acid-jazz / funk-pop with neo-soul colors
- Mood: energetic, slick, groovy, slightly playful
- Vocal: Male lead with tight rhythmic delivery; airy female harmonies stacking on hooks; light ad-libs post-chorus
- Instruments: Clav/Rhodes combo, warm finger bass, dry tight kit with syncopated ghost notes, subtle wah guitar comps, short brass stabs; avoid distorted guitars and long cavernous reverbs
```

**テンプレ運用時の注意点**

- 冒頭に`do not sing`を明示し、Style文が歌詞として歌われる既知バグを防ぎます [12][23]。
- METAとStyleは**生成に寄与する情報だけ**に絞ります。参照URLや背景メモは、ローカルのノート（Git管理外）で管理し、プロンプトの文字数を節約します [47][49]。
- Style欄はミックス観点だけを箇条書きにし、METAと同じ要素（テンポ・キー・避けたい要素など）を二重化しておくと、Remaster Variation Strengthを高く設定しても意図が崩れにくくなります [40][45]。
- Workspacesごとにこのテンプレをプリセット化し、ジャンル/ボーカル別のMETAを複製して使うと、Persistent Memoryのチューニングが楽になります [48][49]。





### **Suno V5 プロンプト裏マニュアル：プロデューサーレベルの制御と実践ワークフロー**

Suno V5は、AI音楽生成を「スタジオプロダクション」のレベルに引き上げましたが、そのポテンシャルを引き出すには、ユーザーが「プロデューサー」として詳細かつ構造化された指示を与える必要があります [1]。あいまいな指示（例: "Pop Song"）は、V5のトレーニングデータの傾向により、**ジェネリックで面白味のない**結果を生み出しがちです [4]。

#### **I. V5プロンプト設計の「プロダクション指示書」**

効果的なV5プロンプトは、単語の羅列ではなく、まるでDAWプロジェクトの設計図のように、明確に構造化された4部構成で記述します。

##### **1\. 基礎構造：プロンプトの「YAML的」4部構成テンプレート**

プロンプトは、以下の4つのセクション（キー）に分けて記述することで、AIの解釈のブレを最小限に抑えます 。

| 構成要素（キー） | 目的と制御 | 具体的な英語記述例 | 出典 |
| :---- | :---- | :---- | :---- |
| **Genre & Era** | 音楽的土台、年代、BPM、キーを定義。 | 90s Alt-Rock with Britpop undertones, Progressive Trance, 136 BPM, C minor |  |
| **Exclude** | 望まないスタイルや楽器を確実に排除する（ネガティブプロンプト）。 | Vocals, Trap, Dubstep, Flute, female humming, choir |  |
| **Instruments & Vox** | 使用楽器、ボーカルスタイル、**音響特性**を指示。 | raspy female vocals; supersaw leads; sub-heavy kick; muted trumpet |  |
| **Tags & Mix Notes** | ムード、エフェクト、ミキシング調整（最重要）。 | cinematic; stereo width; spatial depth; tape saturation |  |

**実践例：プロデューサーレベルの構造化プロンプト**

Genre: Deep House / Tech House, 126 BPM, hypnotic groove  
Exclude: Dubstep, Trap, Rock  
Instruments: dry punchy kick; warm analog pad; minimal chords; crisp hats; subtle vox chops  
Tags: low-swing; late-night vibe; clarity; spatial depth; loop-friendly

##### **2\. 核心技術：プロダクション品質タグ（ソニック形容詞）の活用**

V5の「スタジオ品質」を最大限に引き出すためには、音の質感やミキシングに関する「ソニック形容詞」の記述が不可欠です 。これらのタグは、音の最終的なミキシング品質を向上させます 。

| カテゴリ | タグ例 (English Prompt) | V5での効果（ミキシング/音色） | 出典 |
| :---- | :---- | :---- | :---- |
| **音色/質感** | analog pad, reverb-drenched pluck, spectral keys, granular vocals | 楽器の音色やテクスチャを具体的に指定し、リアリティを向上 |  |
| **ヴィンテージ感** | tape saturation, vinyl hiss, lo-fi texture | 温かみやレトロな質感、ノイズを付与する [3] | [3] |
| **ミキシング** | clarity, separation, spatial depth, warmth, punch, stereo width | 音の明瞭度、空間の深さ、迫力、ステレオ広がりを指示 |  |
| **特殊効果** | autotuned delivery, stacked harmonies, vocoder, gated percussion | ボーカルやパーカッションのポストプロダクション処理を指定 |  |

##### **3\. 裏技：アンカーリング戦略による一貫性の固定**

曲の根幹となるスタイル用語やムード（例：cinematic, emotional）を、スタイルプロンプトの**最初と最後**の両方に配置します 。これは、AIがプロンプトの先頭と末尾に繰り返されたキューを優先的に解釈し、長時間の生成におけるスタイルドリフトを防ぐ強力な手段となります 。

**実践例：アンカーリングプロンプト**

Cinematic outlaw country, bluesy pedal steel, raw and emotional vocal... cinematic southern soul

##### **4\. ジャンル融合の最適化と具体例**

V5は**2つのジャンルペア**の融合において高い安定性を持ちます [8]。3つ以上のジャンルを重ねると、結果が不安定になるリスクが高まります [8]。

| 成功したジャンルペア | 具体的なプロンプト例 | 出典 |
| :---- | :---- | :---- |
| **Gospel House** | Gospel House, female choir vocals, supersaw drop, high tension build | [8] |
| **Nu Metal Trap** | Nu Metal Trap, heavy distortion, pulsing 808 bass, glitched percussion | [10] |
| **Trashcore Cumbia** | Trashcore metal cumbia, danceable ska rhythm, comedic vibe | [11] |
| **Synthwave Fusion** | Dark Synthwave / Electro, 100-115 BPM, analog bass, tape delay, cinematic atmosphere | [12] |

#### **II. カスタム歌詞とメタタグによる「非線形制御」**

Custom Lyrics内のメタタグ（\`\`）は、V5 Studio機能と連携し、楽曲の構成、パフォーマンス、タイミングを直接制御する「二層制御構造」の核です [4]。

##### **1\. ダイナミック・インストラクションの埋め込み（高度な制御）**

V5は、歌詞内の特定の位置に時間指定や楽器のハイライトを強制する「ダイナミック・インストラクション」に強く反応します 。

* **ダイナミック・インストラクションの例:**  
  * \[Verse 1\] Soft vocals rise (ブリッジで15秒間のアコーディオンソロを強制) 。  
  * \`\` (歪んだベースのドロップを強制) 。  
  * \`\` (ギターソロを強制) 。

##### **2\. 発音と音節の強制：ホモグラフ問題への対策**

V5でも、英語の**ホモグラフ**（同綴異義語、例：live）の誤読が発生する可能性があります [2]。この問題を解決するため、歌詞を意図的に**フォネティック・スペル**（音声的なつづり）で記述する裏技が有効です [2]。

また、AIがセクションの違いを認識しやすくするために、**音節数の変化**を利用します。ヴァースとコーラスで歌詞の音節数を意図的に大きく変える（例：遅い4音節/行 $\\rightarrow$ 速い10音節/行）と、AIはセクションの切り替わりをより明確に認識しやすくなります 。

Table 5: 英語ホモグラフへのフォネティック修正

| 単語 (意図) | 誤読リスク | 修正スペル (Optimized Spelling) | 出典 |
| :---- | :---- | :---- | :---- |
| live (コンサートの意図) | liv (住む) | lyve | [2] |
| bass (楽器の意図) | base (基礎) | basss or bahss | [2] |
| tear (泣くの意図) | tare (引き裂く) | teer | [2] |

#### **III. Studioとハイブリッドワークフロー：プロの編集戦略**

V5 Studioの機能（Remake, Rewrite, Extend）は、プロンプトの不確実性を埋め、局所的な修正を可能にします 。

##### **1\. Creative Control Slidersの戦略的運用**

Weirdness（多様性）とStyle Influence（忠実度）のスライダーは、セクションの目的に合わせて戦略的に調整します 。[V5.5] Weirdness と Style Influence を両方高くすると歌詞タグへの追従性が向上する。Audio Influence は Voices 使用時に **25%起点+5%刻み**で調整（75%超は非推奨。詳細はセクション4-E参照）。

Table 6: V5 Studioワークフロー：セクション別スライダー推奨設定

| セクション | Weirdness (多様性) | Style Influence (忠実度) | 目的と実践例 | 出典 |
| :---- | :---- | :---- | :---- | :---- |
| Chorus（コーラス） | 35–45% (低め) | 70–85% (高め) | **フックの安定**と一貫性の確保。Remake時も設定を固定 [13]。 | [13] |
| Bridge（ブリッジ） | 55–70% (高め) | 45–60% (低め) | **構成の転換**、新しいアイデアや実験的なテクスチャの探求 [13]。 | [13] |
| Audio Influence (Upload時) | N/A | 60–75% (リード) / 20–40% (テクスチャ) | 外部オーディオの影響度を制御。 | [13] |

##### **2\. 裏技：複数ボーカル生成の非線形ワークフロー**

Suno V5は、一つのリクエストで複数の声色を同時に出すのが苦手です 。デュエットやラッパーの交代を成功させるためには、Studioを使った「セグメント化された非線形ワークフロー」が必須です 。

1. **Voice 1でベースを生成しロックする**。  
2. **Voice 2の導入部で強制切り替え（スマートカッティング）**：Studioで新しいセクションの開始点を**前のVoice 1の最後の音の直後**に正確に設定します [15]。  
3. **強い信号の送信:** 新しいセクションのCustom Lyricsプロンプトで、**ボーカルタグ**（例: \`\`）と**音節数の変化**の両方を強制することで、AIに声の切り替えを認識させます 。

##### **3\. BPM/キー制御の限界とDAW補正の必要性**

BPMやキー（調性）の指定は、V5でも依然として厳密さに欠けます 。

* **BPM固定のハック:** BPMとキーをグローバルプロンプトと、**各セクションノート**の**両方**に明記します 。  
* **DAW補正の前提:** 商業的な品質を保証するためには、Sunoの出力をDAWに持ち込み、ステムをベースにテンポとハーモニーの精密な補正を行う**ハイブリッドワークフロー**が不可欠です 。

##### **4\. アレンジャーの視点：ミックスの濁り（Muddy Mix）防止**

V5はアレンジが過剰になりやすいため [14]、以下の経験則（ヒューリスティクス）を適用し、パートの重なりを防ぎます 。

* **Verse（ヴァース）:** 中音域の楽器を最大2〜3つに制限し、ボーカルを妨げるリード楽器を排除します 。  
* **Chorus（コーラス）:** [1]つのフック楽器とクリアなリードボーカルを中心に据え、他のパートはサポート役に徹します 。  
* **ネガティブプロンプトの応用:** Style Prompt内に「no lead guitar in chorus」や「minimal low-mid pads in verse」といった指示を埋め込みます 。

#### **IV. トラブルシューティングと商用利用の最終プロトコル**

##### **1\. トラブルシューティング：構造破綻とノイズの除去**

| 症状 | 原因の可能性 | 修正戦略（In-Suno Fix） | 出典 |
| :---- | :---- | :---- | :---- |
| Hookが一貫しない | ChorusのWeirdnessが高すぎる | RemakeでChorusを修正。Weirdness $\\downarrow$, Style $\\uparrow$で固定 [13]。 | [13] |
| 意図しない要素の混入 | V5のポップ/R\&Bへのバイアス | Exclude Stylesにfemale humming, choir, fluteなどを明示的に追加 。 |  |
| 歌詞が歌われない | プロンプトが複雑すぎる/競合 | Style Promptを簡素化し、\[ \]タグの前後を改行で区切る 。 |  |
| Style Promptが歌詞として歌われる | \[ \]タグの配置ミス、または歌詞とタグが接触 | タグが歌詞と接触していないか確認し、新しい行で区切る [16]。 | [16] |
| 構成のスキップ | BridgeやOutroのタグが無視される | 該当セクションの前に\`\`タグを挿入し、その後Remakeを試みる 。 |  |

##### **2\. 商用利用権と法的保護戦略**

Pro/Premierプランで作成した楽曲には、商業利用ライセンスが付与されます [17]。

* **法的保護戦略:** AI生成音楽の著作権は法的に未確定なため、**高度なプロンプト構造、ステムのDAW編集、Hybrid Workflow**を通じて「創造的制御」を強く行使した証拠を残すことが、将来的な法的保護の可能性を最大化します [18]。

##### **3\. ステムエクスポートとDAW補正（Final Mix）**

Pro/Premierユーザーは最大12トラックのマルチステムをエクスポートできます [20]。商業利用では、Sunoの出力では不十分な**ラウドネスと周波数バランス**をDAWで修正することが必須です 。

* **最終QCチェックリスト:**  
  1. ステムをDAWに持ち込み、テンポドリフトを修正（ワープ機能などを使用） 。  
  2. Sunoのミックスで埋もれがちな**ハイハットや高周波数帯域**をEQで持ち上げ、クリアリティを向上させる 。  
  3. 外部のプロセッサ（コンプレッサー、リミッター）を使用して、商業的なラウドネス基準を満たすよう最終マスタリングを行う [13]。  
  4. 最終納品物として、フルミックスWAV、インストゥルメンタル、アカペラ、マルチステムを準備する [13]。


---

## 3. コミュニティ発見テクニック集（Community-Discovered Techniques）

本セクションは、Reddit、Medium、個人ブログ等のコミュニティで発見・検証されたテクニックのみを収録しています。公式ドキュメントに記載されている一般的なマニュアル情報は除外しています。

---

### 3-A. V5専用：Producer's Prompt ハイブリッドモデル

> **発見元**: JG BeatsLab, Medium (James 99)

#### Tag Soupを避ける

**発見:**
V5では、タグを増やすほど出力が悪化する（"prompt fatigue"）。50個のブラケットをスパムすると、ジェネリックなアレンジ、ロボット的ボーカル、10秒の「ハルシネーション」クリップが発生する。

**ルール:**
V5は**Director**を求めている。データ入力係ではない。曲のアーク、歌手の感情、楽器のナラティブを伝える。

#### 4-7 descriptorsの法則

**発見:**
- 少なすぎる → ジェネリック出力
- 多すぎる → 混乱した出力
- **4-7 descriptors**が「スイートスポット」

**テンプレート:**
```
❌ "pop song about love"
❌ "upbeat indie folk singer-songwriter acoustic guitar strumming campfire vibes warm vocals authentic emotion sunset summer breeze..."
✓ "indie folk, acoustic guitar, warm female vocals, 95 BPM, nostalgic summer vibe"
```

---

### 3-B. 構造制御の裏技

> **発見元**: Medium (James 99), Plain English

#### Bracket Theory（5000曲以上の検証結果）

**発見:**
構造タグ（`[Verse]`, `[Chorus]`等）は**Styleプロンプトより10倍強力**。AIはジャンルを「聞く」のではなく、歌詞ボックスを「読む」。この構文でソロ、ビートドロップ、無音を強制できる。

**テンプレート:**
```
[Verse 1]
（歌詞）
[Instrumental Break]
[Guitar Solo - 8 bars]
[Drop]
[Silence - 2 beats]
[Chorus]
（歌詞）
```

#### 15秒ビルディングブロック法

**発見:**
トップ1%のクリエイターは2分の曲を一気に生成しない。**15秒のビルディングブロック**を生成する。

**ワークフロー:**
1. 15秒のコーラスを生成
2. 満足するまでリメイク
3. 前後にExtend
4. 各セクションを個別に調整

#### Dynamic Contrast Technique

**発見:**
プロの音楽には動的コントラスト（微妙な変化）がある。プロンプトで動的変化をマッピングすると劇的に改善。

**テンプレート:**
```
"Begin with minimalist instrumentation and quiet vocals,
gradually introducing layers of harmonies in verse2,
then explode into a full arrangement at chorus"
```

---

### 3-C. 音響効果の隠しコマンド

> **発見元**: Jack Righteous, Suno Wiki, WokeWaves

#### アスタリスク効果（`*effect*`）

**発見:**
アスタリスクで囲んだ単語は「効果音」として解釈される。

**テンプレート:**
```
*gunshots*      → 銃声
*thunder*       → 雷鳴
*rain*          → 雨音
*café ambience* → カフェの雑音
*crowd cheering* → 歓声
*vinyl crackle* → レコードノイズ
```

**スタック可能:**
```
"A soft ambient track with *wind sounds* and *soft raindrops*"
```

#### 大文字ブラケット法（`[ALL CAPS]`）

**発見:**
大文字+ブラケット = 「これは歌詞ではない」という指示

**テンプレート:**
```yaml
# Style
"80s synthwave, [THUNDER CLAP], [RAIN]"

# Lyrics
[Intro]
[DISTANT THUNDER]
きみを まっている
```

#### ライブ版ハック

**発見:**
「ライブ録音」風の音源を生成できる。

**テンプレート:**
```yaml
# Style
"Live recording at a concert"

# Lyrics
[Intro: Live Crowd Cheering]
[Stage Ambience]
[Verse 1]
（歌詞）
```

---

### 3-D. ボーカル制御の裏技

> **発見元**: JG BeatsLab, CometAPI

#### Vocal Anchor Method

**発見:**
歌手を「自分のレーン」に留める方法。プロンプト冒頭でボーカルを固定する。

**テンプレート:**
```
Female lead, airy tone, 120 BPM, verse-chorus-verse-chorus-bridge-outro

[Verse 1]
（歌詞）
```

#### Negative Space Technique

**発見:**
AIを「黙らせる」方法。特定の瞬間に楽器を止めさせる。

**テンプレート:**
```
[Verse 2]
[Drums stop]
ここで しずかに
[Drums return]
（歌詞続き）
```

#### 句読点によるマイクロポーズ

**発見:**
Sunoは句読点を「息継ぎ」として解釈する。

**テンプレート:**
```
きみを, おもうとき...    → カンマで軽く切り、...で余韻
あいが- ここに- ある      → ダッシュでリズミカルに
ああ ああ ああ            → スペースで各音を分離
```

---

### 3-E. プロンプト構造の発見

> **発見元**: Plain English, Reddit分析

#### Top-Anchor テクニック

**発見:**
プロンプトの**最初の20-30語が最も影響力がある**。ここにボーカル役割、BPM、構造を1行でまとめる。

**テンプレート:**
```
Female lead, 120 BPM, verse-chorus-verse-chorus-bridge-outro

[Verse 1]
（歌詞）
```

#### 6-12音節ルール

**発見（Reddit分析）:**
70%の初回生成が3回以上の再生成を必要とする。原因の多くは音節数の問題。**6-12音節/行**を守るとグリッチが激減。

**テンプレート:**
```
✓ たいようが のぼる あさに   (10音節)
✓ きみの こえが きこえた     (9音節)
❌ わたしはあなたのことをずっとまっていたのにどうしてきてくれないの (26音節)
```

#### Negative Prompt-Centric手法

**発見:**
ポジティブプロンプトをExclude欄にもコピペすると、出力が洗練される（手動CFG効果）。シマーの軽減に有効。

**テンプレート:**
```yaml
# Style
J-Pop meets Smooth Jazz; warm Rhodes; airy female vocal...

# Exclude Styles
J-Pop meets Smooth Jazz, warm Rhodes, airy female vocal, Trap, Dubstep
```

---

### 3-F. デュエット・複数ボイス

> **発見元**: Reddit, Lilys.ai

#### 「Voices」複数形トリック

**発見:**
「Voice」より「**Voices**」（複数形）の方が効く。

**テンプレート:**
```
Style: "Emotional Pop Ballad Duet, male and female voices"
                                                  ^^^^^^
```

#### [Verse 1: Male Vocal] 形式

**発見:**
セクションタグにボーカル指定を追加。100%成功するわけではないが、確率が上がる。

**テンプレート:**
```
[Verse 1: Male Vocal]
きみと であった ひから
[Pre-Chorus: Female Vocal]
せかいが かわりはじめた
[Chorus: Male and Female Duet]
ふたりで あるいてゆこう
```

#### Gabriel/Rebecca ペルソナ法（V4.5発見、V5でも有効）

**発見:**
内部ペルソナ名を使うとデュエットが強制される。ただしヒット率は100%ではない。

**テンプレート:**
```
[Gabriel]
きみと であった
[Rebecca]
あの ひのこと
[both]
わすれない
```

---

### 3-G. トラブルシューティング（コミュニティ報告）

> **発見元**: Stoke McToke, Jack Righteous, Reddit

#### Scratched CD効果

| 項目 | 内容 |
|------|------|
| **症状** | 最初の20秒でループ/スキップ |
| **原因** | サーバー負荷 + over-prompting |
| **回避策** | 1. プロンプトを簡素化<br>2. ピーク時間を避ける<br>3. タグを50個から10個以下に減らす |

#### Lyric Cacheバグ

| 項目 | 内容 |
|------|------|
| **症状** | Replace Sectionで歌詞が更新されない |
| **回避策** | 新規セクションとして再生成 |

#### 1単語変更グリッチ

| 項目 | 内容 |
|------|------|
| **症状** | コーラスの1単語を変えるとリズムが崩壊 |
| **原因** | V5は文脈でフレージングを決定 |
| **回避策** | 1単語の編集ではなく、セクション全体をReplace |

#### [Intro]タグの不信頼性

**発見:**
`[Intro]`タグは特に不安定。Styleプロンプトで "short instrumental intro" と書く方が確実。

---

### 3-H. 情報源（コミュニティ）

| 情報源 | URL | 内容 |
|--------|-----|------|
| JG BeatsLab | https://www.jgbeatslab.com/ai-music-lab-blog/suno-v5-vs-v3-prompting-guide | V5専用テクニック7種 |
| Jack Righteous | https://jackrighteous.com/en-us/blogs/guides-using-suno-ai-music-creation/ | 多数のガイド |
| Medium (James 99) | https://medium.com/@kvxxpb | 9 Hacks, 10 Patterns等 |
| Plain English | https://plainenglish.io/blog/i-made-10-suno-v5-prompt-patterns-that-never-miss | 10 Patterns |
| Suno Wiki | https://sunoaiwiki.com/ | アスタリスク効果等 |
| r/SunoAI | https://reddit.com/r/SunoAI | コミュニティ報告 |

---

## 4. V5.5 音声条件付けワークフロー（Cover/Sample/Inspo）

本セクションは、v5.5 で前面化した「音声条件付け」系モード（Cover / Sample / Inspo / Remaster）の使い分けとパラメータ調整に関するコミュニティ知見を収録している。0328調査（Reddit r/SunoAI、v5.5リリース後2週間の報告）に基づく。

> **位置づけ**: セクション1-3が「テキストプロンプト設計」を扱うのに対し、本セクションは「音声入力の選び方とスライダー調整」という別次元の制御を扱う。

### テクニック比較表

| 技名 | 狙い | 触る場所 | 推奨パラメータ | 信頼度 |
|------|------|----------|---------------|--------|
| Sample全尺参照 | Coverの逸脱を抑える | Sample（全曲選択） | Weirdness低, Audio高, Style中〜高 | 中〜高 |
| Inspo複数テイク | 旋律・ブリッジをロック | Inspo（複数音源） | Weirdness 0, Style 50, Influence 85 | 中 |
| Voices/Style衝突回避 | 声・伴奏の衝突を減らす | Cover＋Voices | 全スライダー25起点 | 中〜高 |
| Audio Influence探索法 | "latch on"させる最短探索 | Cover/Sample/Inspo | Audio 25→+5刻み（75超は注意） | 高 |
| スライダー赤域回避 | バグ・破綻を減らす | 全スライダー | 15〜85に収める | 中〜高 |
| Remaster(Subtle)後処理 | 金属声・シビランスの緩和 | Remaster | Strength: Subtle | 中 |

---

### 4-A. 意思決定ワークフロー

v5.5 の Cover/Sample/Inspo 系で「無駄撃ちを減らす」ための分岐フロー。

```
Cover開始
  │
  ├─ 後半で逸脱/短縮する? ─YES→ Sampleに切替（サンプル範囲=全尺）
  │                        └─NO → Cover継続
  │
  ├─ 赤域回避: 全スライダー 0/100 を避ける（安全範囲: 15-85）
  │
  ├─ Audio Influence 25%起点 → +5%刻みで上げる
  │
  ├─ 声が合わない/衝突? ─YES→ Voices併用なら Style最小化（声・楽器記述を削除）
  │                     └─NO → Styleはジャンル+最小要素
  │
  └─ 金属声/刺さる高域? ─YES→ Remaster(Subtle)を試す → 改善なければ段階Remaster
                         └─NO → 完成・微調整へ
```

---

### 4-B. Sample全尺参照

> **発見元**: Reddit r/SunoAI（複数スレッドで独立報告）

**技の要約:**
v5.5でCoverが「途中から原曲を追わなくなる」「長尺が短く切られる」場合、CoverではなくSampleを選び、サンプル範囲を曲全体（全尺）に広げると改善する。

**実践パラメータ:**
- モード: Sample（サンプル範囲：曲全体を選択）
- Style Prompt例: `indie rock, mid-tempo, same chord progression, tighter mix`
- Weirdness: 10 / Style Influence: 60 / Audio Influence: 85

**信頼度:** 中〜高。Coverの逸脱問題に対して、異なるスレで独立に報告。

**注意点:**
- Sample全尺は原曲に寄りすぎてStyle変換が弱まる場合がある
- Audioを上げすぎると発音崩れ・音荒れが発生

**出典:** [45][46][47]

---

### 4-C. Inspo複数テイク

> **発見元**: Reddit r/SunoAI

**技の要約:**
v5.5で"2番以降が別メロになる"とき、Inspoに同一曲の複数録音（3テイク）を入れ、Weirdnessを0にしてInfluenceを高めると、メロディがほぼ一致しやすい。

**実践パラメータ:**
- モード: Inspo（同一曲の自演録音を3本入れる）
- Style Prompt例: `same genre as original, minimal changes, cleaner vocal`
- Weirdness: 0 / Style Influence: 50 / Influence: 85

**信頼度:** 中。具体値まで明示されたレポートあり、他スレでも「Coverが壊すならInspoを使う」という助言が出ている。

**注意点:**
- Inspoは素材次第で「近いけど別曲」になり得る
- ネガティブ指定やStyleを盛りすぎると、音声条件付けと衝突して歪む

**出典:** [48][45]

---

### 4-D. Voices/Persona併用時のStyle最小化

> **発見元**: Reddit r/SunoAI + Suno公式ヘルプ

**技の要約:**
Voices（旧Persona）を使うCoverでは、Style Promptを長文化せず、ボーカル描写や楽器描写をなるべく書かないほうが衝突が減り、元曲の解釈が安定する。

**実践パラメータ:**
- Style Prompt（最小）: `alt rock, 120 bpm`（声の特徴・楽器名は基本書かない）
- Weirdness: 25 / Style Influence: 25 / Audio Influence: 25（起点）

**信頼度:** 中〜高。「声はVoice Personaが既に持っているので書くと衝突する」と明言されている。

**注意点:**
- Style Promptを削りすぎるとジャンル解釈がブレるため、ジャンルだけは最小語数で残す

**出典:** [49][42][39]

---

### 4-E. Audio Influence探索法

> **発見元**: Reddit r/SunoAI（複数スレッドで再現確認）

**技の要約:**
Coverが原曲に"引っ掛からない（latch onしない）"場合、Audio Influenceを25%から始め、5%ずつ上げる探索が最小コストで安定版を見つけやすい。

**実践パラメータ:**
- Audio Influence: 25 → 30 → 35 → …（+5刻み）
- Weirdness: 25（固定）/ Style Influence: 25（固定）
- 停止条件: メロディ保持が十分になったらそこで止める

**信頼度:** 高。具体的な探索刻みと、70〜75%超で「音質・発音が崩れる」副作用まで報告されている。

**注意点:**
- 70〜75%超で発音崩れ・ハーシュなエッジが出る
- "上げ切る"より"必要十分で止める"が安全

**出典:** [49][50][51]

---

### 4-F. スライダー赤域回避

> **発見元**: Reddit r/SunoAI（v5.5リリース直後に再周知）

**技の要約:**
v5.5のCover/Sample/Inspo系では、0%や100%（UIで赤く表示される領域）に入れると破綻・バグ・意図しない逸脱が増えるため、"デフォルト付近から小さく動かす"のがコミュニティの共通見解。

**安全範囲:**
- Weirdness: 15–35
- Style Influence: 20–80
- Audio Influence: 25–85
- **禁止**（まず避ける）: 0 / 100（UIで赤くなる領域）

**信頼度:** 中〜高。v5.5当日のスレで「赤域は事故る」「デフォルトが一番」と複数コメント。

**注意点:**
- 赤域回避は「安定化」に効くが、狙って"壊す"創作（グリッチ等）では逆に不利
- Audioを上げるほど「歌詞構造も元曲に寄せないと歪む」

**出典:** [51][50][52]

---

### 4-G. Remaster(Subtle)後処理

> **発見元**: Reddit r/SunoAI

**技の要約:**
v5.5で「金属っぽいAI声」「高域が痛い」「シビランス」が出るとき、Remasterを"Subtle強度"で回すと改善する報告がある一方、逆に悪化する例もあり、当たり外れを見ながら使う"後処理ハック"。また、Coverが"変えすぎる"ときは、Remasterを「曲全体のReplace/Regenerateを軽微に掛ける別ルート」として使い、複数版の良い部分を繋いだフランケン音源を統合する用途も語られている。

**実践手順:**
1. 通常生成（または旧モデルで生成）
2. Remaster: Strength = Subtle
3. Coverで変化が大きすぎる場合は、Remaster側で"軽微差分"を探索する
4. まだ粗い場合は、数回試すか段階Remaster（v4.5→v5→v5.5のように）
5. 複数テイクの良い部分をDAW/Studioで繋いだフランケン音源があるなら、それをアップしてRemasterで馴染ませる

**信頼度:** 中。Subtle Remasterで"金属感が減る"報告がある一方、反例もある。「万能ではないが、症状が出たときの最初の検査」として扱う。

**強度別ガイド（0401追加）:**
- **Subtle**: 最も安全。微修正のファーストチョイス。複数回回して良いテイクを選ぶ
- **Normal**: "ちょい変え"狙い。メロディは概ね保持されるが1音変わる事故あり
- **High**: 別物になりやすい。意図的な変化を求める場合のみ

**マイクロ修正としての運用（0401追加）:**
Coverが崩れる場面では、Coverで直すよりRemaster(Subtle)を数回回して"軽微な改善だけ取る"方が安定する。Style欄に `Keep melody and arrangement. Only fix: harsh hiss/sibilance, balance high-end, tighten drums.` のように改善点だけを書く。

**注意点:**
- v5→v5.5の直接Remasterで悪化する例もある
- 旧モデルを挟む段階Remasterが語られているが、素材やジャンルで当たり外れあり
- Remasterは歌詞誤唱の修正には弱く、構成変化を完全には防げない
- Subtleでも"1音だけ変わって台無し"事故があり得る。複数回生成→聴き比べ→採用が前提
- v5.5ではRemaster自体が不安定で、逆にシマーが増える反例も報告されている[75]

**出典:** [53][54][59][65][68][69][75]

---

### 4-H. パフォーマンス・ディレクション主導プロンプト

> **発見元**: Reddit r/SunoAI

**技の要約:**
v5.5では、従来の「ジャンル + 形容詞タグの多重列挙」よりも、Verse/Chorus単位で"どんな歌い方・演奏の癖で進めるか"をStyle欄に自然文で書くと通りやすいという報告がある。特に `Verse:` `Chorus:` `Band:` のような役割ラベル付きディレクションが、v5.5の表現追従性と噛み合う。

**実践パラメータ:**
- 用途: Create または Cover
- Style Prompt例:
  - `Barroom rock, loose and ragged, late-night energy.`
  - `Rhythm section: heavy and slightly behind the beat.`
  - `Verse: restrained, talk-sung, conversational.`
  - `Chorus: louder, sloppier, borderline shouted.`
  - `Band: never tight, slightly off-kilter.`
- スライダー: 極端値は避け、まずはデフォルト付近から微調整

**信頼度:** 中。具体的な書式が提示された一次投稿があり、別スレでも「v5.5は細かい指示への追従が改善した」という観察がある。

**注意点:**
- v5.5は"盛る方向"に寄りやすいため、煽り表現を多くすると後半で過剰アドリブ化することがある
- タグ列挙と自然文ディレクションを両方盛りすぎると、指示同士が競合しやすい

**出典:** [55][56]

---

### 4-I. [studio recording] タグによるライブ化抑制

> **発見元**: Reddit r/SunoAI

**技の要約:**
v5.5のCoverで、観客歓声や拍手など"勝手なライブ感"が乗る場合、Style欄をタグ列ではなく自然文で具体化し、Lyrics欄先頭に `[studio recording]` を置くと改善したという報告がある。否定指定よりも「環境を肯定的に固定する」発想が肝。

**実践パラメータ:**
- 用途: Cover（v5.5）
- Style Prompt例:
  - `Remove the fake crowd cheering and clapping.`
  - `This song takes place in a small tavern, not in a stadium.`
  - `Reduce the lead singer yelling; keep the delivery controlled.`
- Lyrics欄先頭: `[studio recording]`

**具体的なStyle自然文テンプレート（0401追加）:**
```
Remove fake crowd cheering and clapping. This song takes place in a small tavern, not a stadium.
Dry studio mix / isolated vocal booth. Close-mic vocal. No audience.
Keep the genre consistent; no mid-song switch.
```
ポイント: 「場」（どこで録音か）+ 「禁止」（何を除くか）+ 「保持」（何を守るか）の3要素に絞る。長すぎると別の誤解を生む。

**信頼度:** 中〜高。自然文指示とタグ併用の成功談が複数あり、v5.5では歌詞タグの優先度が上がったという観察も補強材料になっている。0401追加報告で「crowdが消えた」具体例が増加。

**注意点:**
- 意図的にライブ感を出したいケースでは逆効果
- 自然文で条件を詰め込みすぎると、Cover自体が不安定化することがある
- [Studio Recording]で曲が"乾きすぎる／臨場感が消える"副作用あり

**出典:** [57][58][67][70][71][72]

---

### 4-J. v5.5→v5.0 ダウングレード整形

> **発見元**: Reddit r/SunoAI

**技の要約:**
v5.5初週で報告の多いヒス、ホワイトノイズ、高域シマーに対し、v5.5で作った曲をv5.0にSubtle RemasterまたはCoverで戻すと、粗さが減る場合がある。根本解決ではないが、当座しのぎとして実用的な回避策。

**実践パラメータ:**
- パターンA: v5.5で生成 → v5.0 に Subtle Remaster
- パターンB: v5.5で生成 → v5.0 で Cover
- 症状: hiss / white noise / high-end shimmer が目立つときに試す

**信頼度:** 中。別スレで独立に同方向の改善報告があり、v5.5固有ノイズへのワークアラウンドとして浮上している。

**注意点:**
- 根本修正ではなく、戻し工程で別の破綻が出ることがある
- Cover側の挙動が不安定な時期は、改善より副作用が勝つ場合もある

**出典:** [60][61]

---

### 4-K. ハミング素材化問題の回避

> **発見元**: Reddit r/SunoAI

**技の要約:**
v5.5では、ハミングや口笛のガイド音声を"シンセ化"するより"素材サンプルとして残す"傾向があるという報告があり、回避として「まずインストだけ作る → 後からボーカルを足す」二段階戦術が使われている。必要なら旧モデルへ戻す判断も含む。

**実践パラメータ:**
- 前提: 30秒程度のドライなハミング/口笛をアップロード
- ステップ1: Instrumental を先に生成し、構成・コード・リズムを確定
- ステップ2: Studio / Create で後からボーカル追加
- 補足: どうしても噛み合わない場合のみ Audio 系スライダーを高めて賭ける例があるが、赤域化しやすい

**信頼度:** 低〜中。同一スレ内で問題報告と回避策が示され、別スレでもドライ音声からの成功談があるが、安定技と呼ぶには早い。

**注意点:**
- 工程が増え、Studio側の更新や不具合に左右される
- ボーカル追加操作が全体再生成に化けるなど、再現性は環境依存

**出典:** [62][63]

---

### 4-L. 流動テンポ(rubato)のCover適性

> **発見元**: Reddit r/SunoAI

**技の要約:**
テンポが揺れる即興ピアノやrubato素材をCoverするとき、v5.5は以前よりテンポ揺れを保持しやすいという報告がある。特に「ドラムを足すとテンポが固定化する」問題が改善したという観察がポイント。

**実践パラメータ:**
- 用途: オリジナル演奏（rubatoあり）のアップロード → Cover
- Style Prompt例:
  - `atmospheric metal; keep the fluid tempo; follow the original rubato.`
  - `drums must follow tempo changes, not lock to grid.`
- 確認ポイント: ドラム追加後にテンポがグリッド固定されていないか

**信頼度:** 中。明示的な改善報告があり、別スレでも「v5.5は音声条件付けの追従が良い」という所感が補強している。

**注意点:**
- 単独事例ベースであり、一般化には追加検証が必要
- 素材やジャンル次第では、依然としてテンポが平準化される可能性がある

**出典:** [64][56]

---

### 4-M. v5.5ボーカル + 旧モデル伴奏の分業

> **発見元**: Reddit r/SunoAI

**技の要約:**
「v5.5のボーカルは良いが伴奏が暴れる・好みでない」場合、伴奏をv4.5+/v5で作り、ボーカルだけv5.5で生成して後載せする分業戦術が使われている。v5.5の声質改善を活かしつつ、旧モデル伴奏の安定性を取る折衷案。

**実践パラメータ:**
- 手順:
  1. 伴奏を v4.5+ または v5 で作る（Instrumental想定、Lyrics空）
  2. v5.5で Add Vocals / Cover を使いボーカルを載せる
  3. ボーカルとインストを別書き出しし、Studio または DAW で差し替え
- 想定用途: groove や伴奏のまとまりは旧モデル、声の表情は v5.5 を取りたいとき

**Audio Influenceの推奨値（0401追加）:**
- **85-90%**: メロディ保持とグリッチ回避の折衷。推奨スタート値
- **100%**: 原曲寄せ最大だがグリッチが増えるリスクあり
- Style欄例: `Keep the instrumental arrangement as-is. Add vocals only. Dry vocal booth, controlled dynamics, no extra crowd, no random tempo change.`

**信頼度:** 中〜高。具体的な"後載せ"の発想が共有され、v5.5伴奏側への不満とセットで語られている。0401で具体的なAudioスライダー値が追加。

**注意点:**
- ステム差し替えでは位相、残響、空間処理の整合で手間が増える
- Studio挙動が不安定な時期は、分離・再配置の再現性が落ちる
- Add Vocals経路ではVoices/Personaが使えない制約あり。Persona使用時はCoverに回る必要がある[73]
- Audio=100%は保持に効くが、グリッチや不自然さが増える可能性あり[73]

**出典:** [66][65][73][74]

---

### 4-N. 全曲Sample再生成（Whole-song Sampling）

> **発見元**: Reddit r/SunoAI（0401調査）

**技の要約:**
Coverが"途中で別曲になる／構造が崩れる"場面で、Coverの代わりに**Sampleモードで曲全体を範囲選択して再生成**すると、元曲の骨格を保ったまま音質や演奏の太さが向上するという報告が複数一致。Cover不調時の最有力代替経路。

**実践パラメータ:**
- モード: Sample
- 範囲: 曲全体をドラッグ選択
- **定番スライダーレシピ:**
  - Weirdness: **0%**
  - Style: **100%**
  - Audio: **100%**
  - 代替: Weirdness低 / Style中〜高 / Audio最大（"似せ優先"）
- Style欄例:
```
Keep the exact melody and chords. Keep arrangement mostly the same.
Only improve: tighter drums, cleaner bass, reduce hiss/harsh sibilance, remove crowd ambience.
Dry studio mix, controlled dynamics, no sudden genre change.
```

**信頼度:** 高。複数スレッドで手順とスライダー数値が具体的に一致。

**注意点:**
- 終わり方やブレイク位置が微妙に変わる場合がある
- 余計なインストブレイクが挿入される報告あり
- 完全同一の保証には向かない（"改善版の再生成"と割り切る）

**出典:** [76][77][78][79]

---

### 4-O. Suno Studioのモデル切替ドロップダウン

> **発見元**: Reddit r/SunoAI（0401調査）

**技の要約:**
Suno Studioでは Style欄内に小さなドロップダウンがあり、モデルをv5.5↔v5（場合によりv4.5）で切り替えられる。v5.5で出にくいFX（riser/swoosh等）をv5に戻して生成する回避策として共有されている。また、Style/Lyricsの文字数上限が「1000/5000」と「200/1250」で揺れるという報告もあり、UI状態やモデルの影響が疑われている。

**実践パラメータ:**
- Studio内のStyle欄ドロップダウンでモデルを切り替え
- FX生成目的の場合: v5を選択し、`FX only: riser, whoosh, sweep, impact. No melody, no vocals. Clean.` のようなStyle
- 文字数制限が200に制限される場合: 要件を3行に圧縮
```
Genre anchor: dark progressive house.
Constraint: keep tempo stable, no vocal chops.
Mix: dry, controlled high-end (no harsh hiss).
```

**信頼度:** 中。ドロップダウンの存在は複数人が確認しているが、文字数の揺れやUI条件は環境差・ロールアウト差がありうる。

**注意点:**
- 段階的ロールアウトの可能性あり（全ユーザーが同じUIとは限らない）
- モデルをv5に戻すと、v5.5固有の改善（ボーカル表現など）は弱まる

**出典:** [80][81][73]

---

## 5. Deep Research 統合ログ

このセクションは `docs/deepresearch/` の調査結果を本マニュアルに統合した記録。調査日ごとにエントリを追加する。

### 5-A. 0327調査（V5.5新機能と非公式プロンプト技法）
- **調査日**: 2026-03-27
- **調査範囲**: Suno V5.5リリース直後の公式ドキュメント + Reddit/コミュニティ
- **主な統合先**: V5.5アップデート要点（冒頭テーブル）、各所に[V5.5]タグ追記、セクション2（二層制御補遺）
- **新規テクニック数**: 既存知見の体系化が中心（Voices / Custom Models / My Taste / Style形式変更 / アノテーションタグ / スライダーコンボ）

### 5-B. 0328調査（Cover/Sample/Inspo裏技）
- **調査日**: 2026-03-28
- **調査範囲**: v5.5リリース後2週間のReddit r/SunoAI + r/Suno（Cover/Sample/Inspo/Remaster中心）
- **主な統合先**: セクション4（音声条件付けワークフロー）
- **新規テクニック数**: 6件（Sample全尺、Inspo複数テイク、Style衝突回避、Audio Influence探索、赤域回避、Remaster後処理）
- **出典URL**: 各テクニックカード内に記載

### 5-C. 0331調査（v5.5直近1週間のコミュニティ報告）
- **調査日**: 2026-03-31
- **調査範囲**: v5.5公開後1週間の Reddit r/SunoAI（一次ソース中心）
- **主な統合先**: セクション4（4-G拡張、4-H〜4-M追加）
- **新規テクニック数**: 7件（パフォーマンスディレクション、[studio recording]、Remaster全体Replace運用、ダウングレード整形、ハミング回避、rubato適性、モデル間分業）
- **出典URL**: [55]〜[67]

### 5-D. 0401調査（v5.5公開後1週間・重複排除版）
- **調査日**: 2026-04-01
- **調査範囲**: v5.5公開後1週間の Reddit r/SunoAI（0331調査との重複排除済み）
- **主な統合先**: セクション4（4-G/4-I/4-M拡張、4-N〜4-O追加）
- **新規テクニック数**: 2件（全曲Sample再生成、Studioモデル切替）
- **既存拡張**: 3件（Remaster強度別ガイド、[studio recording]自然文テンプレ、v5/v5.5分業のAudio値）
- **出典URL**: [68]〜[81]

---

## 引用文献（統合・番号付き）

1. https://www.reddit.com/r/SunoAI/comments/1np21fx/what_is_suno_v5_and_best_prompt_tips_of_suno_v5/
2. https://jackrighteous.com/blogs/guides-using-suno-ai-music-creation/suno-v5-series-complete-guides-workflows
3. https://jackrighteous.com/pages/suno-ai-meta-tags-guide
4. https://www.reddit.com/r/SunoAI/comments/1nyybi7/suno_v5_impressions/
5. https://skywork.ai/skypage/en/Mastering-Suno-Prompts:-The-Ultimate-2025-Guide-to-AI-Music-Creation/1975069867135528960
6. https://medium.com/@creativeaininja/suno-v5-and-studio-the-complete-guide-to-professional-ai-music-production-d55c0747a48e
7. https://sider.ai/blog/ai-tools/top-20-prompts-for-suno-v5-to-generate-realistic-songs-with-vocals-instrumentation
8. https://travisnicholson.medium.com/how-to-write-suno-ai-prompts-with-examples-46700d2c3003
9. https://www.reddit.com/r/SunoAI/comments/1n8lq6u/suno_style_prompt_guide_20/
10. https://www.reddit.com/r/SunoAI/comments/1nrjmnn/example_of_a_good_v5_prompt/
11. https://howtopromptsuno.com/making-music/voice-tags
12. https://www.reddit.com/r/SunoAI/comments/1l77atq/what_is_your_favorite_genre_fusions_to_play/
13. https://www.reddit.com/r/SunoAI/comments/1fn8zh8/i_analyzed_100_ai_songs_to_learn_what_works_with/
14. https://www.youtube.com/watch?v=0zyBGn4d_Fc
15. https://www.reddit.com/r/SunoAI/comments/1mym1dm/the_guide_to_meta_tags_in_suno_ai_take_control_of/
16. https://www.youtube.com/watch?v=jpkVhnUk6ZE
17. https://travisnicholson.medium.com/complete-list-of-prompts-styles-for-suno-ai-2024-33ecee85f180
18. https://travisnicholson.medium.com/complete-list-of-instruments-to-use-for-suno-ai-921d6571d39a
19. https://howtopromptsuno.com/making-music/instrumental-tags
20. https://www.reddit.com/r/SunoAI/comments/1ji0g3c/guide_how_to_make_good_songs_with_multiple_voices/
21. https://www.reddit.com/r/SunoAI/comments/1d5xsud/the_secret_of_the_perfect_prompt_part_1/
22. https://www.reddit.com/r/SunoAI/comments/1nkfhkl/how_do_i_get_suno_to_stick_to_a_specific_bpm/
23. https://www.reddit.com/r/SunoAI/comments/1nvso0g/v5_is_absolutely_unusable/
24. https://www.reddit.com/r/SunoAI/comments/1krfsjd/how_to_control_key_and_key_change/
25. https://jackrighteous.com/en-us/blogs/guides-using-suno-ai-music-creation/suno-v5-to-release-inside-suno
26. https://www.youtube.com/watch?v=wguOfyXgfNc
27. https://suno.com/
28. https://help.suno.com/en/articles/3161921
29. https://www.reddit.com/r/SunoAI/comments/1nrc518/full_guide_to_creating_music_wai_suno_v5_tutorial/
30. https://jackrighteous.com/blogs/guides-using-suno-ai-music-creation/suno-ais-exclude-styles-feature-solves-vocal-and-instrument-control-issues
31. https://www.reddit.com/r/SunoAI/comments/1npdcwv/everybody_that_is_getting_good_results_on_v5/
32. https://www.reddit.com/r/SunoAI/comments/1gz1ssg/suno_ai_users_are_you_struggling_with_prompts_not/
33. https://howtopromptsuno.com/common-problems/why-cant-i-hear-my-lyrics
34. https://www.reddit.com/r/SunoAI/comments/1o7vqnu/serious_bug_found/
35. https://help.suno.com/en/articles/2746945
36. https://help.suno.com/en/categories/550145
37. https://www.reddit.com/r/SunoAI/comments/1i2u22g/paid_for_suno_ai_pro_but_wheres_the_license_they/
38. https://www.reddit.com/r/SunoAI/comments/1ksh8uf/commercial_rights/

### V5.5 公式ソース（2026-03-26 追加）

39. https://suno.com/blog/v5-5
40. https://help.suno.com/en/articles/11362305
41. https://help.suno.com/en/articles/11362369 (Voices)
42. https://help.suno.com/en/articles/11362433 (Voices FAQ)
43. https://help.suno.com/en/articles/11362497 (Custom Models)
44. https://help.suno.com/en/articles/11362561 (My Taste)

### 0328調査 出典（Cover/Sample/Inspo）

45. https://www.reddit.com/r/SunoAI/comments/1rziibk/the_cover_feature_is_broken/
46. https://www.reddit.com/r/SunoAI/comments/1s4k70q/v55_coverswth/
47. https://www.reddit.com/r/SunoAI/comments/1raayhs/best_way_to_editcover_a_generated_song_while/
48. https://www.reddit.com/r/SunoAI/comments/1s55acd/v55_changing_melodies/
49. https://www.reddit.com/r/SunoAI/comments/1qyg4cp/practical_guide_to_upgrading_songs_to_v5_making/
50. https://www.reddit.com/r/SunoAI/comments/1qtelo2/weirdness_stlye_auio_influence_question_505050/
51. https://www.reddit.com/r/SunoAI/comments/1s54nnq/v55_testing/
52. https://www.reddit.com/r/SunoAI/comments/1s4t0sg/v55_persona_cover_sample_voice_all_straying_from/
53. https://www.reddit.com/r/SunoAI/comments/1s4z6al/v55_how_to_get_rid_of_those_obvious_ai_voices/
54. https://www.reddit.com/r/SunoAI/comments/1s4y1th/v55_has_been_brilliant/

### 0331調査 出典（v5.5直近1週間）

55. https://www.reddit.com/r/SunoAI/comments/1s73tgz/v55_prompt_structure/
56. https://www.reddit.com/r/SunoAI/comments/1s651ff/55_follows_instructions_better/
57. https://www.reddit.com/r/SunoAI/comments/1s71wcc/i_think_i_understand_the_new_cover_settings_and/
58. https://www.reddit.com/r/SunoAI/comments/1s89loe/me_gusta_y_no_me_gusta_55/
59. https://www.reddit.com/r/SunoAI/comments/1s67231/for_others_who_dont_realize_this_like_i_didnt/
60. https://www.reddit.com/r/SunoAI/comments/1s6q72x/suno_v55_advantages_and_major_drawbacks/
61. https://www.reddit.com/r/SunoAI/comments/1s7r2ti/new_version_55_vocals_hissing_sound/
62. https://www.reddit.com/r/SunoAI/comments/1s7yah3/new_suno_version_seemingly_unable_to_stop_sampling/
63. https://www.reddit.com/r/SunoAI/comments/1s4s425/wow_v55_is_really_something/
64. https://www.reddit.com/r/SunoAI/comments/1s8els8/one_strength_of_v55_that_ive_noticed_regarding/
65. https://www.reddit.com/r/SunoAI/comments/1s676ik/v55_feedback_thread/
66. https://www.reddit.com/r/SunoAI/comments/1s5fp96/v55_vocals_are_a_step_forward_but_everything_else/
67. https://www.reddit.com/r/SunoAI/comments/1s5f3yr/stop_putting_a_live_crowd_on_my_tracks/

### 0401調査 出典（重複排除・新規テクニック）

68. https://www.reddit.com/r/SunoAI/comments/1s67231/for_others_who_dont_realize_this_like_i_didnt/
69. https://www.reddit.com/r/SunoAI/comments/1s4busr/55_just_dropped_for_me/
70. https://www.reddit.com/r/SunoAI/comments/1s71wcc/i_think_i_understand_the_new_cover_settings_and/
71. https://www.reddit.com/r/SunoAI/comments/1s89loe/me_gusta_y_no_me_gusta_55/
72. https://www.reddit.com/r/SunoAI/comments/1s5f3yr/stop_putting_a_live_crowd_on_my_tracks/
73. https://www.reddit.com/r/SunoAI/comments/1s9as4y/struggling_with_v55_try_this_work_flow/
74. https://www.reddit.com/r/SunoAI/comments/1s5fp96/v55_vocals_are_a_step_forward_but_everything_else/
75. https://www.reddit.com/r/SunoAI/comments/1s8yl29/subtle_shimmer_in_everything_i_make_makes_55/
76. https://www.reddit.com/r/SunoAI/comments/1s15e5j/suno/
77. https://www.reddit.com/r/SunoAI/comments/1s82hhh/50_55/
78. https://www.reddit.com/r/SunoAI/comments/1rzpbz8/current_model_completely_broken/
79. https://www.reddit.com/r/SunoAI/comments/1raayhs/best_way_to_editcover_a_generated_song_while/
80. https://www.reddit.com/r/SunoAI/comments/1s8ww89/change_back_the_old_model_in_suno_studio/
81. https://www.reddit.com/r/SunoAI/comments/1s7c06q/whats_the_point_of_studio/
