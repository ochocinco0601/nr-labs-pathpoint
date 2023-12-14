const weekDays = [
  'yesterday',
  'today',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const _parseDate = (nrql, keyword) => {
  let re = new RegExp(keyword, 'i');
  const result = nrql.match(re);

  re = /'/gi;
  const idx1 = re.exec(nrql.substring(result.index)).index;
  const idx2 = re.exec(nrql.substring(result.index)).index;

  return nrql.substring(result.index + idx1 + 1, result.index + idx2);
};

export const getKpiHoverContent = (nrql) => {
  let hoverContent = '';
  const tokens = nrql.toLowerCase().split(' ');

  if (tokens.includes('since')) {
    const index = tokens.indexOf('since');
    if (tokens[index + 1].startsWith("'")) {
      hoverContent = `Since ${_parseDate(nrql, 'since')}`;
    } else if (weekDays.includes(tokens[index + 1])) {
      hoverContent = `Since ${tokens[index + 1]}`;
    } else if (['this', 'last'].includes(tokens[index + 1])) {
      hoverContent = `Since ${tokens[index + 1]} ${tokens[index + 2]}`;
    } else {
      hoverContent = `Since ${tokens.slice(index + 1, index + 4).join(' ')}`;
    }
  }

  if (tokens.includes('until')) {
    const index = tokens.indexOf('until');
    if (tokens[index + 1] === 'now') {
      hoverContent += ` until ${tokens[index + 1]}`;
    } else if (tokens[index + 1].startsWith("'")) {
      hoverContent += ` until ${_parseDate(nrql, 'until')}`;
    } else if (weekDays.includes(tokens[index + 1])) {
      hoverContent += ` until ${tokens[index + 1]}`;
    } else if (['this', 'last'].includes(tokens[index + 1])) {
      hoverContent += ` until ${tokens[index + 1]} ${tokens[index + 2]}`;
    } else {
      hoverContent += ` until ${tokens.slice(index + 1, index + 4).join(' ')}`;
    }
  }

  if (tokens.includes('compare')) {
    const index = tokens.indexOf('compare');
    hoverContent += ` vs. ${tokens.slice(index + 2, index + 5).join(' ')}`;
  }

  return hoverContent;
};
