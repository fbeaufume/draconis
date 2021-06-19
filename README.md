# Draconis

Early stages of a simple, web based, old school RPG.

Standard disclaimer: I'm mostly a backend guy, so as long as I'm the only one designing the UI,
don't expect pretty. Best I can do is basic.

This project is also a sandbox to keep working on frontend technologies such as:
Angular, TypeScript, Tailwind, CSS animations, SVG, etc.

## 1. Main design choices

The current design choices and objectives are:

- No install, but playable with a web browser
- Single player, no backend
- Not text based per se, but textual look and feel with some icons
- No world to explore but basic city hubs, dungeons and quests
- Party based with 4 characters of different classes
- Class specific active and passive skills
- Character classes use one of two type of energy point (tech vs mana) with different generation mechanisms
- Turn based and slightly tactical (i.e. party and enemies use rows) combats
- Generated loot
- Some crafting
- Misc (consumables such as potions, combat statuses, etc)

## 2. Systems

The major application systems and their progress are:

| System     | Description                                        | Progress |
|------------|----------------------------------------------------|----------|
| Combat     | Turns, actions, targets, rows, outcomes, statuses  | 20 %     |
| Characters | Classes, skills, attributes, levels                | 10 %     |
| Enemies    | Classes, skills, A.I.                              | 10 %     |
| World      | Dungeons, cities, quests                           | 5 %      |
| Items      | Equipment slots, consumables, affixes, rarities    | 0 %      |
| Crafting   | Creation, alteration and upgrade of items          | 0 %      |

### 2.1 Combat system

Features of the combat system :

- Group based, i.e. multiple characters vs multiple enemies
- Turn based
- Turn order is randomly generated for each fight and evenly interleaves characters and enemies
- Some creatures (e.g. bosses) can have multiple actions per turn
- Row based, i.e. creatures are front row or back row
- Skill have a range, i.e. melee attacks can only reach front row opponents while distance attacks can reach any opponent
- Single target skills and area of effect skills
- Damaging skills and healing skills
- One shot skills and over time skills
- Bonus effects (a.k.a buffs) and malus effects (a.k.a debuffs)
- Several skill outcomes (success, miss, dodge, resist, critical)
- Counter-attacks
- Skills cooldown
- Multiple effect skills, e.g. a damage and an effect
- Multiple element damages, e.g. physical damage plus poison damage
- Chained attacks, i.e. consecutively using  the same attack changes its result
- Taunts
- Interceptions, e.g. intercept the next attack that would kill an allied creature
