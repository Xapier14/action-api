export function normalizePhoneNumber(phoneNumber) {
  const pattern = /(?:\+63|0)(\d{10})/g;
  const phonePart = pattern.exec(phoneNumber);
  if (phonePart === null) return null;
  return "+63" + phonePart[1];
}

export function getRequiredFieldsForReport() {
  return [
    "inspectorId",
    "inspectedDateTime",
    "location",
    "buildingId",
    "collapsedStructure",
    "leaningOrOutOfPlumb",
    "damageToPrimaryStructure",
    "fallingHazards",
    "groundMovementOrSlope",
    "damagedSubmergedFixtures",
    "estimatedBuildingDamage",
  ];
}
