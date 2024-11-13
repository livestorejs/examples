import { faker } from '@faker-js/faker';
import { User, Issue, Comment, Reaction } from '@/schema';
import { STATUSES, PRIORITIES } from '@/types';
// @ts-ignore
import { cuid } from '@livestore/utils/cuid';

export function createRandomUser(): User {
  return {
    id: cuid(),
    name: faker.person.firstName(),
    email: faker.internet.email(),
    photoUrl: faker.image.avatar(),
  };
}

export function createRandomIssue(assigneeId: string): Issue {
  const actions = [
    'Fix',
    'Update',
    'Implement',
    'Debug',
    'Optimize',
    'Refactor',
    'Add',
  ];
  const subjects = [
    'login flow',
    'navigation',
    'dark mode',
    'performance',
    'database queries',
    'UI components',
    'error handling',
    'user settings',
    'notifications',
    'search functionality',
  ];
  const title = `${randomValueFromArray(actions)} ${randomValueFromArray(subjects)}`;

  return {
    id: cuid(),
    title,
    description: faker.lorem.sentences({ min: 1, max: 2 }),
    parentIssueId: null,
    assigneeId,
    status: randomValueFromArray(Object.values(STATUSES)),
    priority: randomValueFromArray(Object.values(PRIORITIES)),
    createdAt: Date.now(),
    updatedAt: null,
    deletedAt: null,
  };
}

export function createRandomComment(issueId: string, userId: string): Comment {
  return {
    id: cuid(),
    issueId,
    userId,
    content: faker.lorem.sentences({ min: 1, max: 2 }),
    createdAt: faker.date.recent().getDate(),
    updatedAt: null,
  };
}

export function createRandomReaction(
  issueId: string,
  userId: string,
  commentId: string,
): Reaction {
  return {
    id: cuid(),
    issueId,
    commentId,
    userId,
    emoji: randomValueFromArray(emojies),
  };
}

export function randomValueFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

const emojies = ['👍', '👎', '💯', '👀', '🤔', '✅', '🔥'];
