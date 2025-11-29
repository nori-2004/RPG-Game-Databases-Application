-- We are using Oracle SQL syntax
-- Kindly Note: That we would use ON UPDATE CASCADE if we had any foreign keys referencing primary keys that could be updated. But in Oracle, we cannot use ON UPDATE CASCADE.

-- DROP statements (run these first if tables already exist)
DROP TABLE HasAPrerequisite CASCADE CONSTRAINTS;
DROP TABLE Contains CASCADE CONSTRAINTS;
DROP TABLE "Current" CASCADE CONSTRAINTS;
DROP TABLE Earned CASCADE CONSTRAINTS;
DROP TABLE Completes CASCADE CONSTRAINTS;
DROP TABLE Achievements_monitors CASCADE CONSTRAINTS;
DROP TABLE SaveFiles_IsAt CASCADE CONSTRAINTS;
DROP TABLE Checkpoints_IsAt CASCADE CONSTRAINTS;
DROP TABLE PCs CASCADE CONSTRAINTS;
DROP TABLE NPCs_IsAt CASCADE CONSTRAINTS;
DROP TABLE Objectives CASCADE CONSTRAINTS;
DROP TABLE Items CASCADE CONSTRAINTS;
DROP TABLE Locations CASCADE CONSTRAINTS;
DROP TABLE Users CASCADE CONSTRAINTS;
DROP TABLE Difficulty CASCADE CONSTRAINTS;
DROP TABLE ItemBoost CASCADE CONSTRAINTS;
DROP TABLE ItemSaleValue CASCADE CONSTRAINTS;
DROP TABLE CharTypes CASCADE CONSTRAINTS;

-- CREATE TABLES

CREATE TABLE CharTypes (
    chr_type CHAR(20) PRIMARY KEY,
    base_hp INTEGER NOT NULL,
    base_damage INTEGER NOT NULL
);

CREATE TABLE ItemSaleValue (
    item_rarity CHAR(20) PRIMARY KEY,
    sale_value INTEGER NOT NULL
);

CREATE TABLE ItemBoost (
    item_rarity CHAR(20),
    item_type CHAR(20),
    boost INTEGER NOT NULL,
    PRIMARY KEY (item_rarity, item_type)
);

CREATE TABLE Difficulty (
    difficulty CHAR(20) PRIMARY KEY,
    hp_mult INTEGER NOT NULL,
    enemy_dmg_mult INTEGER NOT NULL
);

CREATE TABLE Users (
    username CHAR(20) PRIMARY KEY,
    first_name CHAR(20),
    created_on DATE,
    email VARCHAR2(255) NOT NULL UNIQUE
);

CREATE TABLE Locations (
    location_name CHAR(20) PRIMARY KEY,
    story VARCHAR2(4000),
    biome CHAR(10) NOT NULL,
    landmark CHAR(20) NOT NULL,
    UNIQUE (biome, landmark)
);

CREATE TABLE Items (
    item_name CHAR(20) PRIMARY KEY,
    item_rarity CHAR(20) NOT NULL,
    item_type CHAR(20) NOT NULL,
    FOREIGN KEY (item_rarity) REFERENCES ItemSaleValue(item_rarity) 
        ON DELETE CASCADE,
    FOREIGN KEY (item_rarity, item_type) REFERENCES ItemBoost(item_rarity, item_type) 
        ON DELETE CASCADE
);

CREATE TABLE Objectives (
    obj_name CHAR(20) PRIMARY KEY,
    description VARCHAR2(4000),
    location_name CHAR(20),
    item_name CHAR(20),
    FOREIGN KEY (location_name) REFERENCES Locations(location_name) 
        ON DELETE SET NULL,
    FOREIGN KEY (item_name) REFERENCES Items(item_name) 
        ON DELETE SET NULL
);

