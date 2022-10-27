# Project ACTION

The backend service for a proposed companion service for the BatStateU ACTION Center

## Getting Started

1. Clone the repository.
   ```
   git clone https://github.com/xapier14/action-api.git
   cd action-api
   ```
1. Install the required dependencies.
   ```
   npm install
   ```
1. Run the `start` script.
   ```
   npm run start
   ```

## Progress

- [x] Accounts
  - [x] Create account
  - [x] Login
- [ ] Reports
  - [ ] Create report
  - [ ] View single report
  - [ ] View all and filter reports
- [ ] Attachments
  - [x] Upload attachment
  - [x] Retrieve attachment
  - [ ] Retrieve all by report id

## Routes

- `/` - static files
- `/api/v1`

  - `/login` - POST Method
    | Parameter | Description | Required? |
    |-|-|-|
    | `phoneNumber` | Phone number of the account | Yes |
    | `password` | Plain text password | Yes |
    | `accessLevel` | Requested access level for the session | No, defaults to `0` |
  - `/signup` - POST Method
    | Parameter | Description | Required? |
    |-|-|-|
    | `phoneNumber` | Phone number of the account | Yes |
    | `password` | Plain text password | Yes |
  - `/reports` - _requires session token_

    - `/create` - POST Method
      | Parameter | Description | Required? |
      |-|-|-|
      | `inspectorId` | Account ID of report creator | Yes |
      | `inspectedDateTime` | DateTime of report | Yes |
      | `location` | Location | No |
      | `buildingId` | Building ID in campus defined by `location` | Yes |
      | `collapsedStructure` | Evaluation severity number-based enum | Yes |
      | `leaningOrOutOfPlumb` | Evaluation severity number-based enum | No |
      | `damageToPrimaryStructure` | Evaluation severity number-based enum | No |
      | `fallingHazards` | Evaluation severity number-based enum | No |
      | `groundMovementOrSlope` | Evaluation severity number-based enum | No |
      | `damagedSubmergedFixtures` | Evaluation severity number-based enum | No |
      | `proximityRiskTitle` | Other hazard in close-proximity | No |
      | `proximityRisk` | Evaluation severity number-based enum | No |
      | `evaluationComment` | Additional evaluation comment | No |
      | `estimatedBuildingDamage` | Building damage number-based enum | No |
      | `inspectedPlacard` | Number-based boolean `0/1` | No |
      | `restrictedPlacard` | Number-based boolean `0/1` | No |
      | `unsafePlacard` | Number-based boolean `0/1` | No |
      | `barricadeNeeded` | Number-based boolean `0/1` | No |
      | `barricadeComment` | Additional comment on barricade | No |
      | `detailedEvaluationNeeded` | Number-based boolean `0/1` | No |
      | `detailedEvaluationAreas` | Comma separated list of areas | No |
      | `otherRecommendations` | Additional recommendations | No |
      | `furtherComments` | Overall comments on report | No |
      | `attachments` | Comma separated list of attachment IDs | No |
    - `/list` - GET Method
      | Parameter | Description | Required? |
      |-|-|-|
      | `type` | Filter by report type/classification | No |
      | `gpsCoordinate` | GPS Long+Lat Coordinate | No (Yes if using `gpsRange`) |
      | `gpsRadius` | Radius of reports to fetch from GPS location in meters | No |
    - `/delete` - POST Method

      > Requires `accessLevel >= 1`

      | Parameter  | Description          | Required? |
      | ---------- | -------------------- | --------- |
      | `reportId` | The id of the report | Yes       |

  - `/attachments` - _requires session token_
    - `/{id}` - GET Method
      | Parameter | Description | Required? |
      |-|-|-|
      | `id` | Attachment ID | Yes |
    - `/upload` - POST Method
      | Parameter | Description | Required? |
      |-|-|-|
      | `file` | Attachment data | Yes |

## License

None yet. Please do not distribute until a license is decided upon.
