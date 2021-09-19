import { Label, PullRequestEvent } from '@octokit/webhooks-types';

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

export const getDataFromEvent = (event: PullRequestEvent) => ({
  action: event?.action ?? '',
  labels: event?.pull_request?.labels ?? [],
  project: event?.repository?.full_name ?? '',
  branch: event?.pull_request?.head?.ref ?? '',
});
