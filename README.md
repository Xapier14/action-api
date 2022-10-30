# Project ACTION

The backend service for a proposed companion service for the BatStateU ACTION Center

## Getting Started

1. Make sure you have the following prerequisites installed:
   - [Git](https://git-scm.com/)
   - [Node.js](https://nodejs.org/en/)
   - [MongoDB](https://www.mongodb.com/)
   - [Curl](https://curl.haxx.se/), [Postman](https://www.getpostman.com/), [Insomnia](https://insomnia.rest/), or other REST clients.
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

   > **Important:**
   > You will need to update the `.env` file with your own values.

   The environment file should look something like this:

   ```
   DB_CONNECTION=mongodb://<hostname>:27017/action-api
   PORT=80
   JWT_SECRT=some-secret-passphrase
   ```

   > **Note:**
   > If you are using MongoDB Atlas, just paste the connection string from your dashboard.

1. Run the `start` script.
   ```
   npm run start
   ```
1. You should now be able to access the API at `http://localhost:80`.
   On the first run, a default admin user will be created with the following credentials:

   ```
   email: admin@g.batstate-u.edu.ph
   password: Admin123
   ```

   This account holds an access level of `1`.
   Login to the API using the credentials above via the `/api/v1/login` endpoint.

   ```
   curl -X POST -H "Content-Type: application/json" -d '{"email": admin@g.batstate-u.edu.ph, "password": Admin123}' http://localhost:80/api/v1/login
   ```

   If not supplied with an access level, the API will default to `0`.

   Sample response:

   ```json
   {
     "status": "Login successful.",
     "e": 0,
     "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   }
   ```

   You can then use the returned `token` to access the other endpoints.

1. Create other accounts via the `/api/v1/signup` endpoint.
   This requires an `accessToken` with an `accessLevel` of `1` or higher.
   ```
   curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <accessToken>" -d '{"email": <email-of-new-user>, "password": <password-of-new-user>}' http://localhost:80/api/v1/signup
   ```
   Supply a `maxAccessLevel` parameter to limit the maximum access level of the new user.
   If not supplied, the new user will have an access level of `0`.
1. Change the password of the admin account to something more secure.

## Progress

- [ ] Accounts
  - [x] Create account
  - [x] Login
  - [ ] Delete account
  - [ ] Modify account
  - [ ] Check token
- [ ] Reports
  - [x] Create report
  - [x] View single report
  - [x] View all and filter reports
  - [ ] Delete report
  - [ ] Modify report
- [ ] Attachments
  - [x] Upload attachment
  - [x] Retrieve attachment
  - [ ] Retrieve all by report id
  - [ ] Delete attachment

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

    | Parameter        | Description                             | Required?           |
    | ---------------- | --------------------------------------- | ------------------- |
    | `email`          | Email of the account                    | Yes                 |
    | `password`       | Plain text password                     | Yes                 |
    | `firstName`      | First name of the user                  | Yes                 |
    | `firstName`      | First name of the user                  | Yes                 |
    | `location`       | Campus/Location designation of the user | Yes                 |
    | `maxAccessLevel` | Max access level of the new account     | No, defaults to `0` |

  - `/check` - _session token optional_

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
      | `location` | Filter by report location | No (filter is only usable if used with `accessLevel >= 1`) |
      | `buildingId` | Building ID of report | No (Yes if using `location`) |
      | `severityStatus` | General severity status | No |
      | `inspectorId` | Filter by inspector | No |
      | `resolved` | Filter by resolved status | No |
      | `pageOffset` | Zero-based page offset | No |
      | `limit` | Limit results for pagination | No |
    - `/delete/{id}` - POST Method

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
    - `/delete/{id}` - POST Method

      > Requires `accessLevel >= 1`

      | Parameter | Description                    | Required? |
      | --------- | ------------------------------ | --------- |
      | `id`      | The media id of the attachment | Yes       |

## License

None yet. Please do not distribute until a license is decided upon.
