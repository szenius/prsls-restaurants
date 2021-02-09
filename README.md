# Restaurants

This project was created with Serverless framework. Namely

```
npm init -y
npm install --save-dev serverless
npx sls create --template aws-nodejs
```

## Development

To set up

```
npm install
npx sls export-env          // export environment variables from serverless to .env
node seedRestaurants.js     // seed data to dynamodb
```

To deploy

```
npx sls deploy
```

To see the main page that was deployed, use the root URL, i.e. `https://<some id>.execute-api.<some region>.amazonaws.com/dev/`

As IAM auth was added, `/restaurants` path should return 403 Forbidden.

To run integration tests against actual dynamodb (so this requires seeding)

```
npm run test
```

To delete

```
npx sls remove
```

## Useful resources

- [CloudFormation Ref & GetAtt cheatsheet](https://theburningmonk.com/cloudformation-ref-and-getatt-cheatsheet/)
