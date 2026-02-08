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
import { SectionBox, NameValueTable, StatusLabel, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';

import { KafkaTopicClass } from '../crdClasses';

export default function KafkaTopicDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  // Use the hook pattern with a filter
  const [topics, error] = KafkaTopicClass.useList({ namespace });
  
  // Find the specific topic by name using jsonData
  const topic = topics?.find((t: any) => t.jsonData?.metadata?.name === name);

  if (error) {
    return (
      <SectionBox title="Kafka Topic Details">
        <Typography color="error">Error loading Kafka topic: {(error as any)?.message || 'Unknown error'}</Typography>
      </SectionBox>
    );
  }

  if (topics === null) {
    return (
      <SectionBox title="Kafka Topic Details">
        <Typography>Loading...</Typography>
      </SectionBox>
    );
  }

  if (!topic) {
    return (
      <SectionBox title="Kafka Topic Details">
        <Typography color="error">Kafka topic '{name}' not found in namespace '{namespace}'</Typography>
      </SectionBox>
    );
  }

  // Access data via jsonData
  const data = topic.jsonData || {};
  const spec = data.spec || {};
  const status = data.status || {};
  const metadata = data.metadata || {};

  const getReadyStatus = () => {
    const conditions = status.conditions || [];
    const readyCondition = conditions.find((c: any) => c.type === 'Ready');
    if (readyCondition?.status === 'True') {
      return <StatusLabel status="success">Ready</StatusLabel>;
    } else if (readyCondition?.status === 'False') {
      return <StatusLabel status="error">{readyCondition.reason || 'Not Ready'}</StatusLabel>;
    }
    return <StatusLabel status="warning">Unknown</StatusLabel>;
  };

  // Parse topic config
  const configEntries = Object.entries(spec.config || {}).map(([key, value]) => ({
    key,
    value: String(value),
  }));

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Icon icon="mdi:message-text" width={40} height={40} color="#34a853" />
        <Box ml={2}>
          <Typography variant="h5" fontWeight="bold">
            {metadata.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label={metadata.namespace} size="small" variant="outlined" />
            {getReadyStatus()}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Topic Information">
            <NameValueTable
              rows={[
                { name: 'Resource Name', value: metadata.name },
                { name: 'Namespace', value: metadata.namespace },
                { name: 'Topic Name', value: status.topicName || spec.topicName || metadata.name },
                { name: 'Created', value: metadata.creationTimestamp },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Partition & Replication */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Partitioning">
            <NameValueTable
              rows={[
                { name: 'Partitions', value: spec.partitions || 0 },
                { name: 'Replication Factor', value: spec.replicas || 0 },
                { name: 'Observed Generation', value: status.observedGeneration || 'N/A' },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Topic Configuration */}
        <Grid item xs={12}>
          <SectionBox title="Topic Configuration">
            {configEntries.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Config Key', getter: (c: any) => c.key },
                  { label: 'Value', getter: (c: any) => c.value },
                ]}
                data={configEntries}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No custom configuration set. Using Kafka defaults.
              </Typography>
            )}
          </SectionBox>
        </Grid>

        {/* Conditions */}
        <Grid item xs={12}>
          <SectionBox title="Conditions">
            {status.conditions && status.conditions.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Type', getter: (c: any) => c.type },
                  {
                    label: 'Status',
                    getter: (c: any) => (
                      <StatusLabel status={c.status === 'True' ? 'success' : 'error'}>
                        {c.status}
                      </StatusLabel>
                    ),
                  },
                  { label: 'Reason', getter: (c: any) => c.reason || '-' },
                  { label: 'Message', getter: (c: any) => c.message || '-' },
                ]}
                data={status.conditions}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No conditions available
              </Typography>
            )}
          </SectionBox>
        </Grid>
      </Grid>
    </Box>
  );
}
