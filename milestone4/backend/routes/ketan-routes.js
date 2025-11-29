const express = require("express");
const db = require("../db");

const router = express.Router();

function handleServerError(res, err, message) {
  console.error(err);
  return res.status(500).json({
    success: false,
    error: message || "Internal server error",
    details: err.message,
  });
}

function trimInput(value) {
  return typeof value === "string" ? value.trim() : value;
}

// K1: INSERT - Create User
router.post("/users", async (req, res) => {
  const username = trimInput(req.body.username);
  const firstName = trimInput(req.body.first_name);
  const email = trimInput(req.body.email);

  if (!username || !firstName || !email) {
    return res.status(400).json({
      success: false,
      error: "Username, first_name, and email are required",
    });
  }

  try {
    const existingUser = await db.query(
      `SELECT TRIM(username) AS USERNAME FROM Users WHERE TRIM(username) = :username`,
      { username }
    );

    if (existingUser.rows && existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    await db.query(
      `INSERT INTO Users (username, first_name, created_on, email)
             VALUES (:username, :first_name, SYSDATE, :email)`,
      { username, first_name: firstName, email },
      { autoCommit: true }
    );

    const result = await db.query(
      `SELECT TRIM(username) AS USERNAME,
                    TRIM(first_name) AS FIRST_NAME,
                    TO_CHAR(created_on, 'YYYY-MM-DD') AS CREATED_ON,
                    email AS EMAIL
             FROM Users
             WHERE TRIM(username) = :username`,
      { username }
    );

    const user = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        username: user.USERNAME,
        first_name: user.FIRST_NAME,
        created_on: user.CREATED_ON,
        email: user.EMAIL,
      },
    });
  } catch (err) {
    return handleServerError(res, err, "Failed to create user");
  }
});

// K2: INSERT - Create SaveFile
router.post("/savefiles", async (req, res) => {
  const username = trimInput(req.body.username);
  const difficulty = trimInput(req.body.difficulty);

  if (!username || !difficulty) {
    return res.status(400).json({
      success: false,
      error: "Username and difficulty are required",
    });
  }

  try {
    const userCheck = await db.query(
      `SELECT TRIM(username) AS USERNAME FROM Users WHERE TRIM(username) = :username`,
      { username }
    );

    if (!userCheck.rows || userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const difficultyCheck = await db.query(
      `SELECT TRIM(difficulty) AS DIFFICULTY FROM Difficulty WHERE TRIM(difficulty) = :difficulty`,
      { difficulty }
    );

    if (!difficultyCheck.rows || difficultyCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid difficulty level",
      });
    }

    await db.query(
      `INSERT INTO SaveFiles_IsAt (username, created_on, difficulty)
             VALUES (:username, SYSDATE, :difficulty)`,
      { username, difficulty },
      { autoCommit: true }
    );

    const result = await db.query(
      `SELECT TRIM(username) AS USERNAME,
                    TO_CHAR(created_on, 'YYYY-MM-DD') AS CREATED_ON,
                    TRIM(difficulty) AS DIFFICULTY
             FROM SaveFiles_IsAt
             WHERE TRIM(username) = :username
             ORDER BY created_on DESC
             FETCH FIRST 1 ROW ONLY`,
      { username }
    );

    const saveFile = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "Save file created successfully",
      data: {
        username: saveFile.USERNAME,
        created_on: saveFile.CREATED_ON,
        difficulty: saveFile.DIFFICULTY,
      },
    });
  } catch (err) {
    return handleServerError(res, err, "Failed to create save file");
  }
});

