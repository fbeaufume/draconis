/**
 * The types of equipment.
 */
// TODO FBE add attributes such as category (weapon vs armor vs jewel), hand count (1 handed vs 2 handed), etc ?
export enum EquipmentType {
  AXE, // 2-handed, for warrior
  SWORD, // 1-handed, for knight
  SHIELD, // 1-handed, for knight
  STAFF, // 2-handed, for mage
  SCEPTER, // 1-handed, for priest
  ORB, // 1-handed, for priest
  HELM,
  CHEST,
  GLOVES,
  BOOTS,
  AMULET,
  RING,
}

// TODO FBE add attributes such as monster level equivalence ?
export enum EquipmentTier {
  COPPER,
  BRASS,
  BRONZE,
  IRON,
  STEEL,
  SILVER,
  GOLD,
  PLATINUM,
  TITANIUM,
  MITHRIL,
  ADAMANTIUM,
  // Other ideas: diamond, elder, divine, galaxy, absolute, final
}

/**
 * The item rarity determines the number of affixes.
 */
// TODO FBE add attributes such as number of affixes, a rarity percent ?
export enum ItemRarity {
  NORMAL,
  MAGIC,
  RARE,
  EPIC,
}
