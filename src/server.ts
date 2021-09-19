/// <reference path="env.d.ts" />

import config from './labels.json';
import express from 'express';
import dotenv from 'dotenv';
import {
  isValidAction,
  hasAnExpectedLabel,
  getParametersByLabels,
  hasValidSignature,
  getDataFromEvent,
} from './GitHub';
import { triggerPipeline } from './CircleCI';

dotenv.config();

const app = express();
app.use(express.json());

const circleToken = process.env.CIRCLE_CI_TOKEN ?? '';
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET ?? '';
const algo = process.env.GITHUB_WEBHOOK_ALGORITHM ?? 'sha1';

const labelNames = Object.keys(config);

app.post('/', async (req, res) => {
  const {
    action,
    labels,
    project,
    branch,
  } = getDataFromEvent(req.body);

  const signatureIsValid = hasValidSignature(
    algo,
    webhookSecret,
    JSON.stringify(req.body),
    req.header('x-hub-signature') ?? '',
  );

  if (
    signatureIsValid &&
    isValidAction(action) &&
    hasAnExpectedLabel(labels, labelNames)
  ) {
    const requestParams = getParametersByLabels(labels, config);

    try {
      const response = await triggerPipeline(`gh/${project}`, branch, circleToken, requestParams);

      if (response.status >= 400) {
        throw new Error(`CircleCI request failed: Got HTTP ${response.status}`);
      }
    } catch (e) {
      console.trace(e);
      res.status(500);
    }
  }

  res.send();
});

app.listen(process.env.SERVER_PORT);
