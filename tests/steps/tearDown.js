const AWS = require("aws-sdk");

const anAuthenticatedUser = async (user) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();

  let req = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: user.username,
  };
  await cognito.adminDeleteUser(req).promise();

  console.log(`[${user.username}] - user deleted`);
};

module.exports = {
  anAuthenticatedUser,
};
