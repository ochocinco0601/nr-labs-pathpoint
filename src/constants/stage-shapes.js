export const STAGE_SHAPES_ARRAY = ['None', 'Start', 'Connector', 'Stop'];

export const STAGE_SHAPES_CLASSNAME_ARRAY = [
  '',
  'has-target',
  'has-target has-source',
  'has-source',
];

const icons = [
  'stage-shape-none',
  'stage-shape-start',
  'stage-shape-connector',
  'stage-shape-stop',
];

export const STAGE_SHAPES = STAGE_SHAPES_ARRAY.reduce(
  (acc, shape) => ({
    ...acc,
    [shape.toUpperCase()]: shape,
  }),
  {}
);

export const STAGE_SHAPES_ICON = STAGE_SHAPES_ARRAY.reduce(
  (acc, shape, index) => ({
    ...acc,
    [shape.toUpperCase()]: icons[index].toUpperCase(),
  }),
  {}
);
