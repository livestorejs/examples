import { IssueStatusIcon, PriorityIcon } from '@/components/IssueItem';
import { ThemedText } from '@/components/ThemedText';
import { tables } from '@/schema';
import {
  updateIssueDescription,
  updateIssueTitle,
} from '@/schema/issues-mutations';
import { Priority, Status } from '@/types';
import { Schema } from 'effect';
import { querySQL, sql } from '@livestore/livestore';
import { useScopedQuery, useStore } from '@livestore/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useMemo } from 'react';

export default function EditIssueScreen() {
  const issueId = useLocalSearchParams().issueId;
  const { store } = useStore();
  const router = useRouter();

  const issueQuery = useMemo(
    () =>
      querySQL(sql`SELECT * FROM issues WHERE id = '${issueId}'`, {
        schema: Schema.headOrElse(Schema.Array(tables.issues.schema)),
        label: 'issue',
      }),
    [issueId],
  );

  const issue = useScopedQuery(() => issueQuery, ['edit-issue']);

  const assigneeQuery = useMemo(
    () =>
      querySQL(sql`SELECT * FROM users WHERE id = '${issue.assigneeId}'`, {
        schema: Schema.headOrElse(Schema.Array(tables.users.schema)),
        label: 'assignee',
      }),
    [issue.assigneeId],
  );

  const assignee = useScopedQuery(() => assigneeQuery, ['assignee-edit-issue']);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!issueId) {
    return <ThemedText>Issue not found</ThemedText>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Issue-${issue.id.slice(0, 4)}`,
          headerLeft: () => (
            <Pressable onPress={handleGoBack}>
              <ThemedText>Back</ThemedText>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleGoBack}>
              <ThemedText>Done</ThemedText>
            </Pressable>
          ),
          freezeOnBlur: false,
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <View className="px-5">
          <TextInput
            className="font-bold text-2xl mb-3 dark:text-zinc-50"
            value={issue.title}
            multiline
            autoFocus
            onChangeText={(text: string) =>
              store.mutate(updateIssueTitle({ id: issue.id, title: text }))
            }
          />

          <View className="flex-row border my-2 border-zinc-200 dark:border-zinc-700 rounded-md p-1 px-2 gap-2">
            <View className="flex-row items-center gap-2">
              <IssueStatusIcon status={issue.status as Status} />
              <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>
                {issue.status}
              </ThemedText>
            </View>

            <View className="flex-row items-center gap-2">
              <PriorityIcon priority={issue.priority as Priority} />
              <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>
                {issue.priority}
              </ThemedText>
            </View>

            <View className="flex-row items-center gap-2">
              <Image
                source={{ uri: assignee.photoUrl! }}
                className="w-5 h-5 rounded-full"
              />
              <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>
                {assignee.name}
              </ThemedText>
            </View>
          </View>

          <TextInput
            className="font-normal mb-3 dark:text-zinc-50"
            value={issue.description!}
            placeholder="Description..."
            multiline
            onChangeText={(text: string) =>
              store.mutate(
                updateIssueDescription({ id: issue.id, description: text }),
              )
            }
          />
        </View>
      </ScrollView>
    </>
  );
}
