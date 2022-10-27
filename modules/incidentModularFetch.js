import IncidentSchema from "../models/incident.js";

export async function fetchIncidents(
  minified,
  pageOffset,
  limit,
  location,
  buildingId,
  severityStatus,
  fromInspectorId,
  resolved
) {
  return new Promise(async (resolve, reject) => {
    const query = {};
    if (location !== undefined) {
      query.location = location;
    }
    if (buildingId !== undefined) {
      query.buildingId = buildingId;
    }
    if (severityStatus !== undefined) {
      query.severityStatus = severityStatus;
    }
    if (fromInspectorId !== undefined) {
      query.inspectorId = fromInspectorId;
    }
    if (resolved !== undefined) {
      query.resolved = resolved;
    }
    try {
      const incidents = await IncidentSchema.find(query)
        .skip(pageOffset * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      let results = [];
      if (minified === true) {
        results = incidents.map((incident) => {
          return {
            id: incident._id,
            inspectorId: incident.inspectorId,
            inspectedDateTime: incident.inspectedDateTime,
            location: incident.location,
            buildingId: incident.buildingId,
            severityStatus: incident.severityStatus,
            resolved: incident.resolved,
          };
        });
      } else {
        results = incidents;
      }
      resolve(results ?? []);
    } catch (err) {
      reject(null);
    }
  });
}
export async function countIncidents(
  location,
  buildingId,
  severityStatus,
  fromInspectorId,
  resolved
) {
  return new Promise(async (resolve, reject) => {
    const query = {};
    if (location !== undefined) {
      query.location = location;
    }
    if (buildingId !== undefined) {
      query.buildingId = buildingId;
    }
    if (severityStatus !== undefined) {
      query.severityStatus = severityStatus;
    }
    if (fromInspectorId !== undefined) {
      query.inspectorId = fromInspectorId;
    }
    if (resolved !== undefined) {
      query.resolved = resolved;
    }
    try {
      const incidents = await IncidentSchema.find(query).exec();
      resolve(incidents.length ?? 0);
    } catch (err) {
      console.log(err);
      reject(null);
    }
  });
}
