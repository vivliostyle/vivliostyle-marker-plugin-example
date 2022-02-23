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

`init(documentId: string): void` 

初期化を行う。ドキュメントを区別するためのIdが渡される。

`persistMark(mark: {mark: string, id: string}): string`

渡された`mark`オブジェクトに一意なidをセットし、そのidを返却する。
idはstringでなくてはならない。（例えばnumberであってはならない）。

`getMark(id: string): { mark: string, id: string}`

渡された`id`を持つ`mark`を返す。

`updateMark(mark: {mark: string, id: string}): void`

渡された`mark`を更新する。`mark`の判別は`id`で行う。（同じ`id`でコピーされたオブジェクトが渡される場合もあるため）

`removeMark(mark: {mark: string, id: string}): void`

渡された`mark`を削除する。

`allMarks(): {mark:string, id: string}[]`

記憶しているすべての`mark`を配列で返す。メモリにすべてが載ってしまうため、可能なら次の`allMarksIterator`も実装するのが望ましい。

`allMarksIterator(): AsyncIterable<{mark:string, id: string}>` （オプショナル）

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
  init(documentId) {
    console.log(`-----${documentId}-----`);
    this.documentId = documentId;
  }
  persistMark(mark) {
    const id = `${this.seq++}`;
    mark.id = id;
    this.marks[id] = mark;
    return id;
  }
  getMark(id) {
    return this.marks[id];
  }
  
  updateMark(mark) {
    this.marks[mark.id] = mark;
  }
  removeMark(mark) {
    this.marks[mark.id] = undefined;
  }

  allMarks() {
    return Object.values(this.marks);
  }

  allMarksIterator() {
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

