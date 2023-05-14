# 開発環境
## ターミナルコマンド
- `gulp`
    - 開発環境が動く
- `gulp image`
    - 画像圧縮
    - svgのminify
    - WebP化

# このリポジトリの目的
1. このリポジトリを参照して、静的サイトの高速コーディングを実現する
2. 環境構築にかかる時間を削減
3. テンプレ化することで、もっとクリエイティブな業務に尽力できるようにする


# CSS
## やりたいこと
- PC, TB, SPに対応できるコードを目指す。
- メディアクエリはSPのみ（`max-width:768px`）
- 可変と固定のオブジェクト
    | ウインドウの状態  |可変|固定| 
    | :-: | :- | :- |
    | PC時| ・要素サイズ<br>・画像サイズ<br>一定幅までウインドウサイズが拡がると固定される。<br>（100%表示の画像はその限りではない）<br>原理は`width:100%; max-width:○○○px`で、ウインドウを広げると`max-width`のサイズまで拡大されて、ウインドウを縮めると要素サイズと画像サイズが縮小される | ・文字サイズ<br>・（要素サイズ）<br>・（画像サイズ） |
    | TB時| ・要素サイズ<br>・画像サイズ | ・文字サイズ |
    | SP時| ・要素サイズ<br>・画像サイズ<br>（場合に応じて文字サイズ[vw指定]） | 基本なし<br>（場合に応じて文字サイズ[% or rem指定]） |
- imgの考え方
    ```
    img{
        // PC, TBの場合
        max-width: 100%;
        height: auto;
        vertical-align: bottom;

        //SPの場合（案件によってはつけない）
        @include s.mq(sp){
            width:100%;
        }
    }

    - PC, TBの場合：max-width:100%; height:auto; vertical-aligh:bottom;
    - SPの場合：**width:100%;** max-width:100%; height:auto; vertical-aligh:bottom; 
    （ただし案件によってはwidth:100%はつけないかもしれない（そもそも画像が荒れる問題もあるしwidth:100%はどうなんだ？と思う））

    ```
    - これにより何が嬉しいかというと、CSSでわざわざimgのサイズ指定をしなくて良くなる（個人的にCSSにimgのサイズ指定をしていくことは時間がかかるし、画像ごとにサイズが変わる場合もあり、その度に新たにクラス名を考えてつけていくのは、非常にナンセンスな問題と考えている。画像のサイズはimgのCSS指定よりimgより外の要素のサイズ指定で制御されるべきなのでは？と考えている）
    - ただし、srcsetによる解像度別のアートディレクション（←画像出し分け）ではimgにcssでwidthを制御しなきゃいけない場合もある？
    - 参考：https://developer.mozilla.org/ja/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
- wrapperと100%幅の考え方
レスポンシブレイアウト以前はページの全体をwrapする要素で全体幅を決めてmargin:0 auto;としていた。  
しかしそれではウインドウサイズに対して100%の要素を途中で作ることができなかった。（厳密には作ることはできるけどコツが必要）  
そこでレスポンシブレイアウト以降では全体幅を決めず、sectionごとに全体幅を決めてmargin:0 auto;とすることが多くなった。

## 課題
1. 案件単位で値が変わる要素（上marginの開け方など）の、命名規則を決めておきたいと思う。  
    - Pageのp-（Projectと被るので不採用）
    - Extraのe-（「追加」という意味。意味的に少し違うかなと思う）
    - Scopeのs-（「範囲」という意味。ページ固有の範囲に区切る意味ならこれがありかも）
    - **Pageのpg-**（そのページで使うという意味でも伝わりやすいからこれがいいかも）
2. picture要素のimg要素はwidth, heightは必要か？（PageSpeedInsights的には必要だろうけど、mozillaのpicture要素では指定されていないのが気になる。。。：https://developer.mozilla.org/ja/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images）
3. FLOCSSのUtilityをTailwindCSSに置き換える（コード量の削減に期待）
4. CSS設計は「予測できる」「再利用できる」「保守できる」「拡張できる」
5. 短縮名を使うべきか使わないべきか（https://qiita.com/mrd-takahashi/items/e1099e12bac388d0a9cd）

