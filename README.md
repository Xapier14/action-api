# Project ACTION

The backend service for a proposed companion service for the BatStateU ACTION Center

## Getting Started

1. Make sure you have the following prerequisites installed:
   - [Git](https://git-scm.com/)
   - [Node.js](https://nodejs.org/en/)
   - [MongoDB](https://www.mongodb.com/)
   - [Curl](https://curl.haxx.se/)
1. Clone the repository.
   ```
   git clone https://github.com/xapier14/action-api.git
   cd action-api
   ```
1. Install the required dependencies.
   ```
   npm install
   ```
1. Create the environment file.
   ```
   cp .env.example .env
   ```
   > **NOTE:** You will need to update the `.env` file with your own values.
   > The environment file should look something like this:
   ```
   DB_CONNECTION=mongodb://<hostname>:27017/action-api
   PORT=80
   JWT_SECRT=some-secret-passphrase
   ```
   _If you are using MongoDB Atlas, just paste the connection string from your dashboard._
1. Run the `start` script.
   ```
   npm run start
   ```
1. You should now be able to access the API at `http://localhost:80`.
   On the first run, a default admin user will be created with the following credentials:
   ```
   email: admin@g.batstate-u.edu.ph
   password: admin
   ```
   This account holds an access level of `1`.
   Login to the API using the credentials above via the `/api/v1/login` endpoint.
   ```
   curl -X POST -H "Content-Type: application/json" -d '{"email": admin@g.batstate-u.edu.ph, "password": admin}' http://localhost:80/api/v1/login
   ```
   You can then use the returned `accessToken` to access the other endpoints.
1. Create other accounts via the `/api/v1/signup` endpoint.
   This requires an `accessToken` with an `accessLevel` of `1` or higher.
   ```
   curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <accessToken>" -d '{"email": <email-of-new-user>, "password": <password-of-new-user>}' http://localhost:80/api/v1/signup
   ```
   Supply a `maxAccessLevel` parameter to limit the maximum access level of the new user.
   If not supplied, the new user will have an access level of `0`.

## Progress

- [x] Accounts
  - [x] Create account
  - [x] Login
- [ ] Reports
  - [x] Create report
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
    | `email` | Email of the account | Yes |
    | `password` | Plain text password | Yes |
    | `accessLevel` | Requested access level for the session | No, defaults to `0` |
  - `/signup` - POST Method

    > Requires `accessLevel >= 1`

    | Parameter  | Description          | Required? |
    | ---------- | -------------------- | --------- |
    | `email`    | Email of the account | Yes       |
    | `password` | Plain text password  | Yes       |

  - `/reports` - _requires session token_

    - `/create` - POST Method
      | Parameter | Description | Required? |
      |-|-|-|
      | `inspectedDateTime` | DateTime of report | Yes |
      | `location` | Location | Yes |
      | `buildingId` | Building ID in campus defined by `location` | Yes |
      | `collapsedStructure` | Evaluation severity number-based enum | Yes |
      | `leaningOrOutOfPlumb` | Evaluation severity number-based enum | Yes |
      | `damageToPrimaryStructure` | Evaluation severity number-based enum | Yes |
      | `fallingHazards` | Evaluation severity number-based enum | Yes |
      | `groundMovementOrSlope` | Evaluation severity number-based enum | Yes |
      | `damagedSubmergedFixtures` | Evaluation severity number-based enum | Yes |
      | `proximityRiskTitle` | Other hazard in close-proximity | No |
      | `proximityRisk` | Evaluation severity number-based enum | No |
      | `evaluationComment` | Additional evaluation comment | No |
      | `estimatedBuildingDamage` | Building damage number-based enum | Yes |
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
