const Database = require('sqlite-async');

class CoinkeeperDB {
    dbSqlite;

    constructor(dbPath) {
        this.path = dbPath;
    }

    async connectDb() {
        try {
            this.dbSqlite = await Database.open(this.path);
            // console.log('Connected to the coinkeeper database.');
        } catch (error) {
            throw Error('can not access sqlite database');
        }
    }

    async getDbRows(request) {
        const sqlDateSort = `SELECT Type type,
        _From _from,
        _To _to,
        Tags tags,
        Amount amount,
        Currency currency,
        Amount_converted a_conv,
        Currency_of_conversion currConv,
        Data data
        FROM coinkeeper
        WHERE Data LIKE ?`;

        const rows = await this.dbSqlite.all(sqlDateSort, [request]);
        return rows;
    }

    seekTags(row, tags) {
        for (let i = 0; i < tags.length; i++) {
            if (row === tags[i]) {
                return false;
            }
        }

        return true;
    }

    sumRows(rows, { category, excludeTags }, type) {
        let value = 0;
        let months = [];
        let prevMonth = rows[0].data.split('/')[0];
        const valuePerMonth = {};

        rows.forEach(row => {
            if (row.type === type) {
                if (prevMonth !== row.data.split('/')[0]) {
                    prevMonth = row.data.split('/')[0];
                    months.push(prevMonth);
                }

                for (let i = 0; i < category.length; i++) {
                    if (row._to === category[i] && this.seekTags(row.tags, excludeTags)) {
                        value += row.amount;
                        if (valuePerMonth[prevMonth]) {
                            valuePerMonth[prevMonth] += row.amount;
                        } else {
                            valuePerMonth[prevMonth] = row.amount;
                        }
                    }
                }
            }
        });
        months = [...new Set([...months.map(item => (parseInt(item)))])];
        months = months.sort((a, b) => (a - b));

        const retVal = {
            value: value,
            perMonth: valuePerMonth,
            aver: value / months.length,
            months,
        };
        return retVal;
    }

    sumOnlyRows(rows, { category, excludeTags }, type) {
        let value = 0;
        rows.forEach(row => {
            if (row.type === type) {
                for (let i = 0; i < category.length; i++) {
                    if (row._to === category[i] && !this.seekTags(row.tags, excludeTags)) {
                        value += row.amount;
                    }
                }
            }
        });

        return value;
    }

    async readMonthesRows(month, year) {
        let monthDb;
        if (month === 0) {
            monthDb = '%';
        } else {
            monthDb = month;
        }

        const rows = await this.getDbRows(`${monthDb}/%/${year}`);
        return rows;
    }

    async getStats(obj) {
        const retVal = {};
        let ret;
        const rows = await this.readMonthesRows(obj.date.month, obj.date.year);

        if (obj.base) {
            ret = this.sumRows(rows, obj.base, 'Expense');
            retVal.base = ret.value;
            retVal.baseAver = ret.aver;
            retVal.baseMonths = ret.perMonth;
        }
        if (obj.lifestyle) {
            ret = this.sumRows(rows, obj.lifestyle, 'Expense');
            retVal.lifestyle = ret.value;
            retVal.lifestyleAver = ret.aver;
            retVal.lifeMonths = ret.perMonth;
        }
        if (obj.loans) {
            ret = this.sumRows(rows, obj.loans, 'Transfer');
            retVal.loans = ret.value;
            retVal.loansAver = ret.aver;
            retVal.loansMonths = ret.perMonth;
        }
        if (obj.savings) {
            ret = this.sumRows(rows, obj.savings, 'Transfer');
            retVal.savings = ret.value;
            retVal.savingsAver = ret.aver;
            retVal.savingsMonths = ret.perMonth;
        }

        return retVal;
    }

    async getOnlyTags(obj) {
        const retVal = {};
        const rows = await this.readMonthesRows(obj.date.month, obj.date.year);

        if (obj.target.category) {
            retVal.sum = this.sumOnlyRows(rows, obj.target, 'Expense');
        }

        return retVal;
    }

    async getAvailableTags(year) {
        const retVal = [];
        const rows = await this.readMonthesRows(0, year);
        rows.forEach(row => {
            if (row.tags !== '') {
                retVal.push(row.tags.split(', ')[0]);
            }
        });
        return [...new Set(retVal.sort())];
    }

    async getAvailableCategories(year) {
        const retVal = [];
        const rows = await this.readMonthesRows(0, year);
        rows.forEach(row => {
            if (row.type === 'Expense') {
                retVal.push(row._to);
            }
        });
        return [...new Set(retVal.sort())];
    }

    async getAvailableAccounts(year) {
        const retVal = [];
        const rows = await this.readMonthesRows(0, year);
        rows.forEach(row => {
            if (row.type === 'Transfer') {
                retVal.push(row._to);
            }
        });
        return [...new Set(retVal.sort())];
    }
}

module.exports = CoinkeeperDB;
