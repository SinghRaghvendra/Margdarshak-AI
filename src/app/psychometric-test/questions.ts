
export interface SliderPole {
  label: string;
  emoji?: string;
}

export interface SliderQuestion {
  id: string;
  type: 'slider';
  text: string;
  poles: [SliderPole, SliderPole]; // [Left Pole, Right Pole]
}

export interface Option {
  id:string; // e.g., 'a', 'b'
  text: string;
}

export interface ChoiceQuestion {
  id: string;
  type: 'choice';
  text: string;
  options: Option[];
  visualHint?: string; // For simulating image-based questions
}

export interface ScenarioQuestion {
  id: string;
  type: 'scenario';
  scenario: string; // The introductory scenario text
  questionText: string; // The actual question
  options: Option[];
}

export interface RatingQuestion {
  id: string;
  type: 'rating';
  text: string;
  // Assumes a 1-5 rating scale (Strongly Disagree to Strongly Agree)
}

export type Question = SliderQuestion | ChoiceQuestion | ScenarioQuestion | RatingQuestion;

export interface Section {
  id: string;
  title: string;
  focusArea: string;
  questionTypeDescription: string;
  questions: Array<SliderQuestion | ChoiceQuestion | ScenarioQuestion>;
}

export const psychometricTestSections: Section[] = [
  {
    id: 'section1',
    title: 'Personality & Temperament',
    focusArea: 'Understanding your core personality traits.',
    questionTypeDescription: 'Move the slider to where you fit best on the spectrum.',
    questions: [
      { id: 's1q1', type: 'slider', text: 'I prefer to work...', poles: [{ label: 'Alone', emoji: '🛋' }, { label: 'In a team', emoji: '👯' }] },
      { id: 's1q2', type: 'slider', text: 'I make decisions based on...', poles: [{ label: 'Logic', emoji: '🧠' }, { label: 'Intuition', emoji: '❤️' }] },
      { id: 's1q3', type: 'slider', text: 'When planning, I am more...', poles: [{ label: 'Spontaneous', emoji: '🎉' }, { label: 'Organized', emoji: '🗓️' }] },
      { id: 's1q4', type: 'slider', text: 'In social situations, I am more...', poles: [{ label: 'Introverted', emoji: '🤫' }, { label: 'Extroverted', emoji: '🗣️' }] },
      { id: 's1q5', type: 'slider', text: 'I handle stress by...', poles: [{ label: 'Staying calm', emoji: '🧘' }, { label: 'Feeling pressured', emoji: '😫' }] },
    ],
  },
  {
    id: 'section2',
    title: 'Interests & Enjoyment',
    focusArea: 'Identifying what activities you are naturally drawn to.',
    questionTypeDescription: 'Choose the option that appeals to you most.',
    questions: [
      { id: 's2q1', type: 'choice', text: 'On a free afternoon, I\'d rather:', options: [{id:'a', text:'Build or fix something tangible'}, {id:'b', text:'Analyze data or solve a complex puzzle'}, {id:'c', text:'Create art or write a story'}] },
      { id: 's2q2', type: 'choice', text: 'Which job appeals most?', options: [{id:'a', text:'Managing a project and leading a team'}, {id:'b', text:'Conducting detailed research'}, {id:'c', text:'Helping or advising people directly'}] },
      { id: 's2q3', type: 'choice', text: 'I enjoy tasks that are...', options: [{id:'a', text:'Practical and hands-on'}, {id:'b', text:'Creative and unstructured'}, {id:'c', text:'Organized and detail-oriented'}] },
      { id: 's2q4', type: 'choice', text: 'A documentary I would watch is about...', options: [{id:'a', text:'Technological innovations'}, {id:'b', text:'Historical events and patterns'}, {id:'c', text:'Human psychology and behavior'}] },
      { id: 's2q5', type: 'choice', text: 'I feel most satisfied when I...', options: [{id:'a', text:'Achieve a measurable goal'}, {id:'b', text:'Express myself creatively'}, {id:'c', text:'Make a positive impact on others'}] },
    ],
  },
    {
    id: 'section3',
    title: 'Motivation & Values',
    focusArea: 'What drives you in a professional environment.',
    questionTypeDescription: 'Choose the option that is most important to you.',
    questions: [
      { id: 's3q1', type: 'slider', text: 'My main career driver is...', poles: [{ label: 'Financial security', emoji: '💰' }, { label: 'Making an impact', emoji: '🌍' }] },
      { id: 's3q2', type: 'slider', text: 'I prefer a job that is...', poles: [{ label: 'Stable and predictable', emoji: '🔒' }, { label: 'Dynamic and full of change', emoji: '🔥' }] },
      { id: 's3q3', type: 'choice', text: 'I value a workplace that prioritizes...', options: [{id:'a', text:'Innovation and risk-taking'}, {id:'b', text:'Team harmony and collaboration'}, {id:'c', text:'Individual achievement and autonomy'}] },
      { id: 's3q4', type: 'slider', text: 'I am more motivated by...', poles: [{ label: 'Internal validation', emoji: '😊' }, { label: 'External recognition', emoji: '🏆' }] },
      { id: 's3q5', type: 'choice', text: 'Which company benefit is most appealing?', options: [{id:'a', text:'A high salary and bonus'}, {id:'b', text:'A flexible work schedule'}, {id:'c', text:'Opportunities for professional development'}] },
    ],
  },
  {
    id: 'section4',
    title: 'Cognitive Style',
    focusArea: 'How you process information and solve problems.',
    questionTypeDescription: 'Choose your typical approach.',
    questions: [
      { id: 's4q1', type: 'choice', text: 'When facing a problem, I first...', options: [{id:'a', text:'Break it down into smaller steps'}, {id:'b', text:'Brainstorm many different ideas'}, {id:'c', text:'Go with my gut feeling'}] },
      { id: 's4q2', type: 'choice', text: 'When learning something new, I prefer...', options: [{id:'a', text:'A structured, step-by-step course'}, {id:'b', text:'To experiment and learn by doing'}, {id:'c', text:'To read and absorb a lot of information first'}] },
      { id: 's4q3', type: 'slider', text: 'I am better at...', poles: [{ label: 'Seeing the big picture', emoji: '🔭' }, { label: 'Focusing on the details', emoji: '🔬' }] },
      { id: 's4q4', type: 'scenario', scenario: 'You are given a large, complex dataset.', questionText: 'What is your first instinct?', options: [{id:'a', text:'Look for overall trends and patterns'}, {id:'b', text:'Check the data for accuracy and clean it up'}, {id:'c', text:'Visualize the data to see what stands out'}] },
      { id: 's4q5', type: 'choice', text: 'I prefer my work to be...', options: [{id:'a', text:'Clearly defined with specific instructions'}, {id:'b', text:'Open-ended, allowing for my own interpretation'}, {id:'c', text:'A mix of both clear tasks and creative freedom'}] },
    ],
  },
  {
    id: 'section5',
    title: 'Social & Work Environment Style',
    focusArea: 'Your preferred style of interaction and work environment.',
    questionTypeDescription: 'Select your preference.',
    questions: [
      { id: 's5q1', type: 'slider', text: 'My ideal work environment is...', poles: [{ label: 'Quiet and focused', emoji: '🧘' }, { label: 'Social and collaborative', emoji: '🔊' }] },
      { id: 's5q2', type: 'choice', text: 'I prefer to communicate...', options: [{id:'a', text:'In writing (email, docs)'}, {id:'b', text:'Face-to-face or in meetings'}, {id:'c', text:'A mix of both'}] },
      { id: 's5q3', type: 'scenario', scenario: 'A conflict arises within your team.', questionText: 'How do you typically respond?', options: [{id:'a', text:'Try to mediate and find a compromise'}, {id:'b', text:'Stay out of it unless directly involved'}, {id:'c', text:'Analyze the situation and propose a logical solution'}] },
      { id: 's5q4', type: 'slider', text: 'When it comes to leadership, I prefer to...', poles: [{ label: 'Lead the group', emoji: '👑' }, { label: 'Be a contributor', emoji: '🙋' }] },
      { id: 's5q5', type: 'choice', text: 'Receiving feedback is best when it is...', options: [{id:'a', text:'Direct and to the point'}, {id:'b', text:'Gentle and encouraging'}, {id:'c', text:'Data-driven and objective'}] },
    ],
  }
];

// We will empty the optional questions for this test to keep it simple
export const optionalRatingQuestions: RatingQuestion[] = [];
