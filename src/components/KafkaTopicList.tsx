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
import Alert from '@mui/material/Alert';
import { Link as RouterLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { KafkaTopicClass } from '../crdClasses';
import { mockKafkaTopics, getDataWithMock } from '../mockData';

function getTopicStatus(topic: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const data = topic.jsonData || topic;
  const conditions = data.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

export default function KafkaTopicList() {
  const [topics, error] = KafkaTopicClass.useList();
  
  const displayData = getDataWithMock(topics, mockKafkaTopics as any[], error);
  const isDemoMode = error !== null || (topics !== null && topics.length === 0);

  if (displayData === null) {
    return (
      <SectionBox title="Kafka Topics">
        <Typography>Loading Kafka topics...</Typography>
      </SectionBox>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#34a85315', mr: 2 }}>
          <Icon icon="mdi:message-text" width={32} height={32} color="#34a853" />
        </Box>
        <Box flex={1}>
          <Typography variant="h5" fontWeight="bold">Kafka Topics</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage topics for storing and organizing your event streams
          </Typography>
        </Box>
        {isDemoMode && (
          <Chip label="DEMO MODE" size="small" color="warning" sx={{ fontWeight: 600 }} />
        )}
      </Box>

      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Showing demo data. Connect to a cluster with Strimzi installed to see real resources.
        </Alert>
      )}

      <SectionBox>
        <SimpleTable
          columns={[
            {
              label: 'Name',
              getter: (topic: any) => {
                const data = topic.jsonData || topic;
                return (
                  <Link
                    component={RouterLink}
                    to={`/strimzi/topics/${data.metadata?.namespace}/${data.metadata?.name}`}
                    sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' }}}
                  >
                    {data.metadata?.name}
                  </Link>
                );
              },
            },
            {
              label: 'Namespace',
              getter: (topic: any) => {
                const data = topic.jsonData || topic;
                return <Chip label={data.metadata?.namespace} size="small" variant="outlined" />;
              },
            },
            {
              label: 'Partitions',
              getter: (topic: any) => {
                const data = topic.jsonData || topic;
                return (
                  <Chip 
                    label={data.spec?.partitions || 0} 
                    size="small" 
                    color="success" 
                    sx={{ minWidth: 36, fontWeight: 600 }}
                  />
                );
              },
            },
            {
              label: 'Replicas',
              getter: (topic: any) => {
                const data = topic.jsonData || topic;
                return (
                  <Chip 
                    label={data.spec?.replicas || 0} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ minWidth: 36 }}
                  />
                );
              },
            },
            {
              label: 'Topic Name',
              getter: (topic: any) => {
                const data = topic.jsonData || topic;
                return (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {data.status?.topicName || data.metadata?.name}
                  </Typography>
                );
              },
            },
            {
              label: 'Status',
              getter: (topic: any) => {
                const { status, type } = getTopicStatus(topic);
                return <StatusLabel status={type}>{status}</StatusLabel>;
              },
            },
          ]}
          data={displayData}
          emptyMessage="No Kafka topics found."
        />
      </SectionBox>
    </Box>
  );
}
