import { getParametersByLabels, hasAnExpectedLabel } from './events';

const getMockLabel = (name: string) => ({
  name,
  id: 1,
  url: '/1',
  node_id: '1',
  color: '#000000',
  default: false,
  description: null,
});

const config = {
  qa: {
    deploy_to_qa: true,
  },
  staging: {
    deploy_to_staging: true,
  },
};

const expectedLabels = Object.keys(config);

const mockLabels = [
  getMockLabel('Label One')
];

const mockLabelsWithExpected = [
  ...mockLabels,
  getMockLabel('qa'),
];

describe('hasAnExpectedLabel()', () => {
  it('should return false when no labels match', () => {
    expect(hasAnExpectedLabel(mockLabels, expectedLabels)).toBe(false);
  });

  it('should return true when at least one label matches', () => {
    expect(hasAnExpectedLabel(mockLabelsWithExpected, expectedLabels)).toBe(true);
  });
});

describe('getParametersByLabels()', () => {
  it('should return an empty object if there are no matching labels', () => {
    expect(getParametersByLabels(mockLabels, config)).toEqual({});
  });

  it('should return the parameters for a matched label', () => {
    expect(getParametersByLabels(mockLabelsWithExpected, config)).toEqual(config.qa);
  });

  it('should merge the parameters when multiple labels are matched', () => {
    const labels = [
      ...mockLabelsWithExpected,
      getMockLabel('staging'),
    ];

    expect(getParametersByLabels(labels, config)).toEqual({
      ...config.qa,
      ...config.staging,
    });
  });
});
