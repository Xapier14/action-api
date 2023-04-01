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
    let and = [];
    if (location.length > 0) {
      let or = [];
      for (let i = 0; i < location.length; i++) {
        or.push({ location: location[i] });
      }
      and.push({ $or: or });
    }
    if (buildingId.length > 0) {
      let or = [];
      for (let i = 0; i < buildingId.length; i++) {
        or.push({ buildingId: buildingId[i] });
      }
      and.push({ $or: or });
    }
    if (severityStatus.length > 0) {
      let or = [];
      for (let i = 0; i < severityStatus.length; i++) {
        or.push({ severityStatus: severityStatus[i] });
      }
      and.push({ $or: or });
    }
    if (fromInspectorId !== undefined) {
      and.push({ inspectorId: fromInspectorId });
    }
    if (resolved !== undefined) {
      and.push({ resolved: resolved });
    }
    if (and.length > 0) query.$and = and;
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
    let and = [];
    if (location.length > 0) {
      let or = [];
      for (let i = 0; i < location.length; i++) {
        or.push({ location: location[i] });
      }
      and.push({ $or: or });
    }
    if (buildingId.length > 0) {
      let or = [];
      for (let i = 0; i < buildingId.length; i++) {
        or.push({ buildingId: buildingId[i] });
      }
      and.push({ $or: or });
    }
    if (severityStatus.length > 0) {
      let or = [];
      for (let i = 0; i < severityStatus.length; i++) {
        or.push({ severityStatus: severityStatus[i] });
      }
      and.push({ $or: or });
    }
    if (fromInspectorId !== undefined) {
      and.push({ inspectorId: fromInspectorId });
    }
    if (resolved !== undefined) {
      and.push({ resolved: resolved });
    }
    if (and.length > 0) query.$and = and;
    try {
      const incidents = await IncidentSchema.find(query).exec();
      resolve(incidents.length ?? 0);
    } catch (err) {
      console.log(err);
      reject(null);
    }
  });
}
