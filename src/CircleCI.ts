import fetch from 'node-fetch';

export const triggerPipeline = async (
  slug: string,
  branch: string,
  token: string,
  parameters: Record<string, any>,
) => {
  return fetch(`https://circleci.com/api/v2/project/${slug}/pipeline`, {
    method: 'POST',
    body: JSON.stringify({
      branch,
      parameters,
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Circle-Token': token,
    },
  });
}
