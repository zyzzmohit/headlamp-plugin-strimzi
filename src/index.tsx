/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';

// Import components
import StrimziOverview from './components/StrimziOverview';
import KafkaList from './components/KafkaList';
import KafkaDetails from './components/KafkaDetails';
import KafkaTopicList from './components/KafkaTopicList';
import KafkaTopicDetails from './components/KafkaTopicDetails';
import KafkaUserList from './components/KafkaUserList';
import KafkaUserDetails from './components/KafkaUserDetails';
import KafkaConnectList from './components/KafkaConnectList';
import KafkaConnectDetails from './components/KafkaConnectDetails';
import KafkaConnectorList from './components/KafkaConnectorList';
import KafkaConnectorDetails from './components/KafkaConnectorDetails';

// ============================================================================
// Sidebar Registration
// ============================================================================

// Main Strimzi sidebar entry (parent)
registerSidebarEntry({
  parent: null,
  name: 'strimzi',
  label: 'Strimzi Kafka',
  url: '/strimzi',
  icon: 'mdi:apache-kafka',
});

// Sub-entries under Strimzi
registerSidebarEntry({
  parent: 'strimzi',
  name: 'strimzi-overview',
  label: 'Overview',
  url: '/strimzi',
});

registerSidebarEntry({
  parent: 'strimzi',
  name: 'strimzi-kafka-clusters',
  label: 'Kafka Clusters',
  url: '/strimzi/kafkas',
});

registerSidebarEntry({
  parent: 'strimzi',
  name: 'strimzi-topics',
  label: 'Topics',
  url: '/strimzi/topics',
});

registerSidebarEntry({
  parent: 'strimzi',
  name: 'strimzi-users',
  label: 'Users',
  url: '/strimzi/users',
});

registerSidebarEntry({
  parent: 'strimzi',
  name: 'strimzi-connects',
  label: 'Kafka Connect',
  url: '/strimzi/connects',
});

registerSidebarEntry({
  parent: 'strimzi',
  name: 'strimzi-connectors',
  label: 'Connectors',
  url: '/strimzi/connectors',
});

// ============================================================================
// Route Registration
// ============================================================================

// Overview page
registerRoute({
  path: '/strimzi',
  sidebar: 'strimzi-overview',
  name: 'strimzi-overview',
  exact: true,
  component: StrimziOverview,
});

// Kafka Clusters list
registerRoute({
  path: '/strimzi/kafkas',
  sidebar: 'strimzi-kafka-clusters',
  name: 'strimzi-kafka-clusters',
  exact: true,
  component: KafkaList,
});

// Kafka Cluster details
registerRoute({
  path: '/strimzi/kafkas/:namespace/:name',
  sidebar: 'strimzi-kafka-clusters',
  name: 'strimzi-kafka-details',
  exact: true,
  component: KafkaDetails,
});

// Kafka Topics list
registerRoute({
  path: '/strimzi/topics',
  sidebar: 'strimzi-topics',
  name: 'strimzi-topics',
  exact: true,
  component: KafkaTopicList,
});

// Kafka Topic details
registerRoute({
  path: '/strimzi/topics/:namespace/:name',
  sidebar: 'strimzi-topics',
  name: 'strimzi-topic-details',
  exact: true,
  component: KafkaTopicDetails,
});

// Kafka Users list
registerRoute({
  path: '/strimzi/users',
  sidebar: 'strimzi-users',
  name: 'strimzi-users',
  exact: true,
  component: KafkaUserList,
});

// Kafka User details
registerRoute({
  path: '/strimzi/users/:namespace/:name',
  sidebar: 'strimzi-users',
  name: 'strimzi-user-details',
  exact: true,
  component: KafkaUserDetails,
});

// Kafka Connect list
registerRoute({
  path: '/strimzi/connects',
  sidebar: 'strimzi-connects',
  name: 'strimzi-connects',
  exact: true,
  component: KafkaConnectList,
});

// Kafka Connect details
registerRoute({
  path: '/strimzi/connects/:namespace/:name',
  sidebar: 'strimzi-connects',
  name: 'strimzi-connect-details',
  exact: true,
  component: KafkaConnectDetails,
});

// Kafka Connectors list
registerRoute({
  path: '/strimzi/connectors',
  sidebar: 'strimzi-connectors',
  name: 'strimzi-connectors',
  exact: true,
  component: KafkaConnectorList,
});

// Kafka Connector details
registerRoute({
  path: '/strimzi/connectors/:namespace/:name',
  sidebar: 'strimzi-connectors',
  name: 'strimzi-connector-details',
  exact: true,
  component: KafkaConnectorDetails,
});