CREATE TABLE NPCs_IsAt (
    chr_name CHAR(20) PRIMARY KEY,
    chr_type CHAR(20) NOT NULL,
    bg_story CHAR(20),
    location_name CHAR(20),
    FOREIGN KEY (location_name) REFERENCES Locations(location_name) 
        ON DELETE SET NULL,
    FOREIGN KEY (chr_type) REFERENCES CharTypes(chr_type) 
        ON DELETE CASCADE
);

CREATE TABLE PCs (
    chr_name CHAR(20) PRIMARY KEY,
    chr_type CHAR(20) NOT NULL,
    bg_story CHAR(20),
    FOREIGN KEY (chr_type) REFERENCES CharTypes(chr_type) 
        ON DELETE CASCADE
);

CREATE TABLE Checkpoints_IsAt (
    checkpt_number INTEGER PRIMARY KEY,
    description VARCHAR2(4000),
    location_name CHAR(20) NOT NULL,
    FOREIGN KEY (location_name) REFERENCES Locations(location_name) 
        ON DELETE CASCADE
);

CREATE TABLE SaveFiles_IsAt (
    username CHAR(20),
    created_on DATE,
    difficulty CHAR(20) NOT NULL,
    PRIMARY KEY (username, created_on),
    FOREIGN KEY (username) REFERENCES Users(username) 
        ON DELETE CASCADE,
    FOREIGN KEY (difficulty) REFERENCES Difficulty(difficulty) 
        ON DELETE CASCADE
);

CREATE TABLE Achievements_monitors (
    achievement_name CHAR(20) PRIMARY KEY,
    description VARCHAR2(4000) NOT NULL,
    username CHAR(20) NOT NULL,
    obj_name CHAR(20) NOT NULL,
    FOREIGN KEY (username) REFERENCES Users(username) 
        ON DELETE CASCADE,
    FOREIGN KEY (obj_name) REFERENCES Objectives(obj_name) 
        ON DELETE CASCADE
);

CREATE TABLE Completes (
    username CHAR(20) NOT NULL,
    obj_name CHAR(20) NOT NULL,
    PRIMARY KEY (username, obj_name),
    FOREIGN KEY (username) REFERENCES Users(username) 
        ON DELETE CASCADE,
    FOREIGN KEY (obj_name) REFERENCES Objectives(obj_name) 
        ON DELETE CASCADE
);

CREATE TABLE Earned (
    achievement_name CHAR(20) NOT NULL,
    username CHAR(20) NOT NULL,
    date_earned DATE NOT NULL,
    PRIMARY KEY (achievement_name, username),
    FOREIGN KEY (achievement_name) REFERENCES Achievements_monitors(achievement_name) 
        ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES Users(username) 
        ON DELETE CASCADE
);

CREATE TABLE "Current" (
    username CHAR(20),
    created_on DATE,
    chr_name CHAR(20),
    PRIMARY KEY (username, created_on, chr_name),
    FOREIGN KEY (username, created_on) REFERENCES SaveFiles_IsAt(username, created_on) 
        ON DELETE CASCADE,
    FOREIGN KEY (chr_name) REFERENCES PCs(chr_name) 
        ON DELETE CASCADE
);

CREATE TABLE Contains (
    username CHAR(20),
    created_on DATE,
    item_name CHAR(20),
    quantity INTEGER,
    PRIMARY KEY (username, created_on, item_name),
    FOREIGN KEY (username, created_on) REFERENCES SaveFiles_IsAt(username, created_on) 
        ON DELETE CASCADE,
    FOREIGN KEY (item_name) REFERENCES Items(item_name) 
        ON DELETE CASCADE
);

CREATE TABLE HasAPrerequisite (
    checkpt_number INTEGER,
    obj_name CHAR(20),
    PRIMARY KEY (checkpt_number, obj_name),
    FOREIGN KEY (checkpt_number) REFERENCES Checkpoints_IsAt(checkpt_number) 
        ON DELETE CASCADE,
    FOREIGN KEY (obj_name) REFERENCES Objectives(obj_name) 
        ON DELETE CASCADE
);

--- INSERT STATEMENTS ---

