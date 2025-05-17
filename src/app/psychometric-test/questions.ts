export interface Question {
  id: number;
  text: string;
  options: string[];
}

export const psychometricTestQuestions: Question[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  text: `This is sample question number ${i + 1}. How strongly do you agree with this statement related to work preferences or personality?`,
  options: [
    'Strongly Disagree',
    'Disagree',
    'Neutral',
    'Agree',
    'Strongly Agree',
  ],
}));
