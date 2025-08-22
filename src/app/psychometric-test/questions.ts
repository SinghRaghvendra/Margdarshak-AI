
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
    title: 'Section 1: Personality & Temperament',
    focusArea: 'Understand how you think, feel, and behave.',
    questionTypeDescription: 'Drag the slider to where you best fit.',
    questions: [
      { id: 's1q1', type: 'slider', text: 'I recharge best...', poles: [{ label: 'Alone', emoji: '🛋' }, { label: 'In a crowd', emoji: '👯' }] },
      { id: 's1q2', type: 'slider', text: 'My work style is...', poles: [{ label: 'Structured', emoji: '🎯' }, { label: 'Spontaneous', emoji: '🎨' }] },
      { id: 's1q3', type: 'slider', text: 'I\'m more...', poles: [{ label: 'Logic-driven', emoji: '🧠' }, { label: 'Emotion-driven', emoji: '❤️' }] },
      { id: 's1q4', type: 'slider', text: 'I make decisions...', poles: [{ label: 'Carefully', emoji: '🐢' }, { label: 'Quickly', emoji: '🚀' }] },
      { id: 's1q5', type: 'slider', text: 'I deal with conflict by...', poles: [{ label: 'Avoiding it', emoji: '🙊' }, { label: 'Facing it head-on', emoji: '🗣' }] },
      { id: 's1q6', type: 'slider', text: 'I focus more on...', poles: [{ label: 'Details', emoji: '🔍' }, { label: 'The big picture', emoji: '🌍' }] },
      { id: 's1q7', type: 'slider', text: 'I\'m usually...', poles: [{ label: 'Organized', emoji: '📦' }, { label: 'Flexible', emoji: '🌀' }] },
      { id: 's1q8', type: 'slider', text: 'My emotional state is...', poles: [{ label: 'Steady', emoji: '🌈' }, { label: 'Up & down', emoji: '🌪' }] },
      { id: 's1q9', type: 'slider', text: 'In groups, I...', poles: [{ label: 'Listen mostly', emoji: '👂' }, { label: 'Speak up first', emoji: '🎤' }] },
      { id: 's1q10', type: 'slider', text: 'I prefer environments that are...', poles: [{ label: 'Predictable', emoji: '🛑' }, { label: 'Dynamic', emoji: '🎢' }] },
      { id: 's1q11', type: 'slider', text: 'I’d rather...', poles: [{ label: 'Work independently', emoji: '🖥' }, { label: 'Work in a team', emoji: '🤝' }] },
      { id: 's1q12', type: 'slider', text: 'I usually trust...', poles: [{ label: 'Evidence', emoji: '🧪' }, { label: 'Intuition', emoji: '🔮' }] },
    ],
  },
  {
    id: 'section2',
    title: 'Section 2: Interests & Enjoyment',
    focusArea: 'Uncover what types of activities naturally attract you.',
    questionTypeDescription: 'Select the option that best describes you.',
    questions: [
      { id: 's2q1', type: 'choice', text: 'What sounds most fun on a free afternoon?', options: [{id:'a', text:'Fixing a gadget'}, {id:'b',text:'Reading a science blog'}, {id:'c',text:'Painting'}, {id:'d',text:'Leading a student club'}, {id:'e',text:'Organizing your bookshelf'}] },
      { id: 's2q2', type: 'choice', text: 'Which of these jobs would you try for a day?', options: [{id:'a',text:'Forest ranger'}, {id:'b',text:'Research scientist'}, {id:'c',text:'Fashion designer'}, {id:'d',text:'Sales executive'}, {id:'e',text:'Accountant'}] },
      { id: 's2q3', type: 'choice', text: 'Which school subject did you enjoy most?', options: [{id:'a',text:'Physical Education (PE)'}, {id:'b',text:'Math'}, {id:'c',text:'Art'}, {id:'d',text:'History'}, {id:'e',text:'Business/Economics'}] },
      { id: 's2q4', type: 'choice', text: 'Which hobby feels like *you*?', options: [{id:'a',text:'Woodworking or Crafting'}, {id:'b',text:'Solving puzzles or Strategy games'}, {id:'c',text:'Writing poetry or stories'}, {id:'d',text:'Hosting a podcast or Debating'}, {id:'e',text:'Budgeting or Personal finance planning'}] },
      { id: 's2q5', type: 'choice', text: 'Which setting excites you more?', options: [{id:'a',text:'A vibrant natural landscape (Outdoors)'}, {id:'b',text:'A state-of-the-art laboratory (Lab)'}, {id:'c',text:'A creative workshop or gallery (Studio)'}, {id:'d',text:'A high-energy corporate meeting room (Boardroom)'}, {id:'e',text:'A well-organized, quiet library or study (Office/Library)'}] },
      { id: 's2q6', type: 'choice', text: 'Pick your dream workplace "vibe":', visualHint: 'Imagine different atmospheres.', options: [{id:'a',text:'Collaborative, open-plan, buzzing with ideas'}, {id:'b',text:'Quiet, focused, individual workstations'}, {id:'c',text:'Dynamic, fast-paced, constantly changing'}, {id:'d',text:'Supportive, team-oriented, friendly'}, {id:'e',text:'Innovative, experimental, cutting-edge'}]},
      { id: 's2q7', type: 'choice', text: 'Choose your ideal toolkit:', visualHint: 'Think about tools youd enjoy using.', options: [{id:'a',text:'Physical tools, machinery, outdoor gear'}, {id:'b',text:'Computers, data sets, research papers'}, {id:'c',text:'Art supplies, musical instruments, design software'}, {id:'d',text:'Presentation tools, networking platforms, communication devices'}, {id:'e',text:'Spreadsheets, planning software, organizational systems'}]},
      { id: 's2q8', type: 'choice', text: 'What kind of "impact" sounds most appealing?', visualHint: 'Consider the results of your work.', options: [{id:'a',text:'Building tangible things or improving physical environments'}, {id:'b',text:'Discovering new knowledge or solving complex technical problems'}, {id:'c',text:'Creating beauty, evoking emotion, or expressing ideas'}, {id:'d',text:'Leading teams, influencing decisions, or driving growth'}, {id:'e',text:'Organizing systems, improving efficiency, or ensuring accuracy'}]},
      { id: 's2q9', type: 'choice', text: 'If you were to learn a new skill, which area would you pick?', visualHint: 'Focus on the learning process.', options: [{id:'a',text:'A practical trade or outdoor skill'}, {id:'b',text:'Advanced mathematics or a scientific theory'}, {id:'c',text:'A new artistic medium or performance art'}, {id:'d',text:'Negotiation tactics or public speaking'}, {id:'e',text:'A new software for data management or project planning'}]},
      { id: 's2q10', type: 'choice', text: 'What kind of "challenge" motivates you most?', visualHint: 'Think about overcoming obstacles.', options: [{id:'a',text:'Physical endurance or navigating tough terrain'}, {id:'b',text:'Intellectual puzzles or complex data analysis'}, {id:'c',text:'Creative blocks or expressing a unique vision'}, {id:'d',text:'Persuading a difficult audience or leading a high-stakes project'}, {id:'e',text:'Managing intricate details or ensuring flawless execution'}]}
    ],
  },
  {
    id: 'section3',
    title: 'Section 3: Motivation & Work Values',
    focusArea: 'Understand what drives you in your work and life.',
    questionTypeDescription: 'Drag sliders or select the option that best describes you.',
    questions: [
      { id: 's3q1', type: 'slider', text: 'I work best when I feel...', poles: [{ label: 'Appreciated', emoji: '🙌' }, { label: 'Challenged', emoji: '🧗‍♂️' }] },
      { id: 's3q2', type: 'slider', text: 'I prefer a job that...', poles: [{ label: 'Offers stability', emoji: '🔒' }, { label: 'Is full of surprises', emoji: '🔥' }] },
      { id: 's3q3', type: 'slider', text: 'I\'d trade a higher salary for...', poles: [{ label: 'More free time', emoji: '🕐' }, { label: 'No way, show me the money', emoji: '💰' }] },
      { id: 's3q4', type: 'slider', text: 'I care more about...', poles: [{ label: 'Climbing the ladder', emoji: '💼' }, { label: 'Making a difference', emoji: '❤️' }] },
      { id: 's3q5', type: 'slider', text: 'When working in a team, I value...', poles: [{ label: 'Clear roles', emoji: '📣' }, { label: 'Creative freedom', emoji: '🧠' }] },
      { id: 's3q6', type: 'choice', text: 'Which of these is most important to you in a job?', options: [{id:'a',text:'A prestigious title and recognition'}, {id:'b',text:'Flexible working hours and autonomy'}, {id:'c',text:'Long-term job security and benefits'}, {id:'d',text:'Work that feels purposeful and impactful'}] },
      { id: 's3q7', type: 'choice', text: 'I’d rather be known as someone who is...', options: [{id:'a',text:'Highly reliable and dependable'}, {id:'b',text:'Exceptionally creative and innovative'}, {id:'c',text:'Strongly influential and persuasive'}, {id:'d',text:'Genuinely kind and supportive'}]},
      { id: 's3q8', type: 'scenario', scenario: 'You get 2 job offers. Offer A has higher pay but longer hours. Offer B has lower pay but excellent work-life balance.', questionText: 'Which do you lean towards?', options: [{id:'a',text:'Offer A (Higher Pay)'}, {id:'b',text:'Offer B (Work-Life Balance)'}] },
      { id: 's3q9', type: 'scenario', scenario: 'Your project can either be a guaranteed moderate success by following a proven method, or potentially a huge success (but also risk of failure) by trying a new, innovative approach.', questionText: 'What do you choose?', options: [{id:'a',text:'Proven method (Moderate Success)'}, {id:'b',text:'Innovative approach (High Risk/Reward)'}] },
      { id: 's3q10', type: 'scenario', scenario: 'You have an opportunity to lead a high-profile project which requires significant overtime, or mentor a junior colleague which is rewarding but less visible.', questionText: 'Which is more appealing?', options: [{id:'a',text:'Lead high-profile project'}, {id:'b',text:'Mentor junior colleague'}] },
      { id: 's3q11', type: 'scenario', scenario: 'You can choose a role that offers rapid promotion but is highly competitive, or a role with slower advancement but a more collaborative and supportive team.', questionText: 'Which do you prefer?', options: [{id:'a',text:'Rapid promotion, competitive'}, {id:'b',text:'Slower advancement, supportive team'}] },
      { id: 's3q12', type: 'scenario', scenario: 'Your company is offering training. You can either specialize deeply in your current skill, or learn a completely new skill that could open different career paths.', questionText: 'What do you opt for?', options: [{id:'a',text:'Specialize deeply in current skill'}, {id:'b',text:'Learn a completely new skill'}] },
    ],
  },
  {
    id: 'section4',
    title: 'Section 4: Cognitive Style & Decision-Making',
    focusArea: 'Measure your thinking, planning, and decision-making preferences.',
    questionTypeDescription: 'Drag sliders or select the option that best describes you.',
    questions: [
      { id: 's4q1', type: 'slider', text: 'When solving problems, I...', poles: [{ label: 'Break them down logically', emoji: '🧱' }, { label: 'Go with my gut instinct', emoji: '🧠' }] },
      { id: 's4q2', type: 'slider', text: 'I\'m better at tasks requiring...', poles: [{ label: 'Precise calculation', emoji: '🔢' }, { label: 'Open brainstorming', emoji: '✍️' }] },
      { id: 's4q3', type: 'slider', text: 'I prefer instructions that are...', poles: [{ label: 'Step-by-step & detailed', emoji: '📜' }, { label: 'Open-ended & flexible', emoji: '🧩' }] },
      { id: 's4q4', type: 'choice', text: 'Choose your preferred mental challenge:', options: [{id:'a',text:'Decoding a complex pattern or code'}, {id:'b',text:'Solving a creative riddle or abstract puzzle'}, {id:'c',text:'Developing and pitching an entirely new idea'}, {id:'d',text:'Organizing a multi-step plan for a complex project'}] },
      { id: 's4q5', type: 'choice', text: 'When learning something new, I primarily...', options: [{id:'a',text:'Need to see concrete examples and demonstrations'}, {id:'b',text:'Prefer to experiment and figure it out as I go'}, {id:'c',text:'Learn best through hands-on practice and application'}, {id:'d',text:'Thoroughly research it or ask experts for guidance'}] },
      { id: 's4q6', type: 'scenario', scenario: 'You are faced with an important decision with incomplete information.', questionText: 'What is your typical approach?', options: [{id:'a',text:'Delay the decision until more information is available'}, {id:'b',text:'Make the best decision possible with current information, trusting your judgment'}, {id:'c',text:'Consult with several trusted advisors before deciding'}, {id:'d',text:'Analyze potential risks and benefits of each option extensively'}] },
      { id: 's4q7', type: 'scenario', scenario: 'A new technology is introduced that could streamline your work, but it has a steep learning curve.', questionText: 'How do you react?', options: [{id:'a',text:'Wait to see if others adopt it successfully first'}, {id:'b',text:'Dive in and start learning it immediately'}, {id:'c',text:'Evaluate its pros and cons carefully before investing time'}, {id:'d',text:'Stick to my current methods if they are working well'}] },
      { id: 's4q8', type: 'scenario', scenario: 'You\'re working on a task and realize you made a significant mistake early on.', questionText: 'What do you do?', options: [{id:'a',text:'Try to fix it quietly without telling anyone'}, {id:'b',text:'Acknowledge the mistake to your team/manager and ask for input on fixing it'}, {id:'c',text:'Analyze what went wrong to prevent future mistakes, then fix it'}, {id:'d',text:'Feel discouraged and struggle to refocus'}] },
      { id: 's4q9', type: 'scenario', scenario: 'You need to present a complex idea to an audience with varying levels of expertise.', questionText: 'How do you prepare?', options: [{id:'a',text:'Focus on a highly detailed, technical explanation'}, {id:'b',text:'Use analogies and storytelling to make it accessible'}, {id:'c',text:'Prepare different versions for different audience segments'}, {id:'d',text:'Keep it concise and high-level, offering details if asked'}] },
      { id: 's4q10', type: 'scenario', scenario: 'You are given a task with a tight deadline and limited resources.', questionText: 'Your first step is to:', options: [{id:'a',text:'Immediately start working on the most critical parts'}, {id:'b',text:'Create a detailed plan and schedule'}, {id:'c',text:'Negotiate for more time or resources'}, {id:'d',text:'Delegate parts of the task if possible'}] },
    ],
  },
  {
    id: 'section5',
    title: 'Section 5: Social Style & Environment Fit',
    focusArea: 'Discover how you interact and what work environments suit you.',
    questionTypeDescription: 'Drag sliders or select the option that best describes you.',
    questions: [
      { id: 's5q1', type: 'slider', text: 'I thrive in environments that are...', poles: [{ label: 'Calm & focused', emoji: '🧘' }, { label: 'Buzzing & energetic', emoji: '🔊' }] },
      { id: 's5q2', type: 'slider', text: 'I prefer collaboration that involves...', poles: [{ label: 'Continuous interaction', emoji: '🔄' }, { label: 'Occasional check-ins', emoji: '💡' }] },
      { id: 's5q3', type: 'choice', text: 'In a group project, I usually take on the role of:', options: [{id:'a',text:'Leader/Coordinator (taking charge, organizing)'}, {id:'b',text:'Idea Generator/Innovator (contributing creative ideas)'}, {id:'c',text:'Supporter/Implementer (helping others, executing tasks)'}, {id:'d',text:'Analyst/Researcher (providing data, ensuring accuracy)'}] },
      { id: 's5q4', type: 'choice', text: 'What annoys you more in a work setting?', options: [{id:'a',text:'Poor or unclear communication'}, {id:'b',text:'Lack of structure or disorganization'}, {id:'c',text:'Repetitive or boring tasks'}, {id:'d',text:'Being micromanaged or lacking autonomy'}] },
      { id: 's5q5', type: 'choice', text: 'I’d rather work primarily:', options: [{id:'a',text:'In a bustling co-working space or open office'}, {id:'b',text:'From a quiet, remote location like a home office or cabin'}, {id:'c',text:'As part of a close-knit team in a traditional office setting'}, {id:'d',text:'On the go, traveling frequently and meeting new people'}] },
      { id: 's5q6', type: 'choice', text: 'My ideal workspace aesthetic is:', visualHint: 'Imagine your ideal office decor.', options: [{id:'a',text:'Minimalist and modern'}, {id:'b',text:'Cozy and comfortable, with personal touches'}, {id:'c',text:'Bright, colorful, and stimulating'}, {id:'d',text:'Functional and highly organized, no frills'}, {id:'e',text:'Nature-inspired, with plants and natural light'}]},
      { id: 's5q7', type: 'choice', text: 'The ideal "soundscape" for my work is:', visualHint: 'Think about background noise.', options: [{id:'a',text:'Complete silence'}, {id:'b',text:'Ambient music or white noise'}, {id:'c',text:'The quiet hum of colleagues working'}, {id:'d',text:'Lively chatter and background activity'}, {id:'e',text:'Music with lyrics that I enjoy'}]},
      { id: 's5q8', type: 'choice', text: 'I prefer team meetings that are:', options: [{id:'a',text:'Short, focused, and agenda-driven'}, {id:'b',text:'Brainstorming sessions with free-flowing ideas'}, {id:'c',text:'Infrequent, only when absolutely necessary'}, {id:'d',text:'Regular check-ins that also build team rapport'}]},
      { id: 's5q9', type: 'choice', text: 'When receiving feedback, I prefer it to be:', options: [{id:'a',text:'Direct and to the point, even if critical'}, {id:'b',text:'Gentle, constructive, and encouraging'}, {id:'c',text:'Data-driven and specific with examples'}, {id:'d',text:'Part of a regular, scheduled review process'}]},
      { id: 's5q10', type: 'choice', text: 'My ideal level of social interaction at work is:', options: [{id:'a',text:'Minimal, mostly focused on individual tasks'}, {id:'b',text:'Moderate, with some team collaboration and occasional social events'}, {id:'c',text:'High, with frequent team interactions and a strong social culture'}]},
      { id: 's5q11', type: 'choice', text: 'I am most productive when my workday is:', options: [{id:'a',text:'Highly structured with a clear schedule'}, {id:'b',text:'Flexible, allowing me to set my own pace and priorities'}, {id:'c',text:'A mix of structured tasks and creative freedom'}, {id:'d',text:'Varied, with different types of tasks each day'}]},
      { id: 's5q12', type: 'choice', text: 'If I could choose, my company\'s social events would be:', options: [{id:'a',text:'Optional and low-key gatherings'}, {id:'b',text:'Team-building activities and workshops'}, {id:'c',text:'Large, lively parties and celebrations'}, {id:'d',text:'Volunteer or community service events'}]}
    ],
  },
];

