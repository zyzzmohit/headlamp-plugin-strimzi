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

import React from 'react';
import { SectionBox, SimpleTable, StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import { Link as RouterLink } from 'react-router-dom';

import { KafkaTopicClass } from '../crdClasses';

function getTopicStatus(topic: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const conditions = topic.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

export default function KafkaTopicList() {
  // Use the hook pattern
  const [topics, error] = KafkaTopicClass.useList();

  if (error) {
    return (
      <SectionBox title="Kafka Topics">
        <Typography color="error">Error loading Kafka topics: {error.message || 'Unknown error'}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Make sure Strimzi CRDs are installed in your cluster.
        </Typography>
      </SectionBox>
    );
  }

  if (topics === null) {
    return (
      <SectionBox title="Kafka Topics">
        <Typography>Loading Kafka topics...</Typography>
      </SectionBox>
    );
  }

  return (
    <SectionBox title="Kafka Topics">
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Manage Kafka topics in your Strimzi-managed clusters.
        </Typography>
      </Box>

      <SimpleTable
        columns={[
          {
            label: 'Name',
            getter: (topic: any) => (
              <Link
                component={RouterLink}
                to={`/strimzi/topics/${topic.metadata?.namespace}/${topic.metadata?.name}`}
              >
                {topic.metadata?.name}
              </Link>
            ),
          },
          {
            label: 'Namespace',
            getter: (topic: any) => topic.metadata?.namespace,
          },
          {
            label: 'Partitions',
            getter: (topic: any) => (
              <Chip
                label={topic.spec?.partitions || 0}
                size="small"
                color="primary"
                variant="outlined"
              />
            ),
          },
          {
            label: 'Replicas',
            getter: (topic: any) => (
              <Chip
                label={topic.spec?.replicas || 0}
                size="small"
                color="secondary"
                variant="outlined"
              />
            ),
          },
          {
            label: 'Topic Name',
            getter: (topic: any) =>
              topic.status?.topicName || topic.spec?.topicName || topic.metadata?.name,
          },
          {
            label: 'Status',
            getter: (topic: any) => {
              const { status, type } = getTopicStatus(topic);
              return <StatusLabel status={type}>{status}</StatusLabel>;
            },
          },
        ]}
        data={topics}
        emptyMessage="No Kafka topics found. Create a KafkaTopic resource to get started."
      />
    </SectionBox>
  );
}
