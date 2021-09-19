import { Label, PullRequestEvent } from '@octokit/webhooks-types';
import { createHmac } from 'crypto';

type LabelToParams = Record<string, {[key: string]: any}>;

export const getParametersByLabels = (labels: Label[], labelMap: LabelToParams) =>
  labels.reduce((requestParams: Record<string, any>, label) => {
    if (!labelMap.hasOwnProperty(label.name)) {
      return requestParams;
    }

    return {
      ...requestParams,
      ...labelMap[label.name],
    };
  }, {});

export const isValidAction = (action: string) =>
  ['labeled', 'opened', 'reopened', 'synchronize'].includes(action);

export const hasAnExpectedLabel = (labels: Label[], expectedLabels: string[]) =>
  labels.some(l => expectedLabels.some(label => l.name === label));

export const hasValidSignature = (
  algorithm: 'sha1' | 'sha256',
  token: string,
  payload: string,
  signature: string
) => {
  const digest = createHmac(algorithm, token)
    .update(payload)
    .digest('hex');

  return signature === `${algorithm}=${digest}`;
};

export const getDataFromEvent = (event: PullRequestEvent) => ({
  action: event?.action ?? '',
  labels: event?.pull_request?.labels ?? [],
  project: event?.repository?.full_name ?? '',
  branch: event?.pull_request?.head?.ref ?? '',
});
