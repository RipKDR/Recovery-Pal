/**
 * 12-Step Work Prompts
 * Guided prompts for each step of the program
 */

export interface StepPrompt {
  step: number;
  title: string;
  principle: string;
  description: string;
  prompts: string[];
}

export const STEP_PROMPTS: StepPrompt[] = [
  {
    step: 1,
    title: 'Powerlessness',
    principle: 'Honesty',
    description: 'We admitted we were powerless over our addiction—that our lives had become unmanageable.',
    prompts: [
      'In what ways has your addiction made your life unmanageable?',
      'What consequences have you experienced due to your addiction?',
      'How has your addiction affected your relationships?',
      'What does powerlessness mean to you?',
      'When did you first realize you couldn\'t control your use?',
    ],
  },
  {
    step: 2,
    title: 'Hope',
    principle: 'Hope',
    description: 'Came to believe that a Power greater than ourselves could restore us to sanity.',
    prompts: [
      'What does "sanity" mean to you in the context of recovery?',
      'Have you seen others recover? How does that make you feel?',
      'What gives you hope that change is possible?',
      'What does a Higher Power mean to you?',
      'What insane behaviors have you engaged in due to your addiction?',
    ],
  },
  {
    step: 3,
    title: 'Surrender',
    principle: 'Faith',
    description: 'Made a decision to turn our will and our lives over to the care of God as we understood Him.',
    prompts: [
      'What does surrender mean to you?',
      'What fears do you have about letting go of control?',
      'How has trying to control everything affected your life?',
      'What would your life look like if you trusted a Higher Power?',
      'What is holding you back from making this decision?',
    ],
  },
  {
    step: 4,
    title: 'Inventory',
    principle: 'Courage',
    description: 'Made a searching and fearless moral inventory of ourselves.',
    prompts: [
      'List your resentments and who/what they involve.',
      'What fears have controlled your behavior?',
      'How have you harmed others in your relationships?',
      'What character defects have you noticed in yourself?',
      'What patterns do you see in your behavior?',
    ],
  },
  {
    step: 5,
    title: 'Admission',
    principle: 'Integrity',
    description: 'Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.',
    prompts: [
      'How do you feel about sharing your inventory?',
      'Who have you chosen to hear your Fifth Step? Why?',
      'What parts of your inventory are hardest to admit?',
      'How did you feel after completing your Fifth Step?',
      'What did you learn about yourself through this process?',
    ],
  },
  {
    step: 6,
    title: 'Readiness',
    principle: 'Willingness',
    description: 'Were entirely ready to have God remove all these defects of character.',
    prompts: [
      'Which character defects are you most ready to let go of?',
      'Which defects are you holding onto? Why?',
      'How have your defects "served" you in the past?',
      'What would your life be like without these defects?',
      'What is blocking your willingness?',
    ],
  },
  {
    step: 7,
    title: 'Humility',
    principle: 'Humility',
    description: 'Humbly asked Him to remove our shortcomings.',
    prompts: [
      'What does humility mean to you?',
      'How is humility different from humiliation?',
      'Write a prayer or intention for the removal of your shortcomings.',
      'How can you practice humility in your daily life?',
      'What shortcomings are still present? How are you working on them?',
    ],
  },
  {
    step: 8,
    title: 'Willingness to Amend',
    principle: 'Brotherly Love',
    description: 'Made a list of all persons we had harmed, and became willing to make amends to them all.',
    prompts: [
      'List all the people you have harmed.',
      'What was your part in each situation?',
      'Are there people you\'re not yet willing to make amends to? Why?',
      'How do you feel about the prospect of making amends?',
      'What amends might you owe to yourself?',
    ],
  },
  {
    step: 9,
    title: 'Making Amends',
    principle: 'Justice',
    description: 'Made direct amends to such people wherever possible, except when to do so would injure them or others.',
    prompts: [
      'Which amends have you made? How did they go?',
      'Which amends are you preparing to make?',
      'Are there amends that might cause harm? How will you handle them?',
      'What living amends are you making through changed behavior?',
      'How has making amends affected your recovery?',
    ],
  },
  {
    step: 10,
    title: 'Daily Inventory',
    principle: 'Perseverance',
    description: 'Continued to take personal inventory and when we were wrong promptly admitted it.',
    prompts: [
      'What went well today?',
      'Where was I resentful, selfish, dishonest, or afraid today?',
      'Do I owe anyone an apology?',
      'What could I have done better?',
      'What am I grateful for today?',
    ],
  },
  {
    step: 11,
    title: 'Spiritual Growth',
    principle: 'Spiritual Awareness',
    description: 'Sought through prayer and meditation to improve our conscious contact with God as we understood Him, praying only for knowledge of His will for us and the power to carry that out.',
    prompts: [
      'What is your current spiritual practice?',
      'How has your understanding of a Higher Power evolved?',
      'What did you experience in meditation today?',
      'How do you seek guidance in your daily life?',
      'What messages or insights have you received?',
    ],
  },
  {
    step: 12,
    title: 'Service',
    principle: 'Service',
    description: 'Having had a spiritual awakening as the result of these Steps, we tried to carry this message to others, and to practice these principles in all our affairs.',
    prompts: [
      'How has your life changed as a result of working the steps?',
      'In what ways are you of service to others?',
      'How do you carry the message to those still suffering?',
      'How do you practice these principles in your daily life?',
      'What does a spiritual awakening mean to you?',
    ],
  },
];

/**
 * Get prompts for a specific step
 */
export function getStepPrompts(step: number): StepPrompt | undefined {
  return STEP_PROMPTS.find((s) => s.step === step);
}

