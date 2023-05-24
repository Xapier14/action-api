# Project ACTION

The backend service for a proposed companion service to be used by The BatStateU ACTION Center.
View it in action [here](https://action-web.pages.dev).

## Getting Started

### With Docker

1. Clone the repository.
   ```
   git clone https://github.com/xapier14/action-api.git
   cd action-api
   ```
1. Build the image
   ```
   docker build . -t action-api
   ```
1. Create the environment file.

   ```
   cp .env.example .env
   ```

   > **Important:**
   > You will need to update the `.env` file with your own values.

   Your `.env` file should look something like this:

   ```
   DB_CONNECTION=mongodb://<hostname>:27017/action-api
   PORT=3000
   AZURE_CONNECTION_STRING=<azure-string>
   GOOGLE_CLOUD_PROJECT_ID=<gcloud-project-id>
   GOOGLE_CLOUD_API_KEY=<gcloud-api-key>
   RECAPTCHA_SITE_KEY=<gcloud-enterprise-site-key>
   ROUTE_LOGGER=<true-or-false>
   ENV_CONFIG=<config-discriptor>
   ```

   > **Note:**
   > The Google Cloud Project ID is required, not the project name.
   > If you are using MongoDB Atlas, just paste the connection string from your dashboard and append '/action-api' to specify the database.
   > If you do not have an Azure subscription to use Azure Blob Storage or have not installed Azurite (Azure emulator), leave the field blank to fallback to local storage. (Not recommended for production, files will be deleted when the container is removed.)

1. Run the image with the env file.

   ```
   docker run -p 3000:3000 --env-file .env -d action-api
   ```

1. Verify that the container runs at port 3000.
   ```
   curl http://127.0.0.1:3000
   ```

### Normal Install

1. Make sure you have the following prerequisites installed:
   - [Git](https://git-scm.com/)
   - [Node.js](https://nodejs.org/en/)
   - [MongoDB](https://www.mongodb.com/)
   - [Azurite](https://github.com/azure/azurite) (Optional for testing only, not needed and should not be used for production.)
   - [FFMPEG](https://ffmpeg.org/download.html) (Should either be in your PATH or in the root directory of the project.)
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

   Your `.env` file should look something like this:

   ```
   DB_CONNECTION=mongodb://<hostname>:27017/action-api
   PORT=80
   AZURE_CONNECTION_STRING=<azure-string>
   GOOGLE_CLOUD_PROJECT_ID=<gcloud-project-id>
   GOOGLE_CLOUD_API_KEY=<gcloud-api-key>
   RECAPTCHA_SITE_KEY=<gcloud-enterprise-site-key>
   ROUTE_LOGGER=<true-or-false>
   ENV_CONFIG=<config-discriptor>
   ```

   > **Note:**
   > The Google Cloud Project ID is required, not the project name.
   > If you are using MongoDB Atlas, just paste the connection string from your dashboard and append '/action-api' to specify the database.
   > If you do not have an Azure subscription to use Azure Blob Storage or have not installed Azurite (Azure emulator), leave the field blank to fallback to local storage.

1. Run the `start` script.
   ```
   npm run start
   ```
1. Run an instance of [action-dashboard](https://github.com/Xapier14/action-dashboard) and login to the newly created administrator account.

   ```
   email: admin@g.batstate-u.edu.ph
   password: Admin123
   ```

   This account holds an access level of `1`.
   Login using the credentials above via the `action-dashboard` client.

   > **Note:**
   > The `action-dashboard` client has different environment variables depending on the configuration. The default configuration is for a local development environment. If you are running the API on a different port, you will need to update the `apiHost` variable in [environment.ts](action-dashboard/src/environments/environment.ts).
   > Make sure you have a valid ReCaptcha configuration, otherwise you will not be able to login.

## Progress

- [x] Accounts
  - [x] Create account
  - [x] Login
  - [x] Delete account
  - [x] Modify account password
  - [x] Check token
  - [x] Logout (delete token)
- [x] Incidents
  - [x] Create incident
  - [x] View single incident
  - [x] View all and filter incidents
  - [x] Delete incident
  - [x] Modify incident
- [x] Buildings
  - [x] Add building
  - [x] List buildings
  - [x] Delete building
  - [x] Modify building
- [x] Attachments
  - [x] Upload attachment
  - [x] Retrieve attachment
  - [x] Retrieve all by incident id
  - [x] Delete attachment

## License

None yet. Please do not distribute until a license is decided upon.