// K3: SELECTION - Search Characters with dynamic AND/OR conditions
router.post("/characters/search", async (req, res) => {
  const characterKind = trimInput(req.body.character_kind) || "all";
  const conditions = req.body.conditions || [];

  // Allowed attributes for security (prevent SQL injection)
  const allowedAttributes = [
    "chr_name",
    "chr_type",
    "bg_story",
    "location_name",
  ];
  const allowedOperators = ["=", "LIKE"];

  // Build WHERE clause from conditions
  function buildWhereClause(
    conditions,
    binds,
    bindPrefix,
    includeLocation = true
  ) {
    if (!conditions || conditions.length === 0) {
      return "";
    }

    let whereClause = "";
    let bindIndex = 0;

    for (let i = 0; i < conditions.length; i++) {
      const cond = conditions[i];
      const attr = trimInput(cond.attribute);
      const op = trimInput(cond.operator);
      const val = trimInput(cond.value);
      const connector =
        i === 0 ? "" : ` ${trimInput(cond.connector) || "AND"} `;

      // Skip invalid or empty conditions
      if (
        !attr ||
        !val ||
        !allowedAttributes.includes(attr) ||
        !allowedOperators.includes(op)
      ) {
        continue;
      }

      // Skip location_name for PCs (they don't have location)
      if (!includeLocation && attr === "location_name") {
        continue;
      }

      const bindName = `${bindPrefix}${bindIndex}`;
      bindIndex++;

      // Map attribute to column expression
      let columnExpr;
      if (attr === "bg_story") {
        columnExpr = "bg_story";
      } else {
        columnExpr = `TRIM(${attr})`;
      }

      // Build condition
      if (op === "LIKE") {
        whereClause += `${connector}${columnExpr} LIKE :${bindName}`;
        binds[bindName] = `%${val}%`;
      } else {
        whereClause += `${connector}${columnExpr} = :${bindName}`;
        binds[bindName] = val;
      }
    }

    return whereClause ? ` AND (${whereClause})` : "";
  }

  try {
    let npcs = [];
    let pcs = [];

    if (characterKind === "all" || characterKind === "NPC") {
      const npcBinds = {};
      const whereClause = buildWhereClause(conditions, npcBinds, "npc", true);

      const npcQuery = `
                SELECT TRIM(chr_name) AS CHR_NAME,
                       TRIM(chr_type) AS CHR_TYPE,
                       bg_story AS BG_STORY,
                       TRIM(location_name) AS LOCATION_NAME
                FROM NPCs_IsAt
                WHERE 1=1 ${whereClause}
                ORDER BY TRIM(chr_name)
            `;

      const npcResult = await db.query(npcQuery, npcBinds);
      npcs = (npcResult.rows || []).map((row) => ({
        chr_name: row.CHR_NAME,
        chr_type: row.CHR_TYPE,
        bg_story: row.BG_STORY,
        location_name: row.LOCATION_NAME,
      }));
    }

    if (characterKind === "all" || characterKind === "PC") {
      const pcBinds = {};
      const whereClause = buildWhereClause(conditions, pcBinds, "pc", false);

      const pcQuery = `
                SELECT TRIM(chr_name) AS CHR_NAME,
                       TRIM(chr_type) AS CHR_TYPE,
                       bg_story AS BG_STORY
                FROM PCs
                WHERE 1=1 ${whereClause}
                ORDER BY TRIM(chr_name)
            `;

      const pcResult = await db.query(pcQuery, pcBinds);
      pcs = (pcResult.rows || []).map((row) => ({
        chr_name: row.CHR_NAME,
        chr_type: row.CHR_TYPE,
        bg_story: row.BG_STORY,
      }));
    }

    return res.json({
      success: true,
      data: {
        npcs,
        pcs,
      },
      total: npcs.length + pcs.length,
    });
  } catch (err) {
    return handleServerError(res, err, "Failed to search characters");
  }
});

// K4: PROJECTION - Custom User Report
router.get("/users/report", async (req, res) => {
  const fieldsParam = trimInput(req.query.fields);

  if (!fieldsParam) {
    return res.status(400).json({
      success: false,
      error:
        "fields parameter is required (comma-separated: username, first_name, created_on, email)",
    });
  }

  const allowedFields = ["username", "first_name", "created_on", "email"];
  const requestedFields = fieldsParam
    .split(",")
    .map((f) => f.trim().toLowerCase());

  const invalidFields = requestedFields.filter(
    (f) => !allowedFields.includes(f)
  );
  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Invalid fields: ${invalidFields.join(
        ", "
      )}. Allowed: ${allowedFields.join(", ")}`,
    });
  }

  const columnMap = {
    username: "TRIM(username) AS USERNAME",
    first_name: "TRIM(first_name) AS FIRST_NAME",
    created_on: "TO_CHAR(created_on, 'YYYY-MM-DD') AS CREATED_ON",
    email: "email AS EMAIL",
  };

  const selectColumns = requestedFields.map((f) => columnMap[f]).join(", ");

  try {
    const result = await db.query(
      `SELECT ${selectColumns} FROM Users ORDER BY TRIM(username)`
    );

    const data = (result.rows || []).map((row) => {
      const obj = {};
      requestedFields.forEach((field) => {
        const key = field.toUpperCase();
        obj[field] = row[key];
      });
      return obj;
    });

    return res.json({
      success: true,
      fields: requestedFields,
      data,
      total: data.length,
    });
  } catch (err) {
    return handleServerError(res, err, "Failed to generate user report");
  }
});

// K5: GROUP BY - Items per Rarity
router.get("/items/stats/by-rarity", async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT TRIM(i.item_rarity) AS ITEM_RARITY,
                    COUNT(*) AS ITEM_COUNT,
                    isv.sale_value AS SALE_VALUE,
                    COUNT(*) * isv.sale_value AS TOTAL_VALUE
             FROM Items i
             JOIN ItemSaleValue isv ON TRIM(i.item_rarity) = TRIM(isv.item_rarity)
             GROUP BY TRIM(i.item_rarity), isv.sale_value
             ORDER BY isv.sale_value`
    );

    const data = (result.rows || []).map((row) => ({
      item_rarity: row.ITEM_RARITY,
      item_count: Number(row.ITEM_COUNT) || 0,
      sale_value: Number(row.SALE_VALUE) || 0,
      total_value: Number(row.TOTAL_VALUE) || 0,
    }));

    return res.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (err) {
    return handleServerError(res, err, "Failed to fetch items by rarity");
  }
});

