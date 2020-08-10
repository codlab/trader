import { Table } from './Table';
import sqlite3 from "sqlite3";
import Model from "./models/model";

export class Database {

  name: string;
  database: sqlite3.Database;

  constructor(name: string) {
    this.name = name;
    this.database = new sqlite3.Database(name);
  }

  public save(name: string, pairs: ([string, any, boolean?])[], log: boolean, onId?: (id: number) => void, id?: number) {
    log && console.log("saving :: ", id ? "updating" : "creating");
    if(id) {
      var update = `UPDATE ${name} SET `;
      update += pairs.map(p => {
        var field = p[0], value = p[1];
        return (p.length > 2 && p[2]) ? `"${field}"="${value}"` : `"${field}"=${value}`;
      }).join(",");
      update += ` WHERE id=${id}`;

      this.database.serialize(() => {
        this.database.run(update, (res: any, err: Error|null, e:any) => {
          log && console.log("updating :: res", res);
          log && console.log("updating :: err", err);
          onId && onId(id);
        });
      });
      return;
    } else {
      var insert = `INSERT INTO ${name}`;
      insert += "(" + pairs.map(p => p[0]).join(",") + ")";
      insert += " VALUES ";
      insert += "(" + pairs.map(p => {
        var value = p[1];
        return p.length > 2 && p[2] ? `"${value}"` : value;
      }).join(",") + ")";

      var last_id = `SELECT MAX(id) as id FROM ${name}`;

      this.database.serialize(() => {
        this.database.run(insert, (res: any, err: Error|null, e:any) => {
          log && console.log("updating :: res", res);
          log && console.log("updating :: err", err);
          this.database.each(last_id, (err, row) => {
            row && row.id && onId && onId(row.id);
          }, () => { /* here ?? */});
        });
      });
    }
  }

  public list<TYPE extends Model>(table: Table, create: (row: any) => TYPE): Promise<TYPE[]> {
    return new Promise((resolve, reject) => {
      var list: TYPE[] = [];
      this.database.run(table.str());

      this.database.each(table.list(), (err, row) => {
        list.push(create(row));
      }, () => resolve(list));
    });
  }

  public lastWhere<TYPE extends Model>(table: Table, columns: string[], values: any[], create: (r:any) => TYPE): Promise<TYPE> {
    return new Promise((resolve, reject) => {
      var result: TYPE|null = null;
      this.database.run(table.str());

      const statement = this.database.prepare(table.last(columns));

      statement.each(values, (err: Error, row: any) => {
        result = create(row);
      }, () => {
        if(result) resolve(result);
        else reject("no last item");
      });

      statement.finalize();
    });
  }

  public last<TYPE extends Model>(table: Table, create: (r:any) => TYPE): Promise<TYPE|null> {
    return new Promise((resolve, reject) => {
      var result: TYPE|null = null;
      this.database.run(table.str());

      this.database.each(table.last(), (err, row) => {
        result = create(row);
      },() => resolve(result));
    });
  }

  public add(table: Table): Promise<void> {
    return new Promise((resolve, reject) => {
      this.database.serialize(() => {
        this.database.run(table.str());

        table.indexes().forEach(row => {
          this.database.run(row);
        });
      });

      resolve();
    });
  }
}