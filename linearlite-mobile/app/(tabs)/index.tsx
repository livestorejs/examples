import { View, FlatList } from 'react-native';
import { tables } from '@/schema';
import { Schema } from 'effect';
import { querySQL, sql } from '@livestore/livestore';
import { useRow, useScopedQuery, useStore } from '@livestore/react';
import IssueItem from '@/components/IssueItem';
import { ThemedText } from '@/components/ThemedText';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { updateSelectedHomeTab } from '@/schema/mutations';
import { useUser } from '@/hooks/useUser';
import { useCallback, useMemo } from 'react';

const homeTabs = ['Assigned', 'Created'];
// For reference
// const tabGroupingOptions = ['NoGrouping', 'Assignee', 'Priority', 'Status'];
// const tabOrderingOptions = ['Priority', 'Last Updated', 'Last Created'];
// const completedIssuesOptions = ['None', 'Past Week', 'Past Month', 'Past Year'];

const getOrderingOptions = (
  tab: string,
  assignedTabGrouping: string,
  assignedTabOrdering: string,
  createdTabGrouping: string,
  createdTabOrdering: string,
) => {
  const grouping =
    tab === 'Assigned' ? assignedTabGrouping : createdTabGrouping;
  const ordering =
    tab === 'Assigned' ? assignedTabOrdering : createdTabOrdering;

  let orderClause = 'ORDER BY ';
  const orderFields = [];

  // Handle grouping
  if (grouping !== 'NoGrouping') {
    const groupingField =
      grouping === 'Assignee'
        ? 'assigneeId ASC'
        : grouping === 'Priority'
          ? `CASE issues.priority
              WHEN 'urgent' THEN 1
              WHEN 'high' THEN 2
              WHEN 'medium' THEN 3
              WHEN 'low' THEN 4
              WHEN 'none' THEN 5
              ELSE 6
            END ASC`
          : grouping === 'Status'
            ? `CASE issues.status
                WHEN 'triage' THEN 1
                WHEN 'backlog' THEN 2
                WHEN 'todo' THEN 3
                WHEN 'in_progress' THEN 4
                WHEN 'in_review' THEN 5
                WHEN 'done' THEN 6
                WHEN 'canceled' THEN 7
                WHEN 'wont_fix' THEN 8
                WHEN 'auto_closed' THEN 9
                ELSE 10
              END ASC`
            : '';
    if (groupingField) {
      orderFields.push(groupingField);
    }
  }

  // Handle ordering
  if (ordering) {
    const orderingField =
      ordering === 'Priority'
        ? `CASE issues.priority
              WHEN 'urgent' THEN 1
              WHEN 'high' THEN 2
              WHEN 'medium' THEN 3
              WHEN 'low' THEN 4
              WHEN 'none' THEN 5
              ELSE 6
            END ASC`
        : ordering === 'Last Updated'
          ? 'issues.updatedAt DESC'
          : ordering === 'Last Created'
            ? 'issues.createdAt DESC'
            : '';
    if (orderingField) {
      orderFields.push(orderingField);
    }
  }

  // If no grouping or ordering specified, default to 'createdAt DESC'
  if (orderFields.length === 0) {
    orderFields.push('issues.createdAt DESC');
  }

  orderClause += orderFields.join(', ');
  return orderClause;
};

