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
import Paper from '@mui/material/Paper';
import { Icon } from '@iconify/react';

import { KafkaTopicClass } from '../crdClasses';
import { mockKafkaTopics, getDataWithMock } from '../mockData';

export default function KafkaTopicDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  const [topics, error] = KafkaTopicClass.useList({ namespace });
  const displayData = getDataWithMock(topics, mockKafkaTopics as any[], error);
  
  const topic = displayData?.find((t: any) => {
    const data = t.jsonData || t;
    return data.metadata?.name === name;
  });

  if (displayData === null) {
    return (
      <SectionBox title="Kafka Topic Details">
        <Typography>Loading...</Typography>
      </SectionBox>
    );
  }

  if (!topic) {
    return (
      <SectionBox title="Kafka Topic Details">
        <Typography color="error">Kafka Topic '{name}' not found in namespace '{namespace}'</Typography>
      </SectionBox>
    );
  }

  const data = topic.jsonData || topic;
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
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #34a85315 0%, #34a85305 100%)',
          border: '1px solid #34a85330'
        }}
      >
        <Box display="flex" alignItems="center">
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#34a85320', mr: 2 }}>
            <Icon icon="mdi:message-text" width={40} height={40} color="#34a853" />
          </Box>
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold">
              {metadata.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip label={metadata.namespace} size="small" variant="outlined" />
              <Chip label={`${spec.partitions || 0} partitions`} size="small" color="success" />
              <Chip label={`${spec.replicas || 0} replicas`} size="small" color="primary" variant="outlined" />
              {getReadyStatus()}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Topic Info */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Topic Information">
            <NameValueTable
              rows={[
                { name: 'Name', value: metadata.name },
                { name: 'Namespace', value: metadata.namespace },
                { name: 'Topic Name', value: status.topicName || metadata.name },
                { name: 'Created', value: metadata.creationTimestamp },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Partitioning */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Partitioning & Replication">
            <NameValueTable
              rows={[
                { name: 'Partitions', value: (
                  <Chip label={spec.partitions || 0} size="small" color="success" />
                )},
                { name: 'Replication Factor', value: (
                  <Chip label={spec.replicas || 0} size="small" color="primary" variant="outlined" />
                )},
                { name: 'Observed Generation', value: status.observedGeneration || 'N/A' },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Configuration */}
        <Grid item xs={12}>
          <SectionBox title="Topic Configuration">
            {configEntries.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Config Key', getter: (c: any) => (
                    <Typography fontWeight={500}>{c.key}</Typography>
                  )},
                  { label: 'Value', getter: (c: any) => (
                    <Typography sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>
                      {c.value}
                    </Typography>
                  )},
                ]}
                data={configEntries}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Using default configuration
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
