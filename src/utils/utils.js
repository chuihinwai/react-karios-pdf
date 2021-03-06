import {
  addIndex,
  always,
  assoc,
  compose,
  concat,
  cond,
  curry,
  dropLast,
  equals,
  filter,
  head,
  identity,
  inc,
  join,
  map,
  mergeDeepWith,
  path,
  pathEq,
  pipe,
  prop,
  propEq,
  props,
  replace,
  split,
  T,
  toString,
  transduce,
  unless,
  when,
} from "ramda";
import {
  chapterIntro,
  chapterReview,
  devotion,
  focusPrayer,
  meeting,
  other,
  video,
  worship,
} from "../libs/karios-pdf-parser/categories/category-types";
import {isNilOrEmpty, stripAllQuotes} from "../libs/karios-pdf-parser/utils";

export const excelLinefeed = '\r\n';
export const replaceWithExcelLineFeed = replace(/\r?\n/g, excelLinefeed);

const catEq = propEq('category');

export const viewTextFromCategory = cond([
  [catEq(chapterIntro), pipe(props(['number', 'topic']), join(' '))],
  [catEq(chapterReview), pipe(props(['number', 'topic']), join(' '))],
  [catEq(devotion), prop('topic')],
  [catEq(focusPrayer), pipe(props(['prayerTarget', 'assignedGroup']), join(`${excelLinefeed}- `))],
  [catEq(video), prop('title')],
  [catEq(worship), prop('assignedGroup')],
  [catEq(other), always('')],
  [T, always('')],
]);

const rowCatEq = pathEq(['category', 'category']);

export const fallbackTextForRow = cond([
  [rowCatEq(video), pipe(prop('activityTexts'), head, stripAllQuotes)],
  [rowCatEq(meeting), pipe(prop('sessionIndex'), inc, toString, s => `Session ${s}`)],
  [T, pipe(prop('activityTexts'), join(excelLinefeed))],
]);

export const mapCatTypeToDisplayStr = cond([
  [equals(worship), always('1st worship')],
  [equals(focusPrayer), always('1st focus prayer')],
  [T, identity],
]);

export const collectRowsUnderSessionIndex = sI => filter(propEq('sessionIndex', sI));
export const formatAsShortName = pipe(split(' '), dropLast(1), join(' '));

export const formatSessionDateStr = sessionTime => sessionTime.format('MMM D (ddd)');
export const formatRowTimeStr = rowTime => rowTime.format('h:mm');
export const formatStartEndTimeStr = (a, b) => `${formatRowTimeStr(a)}-${formatRowTimeStr(b)}`;

// => {'worship': {'Sam': [rowIndex]}}}
const categoryWithNameFromRow = (r, i) => assoc(
  path(['category', 'category'], r),
  nameFromRow(r, i),
  {},
);

// => {'Sam': [rowIndex]}
const nameFromRow = (r, i) => assoc(path(['facilitator'], r), [i], {});

const xForm = compose(
  addIndex(map)(categoryWithNameFromRow),
);

const accFn = mergeDeepWith(concat);
export const mapRowsToIndexByCategoryThenName = transduce(xForm, accFn, {});

export const viewByIndex = curry((a, i) => a && a[i]);

export const mapRowToString = fallBackTextFn => row => unless(isNilOrEmpty, pipe(
  prop('category'),
  viewTextFromCategory,
  when(isNilOrEmpty, () => fallBackTextFn(row)),
  replaceWithExcelLineFeed,
))(row);

export const mapRowToStringWithFallback = mapRowToString(unless(isNilOrEmpty, fallbackTextForRow));