export default function HomeScreen() {
  const user = useUser();
  const { store } = useStore();
  const [appSettings] = useRow(tables.app);

  // Memoize selected settings
  const {
    selectedHomeTab,
    assignedTabGrouping,
    assignedTabOrdering,
    createdTabGrouping,
    createdTabOrdering,
    ...displaySettings
  } = useMemo(
    () => ({
      selectedHomeTab: appSettings.selectedHomeTab,
      assignedTabGrouping: appSettings.assignedTabGrouping,
      assignedTabOrdering: appSettings.assignedTabOrdering,
      createdTabGrouping: appSettings.createdTabGrouping,
      createdTabOrdering: appSettings.createdTabOrdering,
      assignedTabShowAssignee: appSettings.assignedTabShowAssignee,
      assignedTabShowStatus: appSettings.assignedTabShowStatus,
      assignedTabShowPriority: appSettings.assignedTabShowPriority,
      createdTabShowAssignee: appSettings.createdTabShowAssignee,
      createdTabShowStatus: appSettings.createdTabShowStatus,
      createdTabShowPriority: appSettings.createdTabShowPriority,
    }),
    [appSettings],
  );

  const issuesCountQuery = useMemo(
    () =>
      querySQL(
        sql`SELECT COUNT(*) as count FROM issues WHERE deletedAt IS NULL`,
        {
          schema: Schema.Any,
          label: `issues-count`,
        },
      ),
    [],
  );

  const issuesCount = useScopedQuery(
    () => issuesCountQuery,
    ['issues-count'],
  )[0].count;

  // Memoize the SQL query
  const issuesQuery = useMemo(
    () =>
      querySQL(
        sql`
        SELECT issues.title, issues.id, issues.assigneeId, issues.status, issues.priority, users.photoUrl as assigneePhotoUrl
        FROM issues 
        LEFT JOIN users ON issues.assigneeId = users.id
        WHERE issues.deletedAt IS NULL 
        AND (
          ${
            selectedHomeTab === 'Assigned'
              ? `issues.assigneeId = '${user.id}'`
              : `true`
          }
        )
        ${getOrderingOptions(
          selectedHomeTab,
          assignedTabGrouping,
          assignedTabOrdering,
          createdTabGrouping,
          createdTabOrdering,
        )}
        LIMIT 100
      `,
        {
          schema: Schema.Any,
          label: `issues-${selectedHomeTab}-${user.id}`,
        },
      ),
    [
      selectedHomeTab,
      user.id,
      assignedTabGrouping,
      assignedTabOrdering,
      createdTabGrouping,
      createdTabOrdering,
    ],
  );

  const issues = useScopedQuery(
    () => issuesQuery,
    [
      selectedHomeTab,
      assignedTabGrouping,
      assignedTabOrdering,
      createdTabGrouping,
      createdTabOrdering,
    ],
  );

  // Memoize the renderItem function
  const renderItem = useCallback(
    ({ item }: { item: (typeof issues)[number] }) => (
      <IssueItem
        issue={item}
        showAssignee={
          selectedHomeTab === 'Assigned'
            ? displaySettings.assignedTabShowAssignee
            : displaySettings.createdTabShowAssignee
        }
        showStatus={
          selectedHomeTab === 'Assigned'
            ? displaySettings.assignedTabShowStatus
            : displaySettings.createdTabShowStatus
        }
        showPriority={
          selectedHomeTab === 'Assigned'
            ? displaySettings.assignedTabShowPriority
            : displaySettings.createdTabShowPriority
        }
      />
    ),
    [selectedHomeTab, displaySettings],
  );

  // Memoize the header component
  const ListHeaderComponent = useMemo(
    () => (
      <View className="px-3">
        <ThemedText type="subtitle">
          Engineering
          {/* Engineering {`${issuesCount} issues`} */}
        </ThemedText>
        <SegmentedControl
          values={homeTabs}
          style={{ marginVertical: 12 }}
          selectedIndex={homeTabs.indexOf(selectedHomeTab)}
          onChange={(event) => {
            store.mutate(
              updateSelectedHomeTab({ tab: event.nativeEvent.value }),
            );
          }}
        />
      </View>
    ),
    [issuesCount, selectedHomeTab, store],
  );

  return (
    <FlatList
      data={issues}
      renderItem={renderItem}
      contentContainerClassName="gap-1 px-2"
      keyExtractor={(item) => item.id.toString()}
      initialNumToRender={100}
      maxToRenderPerBatch={100}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
}
