const { Octokit } = require("@octokit/rest");

const { 
    github_owner_id,
    github_auth_token
} = process.env;

const octokit = new Octokit({
  auth: github_auth_token,
});

const formatResponse = (statusCode, body) => ({
    statusCode,
    body: JSON.stringify(body)
})

const ALLOW_AUTHORIZATION_TO_REPOS = ["test_octokit"];

const REPOSITORY_PERMISSION = "pull";
exports.handler = async (event) => {
    
    const missingLambdaConfiguration = !github_owner_id || !github_auth_token;
    if (missingLambdaConfiguration) return formatResponse(500, {
        message: 'Missing lambda configuration'
    });

    const { queryStringParameters } = event;
    console.log('EVENT en retorno:', queryStringParameters);

    const missingUsernameToAuthorize = !queryStringParameters?.usernameToAuthorize;
    if (missingUsernameToAuthorize) return formatResponse(400, {
        message: 'Missing query param: usernameToAuthorize'
    });

    const missingRepositoryName = !queryStringParameters?.repository;
    if (missingRepositoryName) return formatResponse(400, {
        message: 'Missing query param: repository'
    });

    const { repository: selectedRepository, usernameToAuthorize } = queryStringParameters

    const selectedRepositoryNotAllowed = !ALLOW_AUTHORIZATION_TO_REPOS.includes(selectedRepository);
    if (selectedRepositoryNotAllowed) return formatResponse(401, {
        message: 'Unauthorized'
    });

    await octokit.repos.addCollaborator({
      owner: github_owner_id,
      repo: selectedRepository,
      username: usernameToAuthorize,
      permission: REPOSITORY_PERMISSION
    });

    return formatResponse(200, {
        message: `Sent invite to ${usernameToAuthorize} access ${selectedRepository}.`
    });
};
