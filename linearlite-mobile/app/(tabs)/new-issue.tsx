import { useUser } from '@/hooks/useUser';
import { tables } from '@/schema';
import { createIssue } from '@/schema/issues-mutations';
import {
  updateNewIssueDescription,
  updateNewIssueText,
} from '@/schema/mutations';
import { PRIORITIES, STATUSES } from '@/types';
import { useRow, useStore } from '@livestore/react';
// @ts-ignore
import { cuid } from '@livestore/utils/cuid';
import { Stack, useRouter } from 'expo-router';
import React, { Fragment } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

export default function NewIssueScreen() {
  const user = useUser();
  const router = useRouter();
  const { store } = useStore();
  const [{ newIssueText, newIssueDescription }] = useRow(tables.app);

  const handleCreateIssue = () => {
    if (!newIssueText) return;

    const id = cuid();
    store.mutate(
      createIssue({
        id,
        title: newIssueText,
        description: newIssueDescription,
        parentIssueId: null,
        assigneeId: user.id,
        status: STATUSES.BACKLOG,
        priority: PRIORITIES.NONE,
        createdAt: Date.now(),
        updatedAt: null,
      }),
    );
    router.push(`/issue-details?issueId=${id}`);

    // reset state
    store.mutate(updateNewIssueText({ text: '' }));
    store.mutate(updateNewIssueDescription({ text: '' }));
  };

  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: 'New Issue',
          headerRight: () => (
            <Pressable onPress={handleCreateIssue}>
              <Text className="text-blue-500 pr-4">Create</Text>
            </Pressable>
          ),
          freezeOnBlur: false,
        }}
      />
      <View className="px-5 pt-3">
        <TextInput
          value={newIssueText}
          className="font-bold text-2xl mb-3 dark:text-zinc-50"
          onChangeText={(text: string) =>
            store.mutate(updateNewIssueText({ text }))
          }
          placeholder="Issue title"
        />
        <TextInput
          value={newIssueDescription}
          onChangeText={(text: string) =>
            store.mutate(updateNewIssueDescription({ text }))
          }
          className="dark:text-zinc-50"
          placeholder="Description..."
          multiline
        />
      </View>
    </Fragment>
  );
}
