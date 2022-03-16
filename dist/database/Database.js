"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
class Database {
    constructor(name) {
        this.name = name;
        this.database = new sqlite3_1.default.Database(name);
    }
    save(name, pairs, log, onId, id) {
        log && console.log('saving :: ', id ? 'updating' : 'creating');
        if (id) {
            const update = `UPDATE ${name} SET ${pairs
                .map((p) => `"${p[0]}"=?`)
                .join(',')} WHERE id=${id}`;
            const statement = this.database.prepare(update);
            statement.each(pairs.map((p) => p[1]), (err, row) => {
                log && console.log('updating :: res', row);
                err && console.log('updating :: err', err);
            }, (err) => {
                console.error('updating error', err);
            });
            statement.finalize();
            onId && onId(id);
        }
        else {
            const create = `INSERT INTO ${name}`
                + `(${pairs.map((p) => p[0]).join(',')})`
                + ' VALUES '
                + `(${pairs.map((p) => '?').join(',')})`;
            const statement = this.database.prepare(create);
            statement.each(pairs.map((p) => p[1]), (err, row) => {
                log && console.log('updating :: res', row);
                log && console.log('updating :: err', err);
            }, () => { });
            statement.finalize();
            const lastId = `SELECT MAX(id) as id FROM ${name}`;
            this.database.serialize(() => {
                this.database.each(lastId, (err, row) => {
                    row && row.id && onId && onId(row.id);
                }, () => {
                    /* here ?? */
                });
            });
        }
    }
    list(table, create, where) {
        if (where) {
            return this.executeWhere(table, table.list(where.columns), where.values, create);
        }
        return new Promise((resolve, reject) => {
            const list = [];
            this.database.run(table.str());
            this.database.each(table.list(), (err, row) => {
                list.push(create(row));
            }, () => resolve(list));
        });
    }
    lastWhere(table, columns, values, create) {
        return this.executeWhere(table, table.last(columns), values, create).then((results) => {
            const result = results.find((item) => !!item);
            if (!result)
                throw 'no last item';
            return result;
        });
    }
    executeWhere(table, query, values, create) {
        return new Promise((resolve, reject) => {
            const result = [];
            this.database.run(table.str());
            const statement = this.database.prepare(query);
            statement.each(values, (err, row) => {
                result.push(create(row));
            }, () => resolve(result));
            statement.finalize();
        });
    }
    last(table, create) {
        return new Promise((resolve, reject) => {
            let result = null;
            this.database.run(table.str());
            this.database.each(table.last(), (err, row) => {
                result = create(row);
            }, () => resolve(result));
        });
    }
    add(table) {
        return new Promise((resolve, reject) => {
            this.database.serialize(() => {
                this.database.run(table.str());
                table.indexes().forEach((row) => {
                    this.database.run(row);
                });
            });
            resolve();
        });
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map