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

/**
 * Mock data for demo mode - shows realistic Strimzi resources
 * when no real cluster is connected or Strimzi is not installed.
 */

// Helper to generate timestamps
const hoursAgo = (hours: number): string => {
  const date = new Date(Date.now() - hours * 60 * 60 * 1000);
  return date.toISOString();
};

const daysAgo = (days: number): string => hoursAgo(days * 24);

// ============================================================================
// KAFKA CLUSTERS
// ============================================================================
export const mockKafkaClusters = [
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'Kafka',
      metadata: {
        name: 'production-cluster',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(30),
        uid: 'kafka-prod-001',
      },
      spec: {
        kafka: {
          version: '3.6.1',
          replicas: 5,
          listeners: [
            { name: 'plain', port: 9092, type: 'internal', tls: false },
            { name: 'tls', port: 9093, type: 'internal', tls: true },
            { name: 'external', port: 9094, type: 'loadbalancer', tls: true },
          ],
          storage: {
            type: 'persistent-claim',
            size: '500Gi',
            class: 'fast-ssd',
          },
          config: {
            'num.partitions': 12,
            'default.replication.factor': 3,
            'min.insync.replicas': 2,
          },
        },
        zookeeper: {
          replicas: 3,
          storage: {
            type: 'persistent-claim',
            size: '100Gi',
          },
        },
        entityOperator: {
          topicOperator: {},
          userOperator: {},
        },
      },
      status: {
        conditions: [
          { type: 'Ready', status: 'True', lastTransitionTime: hoursAgo(1) },
        ],
        kafkaVersion: '3.6.1',
        clusterId: 'kfk-prod-abc123xyz',
        listeners: [
          { name: 'plain', bootstrapServers: 'production-cluster-kafka-bootstrap:9092' },
          { name: 'tls', bootstrapServers: 'production-cluster-kafka-bootstrap:9093' },
          { name: 'external', bootstrapServers: 'kafka.example.com:9094' },
        ],
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'Kafka',
      metadata: {
        name: 'staging-cluster',
        namespace: 'kafka-staging',
        creationTimestamp: daysAgo(14),
        uid: 'kafka-staging-001',
      },
      spec: {
        kafka: {
          version: '3.6.0',
          replicas: 3,
          listeners: [
            { name: 'plain', port: 9092, type: 'internal', tls: false },
            { name: 'tls', port: 9093, type: 'internal', tls: true },
          ],
          storage: {
            type: 'persistent-claim',
            size: '100Gi',
          },
        },
        zookeeper: {
          replicas: 3,
          storage: {
            type: 'persistent-claim',
            size: '50Gi',
          },
        },
      },
      status: {
        conditions: [
          { type: 'Ready', status: 'True', lastTransitionTime: hoursAgo(3) },
        ],
        kafkaVersion: '3.6.0',
        clusterId: 'kfk-stg-def456uvw',
        listeners: [
          { name: 'plain', bootstrapServers: 'staging-cluster-kafka-bootstrap:9092' },
          { name: 'tls', bootstrapServers: 'staging-cluster-kafka-bootstrap:9093' },
        ],
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'Kafka',
      metadata: {
        name: 'dev-cluster',
        namespace: 'kafka-dev',
        creationTimestamp: daysAgo(7),
        uid: 'kafka-dev-001',
      },
      spec: {
        kafka: {
          version: '3.7.0',
          replicas: 1,
          listeners: [
            { name: 'plain', port: 9092, type: 'internal', tls: false },
          ],
          storage: {
            type: 'ephemeral',
          },
        },
        zookeeper: {
          replicas: 1,
          storage: {
            type: 'ephemeral',
          },
        },
      },
      status: {
        conditions: [
          { type: 'Ready', status: 'True', lastTransitionTime: hoursAgo(2) },
        ],
        kafkaVersion: '3.7.0',
        clusterId: 'kfk-dev-ghi789rst',
        listeners: [
          { name: 'plain', bootstrapServers: 'dev-cluster-kafka-bootstrap:9092' },
        ],
      },
    },
  },
];

