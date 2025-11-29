const db = require('./db');

const toDate = (dateString) => new Date(`${dateString}T00:00:00Z`);

const charTypes = [
    { chr_type: 'Warrior', base_hp: 100, base_damage: 25 },
    { chr_type: 'Mage', base_hp: 70, base_damage: 30 },
    { chr_type: 'Rogue', base_hp: 80, base_damage: 20 },
    { chr_type: 'Healer', base_hp: 90, base_damage: 15 },
    { chr_type: 'Tank', base_hp: 120, base_damage: 18 }
];

const itemSaleValues = [
    { item_rarity: 'Common', sale_value: 10 },
    { item_rarity: 'Uncommon', sale_value: 25 },
    { item_rarity: 'Rare', sale_value: 50 },
    { item_rarity: 'Epic', sale_value: 100 },
    { item_rarity: 'Legendary', sale_value: 250 }
];

const itemBoosts = [
    { item_rarity: 'Common', item_type: 'Weapon', boost: 5 },
    { item_rarity: 'Common', item_type: 'Armor', boost: 3 },
    { item_rarity: 'Uncommon', item_type: 'Weapon', boost: 10 },
    { item_rarity: 'Uncommon', item_type: 'Armor', boost: 12 },
    { item_rarity: 'Rare', item_type: 'Weapon', boost: 18 },
    { item_rarity: 'Rare', item_type: 'Armor', boost: 15 },
    { item_rarity: 'Epic', item_type: 'Weapon', boost: 25 },
    { item_rarity: 'Epic', item_type: 'Armor', boost: 30 },
    { item_rarity: 'Legendary', item_type: 'Weapon', boost: 45 },
    { item_rarity: 'Legendary', item_type: 'Armor', boost: 40 }
];

const difficulties = [
    { difficulty: 'Easy', hp_mult: 1, enemy_dmg_mult: 1 },
    { difficulty: 'Normal', hp_mult: 2, enemy_dmg_mult: 2 },
    { difficulty: 'Hard', hp_mult: 3, enemy_dmg_mult: 3 },
    { difficulty: 'Expert', hp_mult: 4, enemy_dmg_mult: 5 },
    { difficulty: 'Nightmare', hp_mult: 5, enemy_dmg_mult: 7 }
];

const users = [
    { username: 'player1', first_name: 'John', created_on: toDate('2024-01-15'), email: 'john@email.com' },
    { username: 'player2', first_name: 'Sarah', created_on: toDate('2024-02-20'), email: 'sarah@email.com' },
    { username: 'player3', first_name: 'Mike', created_on: toDate('2024-03-10'), email: 'mike@email.com' },
    { username: 'player4', first_name: 'Emma', created_on: toDate('2024-04-05'), email: 'emma@email.com' },
    { username: 'player5', first_name: 'Alex', created_on: toDate('2024-05-12'), email: 'alex@email.com' }
];

const locations = [
    { location_name: 'Dark Forest', story: 'A mysterious forest shrouded in eternal twilight, home to ancient secrets.', biome: 'Forest', landmark: 'Ancient Oak' },
    { location_name: 'Crystal Cave', story: 'Glowing crystals illuminate this underground wonder, pulsing with magic.', biome: 'Cave', landmark: 'Crystal Shrine' },
    { location_name: 'Desert Ruins', story: 'Ancient civilization remnants half-buried in endless golden sands.', biome: 'Desert', landmark: 'Pyramid' },
    { location_name: 'Mountain Peak', story: 'The highest point in the realm, where storms and legends are born.', biome: 'Mountain', landmark: 'Summit Temple' },
    { location_name: 'Coastal Village', story: 'A peaceful fishing village where adventurers begin their journey.', biome: 'Coast', landmark: 'Lighthouse' }
];

const items = [
    { item_name: 'Iron Sword', item_rarity: 'Common', item_type: 'Weapon' },
    { item_name: 'Steel Armor', item_rarity: 'Uncommon', item_type: 'Armor' },
    { item_name: 'Magic Staff', item_rarity: 'Rare', item_type: 'Weapon' },
    { item_name: 'Dragon Shield', item_rarity: 'Epic', item_type: 'Armor' },
    { item_name: 'Excalibur', item_rarity: 'Legendary', item_type: 'Weapon' }
];

