import React, { memo, useRef } from 'react';
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useInitialNumToRender } from '@/hooks/useInitialNumToRender';
import { List, ListRef } from './List';
import { Issue, tables } from '@/schema';
import IssueItem from './IssueItem';
import { useQuery } from '@livestore/react';
import { querySQL, sql } from '@livestore/livestore';
import { Schema } from 'effect';

type FeedProps = {
  testID?: string;
  style?: StyleProp<ViewStyle>;
  initialNumToRenderOverride?: number;
};

let Feed: React.FC<FeedProps> = ({
  testID,
  style,
  initialNumToRenderOverride,
}) => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`Feed component rendered ${renderCount.current} times`);

  const initialNumToRender = useInitialNumToRender();
  const scrollElRef = React.useRef<ListRef>(null);
  const issues = useQuery(
    querySQL(sql`select * from issues order by createdAt desc`, {
      schema: Schema.Array(tables.issues.schema),
      label: 'issues',
    }),
  );

  const feedFeedback = React.useMemo(
    () => ({
      onItemSeen: (item: Issue) => {
        // Implement item seen logic here if needed
      },
    }),
    [],
  );

  const onRefresh = React.useCallback(async () => {
    console.log('on refresh');
  }, []);

  const onEndReached = React.useCallback(async () => {
    try {
      console.log('end reached');
    } catch (err) {}
  }, []);

  // rendering
  // =
  const renderItem = React.useCallback(
    ({ item, index }: ListRenderItemInfo<Issue>) => {
      return <IssueItem issue={item} />;
    },
    [],
  );

  return (
    <View testID={testID} style={style}>
      <List
        ref={scrollElRef}
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={onRefresh}
        contentContainerStyle={{
          minHeight: Dimensions.get('window').height * 1.5,
        }}
        // onScrolledDownChange={onScrolledDownChange}
        onEndReached={onEndReached}
        onEndReachedThreshold={2} // number of posts left to trigger load more
        removeClippedSubviews={true}
        initialNumToRender={initialNumToRenderOverride ?? initialNumToRender}
        windowSize={9}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={40}
        onItemSeen={feedFeedback.onItemSeen}
      />
    </View>
  );
};
Feed = memo(Feed);
export { Feed };

const styles = StyleSheet.create({
  feedFooter: { paddingTop: 20 },
});
