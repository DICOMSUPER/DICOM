
const splitComma = (strings: string[]): string[] => {
  if (!strings) {
    return [];
  }
  for (let i = 0; i < strings.length; i++) {
    const comma = strings[i].indexOf(',');
    if (comma !== -1) {
      const splits = strings[i].split(/,/);
      strings.splice(i, 1, ...splits);
    }
  }
  return strings;
};


const getSplitParam = (
  lowerCaseKey: string,
  params = new URLSearchParams(window.location.search)
): string[] => {
  const sourceKey = [...params.keys()].find(it => it.toLowerCase() === lowerCaseKey);
  if (!sourceKey) {
    return [];
  }
  return splitComma(params.getAll(sourceKey));
};

export { splitComma, getSplitParam };
