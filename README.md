# Project ACTION

The backend service for a proposed companion service for the BatStateU ACTION Center

## Getting Started

1. Clone the repository.
   ```
   git clone https://github.com/xapier14/action-api.git
   cd chirp-api
   ```
1. Install the required dependencies.
   ```
   npm install
   ```
1. Run the `start` script.
   ```
   npm run start
   ```

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
  - `/reports`

    > Sub-routes require authentication via session token

    - `/create` - POST Method
      | Parameter | Description | Required? |
      |-|-|-|
      | `title` | Report title | Yes |
      | `type` | Type/Classification of report | Yes |
      | `description` | Report description | No |
      | `location` | GPS/IP Location | Yes |
      | `locationType` | Type of location data | Yes |
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

    - `/heatmap` - GET Method

      > Requires a valid **API** key.

      | Parameter       | Description             | Required? |
      | --------------- | ----------------------- | --------- |
      | `gpsCoordinate` | GPS Long+Lat Coordinate | Yes       |

## License

None yet. Please do not distribute until a license is decided upon.
