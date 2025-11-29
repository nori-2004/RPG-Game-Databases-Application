const express = require('express');
const db = require('../db');

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

// JOIN - Achievement details with objectives
router.get('/achievements/details', async (req, res) => {
    const username = trimInput(req.query.username);
    const binds = {};

    let query = `
        SELECT TRIM(am.achievement_name) AS ACHIEVEMENT_NAME,
               am.description AS ACHIEVEMENT_DESCRIPTION,
               TRIM(u.username) AS USERNAME,
               TRIM(u.first_name) AS FIRST_NAME,
               TRIM(am.obj_name) AS OBJ_NAME,
               o.description AS OBJ_DESCRIPTION,
               TRIM(o.location_name) AS LOCATION_NAME,
               TRIM(o.item_name) AS ITEM_REWARD,
               TO_CHAR(e.date_earned, 'YYYY-MM-DD') AS DATE_EARNED
        FROM Achievements_monitors am
        JOIN Users u ON TRIM(am.username) = TRIM(u.username)
        JOIN Objectives o ON TRIM(am.obj_name) = TRIM(o.obj_name)
        LEFT JOIN Earned e ON TRIM(am.achievement_name) = TRIM(e.achievement_name)
                          AND TRIM(am.username) = TRIM(e.username)
    `;

    if (username) {
        query += 'WHERE TRIM(u.username) = :username ';
        binds.username = username;
    }

    query += 'ORDER BY TRIM(u.username), TRIM(am.achievement_name)';

    try {
        const result = await db.query(query, binds);
        const data = (result.rows || []).map((row) => ({
            achievement_name: row.ACHIEVEMENT_NAME,
            achievement_description: row.ACHIEVEMENT_DESCRIPTION,
            username: row.USERNAME,
            first_name: row.FIRST_NAME,
            obj_name: row.OBJ_NAME,
            obj_description: row.OBJ_DESCRIPTION,
            location_name: row.LOCATION_NAME,
            item_reward: row.ITEM_REWARD,
            date_earned: row.DATE_EARNED
        }));

        return res.json({ success: true, data, total: data.length });
    } catch (err) {
        return handleServerError(res, err, 'Failed to fetch achievement details');
    }
});

// HAVING - Active users threshold
router.get('/users/active', async (req, res) => {
    const thresholdRaw = trimInput(req.query.min_savefiles);
    const threshold = Number(thresholdRaw);

    if (Number.isNaN(threshold)) {
        return res.status(400).json({ success: false, error: 'min_savefiles is required and must be a number' });
    }

    try {
        const result = await db.query(
            `SELECT TRIM(u.username) AS USERNAME,
                    TRIM(u.first_name) AS FIRST_NAME,
                    u.email AS EMAIL,
                    COUNT(sf.created_on) AS SAVEFILE_COUNT
             FROM Users u
             LEFT JOIN SaveFiles_IsAt sf ON TRIM(u.username) = TRIM(sf.username)
             GROUP BY TRIM(u.username), TRIM(u.first_name), u.email
             HAVING COUNT(sf.created_on) >= :threshold
             ORDER BY SAVEFILE_COUNT DESC, TRIM(u.username)`,
            { threshold }
        );

        const data = (result.rows || []).map((row) => ({
            username: row.USERNAME,
            first_name: row.FIRST_NAME,
            email: row.EMAIL,
            savefile_count: Number(row.SAVEFILE_COUNT) || 0
        }));

        return res.json({ success: true, threshold, data, total: data.length });
    } catch (err) {
        return handleServerError(res, err, 'Failed to fetch active users');
    }
});

// DIVISION - Completionists by location
router.get('/users/completionists', async (req, res) => {
    const locationName = trimInput(req.query.location_name);
    if (!locationName) {
        return res.status(400).json({ success: false, error: 'location_name is required' });
    }

    try {
        const objectivesResult = await db.query(
            `SELECT TRIM(obj_name) AS OBJ_NAME
             FROM Objectives
             WHERE TRIM(location_name) = :location
             ORDER BY TRIM(obj_name)`,
            { location: locationName }
        );

        const objectivesAtLocation = (objectivesResult.rows || []).map((row) => row.OBJ_NAME);

        if (objectivesAtLocation.length === 0) {
            return res.status(404).json({
                success: false,
                error: `No objectives found for location '${locationName}'`
            });
        }

        const completionistsResult = await db.query(
            `SELECT TRIM(c.username) AS USERNAME,
                    TRIM(u.first_name) AS FIRST_NAME,
                    COUNT(DISTINCT TRIM(c.obj_name)) AS COMPLETED_COUNT
             FROM Completes c
             JOIN Users u ON TRIM(c.username) = TRIM(u.username)
             JOIN Objectives o ON TRIM(c.obj_name) = TRIM(o.obj_name)
             WHERE TRIM(o.location_name) = :location
             GROUP BY TRIM(c.username), TRIM(u.first_name)
             HAVING COUNT(DISTINCT TRIM(c.obj_name)) = :objectiveCount
             ORDER BY TRIM(c.username)`,
            { location: locationName, objectiveCount: objectivesAtLocation.length }
        );

        const data = (completionistsResult.rows || []).map((row) => ({
            username: row.USERNAME,
            first_name: row.FIRST_NAME,
            completed_count: Number(row.COMPLETED_COUNT) || 0,
            total_objectives: objectivesAtLocation.length
        }));

        const responseBody = {
            success: true,
            location: locationName,
            objectives_at_location: objectivesAtLocation,
            data,
            total: data.length
        };

        if (data.length === 0) {
            responseBody.message = 'No users have completed all objectives at this location';
        }

        return res.json(responseBody);
    } catch (err) {
        return handleServerError(res, err, 'Failed to fetch completionists');
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
