# LA Feedback System
The UNL CSE Learning Assistant Program created this system to facilitate the
collection of feedback from students interaction with our LAs.

## Installing
0. Establish a database by running the included SQL setup script (public/data/tableSetup.sql)
0. Rename public/data/sqlExample.json to public/data/sql.json and replace the properties to fit your
database's needs
0. Run `yarn` and allow yarn to install all necessary packages (You can install
[Yarn here](https://yarnpkg.com))
0. Run `yarn eslint` to ensure the code complies with code standards
0. Run `yarn start` or `yarn build`

## Coding Standards
This repo utilizes [Prettier](https://prettier.io) through [ESLint](https://eslint.org) to ensure
code style consistency. All pull requests are expected to comply with this requirement.
