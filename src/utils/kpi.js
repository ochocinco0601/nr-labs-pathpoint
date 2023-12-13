const _parseDate = (nrql, pattern) => {
  let re = new RegExp(pattern, 'i');
  const result = nrql.match(re);

  re = /'/gi;
  const idx1 = re.exec(nrql.substring(result.index)).index;
  const idx2 = re.exec(nrql.substring(result.index)).index;

  return nrql.substring(result.index + idx1 + 1, result.index + idx2);
};

export const getKpiHoverContent = (kpi) => {
  let hoverContent = '';
  const nrqlTokens = kpi.nrqlQuery.toLowerCase().split(' ');

  if (nrqlTokens.includes('since')) {
    const index = nrqlTokens.indexOf('since');
    if (nrqlTokens[index + 1].startsWith("'")) {
      hoverContent = `Since ${_parseDate(kpi.nrqlQuery, 'since')}`;
    } else {
      hoverContent = `Since ${nrqlTokens[index + 1]} ${nrqlTokens[index + 2]} ${
        nrqlTokens[index + 3]
      }`;
    }
  }

  if (nrqlTokens.includes('until')) {
    const index = nrqlTokens.indexOf('until');
    if (nrqlTokens[index + 1].startsWith("'")) {
      hoverContent += ` until ${_parseDate(kpi.nrqlQuery, 'until')}`;
    } else {
      hoverContent += ` until ${nrqlTokens[index + 1]} ${
        nrqlTokens[index + 2]
      } ${nrqlTokens[index + 3]}`;
    }
  }

  if (nrqlTokens.includes('compare')) {
    const index = nrqlTokens.indexOf('compare');
    hoverContent += ` vs. ${nrqlTokens[index + 2]} ${nrqlTokens[index + 3]} ${
      nrqlTokens[index + 4]
    }`;
  }

  return hoverContent;
};