-- CharTypes
INSERT INTO CharTypes VALUES ('Warrior', 100, 25);
INSERT INTO CharTypes VALUES ('Mage', 70, 30);
INSERT INTO CharTypes VALUES ('Rogue', 80, 20);
INSERT INTO CharTypes VALUES ('Healer', 90, 15);
INSERT INTO CharTypes VALUES ('Tank', 120, 18);

-- ItemSaleValue
INSERT INTO ItemSaleValue VALUES ('Common', 10);
INSERT INTO ItemSaleValue VALUES ('Uncommon', 25);
INSERT INTO ItemSaleValue VALUES ('Rare', 50);
INSERT INTO ItemSaleValue VALUES ('Epic', 100);
INSERT INTO ItemSaleValue VALUES ('Legendary', 250);

-- ItemBoost (NOTE: Missing 'Common' + 'Armor' combo - adding it for completeness)
INSERT INTO ItemBoost VALUES ('Common', 'Weapon', 5);
INSERT INTO ItemBoost VALUES ('Common', 'Armor', 3);
INSERT INTO ItemBoost VALUES ('Uncommon', 'Weapon', 10);
INSERT INTO ItemBoost VALUES ('Uncommon', 'Armor', 12);
INSERT INTO ItemBoost VALUES ('Rare', 'Weapon', 18);
INSERT INTO ItemBoost VALUES ('Rare', 'Armor', 15);
INSERT INTO ItemBoost VALUES ('Epic', 'Weapon', 25);
INSERT INTO ItemBoost VALUES ('Epic', 'Armor', 30);
INSERT INTO ItemBoost VALUES ('Legendary', 'Weapon', 45);
INSERT INTO ItemBoost VALUES ('Legendary', 'Armor', 40);

-- Difficulty
INSERT INTO Difficulty VALUES ('Easy', 1, 1);
INSERT INTO Difficulty VALUES ('Normal', 2, 2);
INSERT INTO Difficulty VALUES ('Hard', 3, 3);
INSERT INTO Difficulty VALUES ('Expert', 4, 5);
INSERT INTO Difficulty VALUES ('Nightmare', 5, 7);

-- Users
INSERT INTO Users VALUES ('player1', 'John', DATE '2024-01-15', 'john@email.com');
INSERT INTO Users VALUES ('player2', 'Sarah', DATE '2024-02-20', 'sarah@email.com');
INSERT INTO Users VALUES ('player3', 'Mike', DATE '2024-03-10', 'mike@email.com');
INSERT INTO Users VALUES ('player4', 'Emma', DATE '2024-04-05', 'emma@email.com');
INSERT INTO Users VALUES ('player5', 'Alex', DATE '2024-05-12', 'alex@email.com');

-- Locations
INSERT INTO Locations VALUES ('Dark Forest', 'A mysterious forest shrouded in eternal twilight, home to ancient secrets.', 'Forest', 'Ancient Oak');
INSERT INTO Locations VALUES ('Crystal Cave', 'Glowing crystals illuminate this underground wonder, pulsing with magic.', 'Cave', 'Crystal Shrine');
INSERT INTO Locations VALUES ('Desert Ruins', 'Ancient civilization remnants half-buried in endless golden sands.', 'Desert', 'Pyramid');
INSERT INTO Locations VALUES ('Mountain Peak', 'The highest point in the realm, where storms and legends are born.', 'Mountain', 'Summit Temple');
INSERT INTO Locations VALUES ('Coastal Village', 'A peaceful fishing village where adventurers begin their journey.', 'Coast', 'Lighthouse');

-- Items
INSERT INTO Items VALUES ('Iron Sword', 'Common', 'Weapon');
INSERT INTO Items VALUES ('Steel Armor', 'Uncommon', 'Armor');
INSERT INTO Items VALUES ('Magic Staff', 'Rare', 'Weapon');
INSERT INTO Items VALUES ('Dragon Shield', 'Epic', 'Armor');
INSERT INTO Items VALUES ('Excalibur', 'Legendary', 'Weapon');