// K6: NESTED AGGREGATION - SaveFile Analysis
router.get("/savefiles/analysis", async (_req, res) => {
  try {
    const byDifficultyResult = await db.query(
      `SELECT TRIM(d.difficulty) AS DIFFICULTY,
                    COUNT(DISTINCT sf.username || TO_CHAR(sf.created_on, 'YYYY-MM-DD HH24:MI:SS')) AS SAVEFILE_COUNT,
                    NVL(ROUND(AVG(item_counts.item_count), 2), 0) AS AVG_ITEMS_PER_SAVE,
                    NVL(SUM(item_counts.item_count), 0) AS TOTAL_ITEMS
             FROM Difficulty d
             LEFT JOIN SaveFiles_IsAt sf ON TRIM(d.difficulty) = TRIM(sf.difficulty)
             LEFT JOIN (
                 SELECT username, created_on, COUNT(*) AS item_count
                 FROM Contains
                 GROUP BY username, created_on
             ) item_counts ON sf.username = item_counts.username
                          AND sf.created_on = item_counts.created_on
             GROUP BY TRIM(d.difficulty), d.hp_mult
             ORDER BY d.hp_mult`
    );

    const byDifficulty = (byDifficultyResult.rows || []).map((row) => ({
      difficulty: row.DIFFICULTY,
      savefile_count: Number(row.SAVEFILE_COUNT) || 0,
      avg_items_per_save: Number(row.AVG_ITEMS_PER_SAVE) || 0,
      total_items: Number(row.TOTAL_ITEMS) || 0,
    }));

    const overallResult = await db.query(
      `SELECT COUNT(*) AS TOTAL_SAVEFILES,
                    NVL(ROUND(AVG(item_counts.item_count), 2), 0) AS AVG_ITEMS_ACROSS_ALL,
                    NVL(MAX(item_counts.item_count), 0) AS MAX_ITEMS_IN_SAVE
             FROM SaveFiles_IsAt sf
             LEFT JOIN (
                 SELECT username, created_on, COUNT(*) AS item_count
                 FROM Contains
                 GROUP BY username, created_on
             ) item_counts ON sf.username = item_counts.username
                          AND sf.created_on = item_counts.created_on`
    );

    const mostSavesResult = await db.query(
      `SELECT TRIM(difficulty) AS DIFFICULTY, COUNT(*) AS CNT
             FROM SaveFiles_IsAt
             GROUP BY TRIM(difficulty)
             ORDER BY CNT DESC
             FETCH FIRST 1 ROW ONLY`
    );

    const overallRow = overallResult.rows[0] || {};
    const mostSavesRow = mostSavesResult.rows[0] || {};

    return res.json({
      success: true,
      data: {
        byDifficulty,
        overall: {
          total_savefiles: Number(overallRow.TOTAL_SAVEFILES) || 0,
          avg_items_across_all: Number(overallRow.AVG_ITEMS_ACROSS_ALL) || 0,
          max_items_in_save: Number(overallRow.MAX_ITEMS_IN_SAVE) || 0,
          difficulty_with_most_saves: mostSavesRow.DIFFICULTY || null,
        },
      },
    });
  } catch (err) {
    return handleServerError(res, err, "Failed to analyze save files");
  }
});

// K7: Helper - Get Difficulties
router.get("/difficulties", async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT TRIM(difficulty) AS DIFFICULTY, hp_mult AS HP_MULT, enemy_dmg_mult AS ENEMY_DMG_MULT
             FROM Difficulty
             ORDER BY hp_mult`
    );

    const data = (result.rows || []).map((row) => row.DIFFICULTY);
    const detailed = (result.rows || []).map((row) => ({
      difficulty: row.DIFFICULTY,
      hp_mult: Number(row.HP_MULT) || 0,
      enemy_dmg_mult: Number(row.ENEMY_DMG_MULT) || 0,
    }));

    return res.json({
      success: true,
      data,
      detailed,
      total: data.length,
    });
  } catch (err) {
    return handleServerError(res, err, "Failed to fetch difficulties");
  }
});

// K8: Helper - Get Character Types
router.get("/chartypes", async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT TRIM(chr_type) AS CHR_TYPE, base_hp AS BASE_HP, base_damage AS BASE_DAMAGE
             FROM CharTypes
             ORDER BY chr_type`
    );

    const data = (result.rows || []).map((row) => row.CHR_TYPE);
    const detailed = (result.rows || []).map((row) => ({
      chr_type: row.CHR_TYPE,
      base_hp: Number(row.BASE_HP) || 0,
      base_damage: Number(row.BASE_DAMAGE) || 0,
    }));

    return res.json({
      success: true,
      data,
      detailed,
      total: data.length,
    });
  } catch (err) {
    return handleServerError(res, err, "Failed to fetch character types");
  }
});

module.exports = router;
