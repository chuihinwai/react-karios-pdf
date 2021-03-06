import {chapterReviewParser, chapterReviewTester} from "./chapter-review-tester";
import {chapterReview} from "../category-types";

describe('chapterReviewTester', () => {
  it('should return true for matches', () => {
    expect(chapterReviewTester([`Chapter 7 "Culture C" Review`])).toEqual(true);
    expect(chapterReviewTester([`Chapter 7 Review`])).toEqual(true);
  });

  it('should return false for non-matches', () => {
    expect(chapterReviewTester(['Contextualised Worship Service'])).toEqual(false);
    expect(chapterReviewTester(['Introduction to Course'])).toEqual(false);
  });
});

describe('chapterReviewParser', () => {
  it('should return devotion object for matches', () => {
    expect(chapterReviewParser([`Chapter 7 "Culture C" Review`]).number).toEqual(7);
    expect(chapterReviewParser([`Chapter 7 "Culture C" Review`]).topic).toEqual('Culture C');
    expect(chapterReviewParser([`Chapter 7 "Culture C" Review`]).category).toEqual(chapterReview);
  });

  it('should return empty for missing topic', () => {
    expect(chapterReviewParser([`Chapter 7 Review`]).number).toEqual(7);
    expect(chapterReviewParser([`Chapter 7 Review`]).topic).toEqual('');
    expect(chapterReviewParser([`Chapter 7 Review`]).category).toEqual(chapterReview);
  });

  it('should return -1 for missing index', () => {
    expect(chapterReviewParser([`Chapter "Culture C" Review`]).number).toEqual(-1);
    expect(chapterReviewParser([`Chapter "Culture C" Review`]).topic).toEqual('Culture C');
    expect(chapterReviewParser([`Chapter "Culture C" Review`]).category).toEqual(chapterReview);
  });

  it('should return -1 empty for missing', () => {
    expect(chapterReviewParser([`Chapter Review`]).number).toEqual(-1);
    expect(chapterReviewParser([`Chapter Review`]).topic).toEqual('');
    expect(chapterReviewParser([`Chapter Review`]).category).toEqual(chapterReview);
  });

  it('should throw for non-matches', () => {
    expect(() => chapterReviewParser(['Contextualised Worship Service'])).toThrow(/not chapter review strings/i);
    expect(() => chapterReviewParser(['Introduction to Course'])).toThrow(/not chapter review strings/i);
  });
});
