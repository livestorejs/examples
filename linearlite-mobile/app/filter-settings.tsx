import React from 'react';
import { View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { ThemedText } from '@/components/ThemedText';
import {
  updateAssignedTabGrouping,
  updateAssignedTabOrdering,
  updateAssignedTabCompletedIssues,
  updateCreatedTabGrouping,
  updateCreatedTabOrdering,
  updateCreatedTabCompletedIssues,
  updateAssignedTabShowAssignee,
  updateAssignedTabShowStatus,
  updateAssignedTabShowPriority,
  updateCreatedTabShowPriority,
  updateCreatedTabShowStatus,
  updateCreatedTabShowAssignee,
} from '@/schema/mutations';
import { useRow, useStore } from '@livestore/react';
import { tables } from '@/schema';
import { RowPropertySwitch } from '@/components/RowPropertySwitch';

const tabGroupingOptions = ['NoGrouping', 'Assignee', 'Priority', 'Status'];
const tabOrderingOptions = ['Priority', 'Last Updated', 'Last Created'];
const completedIssuesOptions = ['None', 'Past Week', 'Past Month', 'Past Year'];
const rowProperties = ['Assignee', 'Status', 'Priority'];

export default function FilterSettingsScreen() {
  const { store } = useStore();
  const [
    {
      selectedHomeTab,
      assignedTabGrouping,
      assignedTabOrdering,
      assignedTabCompletedIssues,
      assignedTabShowAssignee,
      assignedTabShowStatus,
      assignedTabShowPriority,
      createdTabGrouping,
      createdTabOrdering,
      createdTabCompletedIssues,
      createdTabShowAssignee,
      createdTabShowStatus,
      createdTabShowPriority,
    },
  ] = useRow(tables.app);

  const handleUpdateFilter = (
    event: string | boolean,
    query:
      | 'tabGrouping'
      | 'tabOrdering'
      | 'tabCompletedIssues'
      | 'showAssignee'
      | 'showStatus'
      | 'showPriority',
  ) => {
    const updateFunctions = {
      Assigned: {
        tabGrouping: updateAssignedTabGrouping,
        tabOrdering: updateAssignedTabOrdering,
        tabCompletedIssues: updateAssignedTabCompletedIssues,
        showAssignee: updateAssignedTabShowAssignee,
        showStatus: updateAssignedTabShowStatus,
        showPriority: updateAssignedTabShowPriority,
      },
      Created: {
        tabGrouping: updateCreatedTabGrouping,
        tabOrdering: updateCreatedTabOrdering,
        tabCompletedIssues: updateCreatedTabCompletedIssues,
        showAssignee: updateCreatedTabShowAssignee,
        showStatus: updateCreatedTabShowStatus,
        showPriority: updateCreatedTabShowPriority,
      },
    };

    // @ts-ignore
    const updateFunction = updateFunctions[selectedHomeTab]?.[query];
    if (updateFunction) {
      const payload = {
        [query === 'tabGrouping'
          ? 'grouping'
          : query === 'tabOrdering'
            ? 'ordering'
            : query === 'tabCompletedIssues'
              ? 'completedIssues'
              : query]: event,
      };
      store.mutate(updateFunction(payload));
    }
  };

  return (
    <ScrollView className="flex-1 px-4 py-6 dark:bg-[#18191B]">
      <Stack.Screen
        options={{
          headerTitle: `Filter settings for "${selectedHomeTab}" tab`,
          freezeOnBlur: false,
        }}
      />

      <View className="mb-8">
        <ThemedText className="mb-3">Grouping</ThemedText>
        <SegmentedControl
          values={tabGroupingOptions}
          selectedIndex={tabGroupingOptions.indexOf(
            selectedHomeTab === 'Assigned'
              ? assignedTabGrouping
              : createdTabGrouping,
          )}
          onChange={(value) =>
            handleUpdateFilter(value.nativeEvent.value, 'tabGrouping')
          }
        />
      </View>

      <View className="mb-8">
        <ThemedText className="mb-3">Ordering</ThemedText>
        <SegmentedControl
          values={tabOrderingOptions}
          selectedIndex={tabOrderingOptions.indexOf(
            selectedHomeTab === 'Assigned'
              ? assignedTabOrdering
              : createdTabOrdering,
          )}
          onChange={(value) =>
            handleUpdateFilter(value.nativeEvent.value, 'tabOrdering')
          }
        />
      </View>
      <View>
        <ThemedText className="mb-3">Row Properties</ThemedText>
        <View className="flex-row gap-3">
          {rowProperties.map((property) => (
            <RowPropertySwitch
              key={property}
              onPress={() =>
                handleUpdateFilter(
                  !(selectedHomeTab === 'Assigned'
                    ? property === 'Assignee'
                      ? assignedTabShowAssignee
                      : property === 'Status'
                        ? assignedTabShowStatus
                        : assignedTabShowPriority
                    : property === 'Assignee'
                      ? createdTabShowAssignee
                      : property === 'Status'
                        ? createdTabShowStatus
                        : createdTabShowPriority),
                  `show${property}` as
                    | 'showAssignee'
                    | 'showStatus'
                    | 'showPriority',
                )
              }
              label={property}
              isSelected={
                selectedHomeTab === 'Assigned'
                  ? property === 'Assignee'
                    ? assignedTabShowAssignee
                    : property === 'Status'
                      ? assignedTabShowStatus
                      : assignedTabShowPriority
                  : property === 'Assignee'
                    ? createdTabShowAssignee
                    : property === 'Status'
                      ? createdTabShowStatus
                      : createdTabShowPriority
              }
            />
          ))}
        </View>
      </View>
      {/* <View className="mb-8">
        <ThemedText className="text-lg font-semibold mb-2">
          Completed Issues
        </ThemedText>
        <SegmentedControl
          values={completedIssuesOptions}
          selectedIndex={completedIssuesOptions.indexOf(
            selectedHomeTab === 'Assigned'
              ? assignedTabCompletedIssues
              : createdTabCompletedIssues,
          )}
          onChange={(value) =>
            handleUpdateFilter(value.nativeEvent.value, 'tabCompletedIssues')
          }
        />
      </View> */}
    </ScrollView>
  );
}
