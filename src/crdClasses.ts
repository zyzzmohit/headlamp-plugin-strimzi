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

import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';

// ============================================================================
// Type Definitions for Strimzi CRDs
// ============================================================================

export interface KafkaSpec {
  kafka: {
    version?: string;
    replicas: number;
    listeners: {
      name: string;
      port: number;
      type: string;
      tls: boolean;
    }[];
    config?: Record<string, string | number | boolean>;
    storage: {
      type: string;
      size?: string;
      class?: string;
    };
  };
  zookeeper?: {
    replicas: number;
    storage: {
      type: string;
      size?: string;
    };
  };
  entityOperator?: {
    topicOperator?: Record<string, unknown>;
    userOperator?: Record<string, unknown>;
  };
}

export interface KafkaStatus {
  conditions?: {
    type: string;
    status: string;
    lastTransitionTime?: string;
    reason?: string;
    message?: string;
  }[];
  observedGeneration?: number;
  listeners?: {
    name: string;
    addresses?: {
      host: string;
      port: number;
    }[];
    bootstrapServers?: string;
  }[];
  kafkaVersion?: string;
  clusterId?: string;
}

export interface KubeKafka extends KubeObjectInterface {
  spec: KafkaSpec;
  status?: KafkaStatus;
}

export interface KafkaTopicSpec {
  topicName?: string;
  partitions: number;
  replicas: number;
  config?: Record<string, string | number | boolean>;
}

export interface KafkaTopicStatus {
  conditions?: {
    type: string;
    status: string;
    lastTransitionTime?: string;
    reason?: string;
    message?: string;
  }[];
  observedGeneration?: number;
  topicName?: string;
}

export interface KubeKafkaTopic extends KubeObjectInterface {
  spec: KafkaTopicSpec;
  status?: KafkaTopicStatus;
}

export interface KafkaUserSpec {
  authentication?: {
    type: string;
  };
  authorization?: {
    type: string;
    acls?: {
      resource: {
        type: string;
        name: string;
        patternType?: string;
      };
      operations: string[];
      host?: string;
    }[];
  };
  quotas?: Record<string, number>;
}

export interface KafkaUserStatus {
  conditions?: {
    type: string;
    status: string;
    lastTransitionTime?: string;
    reason?: string;
    message?: string;
  }[];
  observedGeneration?: number;
  username?: string;
  secret?: string;
}

export interface KubeKafkaUser extends KubeObjectInterface {
  spec: KafkaUserSpec;
  status?: KafkaUserStatus;
}

// ============================================================================
// CRD Class Definitions
// ============================================================================

// Strimzi API group and versions (supporting both v1beta2 and v1)
const STRIMZI_API_GROUP = 'kafka.strimzi.io';
const STRIMZI_VERSIONS = ['v1beta2', 'v1'];

/**
 * Kafka CRD class - represents a Kafka cluster
 */
export const KafkaClass = makeCustomResourceClass({
  apiInfo: STRIMZI_VERSIONS.map(version => ({
    group: STRIMZI_API_GROUP,
    version,
  })),
  kind: 'Kafka',
  pluralName: 'kafkas',
  singularName: 'kafka',
  isNamespaced: true,
});

/**
 * KafkaTopic CRD class - represents a Kafka topic
 */
export const KafkaTopicClass = makeCustomResourceClass({
  apiInfo: STRIMZI_VERSIONS.map(version => ({
    group: STRIMZI_API_GROUP,
    version,
  })),
  kind: 'KafkaTopic',
  pluralName: 'kafkatopics',
  singularName: 'kafkatopic',
  isNamespaced: true,
});

/**
 * KafkaUser CRD class - represents a Kafka user
 */
export const KafkaUserClass = makeCustomResourceClass({
  apiInfo: STRIMZI_VERSIONS.map(version => ({
    group: STRIMZI_API_GROUP,
    version,
  })),
  kind: 'KafkaUser',
  pluralName: 'kafkausers',
  singularName: 'kafkauser',
  isNamespaced: true,
});

/**
 * KafkaConnect CRD class - represents a Kafka Connect cluster
 */
export const KafkaConnectClass = makeCustomResourceClass({
  apiInfo: STRIMZI_VERSIONS.map(version => ({
    group: STRIMZI_API_GROUP,
    version,
  })),
  kind: 'KafkaConnect',
  pluralName: 'kafkaconnects',
  singularName: 'kafkaconnect',
  isNamespaced: true,
});

/**
 * KafkaConnector CRD class - represents a Kafka Connector
 */
export const KafkaConnectorClass = makeCustomResourceClass({
  apiInfo: STRIMZI_VERSIONS.map(version => ({
    group: STRIMZI_API_GROUP,
    version,
  })),
  kind: 'KafkaConnector',
  pluralName: 'kafkaconnectors',
  singularName: 'kafkaconnector',
  isNamespaced: true,
});
