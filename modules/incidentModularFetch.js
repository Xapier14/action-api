import IncidentSchema from "../models/incident.js";
import BuildingSchema from "../models/building.js";
import UserSchema from "../models/user.js";

let buildingCache = {};
let userCache = {};

async function getBuildingName(buildingId) {
  if (buildingCache[buildingId]) {
    return buildingCache[buildingId];
  } else {
    const buildingName = (await BuildingSchema.findOne({ _id: buildingId }))
      .name;
    buildingCache[buildingId] = buildingName;
    return buildingName;
  }
}

async function getUserName(userId) {
  if (userCache[userId]) {
    return userCache[userId];
  } else {
    const user = await UserSchema.findOne({ _id: userId });
    if (!user) return "Unknown User";
    const name = user.firstName + " " + user.lastName;
    userCache[userId] = name;
    return name;
  }
}

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
        .sort({ inspectedDateTime: -1 })
        .skip(pageOffset * limit)
        .limit(limit)
        .exec();
      let results = [];
      if (minified === true) {
        results = await Promise.all(
          incidents.map(async (incident) => {
            let buildingName = await getBuildingName(incident.buildingId);
            let inspectorName = await getUserName(incident.inspectorId);
            return {
              id: incident._id,
              inspector: inspectorName,
              inspectedDateTime: incident.inspectedDateTime,
              location: incident.location,
              buildingName: buildingName,
              severityStatus: incident.severityStatus,
              resolved: incident.resolved,
            };
          })
        );
      } else {
        results = incidents;
      }
      resolve(results ?? []);
    } catch (err) {
      console.log(err);
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