const objectives = [
    { obj_name: 'Find Key', description: 'Search the forest floor for the hidden key.', location_name: 'Dark Forest', item_name: 'Iron Sword' },
    { obj_name: 'Defeat Boss', description: 'Defeat the Crystal Guardian in combat.', location_name: 'Crystal Cave', item_name: 'Magic Staff' },
    { obj_name: 'Solve Puzzle', description: 'Decode the ancient hieroglyphics.', location_name: 'Desert Ruins', item_name: null },
    { obj_name: 'Rescue NPC', description: 'Save the stranded climber from the cliff.', location_name: 'Mountain Peak', item_name: null },
    { obj_name: 'Collect Gems', description: 'Gather 10 sea gems from the shore.', location_name: 'Coastal Village', item_name: 'Dragon Shield' },
    { obj_name: 'Find Artifact', description: 'Locate the ancient artifact in the woods.', location_name: 'Dark Forest', item_name: null },
    { obj_name: 'Map Cave', description: 'Create a complete map of the cave system.', location_name: 'Crystal Cave', item_name: null }
];

const npcs = [
    { chr_name: 'Village Elder', chr_type: 'Healer', bg_story: 'Wise', location_name: 'Coastal Village' },
    { chr_name: 'Guard Captain', chr_type: 'Warrior', bg_story: 'Loyal', location_name: 'Dark Forest' },
    { chr_name: 'Merchant Tom', chr_type: 'Rogue', bg_story: 'Shady', location_name: 'Desert Ruins' },
    { chr_name: 'Wizard Merlin', chr_type: 'Mage', bg_story: 'Ancient', location_name: 'Crystal Cave' },
    { chr_name: 'Mountain Guide', chr_type: 'Tank', bg_story: 'Sturdy', location_name: 'Mountain Peak' }
];

const pcs = [
    { chr_name: 'Hero1', chr_type: 'Warrior', bg_story: 'Noble' },
    { chr_name: 'Hero2', chr_type: 'Mage', bg_story: 'Scholar' },
    { chr_name: 'Hero3', chr_type: 'Rogue', bg_story: 'Thief' },
    { chr_name: 'Hero4', chr_type: 'Healer', bg_story: 'Priest' },
    { chr_name: 'Hero5', chr_type: 'Tank', bg_story: 'Dweller' }
];

const checkpoints = [
    { checkpt_number: 1, description: 'The journey begins at the village.', location_name: 'Coastal Village' },
    { checkpt_number: 2, description: 'Deep within the dark woods.', location_name: 'Dark Forest' },
    { checkpt_number: 3, description: 'The crystal chamber entrance.', location_name: 'Crystal Cave' },
    { checkpt_number: 4, description: 'The desert oasis checkpoint.', location_name: 'Desert Ruins' },
    { checkpt_number: 5, description: 'The final ascent begins.', location_name: 'Mountain Peak' }
];

const saveFiles = [
    { username: 'player1', created_on: toDate('2024-01-15'), difficulty: 'Normal' },
    { username: 'player1', created_on: toDate('2024-06-01'), difficulty: 'Hard' },
    { username: 'player2', created_on: toDate('2024-02-20'), difficulty: 'Hard' },
    { username: 'player2', created_on: toDate('2024-07-15'), difficulty: 'Expert' },
    { username: 'player2', created_on: toDate('2024-08-20'), difficulty: 'Nightmare' },
    { username: 'player3', created_on: toDate('2024-03-10'), difficulty: 'Easy' },
    { username: 'player4', created_on: toDate('2024-04-05'), difficulty: 'Expert' },
    { username: 'player5', created_on: toDate('2024-05-12'), difficulty: 'Nightmare' }
];

const achievements = [
    { achievement_name: 'First Steps', description: 'Complete your first objective.', username: 'player1', obj_name: 'Find Key' },
    { achievement_name: 'Cave Explorer', description: 'Defeat the Crystal Guardian.', username: 'player2', obj_name: 'Defeat Boss' },
    { achievement_name: 'Puzzle Master', description: 'Solve an ancient puzzle.', username: 'player3', obj_name: 'Solve Puzzle' },
    { achievement_name: 'Hero', description: 'Rescue someone in need.', username: 'player4', obj_name: 'Rescue NPC' },
    { achievement_name: 'Collector', description: 'Gather all the gems.', username: 'player5', obj_name: 'Collect Gems' }
];

const completes = [
    { username: 'player1', obj_name: 'Find Key' },
    { username: 'player1', obj_name: 'Find Artifact' },
    { username: 'player2', obj_name: 'Defeat Boss' },
    { username: 'player2', obj_name: 'Map Cave' },
    { username: 'player3', obj_name: 'Solve Puzzle' },
    { username: 'player4', obj_name: 'Rescue NPC' },
    { username: 'player5', obj_name: 'Collect Gems' }
];

const earned = [
    { achievement_name: 'First Steps', username: 'player1', date_earned: toDate('2024-01-20') },
    { achievement_name: 'Cave Explorer', username: 'player2', date_earned: toDate('2024-02-25') },
    { achievement_name: 'Puzzle Master', username: 'player3', date_earned: toDate('2024-03-15') },
    { achievement_name: 'Hero', username: 'player4', date_earned: toDate('2024-04-10') },
    { achievement_name: 'Collector', username: 'player5', date_earned: toDate('2024-05-20') }
];

