export interface UnitMeta {
  number: number
  title: string
  topic: string
  outcomes: string[]
  available: boolean
}

export const UNITS: UnitMeta[] = [
  {
    number: 1,
    title: 'First impressions',
    topic: 'Talking about first impressions',
    outcomes: ['talk about first impressions', 'arrange a meeting', 'exchange contact details'],
    available: true,
  },
  {
    number: 2,
    title: 'Motivation',
    topic: 'Motivation at work',
    outcomes: ['talk about motivation', 'encourage and end conversations politely', 'use different questions to check information or start conversations'],
    available: true,
  },
  {
    number: 3,
    title: 'On schedule',
    topic: 'Managing projects',
    outcomes: ['talk about projects', 'run update meetings and question decisions', 'talk about past or recent actions and achievements'],
    available: true,
  },
  {
    number: 4,
    title: 'New ideas',
    topic: 'Ideas and innovations',
    outcomes: ['talk about innovation', 'present ideas and refer to evidence', 'talk about ability in the past, present and future'],
    available: true,
  },
  {
    number: 5,
    title: 'Ethical business',
    topic: 'Ethical business',
    outcomes: ['talk about ethical business', 'plan arrangements and respond to invitations', 'talk about decisions, plans and predictions'],
    available: true,
  },
  {
    number: 6,
    title: 'Making decisions',
    topic: 'Personality and decision-making',
    outcomes: ['talk about personality', 'participate in decision-making meetings and talk about social plans', 'talk about different quantities'],
    available: true,
  },
  {
    number: 7,
    title: 'Outsourcing',
    topic: 'Outsourcing',
    outcomes: ['talk about outsourcing', 'present information and ask questions about presentations', 'report information in an impersonal way'],
    available: true,
  },
  {
    number: 8,
    title: 'Employees',
    topic: 'Employers and employees',
    outcomes: ['talk about employment', 'negotiate with colleagues and make requests', 'negotiate certain conditions'],
    available: true,
  },
  {
    number: 9,
    title: 'New business',
    topic: 'Starting up a new business',
    outcomes: ['talk about start-ups', "ask contacts for help and avoid saying 'no'", 'talk about past or recent activities and results'],
    available: true,
  },
  {
    number: 10,
    title: 'Communications',
    topic: 'Communications technology',
    outcomes: ['talk about technology', 'deal with information and problems on the phone', 'use phrasal verbs in different contexts'],
    available: true,
  },
  {
    number: 11,
    title: 'Change',
    topic: 'Talking about change',
    outcomes: ['talk about change', 'present plans and give balanced arguments', 'talk about the probability of future activities and developments'],
    available: true,
  },
  {
    number: 12,
    title: 'Data',
    topic: 'Dealing in data',
    outcomes: ['talk about data', 'describe trends', 'report what someone has said'],
    available: true,
  },
  {
    number: 13,
    title: 'Culture',
    topic: 'Cultural differences',
    outcomes: ['talk about cultural differences', 'describe past events and news', 'describe the sequence of past events'],
    available: true,
  },
  {
    number: 14,
    title: 'Performance',
    topic: 'Staff appraisals',
    outcomes: ['talk about appraisals', 'evaluate performance and raise issues', 'talk about imagined past actions and results'],
    available: true,
  },
  {
    number: 15,
    title: 'Career breaks',
    topic: 'Taking a career break',
    outcomes: ['talk about career breaks', 'present a case', 'talk about time off and discuss interview questions'],
    available: true,
  },
]
