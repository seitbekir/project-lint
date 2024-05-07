const SNAKE_CASE_RE = /((([a-z]|\d)+_)*([a-z]|\d)+)/;
const KEBAB_CASE_RE = /((([a-z]|\d)+-)*([a-z]|\d)+)/;
const PASCAL_CASE_RE = /((([A-Z]|\d){1}([a-z]|\d)*)*([A-Z]|\d){1}([a-z]|\d)*)/;
const CAMEL_CASE_RE = /(([a-z]|\d)+(([A-Z]|\d){1}([a-z]|\d)*)*)/;

export const SNAKE_CASE = `${SNAKE_CASE_RE}`.replace(/\//g, '');
export const KEBAB_CASE = `${KEBAB_CASE_RE}`.replace(/\//g, '');
export const PASCAL_CASE = `${PASCAL_CASE_RE}`.replace(/\//g, '');
export const CAMEL_CASE = `${CAMEL_CASE_RE}`.replace(/\//g, '');

export function applyRegexParameters(
  regex: string,
  parentName: string,
  regexParameters: Record<string, string> = {},
): RegExp {
  let currentRegex = regex;

  const defaultRegexParameters = getDefaultRegexParameters(parentName, regexParameters);

  for (const key of Object.keys(defaultRegexParameters)) {
    currentRegex = currentRegex.replace(`\${{${key}}}`, defaultRegexParameters[key]);
  }

  const cleanedRegex = (currentRegex.match(/^\/(.+)\/$/) as RegExpMatchArray)[1];

  return new RegExp(cleanedRegex, 'g');
}

export function getDefaultRegexParameters(
  parentName: string,
  regexParameters: Record<string, string>,
): Record<string, string> {
  return {
    PascalCase: PASCAL_CASE,
    camelCase: CAMEL_CASE,
    snake_case: SNAKE_CASE,
    'kebab-case': KEBAB_CASE,
    'dash-case': KEBAB_CASE,
    ...regexParameters,
    ParentName: upperCaseFirstLetter(parentName),
    parentName: lowerCaseFirstLetter(parentName),
  };
}

export function lowerCaseFirstLetter(text: string): string {
  return `${text?.charAt(0).toLowerCase()}${text?.slice(1)}`;
}

export function upperCaseFirstLetter(text: string): string {
  return `${text?.charAt(0).toUpperCase()}${text?.slice(1)}`;
}
