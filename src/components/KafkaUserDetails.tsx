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

import { KafkaUserClass } from '../crdClasses';
import { mockKafkaUsers, getDataWithMock } from '../mockData';

export default function KafkaUserDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  const [users, error] = KafkaUserClass.useList({ namespace });
  const displayData = getDataWithMock(users, mockKafkaUsers as any[], error);
  
  const user = displayData?.find((u: any) => {
    const data = u.jsonData || u;
    return data.metadata?.name === name;
  });

  if (displayData === null) {
    return (
      <SectionBox title="Kafka User Details">
        <Typography>Loading...</Typography>
      </SectionBox>
    );
  }

  if (!user) {
    return (
      <SectionBox title="Kafka User Details">
        <Typography color="error">Kafka User '{name}' not found in namespace '{namespace}'</Typography>
      </SectionBox>
    );
  }

  const data = user.jsonData || user;
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

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #ea433515 0%, #ea433505 100%)',
          border: '1px solid #ea433530'
        }}
      >
        <Box display="flex" alignItems="center">
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#ea433520', mr: 2 }}>
            <Icon icon="mdi:account-key" width={40} height={40} color="#ea4335" />
          </Box>
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold">
              {metadata.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip label={metadata.namespace} size="small" variant="outlined" />
              <Chip label={spec.authentication?.type || 'No Auth'} size="small" color="primary" />
              {spec.authorization?.type && (
                <Chip label={spec.authorization.type} size="small" color="secondary" variant="outlined" />
              )}
              {getReadyStatus()}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* User Info */}
        <Grid item xs={12} md={6}>
          <SectionBox title="User Information">
            <NameValueTable
              rows={[
                { name: 'Name', value: metadata.name },
                { name: 'Namespace', value: metadata.namespace },
                { name: 'Username', value: status.username || metadata.name },
                { name: 'Secret', value: status.secret || 'N/A' },
                { name: 'Created', value: metadata.creationTimestamp },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Authentication */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Authentication">
            <NameValueTable
              rows={[
                { name: 'Type', value: (
                  <Chip label={spec.authentication?.type || 'None'} size="small" color="primary" />
                )},
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Authorization */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Authorization">
            <NameValueTable
              rows={[
                { name: 'Type', value: (
                  <Chip label={spec.authorization?.type || 'None'} size="small" color="secondary" />
                )},
              ]}
            />
          </SectionBox>
        </Grid>

        {/* Quotas */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Quotas">
            {spec.quotas ? (
              <NameValueTable
                rows={[
                  { name: 'Producer Byte Rate', value: spec.quotas.producerByteRate ? `${(spec.quotas.producerByteRate / 1024 / 1024).toFixed(1)} MB/s` : 'Unlimited' },
                  { name: 'Consumer Byte Rate', value: spec.quotas.consumerByteRate ? `${(spec.quotas.consumerByteRate / 1024 / 1024).toFixed(1)} MB/s` : 'Unlimited' },
                  { name: 'Request Percentage', value: spec.quotas.requestPercentage ? `${spec.quotas.requestPercentage}%` : 'Unlimited' },
                ]}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No quotas configured
              </Typography>
            )}
          </SectionBox>
        </Grid>

        {/* ACLs */}
        <Grid item xs={12}>
          <SectionBox title="Access Control Lists (ACLs)">
            {spec.authorization?.acls && spec.authorization.acls.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Resource Type', getter: (acl: any) => (
                    <Chip label={acl.resource?.type} size="small" color="primary" variant="outlined" />
                  )},
                  { label: 'Resource Name', getter: (acl: any) => (
                    <Typography sx={{ fontFamily: 'monospace' }}>{acl.resource?.name}</Typography>
                  )},
                  { label: 'Pattern', getter: (acl: any) => acl.resource?.patternType || 'literal' },
                  { label: 'Operations', getter: (acl: any) => (
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {(acl.operations || []).map((op: string) => (
                        <Chip key={op} label={op} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )},
                ]}
                data={spec.authorization.acls}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No ACLs configured
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
