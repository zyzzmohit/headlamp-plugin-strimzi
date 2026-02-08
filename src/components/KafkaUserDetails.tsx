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

import { KafkaUserClass } from '../crdClasses';

export default function KafkaUserDetails() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  
  // Use the hook pattern with a filter
  const [users, error] = KafkaUserClass.useList({ namespace });
  
  // Find the specific user by name using jsonData
  const user = users?.find((u: any) => u.jsonData?.metadata?.name === name);

  if (error) {
    return (
      <SectionBox title="Kafka User Details">
        <Typography color="error">Error loading Kafka user: {(error as any)?.message || 'Unknown error'}</Typography>
      </SectionBox>
    );
  }

  if (users === null) {
    return (
      <SectionBox title="Kafka User Details">
        <Typography>Loading...</Typography>
      </SectionBox>
    );
  }

  if (!user) {
    return (
      <SectionBox title="Kafka User Details">
        <Typography color="error">Kafka user '{name}' not found in namespace '{namespace}'</Typography>
      </SectionBox>
    );
  }

  // Access data via jsonData
  const data = user.jsonData || {};
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

  // Parse ACLs
  const acls = spec.authorization?.acls || [];

  // Parse quotas
  const quotaEntries = Object.entries(spec.quotas || {}).map(([key, value]) => ({
    quota: key,
    value: String(value),
  }));

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Icon icon="mdi:account-key" width={40} height={40} color="#ea4335" />
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
          <SectionBox title="User Information">
            <NameValueTable
              rows={[
                { name: 'Resource Name', value: metadata.name },
                { name: 'Namespace', value: metadata.namespace },
                { name: 'Username', value: status.username || metadata.name },
                { name: 'Secret Name', value: status.secret || 'N/A' },
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
                {
                  name: 'Type',
                  value: spec.authentication?.type || 'None',
                },
                {
                  name: 'Authorization Type',
                  value: spec.authorization?.type || 'None',
                },
              ]}
            />
          </SectionBox>
        </Grid>

        {/* ACLs */}
        <Grid item xs={12}>
          <SectionBox title="Access Control Lists (ACLs)">
            {acls.length > 0 ? (
              <SimpleTable
                columns={[
                  {
                    label: 'Resource Type',
                    getter: (acl: any) => acl.resource?.type || 'Unknown',
                  },
                  {
                    label: 'Resource Name',
                    getter: (acl: any) => acl.resource?.name || '*',
                  },
                  {
                    label: 'Pattern Type',
                    getter: (acl: any) => acl.resource?.patternType || 'literal',
                  },
                  {
                    label: 'Operations',
                    getter: (acl: any) => (acl.operations || []).join(', '),
                  },
                  {
                    label: 'Host',
                    getter: (acl: any) => acl.host || '*',
                  },
                ]}
                data={acls}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No ACLs configured. User has no access restrictions.
              </Typography>
            )}
          </SectionBox>
        </Grid>

        {/* Quotas */}
        <Grid item xs={12} md={6}>
          <SectionBox title="Quotas">
            {quotaEntries.length > 0 ? (
              <SimpleTable
                columns={[
                  { label: 'Quota', getter: (q: any) => q.quota },
                  { label: 'Value', getter: (q: any) => q.value },
                ]}
                data={quotaEntries}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No quotas configured
              </Typography>
            )}
          </SectionBox>
        </Grid>

        {/* Conditions */}
        <Grid item xs={12} md={6}>
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
