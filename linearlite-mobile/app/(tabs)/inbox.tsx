import React, { useMemo } from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from 'react-native';
import {
  Comment,
  Issue,
  userMutations,
  issuesMutations,
  Reaction,
  tables,
  User,
  mutations,
} from '@/schema';
import { Schema } from 'effect';
import { querySQL, sql } from '@livestore/livestore';
import { useScopedQuery, useStore } from '@livestore/react';
import {
  createRandomUser,
  createRandomIssue,
  createRandomComment,
  createRandomReaction,
  randomValueFromArray,
} from '@/utils/generate-fake-data';

const COMMENTS_PER_ISSUE = 10;

export default function InboxScreen() {
  const user = useUser();
  const { store } = useStore();

  const usersQuery = useMemo(
    () =>
      querySQL(sql`select * from users`, {
        schema: Schema.Array(tables.users.schema),
        label: 'users',
      }),
    [],
  );

  const users = useScopedQuery(() => usersQuery, ['users']);

  function generateRandomData(numUsers: number, numIssuesPerUser: number) {
    const users: User[] = [];
    const issues: Issue[] = [];
    const comments: Comment[] = [];
    const reactions: Reaction[] = [];

    // Generate users
    for (let i = 0; i < numUsers; i++) {
      const user = createRandomUser();
      users.push(user);

      // Generate issues for each user
      for (let j = 0; j < numIssuesPerUser; j++) {
        const issue = createRandomIssue(user.id);
        issues.push(issue);

        // Generate 0-3 comments for each issue
        const numComments = Math.floor(Math.random() * COMMENTS_PER_ISSUE + 1);
        for (let k = 0; k < numComments; k++) {
          const comment = createRandomComment(issue.id, user.id);
          comments.push(comment);

          // Generate 0-2 reactions for each comment
          const numReactions = Math.floor(Math.random() * 3);
          for (let l = 0; l < numReactions; l++) {
            const reaction = createRandomReaction(
              issue.id,
              user.id,
              comment.id,
            );
            reactions.push(reaction);
          }
        }
      }
    }
    // Add generated data to the store
    store.mutate(
      ...users.map((user) => userMutations.createUser(user)),
      ...issues.map((issue) => issuesMutations.createIssue(issue)),
      ...comments.map((comment) => issuesMutations.createComment(comment)),
      ...reactions.map((reaction) => issuesMutations.createReaction(reaction)),
    );
  }

  function generateIssuesForCurrentUser(numberOfIssues: number) {
    const issues: Issue[] = [];
    const comments: Comment[] = [];
    const reactions: Reaction[] = [];

    for (let i = 0; i < numberOfIssues; i++) {
      const issue = createRandomIssue(user.id);
      issues.push(issue);

      // Generate comments using users
      const numComments = Math.floor(Math.random() * COMMENTS_PER_ISSUE + 1);
      for (let j = 0; j < numComments; j++) {
        const comment = createRandomComment(
          issue.id,
          // @ts-ignore
          randomValueFromArray(users).id,
        );
        comments.push(comment);

        const numReactions = Math.floor(Math.random() * 2);
        for (let k = 0; k < numReactions; k++) {
          const reaction = createRandomReaction(
            issue.id,
            // @ts-ignore
            randomValueFromArray(users).id,
            comment.id,
          );
          reactions.push(reaction);
        }
      }
    }

    store.mutate(
      ...issues.map((issue) => issuesMutations.createIssue(issue)),
      ...comments.map((comment) => issuesMutations.createComment(comment)),
      ...reactions.map((reaction) => issuesMutations.createReaction(reaction)),
    );
  }

  const reset = () =>
    store.mutate(issuesMutations.clearAll({ deleted: Date.now() }));

  return (
    <>
      <Button
        title="Generate 5 users with 10 issues"
        onPress={() => generateRandomData(5, 10)}
      />
      <Button
        title={`Generate 50 issues for ${user.name}`}
        onPress={() => generateIssuesForCurrentUser(50)}
      />
      <Button title="Clear all issues" color="red" onPress={reset} />
      {/* <Button
        title="Generate 50 users with 100 issues (can take a while)"
        onPress={() => generateRandomData(50, 100)}
      /> */}
    </>
  );
}