-- Objectives (more variety for better query results)
INSERT INTO Objectives VALUES ('Find Key', 'Search the forest floor for the hidden key.', 'Dark Forest', 'Iron Sword');
INSERT INTO Objectives VALUES ('Defeat Boss', 'Defeat the Crystal Guardian in combat.', 'Crystal Cave', 'Magic Staff');
INSERT INTO Objectives VALUES ('Solve Puzzle', 'Decode the ancient hieroglyphics.', 'Desert Ruins', NULL);
INSERT INTO Objectives VALUES ('Rescue NPC', 'Save the stranded climber from the cliff.', 'Mountain Peak', NULL);
INSERT INTO Objectives VALUES ('Collect Gems', 'Gather 10 sea gems from the shore.', 'Coastal Village', 'Dragon Shield');
-- Additional objectives for division query testing
INSERT INTO Objectives VALUES ('Find Artifact', 'Locate the ancient artifact in the woods.', 'Dark Forest', NULL);
INSERT INTO Objectives VALUES ('Map Cave', 'Create a complete map of the cave system.', 'Crystal Cave', NULL);

-- NPCs_IsAt
INSERT INTO NPCs_IsAt VALUES ('Village Elder', 'Healer', 'Wise', 'Coastal Village');
INSERT INTO NPCs_IsAt VALUES ('Guard Captain', 'Warrior', 'Loyal', 'Dark Forest');
INSERT INTO NPCs_IsAt VALUES ('Merchant Tom', 'Rogue', 'Shady', 'Desert Ruins');
INSERT INTO NPCs_IsAt VALUES ('Wizard Merlin', 'Mage', 'Ancient', 'Crystal Cave');
INSERT INTO NPCs_IsAt VALUES ('Mountain Guide', 'Tank', 'Sturdy', 'Mountain Peak');

-- PCs
INSERT INTO PCs VALUES ('Hero1', 'Warrior', 'Noble');
INSERT INTO PCs VALUES ('Hero2', 'Mage', 'Scholar');
INSERT INTO PCs VALUES ('Hero3', 'Rogue', 'Thief');
INSERT INTO PCs VALUES ('Hero4', 'Healer', 'Priest');
INSERT INTO PCs VALUES ('Hero5', 'Tank', 'Dweller');

-- Checkpoints_IsAt
INSERT INTO Checkpoints_IsAt VALUES (1, 'The journey begins at the village.', 'Coastal Village');
INSERT INTO Checkpoints_IsAt VALUES (2, 'Deep within the dark woods.', 'Dark Forest');
INSERT INTO Checkpoints_IsAt VALUES (3, 'The crystal chamber entrance.', 'Crystal Cave');
INSERT INTO Checkpoints_IsAt VALUES (4, 'The desert oasis checkpoint.', 'Desert Ruins');
INSERT INTO Checkpoints_IsAt VALUES (5, 'The final ascent begins.', 'Mountain Peak');

-- SaveFiles_IsAt (adding more for better HAVING query results)
INSERT INTO SaveFiles_IsAt VALUES ('player1', DATE '2024-01-15', 'Normal');
INSERT INTO SaveFiles_IsAt VALUES ('player1', DATE '2024-06-01', 'Hard');
INSERT INTO SaveFiles_IsAt VALUES ('player2', DATE '2024-02-20', 'Hard');
INSERT INTO SaveFiles_IsAt VALUES ('player2', DATE '2024-07-15', 'Expert');
INSERT INTO SaveFiles_IsAt VALUES ('player2', DATE '2024-08-20', 'Nightmare');
INSERT INTO SaveFiles_IsAt VALUES ('player3', DATE '2024-03-10', 'Easy');
INSERT INTO SaveFiles_IsAt VALUES ('player4', DATE '2024-04-05', 'Expert');
INSERT INTO SaveFiles_IsAt VALUES ('player5', DATE '2024-05-12', 'Nightmare');