export const optionalRatingQuestions: RatingQuestion[] = [
  // Self-Perception & Work Ethic
  { id: 'opt_q1', type: 'rating', text: 'I consistently seek out new challenges to grow my abilities.' },
  { id: 'opt_q2', type: 'rating', text: 'I am highly self-motivated and require little external push.' },
  { id: 'opt_q3', type: 'rating', text: 'I am meticulous and strive for perfection in my work.' },
  { id: 'opt_q4', type: 'rating', text: 'I am comfortable with ambiguity and can make decisions with incomplete information.' },
  // Interpersonal & Communication Style
  { id: 'opt_q5', type: 'rating', text: 'I am skilled at navigating complex social dynamics in a group.' },
  { id: 'opt_q6', type: 'rating', text: 'I find it easy to empathize with people from diverse backgrounds.' },
  { id: 'opt_q7', type: 'rating', text: 'I am persuasive and can effectively rally support for my ideas.' },
  { id: 'opt_q8', type: 'rating', text: 'I actively seek opportunities to collaborate with others.' },
  // Thinking & Problem-Solving Style
  { id: 'opt_q9', type: 'rating', text: 'I enjoy deconstructing complex problems into smaller, manageable parts.' },
  { id: 'opt_q10', type: 'rating', text: 'I often think "outside the box" to find innovative solutions.' },
  { id: 'opt_q11', type: 'rating', text: 'I am adept at long-term strategic planning.' },
  { id: 'opt_q12', type: 'rating', text: 'I rely heavily on data and evidence when making important judgments.' },
  // Work Environment Preferences
  { id: 'opt_q13', type: 'rating', text: 'I perform best in high-pressure, fast-paced environments.' },
  { id: 'opt_q14', type: 'rating', text: 'I value a workplace that offers significant autonomy and independence.' },
  { id: 'opt_q15', type: 'rating', text: 'A strong ethical compass in a company is crucial for me.' },
  { id: 'opt_q16', type: 'rating', text: 'I enjoy work that involves a high degree of variety and change.' },
  // Resilience & Stress Management
  { id: 'opt_q17', type: 'rating', text: 'I maintain composure and effectiveness under tight deadlines.' },
  { id: 'opt_q18', type: 'rating', text: 'I bounce back quickly from setbacks and view them as learning opportunities.' },
  { id: 'opt_q19', type: 'rating', text: 'I am good at managing my energy levels to avoid burnout.' },
  { id: 'opt_q20', type: 'rating', text: 'I proactively address potential stressors before they become major issues.' },
];
