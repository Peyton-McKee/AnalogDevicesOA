# AnalogDevicesOA

This repo creates the SMS Manager service as outlined by the analog devices OA. It includes a rust backend for managing the logic of the producers, as well as a frontend to visualize, create and edit prodcuers and their messages. 

## View README in Frontend and Backend for more information on the architecture of each

### Development

To Develop this application, create the databse by running `docker compose up -d`

Then follow the README in the backend to start the backend service

Follow the README in the frontend to start the frontend service. 

You are able to create, edit, and delete producers from the frontend. You are also able to determine when to generate messages and send messages as well from there and visualize the progress of each individual producer. 

### Future Possible Improvements

I would like to setup a docker container for both the frontend and backend and put it all under the compose for a production release

System tests using cypress or puppeteer to do end to end tests from the frontend to the backend.

Github actions to enforce coding standards, linting and test passing / coverage.

Husky precommit hooks to enforce the same things as well 

Optimization of threading in sender.rs in backend