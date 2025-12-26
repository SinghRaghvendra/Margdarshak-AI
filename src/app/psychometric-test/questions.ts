
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
  id:string; // e.g., 'a', 'b', 'c', 'd'
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

export type Question = SliderQuestion | ChoiceQuestion | ScenarioQuestion;

export interface Section {
  id: string;
  title: string;
  focusArea: string;
  questions: Array<SliderQuestion | ChoiceQuestion | ScenarioQuestion>;
}

export const psychometricTestSections: Section[] = [
  {
    id: 'section1',
    title: 'Personality & Temperament',
    focusArea: 'Understanding your core personality traits.',
    questions: [
        { id: 's1q1', type: 'slider', text: 'I prefer to work...', poles: [{ label: 'Alone', emoji: '🛋️' }, { label: 'In a team', emoji: '🧑‍🤝‍🧑' }] },
        { id: 's1q2', type: 'slider', text: 'I make decisions based on...', poles: [{ label: 'Data and logic', emoji: '🧠' }, { label: 'Intuition and feelings', emoji: '❤️' }] },
        { id: 's1q3', type: 'slider', text: 'In my daily life, I am more...', poles: [{ label: 'Spontaneous', emoji: '🎉' }, { label: 'Organized and planned', emoji: '🗓️' }] },
        { id: 's1q4', type: 'slider', text: 'In social situations, I feel...', poles: [{ label: 'Energized by people', emoji: '🗣️' }, { label: 'Drained by people', emoji: '🤫' }] },
        { id: 's1q5', type: 'slider', text: 'When facing unexpected problems, I tend to...', poles: [{ label: 'Stay calm and adapt', emoji: '🧘' }, { label: 'Feel stressed and pressured', emoji: '😫' }] },
        { id: 's1q6', type: 'choice', text: 'When starting a new project, I prefer to:', options: [{id:'a', text:'Have a clear, detailed plan from the start.'}, {id:'b', text:'Have a general goal and figure it out as I go.'}, {id:'c', text:'Collaborate with others to define the plan.'}, {id:'d', text:'Experiment with a few different approaches first.'}] },
        { id: 's1q7', type: 'choice', text: 'How do you react to criticism of your work?', options: [{id:'a', text:'I take it personally and feel discouraged.'}, {id:'b', text:'I appreciate it as a chance to improve.'}, {id:'c', text:'I question its validity and defend my work.'}, {id:'d', text:'I focus on the feedback, not the person giving it.'}] },
        { id: 's1q8', type: 'choice', text: 'You have a long to-do list. How do you approach it?', options: [{id:'a', text:'Tackle the hardest task first to get it over with.'}, {id:'b', text:'Start with the easiest tasks for quick wins.'}, {id:'c', text:'Do whichever task I feel most motivated for at the moment.'}, {id:'d', text:'Group similar tasks together and do them in batches.'}] },
        { id: 's1q9', type: 'slider', text: 'My general approach to rules is...', poles: [{ label: 'They are essential guidelines', emoji: '📜' }, { label: 'They are meant to be questioned', emoji: '🤔' }] },
        { id: 's1q10', type: 'choice', text: 'When a friend is upset, my first instinct is to:', options: [{id:'a', text:'Offer practical solutions to their problem.'}, {id:'b', text:'Listen and offer emotional support.'}, {id:'c', text:'Distract them with a fun activity.'}, {id:'d', text:'Give them space to process their feelings.'}] },
        { id: 's1q11', type: 'slider', text: 'I am more drawn to...', poles: [{ label: 'New, exciting experiences', emoji: '🚀' }, { label: 'Comfortable, familiar routines', emoji: '🏡' }] },
        { id: 's1q12', type: 'choice', text: 'How do you feel about public speaking?', options: [{id:'a', text:'Excited and energized by the opportunity.'}, {id:'b', text:'Nervous, but I can manage it if prepared.'}, {id:'c', text:'Terrified and I avoid it at all costs.'}, {id:'d', text:'Comfortable, it doesn\'t bother me.'}] },
        { id: 's1q13', type: 'scenario', scenario: 'Your team is facing a tight deadline.', questionText: 'What is your role?', options: [{id:'a', text:'The one keeping everyone calm and motivated.'}, {id:'b', text:'The one re-organizing the plan to be more efficient.'}, {id:'c', text:'The one doing the focused, heads-down work.'}, {id:'d', text:'The one challenging if the deadline is realistic.'}] },
        { id: 's1q14', type: 'slider', text: 'I recharge my energy by...', poles: [{ label: 'Spending time alone', emoji: '🔋' }, { label: 'Being with others', emoji: '🎉' }] },
        { id: 's1q15', type: 'choice', text: 'When making a purchase, I rely more on:', options: [{id:'a', text:'Thorough research and feature comparisons.'}, {id:'b', text:'Customer reviews and recommendations.'}, {id:'c', text:'How the product makes me feel.'}, {id:'d', text:'The brand\'s reputation and my past experiences.'}] },
        { id: 's1q16', type: 'slider', text: 'I consider myself to be more...', poles: [{ label: 'Idealistic and visionary', emoji: '✨' }, { label: 'Pragmatic and realistic', emoji: '⚙️' }] },
        { id: 's1q17', type: 'choice', text: 'How do you handle multiple competing priorities?', options: [{id:'a', text:'I get stressed and struggle to choose what to do.'}, {id:'b', text:'I quickly rank them by urgency and importance.'}, {id:'c', text:'I try to multitask and work on them all at once.'}, {id:'d', text:'I delegate or ask for help to manage the load.'}] },
        { id: 's1q18', type: 'slider', text: 'When it comes to risk...', poles: [{ label: 'I prefer safety and predictability', emoji: '🛡️' }, { label: 'I enjoy taking calculated risks', emoji: '🎲' }] },
        { id: 's1q19', type: 'scenario', scenario: 'A project you led failed.', questionText: 'Your primary feeling is:', options: [{id:'a', text:'Disappointment in myself for not succeeding.'}, {id:'b', text:'Frustration with the external factors that caused it.'}, {id:'c', text:'A desire to analyze what went wrong and learn.'}, {id:'d', text:'Eagerness to move on to the next challenge.'}] },
        { id: 's1q20', type: 'choice', text: 'My desk or workspace is usually:', options: [{id:'a', text:'Perfectly neat and organized.'}, {id:'b', text:'A bit of organized chaos.'}, {id:'c', text:'Minimalist and clean.'}, {id:'d', text:'Covered in current projects and ideas.'}] },
    ],
  },
  {
    id: 'section2',
    title: 'Interests & Enjoyment',
    focusArea: 'Identifying what activities you are naturally drawn to.',
    questions: [
        { id: 's2q1', type: 'choice', text: 'If you had a free afternoon, which activity would you choose?', options: [{id:'a', text:'Build or fix something (like furniture or a gadget).'}, {id:'b', text:'Read a book or watch a documentary.'}, {id:'c', text:'Doodle, paint, or write a story.'}, {id:'d', text:'Organize your closet or plan your week.'}] },
        { id: 's2q2', type: 'choice', text: 'Which of these job descriptions sounds most appealing?', options: [{id:'a', text:'Lead a team to launch a new product.'}, {id:'b', text:'Analyze data to uncover hidden market trends.'}, {id:'c',text:'Help people navigate their personal challenges.'}, {id:'d', text:'Design the user interface for a new mobile app.'}] },
        { id: 's2q3', type: 'choice', text: 'Which section of a bookstore would you go to first?', options: [{id:'a', text:'Science & Technology'}, {id:'b', text:'Arts & Photography'}, {id:'c', text:'Self-Help & Psychology'}, {id:'d', text:'Business & Finance'}] },
        { id: 's2q4', type: 'choice', text: 'I feel most satisfied when I:', options: [{id:'a', text:'Solve a complex problem that no one else could.'}, {id:'b', text:'Create something beautiful and unique.'}, {id:'c', text:'Help someone achieve their goal.'}, {id:'d', text:'Build an efficient system that saves time.'}] },
        { id: 's2q5', type: 'choice', text: 'Which type of TV show are you most likely to watch?', options: [{id:'a', text:'A crime documentary analyzing evidence.'}, {id:'b', text:'A competition show for artists or designers.'}, {id:'c', text:'A talk show about social issues.'}, {id:'d', text:'A reality show about running a business.'}] },
        { id: 's2q6', type: 'slider', text: 'The idea of working with my hands is...', poles: [{ label: 'Very appealing', emoji: '🛠️' }, { label: 'Not for me', emoji: '🙅' }] },
        { id: 's2q7', text: 'I am most interested in understanding...', type: 'choice', options: [{id:'a', text:'How machines work.'}, {id:'b', text:'How economies work.'}, {id:'c', text:'How people think and feel.'}, {id:'d', text:'How natural ecosystems work.'}] },
        { id: 's2q8', type: 'choice', text: 'Which task sounds like the most fun?', options: [{id:'a', text:'Negotiating a major business deal.'}, {id:'b', text:'Writing a piece of music.'}, {id:'c', text:'Conducting a scientific experiment.'}, {id:'d', text:'Teaching a difficult concept to a student.'}] },
        { id: 's2q9', type: 'slider', text: 'I enjoy activities that involve...', poles: [{ label: 'Abstract thinking', emoji: '🤔' }, { label: 'Concrete, tangible results', emoji: '🧱' }] },
        { id: 's2q10', text: 'If I were to start a YouTube channel, it would be about:', type: 'choice', options: [{id:'a', text:'Reviewing the latest tech gadgets.'}, {id:'b', text:'Creating short films or animations.'}, {id:'c', text:'Explaining complex scientific topics simply.'}, {id:'d', text:'Interviewing successful entrepreneurs.'}] },
        { id: 's2q11', type: 'choice', text: 'Which subject did you enjoy most in school?', options: [{id:'a', text:'Mathematics or Physics'}, {id:'b', text:'Art or Literature'}, {id:'c', text:'Biology or Chemistry'}, {id:'d', text:'History or Social Studies'}] },
        { id: 's2q12', type: 'slider', text: 'I am more drawn to jobs that offer...', poles: [{ label: 'A chance to be creative', emoji: '🎨' }, { label: 'A clear path for advancement', emoji: '📈' }] },
        { id: 's2q13', type: 'choice', text: 'A perfect weekend includes:', options: [{id:'a', text:'A solo trip to a museum or art gallery.'}, {id:'b', text:'A competitive sports game with friends.'}, {id:'c', text:'Volunteering for a cause I care about.'}, {id:'d', text:'Fixing things or working on a project at home.'}] },
        { id: 's2q14', type: 'scenario', scenario: 'You win a free online course.', questionText: 'Which one do you pick?', options: [{id:'a', text:'"Introduction to Python Programming"'}, {id:'b', text:'"Fundamentals of Graphic Design"'}, {id:'c', text:'"The Psychology of Persuasion"'}, {id:'d', text:'"Investment Strategies for Beginners"'}] },
        { id: 's2q15', type: 'slider', text: 'I prefer to...', poles: [{ label: 'Work with data', emoji: '📊' }, { label: 'Work with people', emoji: '👥' }] },
        { id: 's2q16', type: 'choice', text: 'What kind of news do you read first?', options: [{id:'a', text:'Technology and startup news.'}, {id:'b', text:'Politics and world affairs.'}, {id:'c', text:'Arts and culture reviews.'}, {id:'d', text:'Business and market updates.'}] },
        { id: 's2q17', type: 'slider', text: 'I find more fulfillment in...', poles: [{ label: 'Leading and influencing', emoji: '👑' }, { label: 'Creating and building', emoji: '🔨' }] },
        { id: 's2q18', text: 'Which work environment sounds best?', type: 'choice', options: [{id:'a', text:'A busy, bustling hospital or clinic.'}, {id:'b', text:'A quiet, focused research lab.'}, {id:'c', text:'A collaborative and creative design studio.'}, {id:'d', text:'A high-energy, competitive sales floor.'}] },
        { id: 's2q19', type: 'choice', text: 'If you had to choose a superpower, it would be:', options: [{id:'a', text:'The ability to talk to animals.'}, {id:'b', text:'The ability to solve any puzzle instantly.'}, {id:'c', text:'The ability to create anything you can imagine.'}, {id:'d', text:'The ability to persuade anyone of your viewpoint.'}] },
        { id: 's2q20', type: 'slider', text: 'I\'m more interested in...', poles: [{ label: 'How things are made', emoji: '🔧' }, { label: 'Why people do things', emoji: '🧐' }] },
    ],
  },
    {
    id: 'section3',
    title: 'Motivation & Values',
    focusArea: 'What drives you in a professional environment.',
    questions: [
        { id: 's3q1', type: 'slider', text: 'My main career driver is...', poles: [{ label: 'Financial security', emoji: '💰' }, { label: 'Making a positive impact', emoji: '🌍' }] },
        { id: 's3q2', type: 'slider', text: 'I prefer a job that is...', poles: [{ label: 'Stable and predictable', emoji: '🔒' }, { label: 'Dynamic and ever-changing', emoji: '🔥' }] },
        { id: 's3q3', type: 'choice', text: 'Which of these is the most important factor in a job for you?', options: [{id:'a', text:'A high salary and generous bonuses.'}, {id:'b', text:'A healthy work-life balance and flexibility.'}, {id:'c', text:'A strong sense of purpose in my work.'}, {id:'d', text:'Continuous learning and skill development.'}] },
        { id: 's3q4', type: 'slider', text: 'I am more motivated by...', poles: [{ label: 'My own internal standards', emoji: '😊' }, { label: 'External recognition and awards', emoji: '🏆' }] },
        { id: 's3q5', type: 'choice', text: 'What would make you leave a job, even if it paid well?', options: [{id:'a', text:'A toxic or negative work environment.'}, {id:'b', text:'Feeling bored and uninspired by the work.'}, {id:'c', text:'Lack of opportunities for promotion or growth.'}, {id:'d', text:'The company having unethical practices.'}] },
        { id: 's3q6', type: 'scenario', scenario: 'You are offered two jobs.', questionText: 'Which one do you choose?', options: [{id:'a', text:'A high-paying job with long hours at a large corporation.'}, {id:'b', text:'A lower-paying job with a great team at a mission-driven startup.'}, {id:'c', text:'A freelance role with high flexibility but unstable income.'}, {id:'d', text:'A stable government job with great benefits and job security.'}] },
        { id: 's3q7', type: 'slider', text: 'I prefer to be...', poles: [{ label: 'A specialist expert in one area', emoji: '🎯' }, { label: 'A generalist with broad knowledge', emoji: '🌐' }] },
        { id: 's3q8', type: 'choice', text: 'The most powerful motivator for me is:', options: [{id:'a', text:'Autonomy and the freedom to work my own way.'}, {id:'b', text:'The opportunity to lead and manage a team.'}, {id:'c', text:'Mastering a difficult skill or craft.'}, {id:'d', text:'The social status and prestige of my job title.'}] },
        { id: 's3q9', type: 'slider', text: 'When it comes to my career, I am playing the...', poles: [{ label: 'Short game (quick wins)', emoji: ' Sprint' }, { label: 'Long game (future growth)', emoji: 'Marathon' }] },
        { id: 's3q10', type: 'choice', text: 'What does "success" mean to you?', options: [{id:'a', text:'Financial independence and wealth.'}, {id:'b',text:'Being a recognized expert in my field.'}, {id:'c', text:'Having a fulfilling life outside of work.'}, {id:'d', text:'Creating work that outlasts me.'}] },
        { id: 's3q11', type: 'slider', text: 'I prefer a company that values...', poles: [{ label: 'Tradition and stability', emoji: '🏛️' }, { label: 'Innovation and disruption', emoji: '⚡' }] },
        { id: 's3q12', type: 'scenario', scenario: 'You have to choose a project to work on.', questionText: 'Which do you pick?', options: [{id:'a', text:'A high-profile project with a high chance of failure.'}, {id:'b', text:'A guaranteed success that won\'t get much attention.'}, {id:'c', text:'A project that aligns with my personal interests.'}, {id:'d', text:'The one that will get me promoted fastest.'}] },
        { id: 's3q13', type: 'choice', text: 'The best reward for a job well done is:', options: [{id:'a', text:'A cash bonus.'}, {id:'b', text:'Public praise from leadership.'}, {id:'c', text:'More responsibility and a bigger challenge.'}, {id:'d', text:'Extra time off.'}] },
        { id: 's3q14', text: 'I feel most valued at work when:', type: 'choice', options: [{id:'a', text:'My opinion is sought after and respected.'}, {id:'b', text:'I am given the trust to work independently.'}, {id:'c', text:'My contributions to the team are acknowledged.'}, {id:'d', text:'I receive a promotion or a pay raise.'}] },
        { id: 's3q15', type: 'slider', text: 'I am more comfortable with...', poles: [{ label: 'A structured salary', emoji: '💼' }, { label: 'Performance-based pay', emoji: '📈' }] },
        { id: 's3q16', type: 'choice', text: 'Which of these is a deal-breaker for you in a job?', options: [{id:'a', text:'No opportunities for remote work.'}, {id:'b', text:'A very competitive, cut-throat culture.'}, {id:'c', text:'Repetitive, monotonous tasks.'}, {id:'d', text:'Poor management and leadership.'}] },
        { id: 's3q17', type: 'slider', text: 'I admire leaders who are...', poles: [{ label: 'Visionary and inspiring', emoji: '🔭' }, { label: 'Practical and effective', emoji: '🛠️' }] },
        { id: 's3q18', type: 'choice', text: 'In 10 years, I would rather be:', options: [{id:'a', text:'Wealthy, but working long hours.'}, {id:'b', text:'Making a moderate income, but with a lot of free time.'}, {id:'c', text:'Famous in my industry, but with a lot of stress.'}, {id:'d', text:'Making a real difference, even if not well-known.'}] },
        { id: 's3q19', type: 'slider', text: 'It\'s more important for my work to be...', poles: [{ label: 'Interesting to me', emoji: '💡' }, { label: 'Valued by others', emoji: '🌟' }] },
        { id: 's3q20', type: 'choice', text: 'I prefer a company culture that feels like:', options: [{id:'a', text:'A professional sports team (high performance, competitive).'}, {id:'b', text:'A family (supportive, close-knit).'}, {id:'c', text:'A university lab (innovative, experimental).'}, {id:'d', text:'A well-oiled machine (efficient, predictable).'}] },
    ],
  },
  {
    id: 'section4',
    title: 'Cognitive Style',
    focusArea: 'How you process information and solve problems.',
    questions: [
        { id: 's4q1', type: 'choice', text: 'When facing a complex problem, my first step is to:', options: [{id:'a', text:'Break it down into smaller, logical steps.'}, {id:'b', text:'Brainstorm as many creative solutions as possible.'}, {id:'c', text:'Try to find a similar problem I\'ve solved before.'}, {id:'d', text:'Visualize the problem and its components.'}] },
        { id: 's4q2', type: 'choice', text: 'How do you prefer to learn a new software?', options: [{id:'a', text:'Read the user manual from start to finish.'}, {id:'b', text:'Watch a video tutorial that walks through it.'}, {id:'c', text:'Click around and figure it out through trial and error.'}, {id:'d', text:'Take a structured online course.'}] },
        { id: 's4q3', type: 'slider', text: 'When working on a project, I am better at...', poles: [{ label: 'Generating initial ideas', emoji: '💡' }, { label: 'Executing the fine details', emoji: '✍️' }] },
        { id: 's4q4', type: 'scenario', scenario: 'You are presented with a large spreadsheet of data.', questionText: 'What is your first instinct?', options: [{id:'a', text:'Look for the high-level summary and key trends.'}, {id:'b', text:'Check for errors and inconsistencies in the data.'}, {id:'c', text:'Create a chart or graph to visualize it.'}, {id:'d', text:'Question the source and method of data collection.'}] },
        { id: 's4q5', type: 'choice', text: 'I am better at remembering:', options: [{id:'a', text:'Faces and names.'}, {id:'b', text:'Stories and events.'}, {id:'c', text:'Numbers and statistics.'}, {id:'d', text:'Processes and step-by-step instructions.'}] },
        { id: 's4q6', type: 'slider', text: 'I prefer work that is...', poles: [{ label: 'Creative and open-ended', emoji: '🎨' }, { label: 'Structured and data-driven', emoji: '🔢' }] },
        { id: 's4q7', type: 'choice', text: 'When assembling furniture, I am more likely to:', options: [{id:'a', text:'Follow the instructions step-by-step.'}, {id:'b', text:'Look at the picture and figure it out myself.'}, {id:'c', text:'Organize all the pieces before I start.'}, {id:'d', text:'Get frustrated and ask for help.'}] },
        { id: 's4q8', type: 'scenario', scenario: 'You need to explain a complex idea to your team.', questionText: 'How do you do it?', options: [{id:'a', text:'With a detailed, written document.'}, {id:'b', text:'Using a whiteboard and diagrams.'}, {id:'c', text:'Through a story or an analogy.'}, {id:'d', text:'By presenting the raw data and letting it speak for itself.'}] },
        { id: 's4q9', type: 'slider', text: 'I enjoy...', poles: [{ label: 'Following a proven method', emoji: '✅' }, { label: 'Inventing a new method', emoji: '💡' }] },
        { id: 's4q10', type: 'choice', text: 'Which statement is more true for you?', options: [{id:'a', text:'I am good at seeing the big picture.'}, {id:'b', text:'I am good at noticing small details.'}, {id:'c', text:'I am good at connecting unrelated ideas.'}, {id:'d', text:'I am good at finding flaws in a plan.'}] },
        { id: 's4q11', type: 'slider', text: 'I learn best by...', poles: [{ label: 'Doing', emoji: '🛠️' }, { label: 'Observing', emoji: '👀' }] },
        { id: 's4q12', type: 'choice', text: 'When planning a vacation, I am more likely to:', options: [{id:'a', text:'Create a detailed spreadsheet itinerary.'}, {id:'b', text:'Have a general idea of places to visit.'}, {id:'c', text:'Book the first good deal I find.'}, {id:'d', text:'Research the culture and history extensively.'}] },
        { id: 's4q13', type: 'scenario', scenario: 'The project\'s initial plan has failed.', questionText: 'What is your reaction?', options: [{id:'a', text:'"Let\'s analyze the data to see where the assumption was wrong."' }, {id:'b', text:'"Let\'s brainstorm some completely new approaches."' }, {id:'c', text:'"Let\'s go back to the drawing board and create a more detailed plan."' }, {id:'d', text:'"Let\'s see if we can find a quick fix to get back on track."' }] },
        { id: 's4q14', type: 'slider', text: 'My thinking style is more...', poles: [{ label: 'Linear and sequential', emoji: '➡️' }, { label: 'Web-like and associative', emoji: '🕸️' }] },
        { id: 's4q15', type: 'choice', text: 'Which question is more interesting to you?', options: [{id:'a', text:'"How can we make this process 10% more efficient?"'}, {id:'b', text:'"What is a completely new way to solve this problem?"'}, {id:'c', text:'"How will this change affect our team\'s morale?"'}, {id:'d', text:'"What are the long-term consequences of this decision?"'}] },
        { id: 's4q16', type: 'slider', text: 'When reading an article, I pay more attention to...', poles: [{ label: 'The specific facts and figures', emoji: '📈' }, { label: 'The author\'s main argument', emoji: '🗣️' }] },
        { id: 's4q17', type: 'choice', text: 'I would rather:', options: [{id:'a', text:'Debug a complicated piece of code.'}, {id:'b', text:'Design a logo for a new brand.'}, {id:'c', text:'Create a financial model for a business.'}, {id:'d', text:'Write a company\'s mission statement.'}] },
        { id: 's4q18', type: 'scenario', scenario: 'You have to memorize a list of items.', questionText: 'What technique do you use?', options: [{id:'a', text:'Repeat the list over and over.'}, {id:'b', text:'Create a story connecting the items.'}, {id:'c', text:'Group the items into categories.'}, {id:'d', text:'Visualize the items in a specific location.'}] },
        { id: 's4q19', type: 'slider', text: 'When problem-solving, I focus more on...', poles: [{ label: 'Finding the correct answer', emoji: '✔️' }, { label: 'Exploring different possibilities', emoji: '❓' }] },
        { id: 's4q20', type: 'choice', text: 'Which task sounds more appealing?', options: [{id:'a', text:'Optimizing an existing system for better performance.'}, {id:'b', text:'Inventing a completely new system from scratch.'}, {id:'c', text:'Documenting how a system works for others.'}, {id:'d', text:'Testing a system to find all its weaknesses.'}] },
    ],
  },
  {
    id: 'section5',
    title: 'Work & Social Environment',
    focusArea: 'Your preferred style of interaction and workplace.',
    questions: [
        { id: 's5q1', type: 'slider', text: 'My ideal work environment is...', poles: [{ label: 'Quiet and allows deep focus', emoji: '🤫' }, { label: 'Social and full of interaction', emoji: '🗣️' }] },
        { id: 's5q2', type: 'choice', text: 'I prefer to communicate important information:', options: [{id:'a', text:'In a detailed email or document.'}, {id:'b', text:'In a face-to-face meeting.'}, {id:'c', text:'Over a quick chat or instant message.'}, {id:'d', text:'Through a formal presentation.'}] },
        { id: 's5q3', type: 'scenario', scenario: 'A conflict arises between two team members.', questionText: 'Your typical response is to:', options: [{id:'a', text:'Try to mediate and help them find a middle ground.'}, {id:'b', text:'Stay out of it unless it directly affects your work.'}, {id:'c', text:'Report it to a manager or HR.'}, {id:'d', text:'Propose a logical solution based on facts.'}] },
        { id: 's5q4', type: 'slider', text: 'When it comes to team projects, I prefer to...', poles: [{ label: 'Take the lead and organize', emoji: '👑' }, { label: 'Be a reliable contributor', emoji: '🙋' }] },
        { id: 's5q5', type: 'choice', text: 'When receiving feedback, I prefer it to be:', options: [{id:'a', text:'Direct, blunt, and to the point.'}, {id:'b', text:'Gentle, encouraging, and diplomatic.'}, {id:'c', text:'Anonymous and in writing.'}, {id:'d', text:'Backed by data and specific examples.'}] },
        { id: 's5q6', type: 'choice', text: 'I work best in a team that:', options: [{id:'a', text:'Challenges each other and debates ideas openly.'}, {id:'b', text:'Is harmonious and avoids confrontation.'}, {id:'c', text:'Is highly organized with clear roles for everyone.'}, {id:'d', text:'Is flexible and adapts roles as needed.'}] },
        { id: 's5q7', type: 'slider', text: 'I am more productive when I am...', poles: [{ label: 'Working from home', emoji: '🏠' }, { label: 'Working in an office', emoji: '🏢' }] },
        { id: 's5q8', type: 'choice', text: 'I prefer a manager who:', options: [{id:'a', text:'Gives me clear instructions and checks in often.'}, {id:'b', text:'Gives me freedom and trusts me to deliver.'}, {id:'c', text:'Acts as a mentor and helps me grow my skills.'}, {id:'d', text:'Protects the team from outside pressures.'}] },
        { id: 's5q9', type: 'scenario', scenario: 'Your team is celebrating a big win.', questionText: 'Where would you rather be?', options: [{id:'a', text:'At a loud, crowded team party.'}, {id:'b', text:'At a small, quiet team dinner.'}, {id:'c', text:'Receiving a team-wide email recognition.'}, {id:'d', text:'Already focused on the next project.'}] },
        { id: 's5q10', type: 'slider', text: 'I enjoy giving presentations...', poles: [{ label: 'To a large audience', emoji: '🎤' }, { label: 'To a small group', emoji: '🧑‍🏫' }] },
        { id: 's5q11', type: 'choice', text: 'When collaborating, I am the one who:', options: [{id:'a', text:'Makes sure everyone is heard.'}, {id:'b', text:'Keeps the team focused on the goal.'}, {id:'c', text:'Comes up with the creative ideas.'}, {id:'d', text:'Takes notes and organizes next steps.'}] },
        { id: 's5q12', type: 'slider', text: 'I prefer a company that is...', poles: [{ label: 'A small, tight-knit startup', emoji: '🚀' }, { label: 'A large, established corporation', emoji: '🏛️' }] },
        { id: 's5q13', type: 'choice', text: 'Which part of a group project do you enjoy most?', options: [{id:'a', text:'The initial brainstorming session.'}, {id:'b', text:'The individual research and work.'}, {id:'c', text:'Putting all the pieces together at the end.'}, {id:'d', text:'Presenting the final result to an audience.'}] },
        { id: 's5q14', type: 'scenario', scenario: 'You join a new company.', questionText: 'What is most important for you to learn first?', options: [{id:'a', text:'Who the key decision-makers are.'}, {id:'b', text:'The details of my first project.'}, {id:'c', text:'The company\'s long-term vision and goals.'}, {id:'d',text:'The unwritten social rules of the office.'}] },
        { id: 's5q15', type: 'slider', text: 'My approach to networking is...', poles: [{ label: 'I find it energizing', emoji: '🤝' }, { label: 'I find it draining', emoji: '🥵' }] },
        { id: 's5q16', type: 'choice', text: 'I\'m more likely to befriend a coworker who is:', options: [{id:'a', text:'Highly intelligent and challenges me.'}, {id:'b', text:'Funny and makes the day enjoyable.'}, {id:'c', text:'Supportive and a good listener.'}, {id:'d', text:'Ambitious and well-connected.'}] },
        { id: 's5q17', type: 'slider', text: 'I prefer to get help by...', poles: [{ label: 'Asking a coworker directly', emoji: '🙋' }, { label: 'Searching for the answer myself', emoji: '🔍' }] },
        { id: 's5q18', type: 'choice', text: 'A "good meeting" is one that:', options: [{id:'a', text:'Is short and has a clear agenda.'}, {id:'b', text:'Generates a lot of new ideas.'}, {id:'c', text:'Strengthens team bonds and relationships.'}, {id:'d', text:'Results in a firm decision being made.'}] },
        { id: 's5q19', type: 'scenario', scenario: 'The team has to work late.', questionText: 'Your thought is:', options: [{id:'a', text:'"Great! I love the energy of working under pressure together."' }, {id:'b', text:'"Annoying, but I\'ll do my part to get it done."' }, {id:'c', text:'"This is a sign of poor planning."' }, {id:'d', text:'"I hope there\'s free pizza."' }] },
        { id: 's5q20', type: 'slider', text: 'When it comes to my career, I prefer...', poles: [{ label: 'Competition with others', emoji: '🏆' }, { label: 'Collaboration with others', emoji: '🤝' }] },
    ],
  }
];