const currentAssignments = [
    { username: 'player1', created_on: toDate('2024-01-15'), chr_name: 'Hero1' },
    { username: 'player1', created_on: toDate('2024-06-01'), chr_name: 'Hero2' },
    { username: 'player2', created_on: toDate('2024-02-20'), chr_name: 'Hero2' },
    { username: 'player3', created_on: toDate('2024-03-10'), chr_name: 'Hero3' },
    { username: 'player4', created_on: toDate('2024-04-05'), chr_name: 'Hero4' },
    { username: 'player5', created_on: toDate('2024-05-12'), chr_name: 'Hero5' }
];

const contains = [
    { username: 'player1', created_on: toDate('2024-01-15'), item_name: 'Iron Sword', quantity: 1 },
    { username: 'player1', created_on: toDate('2024-01-15'), item_name: 'Steel Armor', quantity: 2 },
    { username: 'player1', created_on: toDate('2024-06-01'), item_name: 'Magic Staff', quantity: 1 },
    { username: 'player2', created_on: toDate('2024-02-20'), item_name: 'Steel Armor', quantity: 1 },
    { username: 'player2', created_on: toDate('2024-02-20'), item_name: 'Magic Staff', quantity: 1 },
    { username: 'player2', created_on: toDate('2024-02-20'), item_name: 'Dragon Shield', quantity: 1 },
    { username: 'player3', created_on: toDate('2024-03-10'), item_name: 'Magic Staff', quantity: 1 },
    { username: 'player4', created_on: toDate('2024-04-05'), item_name: 'Dragon Shield', quantity: 2 },
    { username: 'player5', created_on: toDate('2024-05-12'), item_name: 'Excalibur', quantity: 1 },
    { username: 'player5', created_on: toDate('2024-05-12'), item_name: 'Dragon Shield', quantity: 1 }
];

const prerequisites = [
    { checkpt_number: 1, obj_name: 'Find Key' },
    { checkpt_number: 2, obj_name: 'Find Key' },
    { checkpt_number: 3, obj_name: 'Defeat Boss' },
    { checkpt_number: 4, obj_name: 'Solve Puzzle' },
    { checkpt_number: 5, obj_name: 'Rescue NPC' }
];

