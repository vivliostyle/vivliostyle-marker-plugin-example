# Vivliostyle マーカープラグイン サンプル

Vivliostyleのマーカー機能は、デフォルトではURLに記録する。これをバックエンドのDBなどに記録するために、プラグインを作成・利用する必要がある。

## プラグイン概要

URL以外の場所にマーカーを記録したい場合は、プラグインが必要となる。

特定のメソッドを持つクラスを定義・作成し、`window`オブジェクトにセットするjsファイルを特定の場所に設置することによって、プラグインが利用できる。

## プラグイン詳細

### 設置場所

Vivliostyleが設置されている場所の、`resources`ディレクトリ直下に、`marks-store-plugin.js`の名前でjsファイルを設置する。

### 条件

以下のメソッドを持つオブジェクトを生成し、`window.marksStorePlugin`に設定する。
（TypeScriptの記法で型は表記している）

`async init(documentId: string): Promise<void>` 

初期化を行う。ドキュメントを区別するためのIdが渡される。

`async persistMark(mark: {mark: string, id: string, memo: string}): Promise<string>`

渡された`mark`オブジェクトに一意なidをセットし、そのidを返却する。
idはstringでなくてはならない。（例えばnumberであってはならない）。

`async getMark(id: string): Promise<{ mark: string, id: string, memo: string}| undefined }>`

渡された`id`を持つ`mark`を返す。

`async updateMark(mark: {mark: string, id: string, memo: string}): Promise<void>`

渡された`mark`を更新する。`mark`の判別は`id`で行う。（同じ`id`でコピーされたオブジェクトが渡される場合もあるため）

`async removeMark(mark: {mark: string, id: string, memo: string}): Promise<void>`

渡された`mark`を削除する。

`async allMarks(): Promise<{mark:string, id: string, memo: string}[]>`

記憶しているすべての`mark`を配列で返す。メモリにすべてが載ってしまうため、可能なら次の`allMarksIterator`も実装するのが望ましい。

`async allMarksIterator(): Promise<AsyncIterable<{mark:string, id: string memo: string}>>` （オプショナル）

記憶しているすべての`mark`に対する、`AsyncIterable`を返す。

## 簡単な例

すべてのマーカーをメモリ上に記憶するプラグインの例を以下に示す。

``` javascript
class TestMarkStore {
  constructor() {
    this.marks = {};
    this.documentId = '';
    this.seq = 0;
  }
  async init(documentId) {
    console.log(`-----${documentId}-----`);
    this.documentId = documentId;
  }
  async persistMark(mark) {
    const id = `${this.seq++}`;
    mark.id = id;
    this.marks[id] = mark;
    return id;
  }
  async getMark(id) {
    return this.marks[id];
  }
  
  async updateMark(mark) {
    this.marks[mark.id] = mark;
  }
  async removeMark(mark) {
    this.marks[mark.id] = undefined;
  }

  async allMarks() {
    return Object.values(this.marks);
  }

  async allMarksIterator() {
    const marks = this.allMarks();
    return (function*() {
      let i = 0;
      while (i < marks.length) {
        const v = marks[i++];
        yield v;
      }
    })();
  }
}

window['marksStorePlugin'] = new TestMarkStore();
```

## ある程度実用的な例

本レポジトリにIndexedDBを使ったサンプル実装を設置している。IndexedDBの操作には[Dexie.js](https://dexie.org)を利用している。
これにより、ブラウザごとにマーカーを記憶することができる。IndexedDBはブラウザの持つDBであるため、別のブラウザ間でのマーカー共有はできない。

`src/indexed-db/`以下のjsファイルを、vivliostyle-viewerの`resources`に配置することで動作させることができる。

## プラグインのライセンスについて

このAPIに沿ったプラグインがVivliostyle.jsの一部となるかどうかは、判断が難しい境界線上のケースになると思われる。プラグインそのものはAGPL（またはAGPLと互換性のあるオープンソースライセンス）とするのが安全であると考えられる。

なおこのAPIに沿ったプラグインを用いてサーバと通信する場合、サーバ側のコードをAGPLにする必要はない。

## LICENSE

* このレポジトリの`/src/indexed-db/marks-store-plugin.js`は[Vivliostyle.js](https://github.com/vivliostyle/vivliostyle.js)の一部とみなし、AGPL3ライセンスとします。
* `/src/indexed-db/dexie.min.js`は[Dexie.js](https://dexie.org)の成果物であり、Apache License 2.0でライセンスされています。
