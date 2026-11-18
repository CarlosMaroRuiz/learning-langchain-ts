export type DocInput = {
  topic: string;
  level: string;
  focus: string;
};

export interface SectionsDoc {
  frontPage: string;
  whatIs: string;
  howItWorks: string;
  practicalCase: string;
  applications: string;
  bestPractices: string;
  comparison: string;
}

export type DocumentState = DocInput & {
  sections: SectionsDoc;
  markdown: string;
};