const insertStatements = {
    charTypes: `
        INSERT INTO CharTypes (chr_type, base_hp, base_damage)
        SELECT :chr_type, :base_hp, :base_damage FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM CharTypes WHERE TRIM(chr_type) = :chr_type
        )
    `,
    itemSaleValues: `
        INSERT INTO ItemSaleValue (item_rarity, sale_value)
        SELECT :item_rarity, :sale_value FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM ItemSaleValue WHERE TRIM(item_rarity) = :item_rarity
        )
    `,
    itemBoosts: `
        INSERT INTO ItemBoost (item_rarity, item_type, boost)
        SELECT :item_rarity, :item_type, :boost FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM ItemBoost
            WHERE TRIM(item_rarity) = :item_rarity AND TRIM(item_type) = :item_type
        )
    `,
    difficulties: `
        INSERT INTO Difficulty (difficulty, hp_mult, enemy_dmg_mult)
        SELECT :difficulty, :hp_mult, :enemy_dmg_mult FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Difficulty WHERE TRIM(difficulty) = :difficulty
        )
    `,
    users: `
        INSERT INTO Users (username, first_name, created_on, email)
        SELECT :username, :first_name, :created_on, :email FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Users WHERE TRIM(username) = :username
        )
    `,
    locations: `
        INSERT INTO Locations (location_name, story, biome, landmark)
        SELECT :location_name, :story, :biome, :landmark FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Locations WHERE TRIM(location_name) = :location_name
        )
    `,
    items: `
        INSERT INTO Items (item_name, item_rarity, item_type)
        SELECT :item_name, :item_rarity, :item_type FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Items WHERE TRIM(item_name) = :item_name
        )
    `,
    objectives: `
        INSERT INTO Objectives (obj_name, description, location_name, item_name)
        SELECT :obj_name, :description, :location_name, :item_name FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Objectives WHERE TRIM(obj_name) = :obj_name
        )
    `,
    npcs: `
        INSERT INTO NPCs_IsAt (chr_name, chr_type, bg_story, location_name)
        SELECT :chr_name, :chr_type, :bg_story, :location_name FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM NPCs_IsAt WHERE TRIM(chr_name) = :chr_name
        )
    `,
    pcs: `
        INSERT INTO PCs (chr_name, chr_type, bg_story)
        SELECT :chr_name, :chr_type, :bg_story FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM PCs WHERE TRIM(chr_name) = :chr_name
        )
    `,
    checkpoints: `
        INSERT INTO Checkpoints_IsAt (checkpt_number, description, location_name)
        SELECT :checkpt_number, :description, :location_name FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Checkpoints_IsAt WHERE checkpt_number = :checkpt_number
        )
    `,
    saveFiles: `
        INSERT INTO SaveFiles_IsAt (username, created_on, difficulty)
        SELECT :username, :created_on, :difficulty FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM SaveFiles_IsAt
            WHERE TRIM(username) = :username AND created_on = :created_on
        )
    `,
    achievements: `
        INSERT INTO Achievements_monitors (achievement_name, description, username, obj_name)
        SELECT :achievement_name, :description, :username, :obj_name FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Achievements_monitors WHERE TRIM(achievement_name) = :achievement_name
        )
    `,
    completes: `
        INSERT INTO Completes (username, obj_name)
        SELECT :username, :obj_name FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Completes WHERE TRIM(username) = :username AND TRIM(obj_name) = :obj_name
        )
    `,
    earned: `
        INSERT INTO Earned (achievement_name, username, date_earned)
        SELECT :achievement_name, :username, :date_earned FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Earned
            WHERE TRIM(achievement_name) = :achievement_name AND TRIM(username) = :username
        )
    `,
    currentAssignments: `
        INSERT INTO "Current" (username, created_on, chr_name)
        SELECT :username, :created_on, :chr_name FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM "Current"
            WHERE TRIM(username) = :username AND created_on = :created_on AND TRIM(chr_name) = :chr_name
        )
    `,
    containsWithQuantity: `
        INSERT INTO Contains (username, created_on, item_name, quantity)
        SELECT :username, :created_on, :item_name, :quantity FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Contains
            WHERE TRIM(username) = :username AND created_on = :created_on AND TRIM(item_name) = :item_name
        )
    `,
    containsWithoutQuantity: `
        INSERT INTO Contains (username, created_on, item_name)
        SELECT :username, :created_on, :item_name FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM Contains
            WHERE TRIM(username) = :username AND created_on = :created_on AND TRIM(item_name) = :item_name
        )
    `,
    prerequisites: `
        INSERT INTO HasAPrerequisite (checkpt_number, obj_name)
        SELECT :checkpt_number, :obj_name FROM dual
        WHERE NOT EXISTS (
            SELECT 1 FROM HasAPrerequisite
            WHERE checkpt_number = :checkpt_number AND TRIM(obj_name) = :obj_name
        )
    `
};

async function seedCollection(sql, collection) {
    for (const record of collection) {
        await db.query(sql, record, { autoCommit: true });
    }
}

let hasSeeded = false;

async function columnExists(tableName, columnName) {
    const result = await db.query(
        `SELECT 1 FROM user_tab_columns
         WHERE table_name = :tableName AND column_name = :columnName
         FETCH FIRST 1 ROW ONLY`,
        { tableName: tableName.toUpperCase(), columnName: columnName.toUpperCase() }
    );
    return Boolean(result.rows && result.rows.length > 0);
}

async function seedInitialData() {
    if (hasSeeded) {
        return;
    }
    hasSeeded = true;
    await db.initPool();
    await seedCollection(insertStatements.charTypes, charTypes);
    await seedCollection(insertStatements.itemSaleValues, itemSaleValues);
    await seedCollection(insertStatements.itemBoosts, itemBoosts);
    await seedCollection(insertStatements.difficulties, difficulties);
    await seedCollection(insertStatements.users, users);
    await seedCollection(insertStatements.locations, locations);
    await seedCollection(insertStatements.items, items);
    await seedCollection(insertStatements.objectives, objectives);
    await seedCollection(insertStatements.npcs, npcs);
    await seedCollection(insertStatements.pcs, pcs);
    await seedCollection(insertStatements.checkpoints, checkpoints);
    await seedCollection(insertStatements.saveFiles, saveFiles);
    await seedCollection(insertStatements.achievements, achievements);
    await seedCollection(insertStatements.completes, completes);
    await seedCollection(insertStatements.earned, earned);
    await seedCollection(insertStatements.currentAssignments, currentAssignments);
    const hasQuantityColumn = await columnExists('CONTAINS', 'QUANTITY');
    const containsSql = hasQuantityColumn
        ? insertStatements.containsWithQuantity
        : insertStatements.containsWithoutQuantity;
    const containsData = hasQuantityColumn
        ? contains
        : contains.map(({ username, created_on, item_name }) => ({ username, created_on, item_name }));
    await seedCollection(containsSql, containsData);
    await seedCollection(insertStatements.prerequisites, prerequisites);
}

module.exports = {
    seedInitialData
};
