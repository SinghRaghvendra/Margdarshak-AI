
export interface Question {
  id: number;
  text: string;
  options: string[];
}

export const psychometricTestQuestions: Question[] = [
  // Category: Self-Perception & Work Ethic
  { id: 1, text: 'I consider myself a highly disciplined person.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 2, text: 'I am very organized and methodical in my approach to tasks.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 3, text: 'I am reliable and always meet my deadlines.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 4, text: 'I take initiative rather than waiting to be told what to do.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 5, text: 'I am persistent and don\'t give up easily when faced with challenges.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 6, text: 'I am a self-starter and can motivate myself.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 7, text: 'I pay close attention to details in my work.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 8, text: 'I am proactive about improving my skills and knowledge.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 9, text: 'I maintain a positive attitude, even when things are tough.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 10, text: 'I am comfortable taking responsibility for my actions.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 11, text: 'I set high standards for myself and my work.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 12, text: 'I am usually an optimistic person.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 13, text: 'I am adaptable and can adjust to new situations easily.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 14, text: 'I believe in following rules and procedures carefully.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 15, text: 'I am driven by a desire to achieve significant results.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },

  // Category: Interpersonal & Communication Style
  { id: 16, text: 'I enjoy working collaboratively in a team.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 17, text: 'I am a good listener and try to understand others\' perspectives.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 18, text: 'I can clearly articulate my thoughts and ideas to others.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 19, text: 'I am comfortable giving presentations to groups.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 20, text: 'I am empathetic and can understand others\' feelings.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 21, text: 'I handle conflicts and disagreements constructively.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 22, text: 'I am good at persuading and influencing others.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 23, text: 'I prefer direct and straightforward communication.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 24, text: 'I enjoy networking and building professional relationships.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 25, text: 'I am comfortable working with diverse groups of people.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 26, text: 'I am good at providing constructive feedback.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 27, text: 'I find it easy to build rapport with new people.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 28, text: 'I am patient when explaining things to others.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 29, text: 'I enjoy helping and mentoring colleagues.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 30, text: 'I prefer working in environments with open communication.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },

  // Category: Thinking & Problem-Solving Style
  { id: 31, text: 'I enjoy solving complex and challenging problems.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 32, text: 'I am an analytical thinker and like to break down problems.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 33, text: 'I often come up with creative and innovative solutions.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 34, text: 'I am good at strategic thinking and long-term planning.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 35, text: 'I make decisions based on logic and data rather than intuition.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 36, text: 'I am comfortable making decisions even with incomplete information.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 37, text: 'I enjoy brainstorming and exploring multiple possibilities.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 38, text: 'I am good at identifying patterns and trends in information.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 39, text: 'I prefer tasks that require critical thinking.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 40, text: 'I am often able to see things from different perspectives.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 41, text: 'I enjoy tasks that involve research and investigation.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 42, text: 'I am quick to understand new concepts.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 43, text: 'I am good at anticipating potential problems or obstacles.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 44, text: 'I trust my intuition when making important decisions.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 45, text: 'I like to experiment with new ideas and approaches.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },

  // Category: Work Environment Preferences
  { id: 46, text: 'I prefer a structured work environment with clear guidelines.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 47, text: 'I thrive in fast-paced and dynamic work environments.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 48, text: 'I prefer working independently with a lot of autonomy.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 49, text: 'I value a workplace that encourages innovation and creativity.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 50, text: 'I prefer a stable and predictable work routine.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 51, text: 'I enjoy working in a competitive environment.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 52, text: 'I prefer a quiet work environment with minimal distractions.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 53, text: 'I value a strong sense of community and teamwork in the workplace.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 54, text: 'I am comfortable with a high degree of ambiguity at work.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 55, text: 'I prefer a work environment that offers frequent feedback and recognition.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 56, text: 'I enjoy work that involves a lot of variety and new challenges.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 57, text: 'I prefer a workplace with a clear hierarchical structure.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 58, text: 'I am drawn to companies with a strong social mission.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 59, text: 'I enjoy working outdoors or in non-office settings.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 60, text: 'I am comfortable working remotely most of the time.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },

  // Category: Learning & Adaptability
  { id: 61, text: 'I am eager to learn new skills and technologies.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 62, text: 'I adapt quickly to changes in plans or priorities.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 63, text: 'I am open to constructive criticism and feedback.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 64, text: 'I enjoy stepping out of my comfort zone.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 65, text: 'I learn best by doing and through hands-on experience.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 66, text: 'I can quickly pick up new software or tools.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 67, text: 'I see mistakes as learning opportunities.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 68, text: 'I enjoy being challenged intellectually.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 69, text: 'I actively seek out opportunities for professional development.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 70, text: 'I am comfortable with ambiguity and uncertainty.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },

  // Category: Interests & Motivators
  { id: 71, text: 'I am motivated by financial rewards and incentives.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 72, text: 'I am motivated by opportunities for advancement and career growth.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 73, text: 'I am motivated by making a positive impact on others or society.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 74, text: 'I enjoy tasks that allow me to express my creativity.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 75, text: 'I am interested in working with data and numbers.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 76, text: 'I enjoy working with my hands and building things.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 77, text: 'I am interested in science and technology.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 78, text: 'I am passionate about arts and culture.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 79, text: 'I enjoy tasks that involve helping or caring for others.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 80, text: 'I am motivated by public recognition and praise.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 81, text: 'I enjoy routine tasks that are predictable.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 82, text: 'I am interested in understanding how things work.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 83, text: 'I am motivated by intellectual stimulation.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 84, text: 'I enjoy activities that involve physical exertion.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 85, text: 'I am drawn to fields that involve research and discovery.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },

  // Category: Resilience & Stress Management
  { id: 86, text: 'I remain calm under pressure.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 87, text: 'I bounce back quickly from setbacks and disappointments.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 88, text: 'I can manage multiple tasks and deadlines effectively.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 89, text: 'I have effective strategies for managing stress.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 90, text: 'I can maintain focus even in chaotic environments.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 91, text: 'I am not easily discouraged by criticism.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 92, text: 'I view challenges as opportunities for growth.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 93, text: 'I am comfortable dealing with difficult people or situations.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 94, text: 'I can work effectively for long periods if necessary.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 95, text: 'I seek support from others when I am feeling overwhelmed.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },

  // Category: Leadership & Initiative
  { id: 96, text: 'I am comfortable taking on leadership roles.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 97, text: 'I enjoy motivating and inspiring others.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 98, text: 'I am confident in my ability to make important decisions.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 99, text: 'I often volunteer to take on new responsibilities or projects.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
  { id: 100, text: 'I am good at delegating tasks effectively.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
];

    