## Sassフォルダ構成
- FLOCSSを採用している
- ObjectのComponentとProjectの粒度は通常のFLOCSSの公式説明とBootstrapのコンポーネントの粒度を参考にしている
- ObjectにUtilityは含まれていない。
- Utilityの代わりとしてTailwindを採用している。`m-[12px]`のようにするとJITモードが動いてプロパティを作成できる。読み込みは`sass/common/css/style.scss`で行っている。
- FLOCSSにあたるCSSは`sass/common/css/style.scss`で読み込みしている。`ejs/_layout/_head.ejs`で全てのページで読み込みを行うようにしている。

## 接頭辞の役割
| 接頭辞 | 記述ファイル | 説明 | 
| :-: | :- | :- |
| pg- | `src/sass/各ページ用ディレクトリ/ページ名.scss` | **ページ固有のCSSを作成する際に使用する。**<br><br>・margin-topなど要素間の余白の調整<br>・要素の横幅をwrapperとして調整<br>・p-パーツのflexboxの指定<br>・p-パーツ, c-コンポーネントのページ単位での微妙な変化に対応（font-size, line-heightなど）<br><br>・pg-はそのページやディレクトリでしか使用しないCSS（/ディレクトリ名/css/ページ名.css）を作成して、そこに追記していく。|
| p- | `src/sass/_object/_project/_main.scss` | **粒度の大きなコンポーネントを作成する。**<br><br>・c-に当てはまらないような大きさ。<br>・Bootstrapでいうcardくらいの大きさ。<br>・p-は例えば必要であればp-bodyのp-body__title下にp-body__text追加のように拡張を行なっていけるものとする。 |
| c- | `src/sass/_object/component/_main.scss` | **粒度の最も小さなコンポーネントを作成する。**<br><br>・基本的にはc-の中にc-が入ることはないと言われているが、例外的に粒度のさらに小さいものであれば構わないと思う。（p要素[フローコンテンツ]の中にspan要素[フレージングコンテンツ]が入るくらいの粒度）<br><br>・c-は特徴的なパーツと思ってもらえればよくて、これ以上拡張しようのないものとする。（拡張が行えるとしたら別のコンポーネントを追加するくらい）<br>- headingBlockにあたるもの<br>- buttonにあたるもの<br>- 見出しアイコンにあたるもの（bootstrapでいうbadgeにあたる）<br>- liの左アイコン付きリストのようなもの |
#### 注意
- p-とc-は他のページで流用できるものとするため、もっとも外側の要素で**margin-topなどを使って余白調整しないものとする。**（余白調整する場合はpg-をclass名に併記したり、pg-でp-,c-をwrapする）
- p-とc-はそのサイトにグローバルなcssを作成して、そこに追記していく。まさにコンポーネント的な使い方になる。


# 全体
## 検討
1. コメントの書き方の統一をしたい。特に見出しの書き方を統一したい。
    - https://ics.media/entry/6789/
    - ↑のJSDocコメントという手段もあるが...
    - JSDocコメントとは、[Google JavaScript Style Guide](https://cou929.nu/data/google_javascript_style_guide/#id56)で推奨されているコメントの書き方の事
2. フォームのテンプレ化
3. ボタンを数種類作成（アイコンの左右寄りなど）

## 未着手
1. Prettierが未設定（設定ファイルがあるけどうまく動かない）
2. ES Lintが未設定
3. babelが未設定

- 閉じタグコメント欲しい（結構必須）
- 定期的なアプデをしたい（どこかで通知）
- 1年後に見てもすぐに使えるようにしたい
- 閉じタグコメントつけた後で、class名を追加したら、閉じタグコメントにも反映されるようにしたい（無理かも・・・）
