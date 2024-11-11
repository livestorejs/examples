import '../global.css';
import '../globals.js';
import '../polyfill.ts';

import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { makeAdapter } from '@livestore/expo';
import {
  BaseGraphQLContext,
  LiveStoreSchema,
  sql,
  Store,
} from '@livestore/livestore';
import { LiveStoreProvider } from '@livestore/react';
import { cuid } from '@livestore/utils/cuid';
import React from 'react';
import {
  Button,
  Text,
  unstable_batchedUpdates as batchUpdates,
  View,
  LogBox,
  Platform,
} from 'react-native';

import { mutations, schema, userMutations } from '../schema/index';
import LoadingLiveStore from '@/components/LoadingLiveStore';
import ThemeProvider from '@/context/ThemeProvider';
import { NavigationHistoryTracker } from '@/context/navigation-history';

// export const unstable_settings = {
//   // Ensure any route can link back to `/`
//   initialRouteName: '/',
// };

LogBox.ignoreAllLogs();

export default function RootLayout() {
  const adapter = makeAdapter();
  const [, rerender] = React.useState({});

  return (
    <LiveStoreProvider
      schema={schema}
      renderLoading={(_) => <LoadingLiveStore stage={_.stage} />}
      disableDevtools={true}
      renderError={(error: any) => (
        <View className="flex-1 items-center justify-center">
          <Text>Error: {JSON.stringify(error, null, 2)}</Text>
        </View>
      )}
      renderShutdown={() => {
        return (
          <View className="flex-1 items-center justify-center">
            <Text>LiveStore Shutdown</Text>
            <Button title="Reload" onPress={() => rerender({})} />
          </View>
        );
      }}
      boot={boot}
      adapter={adapter}
      batchUpdates={batchUpdates}
    >
      <NavigationHistoryTracker />
      <ThemeProvider>
        <Stack screenOptions={{ freezeOnBlur: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="filter-settings"
            options={{
              presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
              sheetAllowedDetents: [0.4],
              sheetCornerRadius: 16,
              sheetGrabberVisible: true,
              headerShown: Platform.OS === 'android',
            }}
          />
          <Stack.Screen
            name="issue-details"
            options={{
              freezeOnBlur: false,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="edit-issue"
            options={{ presentation: 'modal', freezeOnBlur: false }}
          />
        </Stack>
      </ThemeProvider>
    </LiveStoreProvider>
  );
}

/**
 * This function is called when the app is booted.
 * It is used to initialize the database with some data.
 */
const boot = (store: Store<BaseGraphQLContext, LiveStoreSchema>) => {
  if (
    store.__select(sql`SELECT count(*) as count FROM todos`)[0]!.count === 0
  ) {
    store.mutate(mutations.addTodo({ id: cuid(), text: 'Make coffee' }));
  }
  if (
    store.__select(sql`SELECT count(*) as count FROM users`)[0]!.count === 0
  ) {
    store.mutate(
      userMutations.createUser({
        id: cuid(),
        name: 'Beto',
        email: 'beto@expo.io',
        photoUrl: 'https://avatars.githubusercontent.com/u/43630417?v=4',
      }),
    );
  }
};
