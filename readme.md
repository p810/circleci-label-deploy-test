# circleci-label-deploy-test
This is a quick proof of concept tool to kick off a pipeline in CircleCI when a specific label is added to a pull request in GitHub.

The program can be built either as a web app or as a GitHub Action since the payloads of the pull request events are the same for webhooks and actions. It would be best just to use GitHub Actions for everything in the latter case, but I mention this since it's one way of getting around having to spin up and manage a server, and it's free up to a certain point. I haven't yet written an integration that builds for a GitHub Action.

## Usage
### Prerequisites
You'll need [an API token for CircleCI](https://circleci.com/docs/2.0/managing-api-tokens/) and [a webhook on your project's repo](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks) that points to the URL you'll be serving the app behind. [ngrok](https://ngrok.com) is a good tool for testing the server locally.

After cloning this repo open `.env.example` and populate it with your CircleCI token and [your webhook's secret token](https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks#setting-your-secret-token). You can also change the port that the server listens on and/or specify whether you want to use SHA1 or SHA256 for signature validation.

Save the resulting file as `.env` and then open `src/labels.json`. Update this file to include the labels you want to react to and the parameters that should be sent to CircleCI when they're seen on a PR (this is explained further [below](#how-it-works)).

This project was built and tested with **Node 14.17.6**. At some point maybe I'll Dockerize this but the repo does include an [`.nvmrc`](https://github.com/nvm-sh/nvm).

### Installation
```sh
yarn install
```

Following that any of the following commands should work:

| Command          | Purpose                                                                        |
|------------------|--------------------------------------------------------------------------------|
| `yarn run dev`   | Runs the web server and automatically recompiles when source files are changed |
| `yarn run build` | Builds the project and outputs it at `dist/index.js`                           |
| `yarn run serve` | Runs the app after it's been built                                             |
| `yarn run test`  | Runs the test suite for the app                                                |

By default the server listens on port `7890`.

## How it works
Each time a pull request is opened (including when it's reopened) or labeled, and whenever commits are pushed to the head branch, GitHub will notify your web app or action of this and the program will look to make sure that one or more expected labels are set on the PR.

It knows which labels to look for because of `src/labels.json`, which maps label names to a map of pipeline parameters and the value they should be when that label is set, e.g.:

```json
{
  "qa": {
    "should_deploy_qa": true
  }
}
```

For events representing PRs that have the `qa` label, a request will be made to CircleCI's API that kicks off a pipeline for the head branch with the specified parameters. When multiple labels are matched all of the parameters will be set; any params that are shared between labels will be overwritten by whichever value comes last.

The API is currently only able to create new pipelines, and CircleCI's default integration already creates one for each commit and doesn't cancel redundant builds. Preventing redundant builds can be [enabled in a project's settings](https://circleci.com/docs/2.0/skip-build/#auto-cancelling-a-redundant-build), but if you can't do this then you can use conditions to skip other workflows. For example, if your API request sends `should_deploy_qa: true`, `unless` could be used to disable a workflow(s) in that case:

```yml
workflows:
  says_hello_world:
    jobs:
      - greet_world
    when:
      or:
        - equal: [ master, << pipeline.git.branch >> ]
        - << pipeline.parameters.should_greet_world >>
  tells_the_time:
    jobs:
      - log_current_time
    unless: << pipeline.parameters.should_greet_world >>
```