// ============================================================================
// KAFKA TOPICS
// ============================================================================
export const mockKafkaTopics = [
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaTopic',
      metadata: {
        name: 'orders',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(28),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        partitions: 12,
        replicas: 3,
        config: {
          'retention.ms': '604800000',
          'cleanup.policy': 'delete',
          'min.insync.replicas': '2',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        topicName: 'orders',
        observedGeneration: 1,
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaTopic',
      metadata: {
        name: 'user-events',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(25),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        partitions: 24,
        replicas: 3,
        config: {
          'retention.ms': '2592000000',
          'cleanup.policy': 'compact,delete',
          'segment.bytes': '1073741824',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        topicName: 'user-events',
        observedGeneration: 2,
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaTopic',
      metadata: {
        name: 'inventory-updates',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(20),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        partitions: 6,
        replicas: 3,
        config: {
          'retention.ms': '86400000',
          'cleanup.policy': 'compact',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        topicName: 'inventory-updates',
        observedGeneration: 1,
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaTopic',
      metadata: {
        name: 'notifications',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(18),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        partitions: 8,
        replicas: 3,
        config: {
          'retention.ms': '3600000',
          'cleanup.policy': 'delete',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        topicName: 'notifications',
        observedGeneration: 1,
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaTopic',
      metadata: {
        name: 'payment-transactions',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(15),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        partitions: 16,
        replicas: 3,
        config: {
          'retention.ms': '31536000000',
          'cleanup.policy': 'delete',
          'min.insync.replicas': '2',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        topicName: 'payment-transactions',
        observedGeneration: 1,
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaTopic',
      metadata: {
        name: 'audit-logs',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(10),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        partitions: 4,
        replicas: 3,
        config: {
          'retention.ms': '63072000000',
          'cleanup.policy': 'delete',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        topicName: 'audit-logs',
        observedGeneration: 1,
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaTopic',
      metadata: {
        name: 'staging-events',
        namespace: 'kafka-staging',
        creationTimestamp: daysAgo(12),
        labels: { 'strimzi.io/cluster': 'staging-cluster' },
      },
      spec: {
        partitions: 6,
        replicas: 2,
        config: {
          'retention.ms': '86400000',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        topicName: 'staging-events',
        observedGeneration: 1,
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaTopic',
      metadata: {
        name: 'test-topic',
        namespace: 'kafka-dev',
        creationTimestamp: daysAgo(3),
        labels: { 'strimzi.io/cluster': 'dev-cluster' },
      },
      spec: {
        partitions: 1,
        replicas: 1,
        config: {},
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        topicName: 'test-topic',
        observedGeneration: 1,
      },
    },
  },
];

// ============================================================================
// KAFKA USERS
// ============================================================================
export const mockKafkaUsers = [
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaUser',
      metadata: {
        name: 'order-service',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(27),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        authentication: { type: 'scram-sha-512' },
        authorization: {
          type: 'simple',
          acls: [
            { resource: { type: 'topic', name: 'orders', patternType: 'literal' }, operations: ['Read', 'Write', 'Describe'] },
            { resource: { type: 'group', name: 'order-service', patternType: 'prefix' }, operations: ['Read'] },
          ],
        },
        quotas: {
          producerByteRate: 10485760,
          consumerByteRate: 20971520,
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        username: 'order-service',
        secret: 'order-service',
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaUser',
      metadata: {
        name: 'analytics-consumer',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(24),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        authentication: { type: 'tls' },
        authorization: {
          type: 'simple',
          acls: [
            { resource: { type: 'topic', name: '*', patternType: 'literal' }, operations: ['Read', 'Describe'] },
            { resource: { type: 'group', name: 'analytics', patternType: 'prefix' }, operations: ['Read'] },
          ],
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        username: 'CN=analytics-consumer',
        secret: 'analytics-consumer',
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaUser',
      metadata: {
        name: 'payment-processor',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(22),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        authentication: { type: 'scram-sha-512' },
        authorization: {
          type: 'simple',
          acls: [
            { resource: { type: 'topic', name: 'payment-transactions', patternType: 'literal' }, operations: ['Read', 'Write'] },
            { resource: { type: 'topic', name: 'orders', patternType: 'literal' }, operations: ['Read'] },
          ],
        },
        quotas: {
          producerByteRate: 5242880,
          consumerByteRate: 10485760,
          requestPercentage: 50,
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        username: 'payment-processor',
        secret: 'payment-processor',
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaUser',
      metadata: {
        name: 'notification-service',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(18),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        authentication: { type: 'scram-sha-512' },
        authorization: {
          type: 'simple',
          acls: [
            { resource: { type: 'topic', name: 'notifications', patternType: 'literal' }, operations: ['Read', 'Write'] },
            { resource: { type: 'topic', name: 'user-events', patternType: 'literal' }, operations: ['Read'] },
          ],
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        username: 'notification-service',
        secret: 'notification-service',
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaUser',
      metadata: {
        name: 'admin-user',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(30),
        labels: { 'strimzi.io/cluster': 'production-cluster' },
      },
      spec: {
        authentication: { type: 'tls' },
        authorization: {
          type: 'simple',
          acls: [
            { resource: { type: 'topic', name: '*', patternType: 'literal' }, operations: ['All'] },
            { resource: { type: 'group', name: '*', patternType: 'literal' }, operations: ['All'] },
            { resource: { type: 'cluster', name: '*', patternType: 'literal' }, operations: ['All'] },
          ],
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        username: 'CN=admin-user',
        secret: 'admin-user',
      },
    },
  },
];

// ============================================================================
// KAFKA CONNECT
// ============================================================================
export const mockKafkaConnects = [
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaConnect',
      metadata: {
        name: 'production-connect',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(25),
      },
      spec: {
        version: '3.6.1',
        replicas: 3,
        bootstrapServers: 'production-cluster-kafka-bootstrap:9093',
        tls: {
          trustedCertificates: [{ secretName: 'production-cluster-cluster-ca-cert', certificate: 'ca.crt' }],
        },
        config: {
          'group.id': 'connect-cluster',
          'key.converter': 'org.apache.kafka.connect.json.JsonConverter',
          'value.converter': 'org.apache.kafka.connect.json.JsonConverter',
        },
        build: {
          output: { type: 'docker', image: 'my-registry/my-connect:latest' },
          plugins: [
            { name: 'debezium-postgres', artifacts: [{ type: 'tgz', url: 'https://repo1.maven.org/maven2/io/debezium/debezium-connector-postgres/2.4.0.Final/debezium-connector-postgres-2.4.0.Final-plugin.tar.gz' }] },
            { name: 'camel-aws-s3', artifacts: [{ type: 'tgz', url: 'https://repo1.maven.org/maven2/org/apache/camel/kafkaconnector/camel-aws-s3-sink-kafka-connector/3.20.3/camel-aws-s3-sink-kafka-connector-3.20.3-package.tar.gz' }] },
          ],
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        observedGeneration: 2,
        url: 'http://production-connect-connect-api:8083',
        connectorPlugins: [
          { class: 'io.debezium.connector.postgresql.PostgresConnector', type: 'source', version: '2.4.0.Final' },
          { class: 'org.apache.camel.kafkaconnector.awss3.CamelAwss3SinkConnector', type: 'sink', version: '3.20.3' },
          { class: 'org.apache.kafka.connect.file.FileStreamSourceConnector', type: 'source', version: '3.6.1' },
          { class: 'org.apache.kafka.connect.file.FileStreamSinkConnector', type: 'sink', version: '3.6.1' },
          { class: 'org.apache.kafka.connect.mirror.MirrorSourceConnector', type: 'source', version: '3.6.1' },
        ],
        replicas: 3,
        readyReplicas: 3,
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaConnect',
      metadata: {
        name: 'staging-connect',
        namespace: 'kafka-staging',
        creationTimestamp: daysAgo(10),
      },
      spec: {
        version: '3.6.0',
        replicas: 1,
        bootstrapServers: 'staging-cluster-kafka-bootstrap:9092',
        config: {
          'group.id': 'staging-connect',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        observedGeneration: 1,
        connectorPlugins: [
          { class: 'org.apache.kafka.connect.file.FileStreamSourceConnector', type: 'source', version: '3.6.0' },
          { class: 'org.apache.kafka.connect.file.FileStreamSinkConnector', type: 'sink', version: '3.6.0' },
        ],
        replicas: 1,
        readyReplicas: 1,
      },
    },
  },
];

// ============================================================================
// KAFKA CONNECTORS
// ============================================================================
export const mockKafkaConnectors = [
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaConnector',
      metadata: {
        name: 'postgres-source-orders',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(20),
        labels: { 'strimzi.io/cluster': 'production-connect' },
      },
      spec: {
        class: 'io.debezium.connector.postgresql.PostgresConnector',
        tasksMax: 1,
        config: {
          'database.hostname': 'postgres.database.svc',
          'database.port': '5432',
          'database.user': 'debezium',
          'database.dbname': 'orders_db',
          'database.server.name': 'dbserver1',
          'table.include.list': 'public.orders,public.order_items',
          'topic.prefix': 'postgres',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        observedGeneration: 1,
        connectorStatus: {
          connector: { state: 'RUNNING', worker_id: 'production-connect-connect-0:8083' },
          name: 'postgres-source-orders',
          tasks: [
            { id: 0, state: 'RUNNING', worker_id: 'production-connect-connect-0:8083' },
          ],
          type: 'source',
        },
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaConnector',
      metadata: {
        name: 's3-sink-archive',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(18),
        labels: { 'strimzi.io/cluster': 'production-connect' },
      },
      spec: {
        class: 'org.apache.camel.kafkaconnector.awss3.CamelAwss3SinkConnector',
        tasksMax: 3,
        config: {
          'topics': 'audit-logs',
          'camel.sink.path.bucketNameOrArn': 'my-kafka-archive-bucket',
          'camel.sink.endpoint.region': 'us-west-2',
          'camel.sink.marshal': 'json',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        observedGeneration: 1,
        connectorStatus: {
          connector: { state: 'RUNNING', worker_id: 'production-connect-connect-1:8083' },
          name: 's3-sink-archive',
          tasks: [
            { id: 0, state: 'RUNNING', worker_id: 'production-connect-connect-0:8083' },
            { id: 1, state: 'RUNNING', worker_id: 'production-connect-connect-1:8083' },
            { id: 2, state: 'RUNNING', worker_id: 'production-connect-connect-2:8083' },
          ],
          type: 'sink',
        },
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaConnector',
      metadata: {
        name: 'postgres-source-users',
        namespace: 'kafka-prod',
        creationTimestamp: daysAgo(15),
        labels: { 'strimzi.io/cluster': 'production-connect' },
      },
      spec: {
        class: 'io.debezium.connector.postgresql.PostgresConnector',
        tasksMax: 1,
        config: {
          'database.hostname': 'postgres.database.svc',
          'database.port': '5432',
          'database.user': 'debezium',
          'database.dbname': 'users_db',
          'database.server.name': 'userserver',
          'table.include.list': 'public.users,public.user_profiles',
          'topic.prefix': 'postgres-users',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        observedGeneration: 1,
        connectorStatus: {
          connector: { state: 'RUNNING', worker_id: 'production-connect-connect-2:8083' },
          name: 'postgres-source-users',
          tasks: [
            { id: 0, state: 'RUNNING', worker_id: 'production-connect-connect-2:8083' },
          ],
          type: 'source',
        },
      },
    },
  },
  {
    jsonData: {
      apiVersion: 'kafka.strimzi.io/v1beta2',
      kind: 'KafkaConnector',
      metadata: {
        name: 'file-source-test',
        namespace: 'kafka-staging',
        creationTimestamp: daysAgo(5),
        labels: { 'strimzi.io/cluster': 'staging-connect' },
      },
      spec: {
        class: 'org.apache.kafka.connect.file.FileStreamSourceConnector',
        tasksMax: 1,
        pause: true,
        config: {
          'file': '/tmp/test-file.txt',
          'topic': 'test-file-topic',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        observedGeneration: 1,
        connectorStatus: {
          connector: { state: 'PAUSED', worker_id: 'staging-connect-connect-0:8083' },
          name: 'file-source-test',
          tasks: [
            { id: 0, state: 'PAUSED', worker_id: 'staging-connect-connect-0:8083' },
          ],
          type: 'source',
        },
      },
    },
  },
];

// ============================================================================
// DEMO MODE UTILITIES
// ============================================================================

// Check if we're in demo mode (no real resources found)
export const shouldUseMockData = (realData: any[] | null, error: any): boolean => {
  // Use mock data if there's an error (CRDs not installed) or if real data is empty
  return error !== null || (realData !== null && realData.length === 0);
};

// Get data with fallback to mock
export const getDataWithMock = <T>(realData: T[] | null, mockData: T[], error: any): T[] | null => {
  if (realData === null && error === null) {
    return null; // Still loading
  }
  if (shouldUseMockData(realData, error)) {
    return mockData;
  }
  return realData;
};
