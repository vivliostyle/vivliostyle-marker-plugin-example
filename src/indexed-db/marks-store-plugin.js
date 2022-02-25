import "./dexie.min.js";
export class ExampleMarkStoreIDB {
  constructor() {
    this.db = new Dexie("vivliostyleMarkerDb");
    this.db.version(1).stores({
      marks: `++id,documentId`
    });
  }
  async init(documentId) {
    this.documentId = documentId;
  }
  async persistMark(mark) {
    mark.documentId = this.documentId;
    delete mark.id;
    return this.db.marks.put(mark);
  }

  async getMark(id) {
    let d = await this.db.marks.get({id: id});
    if (d) {
      d = Object.assign({}, d);
      delete d.documentId
    }
    return d;
  }

  async updateMark(mark) {
    return this.db.marks.update(mark.id, mark).then(_ => {});
  }

  async removeMark(mark) {
    return this.db.marks.delete(mark.id);
  }

  async allMarks() {
    const collection = this.db.marks.where({documentId: this.documentId});
    const r = await collection.toArray();
    return r.map(x => { delete x.documentId; return x });
  }

  async allMarksIterator() {
    const keys = await this.db.marks.where({documentId: this.documentId}).primaryKeys();
    const table = this.db.marks;
    return (async function*() {
      let i = 0;
      while (i < keys.length) {
        let v = await table.get({id: keys[i++]});
        v = Object.assign({}, v);
        delete v.documentId;
        yield v;
      }
    })();
  }
}

window['marksStorePlugin'] = new ExampleMarkStoreIDB();
