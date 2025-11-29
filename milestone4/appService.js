const db = require('./backend/db');

async function testOracleConnection() {
    try {
        await db.query('SELECT 1 FROM dual');
        return true;
    } catch (err) {
        console.error('testOracleConnection failed', err);
        return false;
    }
}

async function fetchDemotableFromDb() {
    try {
        const result = await db.query('SELECT * FROM DEMOTABLE');
        return result.rows || [];
    } catch (err) {
        console.error('fetchDemotableFromDb failed', err);
        return [];
    }
}

async function initiateDemotable() {
    try {
        await db.query('DROP TABLE DEMOTABLE');
    } catch (err) {
        if (err.errorNum !== 942) {
            console.error('Failed to drop DEMOTABLE', err);
            return false;
        }
    }

    try {
        await db.query(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    } catch (err) {
        console.error('Failed to create DEMOTABLE', err);
        return false;
    }
}

async function insertDemotable(id, name) {
    try {
        const result = await db.query(
            'INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)',
            { id: Number(id), name },
            { autoCommit: true }
        );
        return (result.rowsAffected || 0) > 0;
    } catch (err) {
        console.error('insertDemotable failed', err);
        return false;
    }
}

async function updateNameDemotable(oldName, newName) {
    try {
        const result = await db.query(
            'UPDATE DEMOTABLE SET name = :newName WHERE name = :oldName',
            { newName, oldName },
            { autoCommit: true }
        );
        return (result.rowsAffected || 0) > 0;
    } catch (err) {
        console.error('updateNameDemotable failed', err);
        return false;
    }
}

async function countDemotable() {
    try {
        const result = await db.query('SELECT COUNT(*) AS CNT FROM DEMOTABLE');
        const row = result.rows && result.rows[0];
        return row ? Number(row.CNT) : 0;
    } catch (err) {
        console.error('countDemotable failed', err);
        return -1;
    }
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable,
    insertDemotable,
    updateNameDemotable,
    countDemotable
};