-- Achievements_monitors
INSERT INTO Achievements_monitors VALUES ('First Steps', 'Complete your first objective.', 'player1', 'Find Key');
INSERT INTO Achievements_monitors VALUES ('Cave Explorer', 'Defeat the Crystal Guardian.', 'player2', 'Defeat Boss');
INSERT INTO Achievements_monitors VALUES ('Puzzle Master', 'Solve an ancient puzzle.', 'player3', 'Solve Puzzle');
INSERT INTO Achievements_monitors VALUES ('Hero', 'Rescue someone in need.', 'player4', 'Rescue NPC');
INSERT INTO Achievements_monitors VALUES ('Collector', 'Gather all the gems.', 'player5', 'Collect Gems');

-- Completes (more completions for division query testing)
INSERT INTO Completes VALUES ('player1', 'Find Key');
INSERT INTO Completes VALUES ('player1', 'Find Artifact');
INSERT INTO Completes VALUES ('player2', 'Defeat Boss');
INSERT INTO Completes VALUES ('player2', 'Map Cave');
INSERT INTO Completes VALUES ('player3', 'Solve Puzzle');
INSERT INTO Completes VALUES ('player4', 'Rescue NPC');
INSERT INTO Completes VALUES ('player5', 'Collect Gems');

-- Earned
INSERT INTO Earned VALUES ('First Steps', 'player1', DATE '2024-01-20');
INSERT INTO Earned VALUES ('Cave Explorer', 'player2', DATE '2024-02-25');
INSERT INTO Earned VALUES ('Puzzle Master', 'player3', DATE '2024-03-15');
INSERT INTO Earned VALUES ('Hero', 'player4', DATE '2024-04-10');
INSERT INTO Earned VALUES ('Collector', 'player5', DATE '2024-05-20');

-- Current
INSERT INTO "Current" VALUES ('player1', DATE '2024-01-15', 'Hero1');
INSERT INTO "Current" VALUES ('player1', DATE '2024-06-01', 'Hero2');
INSERT INTO "Current" VALUES ('player2', DATE '2024-02-20', 'Hero2');
INSERT INTO "Current" VALUES ('player3', DATE '2024-03-10', 'Hero3');
INSERT INTO "Current" VALUES ('player4', DATE '2024-04-05', 'Hero4');
INSERT INTO "Current" VALUES ('player5', DATE '2024-05-12', 'Hero5');

-- Contains (FIXED: Added quantity column!)
INSERT INTO Contains VALUES ('player1', DATE '2024-01-15', 'Iron Sword', 1);
INSERT INTO Contains VALUES ('player1', DATE '2024-01-15', 'Steel Armor', 2);
INSERT INTO Contains VALUES ('player1', DATE '2024-06-01', 'Magic Staff', 1);
INSERT INTO Contains VALUES ('player2', DATE '2024-02-20', 'Steel Armor', 1);
INSERT INTO Contains VALUES ('player2', DATE '2024-02-20', 'Magic Staff', 1);
INSERT INTO Contains VALUES ('player2', DATE '2024-02-20', 'Dragon Shield', 1);
INSERT INTO Contains VALUES ('player3', DATE '2024-03-10', 'Magic Staff', 1);
INSERT INTO Contains VALUES ('player4', DATE '2024-04-05', 'Dragon Shield', 2);
INSERT INTO Contains VALUES ('player5', DATE '2024-05-12', 'Excalibur', 1);
INSERT INTO Contains VALUES ('player5', DATE '2024-05-12', 'Dragon Shield', 1);

-- HasAPrerequisite
INSERT INTO HasAPrerequisite VALUES (1, 'Find Key');
INSERT INTO HasAPrerequisite VALUES (2, 'Find Key');
INSERT INTO HasAPrerequisite VALUES (3, 'Defeat Boss');
INSERT INTO HasAPrerequisite VALUES (4, 'Solve Puzzle');
INSERT INTO HasAPrerequisite VALUES (5, 'Rescue NPC');
