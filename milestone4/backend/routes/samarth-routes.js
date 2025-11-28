const express = require('express');
const db = require('../../db');

const router = express.Router();

function handleServerError(res, err, message) {
    console.error(err);
    return res.status(500).json({
        success: false,
        error: message || 'Internal server error',
        details: err.message
    });
}

function getCountFromResult(result, key = 'COUNT_VALUE') {
    if (!result || !result.rows || result.rows.length === 0) {
        return 0;
    }
    const row = result.rows[0];
    const resolvedKey = Object.prototype.hasOwnProperty.call(row, key)
        ? key
        : Object.keys(row)[0];
    const value = row[resolvedKey];
    return typeof value === 'number' ? value : Number(value) || 0;
}

function trimInput(value) {
    return typeof value === 'string' ? value.trim() : value;
}

// DELETE - Delete with cascade
router.delete('/users/:username', async (req, res) => {
    const username = trimInput(req.params.username);
    if (!username) {
        return res.status(400).json({ success: false, error: 'Username is required' });
    }

    try {
        const existingUser = await db.query(
            `SELECT TRIM(username) AS USERNAME FROM Users WHERE TRIM(username) = :username`,
            { username }
        );

        if (!existingUser.rows || existingUser.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const saveFilesCount = getCountFromResult(await db.query(
            `SELECT COUNT(*) AS COUNT_VALUE FROM SaveFiles_IsAt WHERE TRIM(username) = :username`,
            { username }
        ));

        const achievementsCount = getCountFromResult(await db.query(
            `SELECT COUNT(*) AS COUNT_VALUE FROM Achievements_monitors WHERE TRIM(username) = :username`,
            { username }
        ));

        const completedObjectivesCount = getCountFromResult(await db.query(
            `SELECT COUNT(*) AS COUNT_VALUE FROM Completes WHERE TRIM(username) = :username`,
            { username }
        ));

        await db.query(
            `DELETE FROM Users WHERE TRIM(username) = :username`,
            { username },
            { autoCommit: true }
        );

        return res.json({
            success: true,
            message: `User '${username}' and all related data deleted successfully`,
            deletedRelated: {
                saveFiles: saveFilesCount,
                achievements: achievementsCount,
                completedObjectives: completedObjectivesCount
            }
        });
    } catch (err) {
        return handleServerError(res, err, 'Failed to delete user');
    }
});

// UPDATE - Update Item rarity/type
router.put('/items/:item_name', async (req, res) => {
    const itemName = trimInput(req.params.item_name);
    if (!itemName) {
        return res.status(400).json({ success: false, error: 'Item name is required' });
    }

    const desiredRarity = trimInput(req.body.item_rarity);
    const desiredType = trimInput(req.body.item_type);

    if (!desiredRarity && !desiredType) {
        return res.status(400).json({
            success: false,
            error: 'Provide item_rarity and/or item_type to update'
        });
    }

    try {
        const itemResult = await db.query(
            `SELECT TRIM(item_name) AS ITEM_NAME, TRIM(item_rarity) AS ITEM_RARITY, TRIM(item_type) AS ITEM_TYPE
             FROM Items
             WHERE TRIM(item_name) = :item_name`,
            { item_name: itemName }
        );

        if (!itemResult.rows || itemResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        const currentItem = itemResult.rows[0];
        const updatedRarity = desiredRarity || currentItem.ITEM_RARITY;
        const updatedType = desiredType || currentItem.ITEM_TYPE;

        const comboCheck = await db.query(
            `SELECT COUNT(*) AS COUNT_VALUE
             FROM ItemBoost
             WHERE TRIM(item_rarity) = :item_rarity AND TRIM(item_type) = :item_type`,
            { item_rarity: updatedRarity, item_type: updatedType }
        );

        if (getCountFromResult(comboCheck) === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid rarity/type combination - no matching boost exists'
            });
        }

        await db.query(
            `UPDATE Items
             SET item_rarity = :item_rarity, item_type = :item_type
             WHERE TRIM(item_name) = :item_name`,
            { item_rarity: updatedRarity, item_type: updatedType, item_name: itemName },
            { autoCommit: true }
        );

        return res.json({
            success: true,
            message: 'Item updated successfully',
            data: {
                item_name: itemName,
                item_rarity: updatedRarity,
                item_type: updatedType
            }
        });
    } catch (err) {
        return handleServerError(res, err, 'Failed to update item');
    }
});

// Helper - Locations list
router.get('/locations', async (_req, res) => {
    try {
        const result = await db.query(
            `SELECT TRIM(location_name) AS LOCATION_NAME,
                    story AS STORY,
                    TRIM(biome) AS BIOME,
                    TRIM(landmark) AS LANDMARK
             FROM Locations
             ORDER BY TRIM(location_name)`
        );

        const data = (result.rows || []).map((row) => ({
            location_name: row.LOCATION_NAME,
            story: row.STORY,
            biome: row.BIOME,
            landmark: row.LANDMARK
        }));

        return res.json({ success: true, data, total: data.length });
    } catch (err) {
        return handleServerError(res, err, 'Failed to fetch locations');
    }
});

// Helper - Items list
router.get('/items', async (_req, res) => {
    try {
        const result = await db.query(
            `SELECT TRIM(item_name) AS ITEM_NAME,
                    TRIM(item_rarity) AS ITEM_RARITY,
                    TRIM(item_type) AS ITEM_TYPE
             FROM Items
             ORDER BY TRIM(item_name)`
        );

        const data = (result.rows || []).map((row) => ({
            item_name: row.ITEM_NAME,
            item_rarity: row.ITEM_RARITY,
            item_type: row.ITEM_TYPE
        }));

        return res.json({ success: true, data, total: data.length });
    } catch (err) {
        return handleServerError(res, err, 'Failed to fetch items');
    }
});

// Helper - Users list for dropdowns
router.get('/users', async (_req, res) => {
    try {
        const result = await db.query(
            `SELECT TRIM(username) AS USERNAME,
                    TRIM(first_name) AS FIRST_NAME,
                    email AS EMAIL,
                    TO_CHAR(created_on, 'YYYY-MM-DD') AS CREATED_ON
             FROM Users
             ORDER BY TRIM(username)`
        );

        const data = (result.rows || []).map((row) => ({
            username: row.USERNAME,
            first_name: row.FIRST_NAME,
            email: row.EMAIL,
            created_on: row.CREATED_ON
        }));

        return res.json({ success: true, data, total: data.length });
    } catch (err) {
        return handleServerError(res, err, 'Failed to fetch users');
    }
});

module.exports = router;
