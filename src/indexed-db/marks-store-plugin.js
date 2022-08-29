/*
 * Copyright 2022 Vivliostyle Foundation
 *
 * This file is part of Vivliostyle UI.
 *
 * Vivliostyle UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Vivliostyle UI is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Vivliostyle UI.  If not, see <http://www.gnu.org/licenses/>.
 */

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
      delete d.documentId;
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
        if (v) {
          v = Object.assign({}, v);
          delete v.documentId;
        }
        yield v;
      }
    })();
  }
}

window['marksStorePlugin'] = new ExampleMarkStoreIDB();
